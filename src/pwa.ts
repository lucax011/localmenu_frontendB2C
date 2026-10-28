import { Platform } from 'react-native';

// Instalação do PWA. O Chrome (Android/desktop) avisa com `beforeinstallprompt` e o app
// guarda o evento para mostrar o convite na hora certa (depois do primeiro pedido).
// O iPhone não tem esse evento: lá o cliente instala por Compartilhar > Adicionar à Tela de Início.
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

export function setupPwa() {
  if (!isWeb) return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
  // Service worker só no build de produção: no desenvolvimento ele guardaria bundles velhos
  if (!__DEV__ && 'serviceWorker' in navigator) {
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
  }
}

export const onInstallChange = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const canPromptInstall = () => !!deferred;

export async function promptInstall() {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  notify();
  return outcome === 'accepted';
}

export const isInstalled = () =>
  isWeb &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIosSafari = () =>
  isWeb &&
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !/crios|fxios/i.test(navigator.userAgent);

// Lembra que o cliente fechou o convite. localStorage pode faltar (aba anônima): aí só não lembra.
const DISMISS_KEY = 'localmenu-install-dismissed';

export const installDismissed = () => {
  try {
    return isWeb && window.localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

export const dismissInstall = () => {
  try {
    window.localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // sem armazenamento: o convite volta na próxima visita
  }
};
