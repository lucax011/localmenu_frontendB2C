import type { MenuCategory, OpeningHour, OrderStatus, PaymentMethod } from '@/api/types';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const money = (value: number) => BRL.format(value || 0);

// Como o cliente lê cada etapa do pedido
export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Aguardando pagamento',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Em preparo',
  READY: 'Pronto para retirada',
  COMPLETED: 'Retirado',
  CANCELLED: 'Cancelado',
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: '#B45309',
  CONFIRMED: '#1D4ED8',
  PREPARING: '#7C3AED',
  READY: '#047857',
  COMPLETED: '#57534E',
  CANCELLED: '#B91C1C',
};

// Etapas mostradas na linha do tempo do pedido, na ordem em que acontecem
export const STATUS_STEPS: OrderStatus[] = ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

export const stepIndex = (status: OrderStatus) => STATUS_STEPS.indexOf(status);

export const isOpenOrder = (status: OrderStatus) =>
  status !== 'COMPLETED' && status !== 'CANCELLED';

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro na retirada',
};

const DAY_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_KEYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

// "Hoje: 11:00–23:00", "Hoje: fechado" ou null quando o restaurante não cadastrou horários
export const todayHours = (hours: OpeningHour[], now = new Date()) => {
  if (!hours.length) return null;
  const today = hours.find((h) => h.dayOfWeek === DAY_KEYS[now.getDay()]);
  if (!today || !today.isOpen) return `Hoje (${DAY_LABEL[now.getDay()]}): fechado`;
  return `Hoje (${DAY_LABEL[now.getDay()]}): ${today.openTime}–${today.closeTime}`;
};

// Busca sem diferenciar maiúsculas nem acentos ("cafe" acha "Café")
export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const matches = (query: string, ...fields: (string | null | undefined)[]) => {
  const q = normalize(query);
  if (!q) return true;
  return fields.some((f) => !!f && normalize(f).includes(q));
};

// Mantém só as categorias com itens que batem com a busca
export const filterMenu = (categories: MenuCategory[], query: string) =>
  categories
    .map((c) => ({ ...c, items: c.items.filter((i) => matches(query, i.name, i.description)) }))
    .filter((c) => c.items.length > 0);

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
