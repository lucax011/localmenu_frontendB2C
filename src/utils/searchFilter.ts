import { MenuItem } from '../types/api';

/**
 * Filters menu items by name (case-insensitive)
 * @param items - Array of menu items to filter
 * @param searchQuery - Search query string
 * @returns Filtered array of menu items
 */
export function filterMenuItemsByName(items: MenuItem[], searchQuery: string): MenuItem[] {
  if (!searchQuery.trim()) {
    return items;
  }

  const query = searchQuery.toLowerCase().trim();
  return items.filter((item) =>
    item.name.toLowerCase().includes(query)
  );
}
