import { addLine, cartCount, cartTotal, MAX_QTY, setLineQty, toOrderPayload } from '@/utils/cart';
import { filterMenu, matches, stepIndex, todayHours } from '@/utils/format';
import type { MenuCategory, OpeningHour } from '@/api/types';

const burger = { id: 'i1', name: 'Smash Burger', price: 32.9 };
const fries = { id: 'i2', name: 'Batata Rústica', price: 18.5 };

describe('carrinho', () => {
  it('soma a quantidade quando o mesmo item é adicionado de novo', () => {
    const lines = addLine(addLine(addLine([], burger), fries), burger);
    expect(lines).toHaveLength(2);
    expect(lines[0].quantity).toBe(2);
    expect(cartCount(lines)).toBe(3);
    expect(cartTotal(lines)).toBe(84.3);
  });

  it('quantidade zero tira o item e o máximo é o que a API aceita', () => {
    let lines = addLine([], burger);
    lines = setLineQty(lines, 'i1', 999);
    expect(lines[0].quantity).toBe(MAX_QTY);
    expect(setLineQty(lines, 'i1', 0)).toEqual([]);
  });

  it('o pedido leva só id e quantidade, nunca o preço', () => {
    const payload = toOrderPayload('r1', addLine([], burger), '  sem cebola ');
    expect(payload).toEqual({
      restaurantId: 'r1',
      items: [{ menuItemId: 'i1', quantity: 1 }],
      customerNotes: 'sem cebola',
    });
    expect(toOrderPayload('r1', [], '   ').customerNotes).toBeUndefined();
  });
});

describe('busca no cardápio', () => {
  const menu: MenuCategory[] = [
    {
      id: 'c1',
      name: 'Lanches',
      order: 0,
      items: [{ ...burger, description: 'Pão brioche', isAvailable: true }],
    },
    {
      id: 'c2',
      name: 'Bebidas',
      order: 1,
      items: [{ id: 'i3', name: 'Café', price: 6, description: null, isAvailable: true }],
    },
  ];

  it('ignora acentos e maiúsculas', () => {
    expect(matches('CAFE', 'Café')).toBe(true);
    expect(matches('brioche', 'Smash', 'Pão brioche')).toBe(true);
    expect(matches('', 'qualquer')).toBe(true);
  });

  it('esconde categorias sem itens que batem com a busca', () => {
    const result = filterMenu(menu, 'cafe');
    expect(result.map((c) => c.name)).toEqual(['Bebidas']);
    expect(filterMenu(menu, 'pizza')).toEqual([]);
  });
});

describe('pedido e horário', () => {
  it('ordena as etapas que o cliente acompanha', () => {
    expect(stepIndex('CONFIRMED')).toBe(0);
    expect(stepIndex('READY')).toBe(2);
    expect(stepIndex('CANCELLED')).toBe(-1);
  });

  it('mostra o horário de hoje', () => {
    const hours: OpeningHour[] = [
      { dayOfWeek: 'MONDAY', openTime: '11:00', closeTime: '23:00', isOpen: true },
      { dayOfWeek: 'TUESDAY', openTime: '11:00', closeTime: '23:00', isOpen: false },
    ];
    // 2026-10-26 é uma segunda-feira
    expect(todayHours(hours, new Date(2026, 9, 26))).toBe('Hoje (Seg): 11:00–23:00');
    expect(todayHours(hours, new Date(2026, 9, 27))).toBe('Hoje (Ter): fechado');
    expect(todayHours([], new Date(2026, 9, 27))).toBeNull();
  });
});
