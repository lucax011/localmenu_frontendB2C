/* eslint-env serviceworker */
// Service worker do LocalMenu (só registrado no build de produção, ver src/pwa.ts).
// - páginas: rede primeiro; sem rede, abre a casca do app guardada
// - bundles do Expo (/_expo/static, nomes com hash): cache primeiro
// - cardápio e restaurantes (GET /public/*): rede primeiro (preço e "esgotado" mudam);
//   sem rede, mostra a última versão guardada
// - fotos: cache primeiro, até 150 fotos
// Pedidos, pagamento e conta nunca passam pelo cache.
const VERSION = 'v1';
const SHELL = `shell-${VERSION}`;
const STATIC = `static-${VERSION}`;
const API = `api-${VERSION}`;
const IMG = `img-${VERSION}`;
const SHELL_FILES = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const keep = [SHELL, STATIC, API, IMG];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

const trim = async (name, max) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
};

const cacheFirst = async (request, name) => {
  const hit = await caches.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === 'opaque') {
    const cache = await caches.open(name);
    cache.put(request, res.clone());
  }
  return res;
};

const networkFirst = async (request) => {
  const cache = await caches.open(API);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }
  if (url.origin === self.location.origin && url.pathname.startsWith('/_expo/static/')) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }
  if (url.pathname.startsWith('/public/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMG).finally(() => trim(IMG, 150)));
  }
});
