import type { OrderPayload } from '@/api/client';
import type { MenuItem } from '@/api/types';

// A API aceita de 1 a 50 unidades por item
export const MAX_QTY = 50;

export type CartRestaurant = { id: string; slug: string; name: string };

export type CartLine = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export const addLine = (lines: CartLine[], item: Pick<MenuItem, 'id' | 'name' | 'price'>) => {
  const found = lines.find((l) => l.itemId === item.id);
  if (!found) {
    return [...lines, { itemId: item.id, name: item.name, price: item.price, quantity: 1 }];
  }
  return setLineQty(lines, item.id, found.quantity + 1);
};

// Quantidade zero tira o item do carrinho
export const setLineQty = (lines: CartLine[], itemId: string, quantity: number) => {
  if (quantity <= 0) return lines.filter((l) => l.itemId !== itemId);
  const q = Math.min(MAX_QTY, Math.floor(quantity));
  return lines.map((l) => (l.itemId === itemId ? { ...l, quantity: q } : l));
};

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);

// Estimativa mostrada no app; o valor cobrado é o que a API calcula pelo cardápio
export const cartTotal = (lines: CartLine[]) =>
  Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;

export const toOrderPayload = (
  restaurantId: string,
  lines: CartLine[],
  notes: string
): OrderPayload => ({
  restaurantId,
  items: lines.map((l) => ({ menuItemId: l.itemId, quantity: l.quantity })),
  customerNotes: notes.trim() || undefined,
});
