import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MenuItem } from '@/api/types';
import { addLine, CartLine, CartRestaurant, setLineQty } from '@/utils/cart';

type CartState = {
  restaurant: CartRestaurant | null;
  lines: CartLine[];
  notes: string;
  // false quando o carrinho já tem itens de outro restaurante (a tela pergunta antes de trocar)
  add: (restaurant: CartRestaurant, item: MenuItem) => boolean;
  replaceWith: (restaurant: CartRestaurant, item: MenuItem) => void;
  setQty: (itemId: string, quantity: number) => void;
  setNotes: (notes: string) => void;
  clear: () => void;
};

const EMPTY = { restaurant: null, lines: [], notes: '' };

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      add: (restaurant, item) => {
        const current = get();
        if (current.restaurant && current.restaurant.id !== restaurant.id && current.lines.length) {
          return false;
        }
        set({ restaurant, lines: addLine(current.lines, item) });
        return true;
      },
      replaceWith: (restaurant, item) => set({ restaurant, lines: addLine([], item), notes: '' }),
      setQty: (itemId, quantity) => {
        const lines = setLineQty(get().lines, itemId, quantity);
        set(lines.length ? { lines } : EMPTY);
      },
      setNotes: (notes) => set({ notes }),
      clear: () => set(EMPTY),
    }),
    {
      name: 'localmenu-b2c-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ restaurant: s.restaurant, lines: s.lines, notes: s.notes }),
    }
  )
);
