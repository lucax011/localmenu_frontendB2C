import { filterMenuItemsByName } from '../utils/searchFilter';
import { MenuItem } from '../types/api';

describe('filterMenuItemsByName', () => {
  const mockItems: MenuItem[] = [
    {
      id: 1,
      name: 'Margherita Pizza',
      price: 12.99,
      description: 'Classic tomato and mozzarella',
      isAvailable: true,
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      price: 14.99,
      description: 'With spicy pepperoni',
      isAvailable: true,
    },
    {
      id: 3,
      name: 'Caesar Salad',
      price: 8.99,
      description: 'Fresh romaine lettuce',
      isAvailable: true,
    },
    {
      id: 4,
      name: 'Greek Salad',
      price: 9.99,
      description: 'With feta cheese',
      isAvailable: false,
    },
  ];

  it('should return all items when search query is empty', () => {
    expect(filterMenuItemsByName(mockItems, '')).toEqual(mockItems);
  });

  it('should return all items when search query is only whitespace', () => {
    expect(filterMenuItemsByName(mockItems, '   ')).toEqual(mockItems);
  });

  it('should filter items by name (case-insensitive)', () => {
    const result = filterMenuItemsByName(mockItems, 'pizza');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Margherita Pizza');
    expect(result[1].name).toBe('Pepperoni Pizza');
  });

  it('should filter items by partial name match', () => {
    const result = filterMenuItemsByName(mockItems, 'salad');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Caesar Salad');
    expect(result[1].name).toBe('Greek Salad');
  });

  it('should be case-insensitive', () => {
    const result = filterMenuItemsByName(mockItems, 'PIZZA');
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no matches found', () => {
    const result = filterMenuItemsByName(mockItems, 'burger');
    expect(result).toHaveLength(0);
  });

  it('should handle special characters in search query', () => {
    const result = filterMenuItemsByName(mockItems, 'margherita');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Margherita Pizza');
  });
});
