// API Types for Backend Endpoints

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  menuId: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: number;
  name: string;
  order: number;
  items: MenuItem[];
}

export interface Menu {
  id: number;
  name: string;
  categories: MenuCategory[];
}

export interface RestaurantDetails {
  restaurant: {
    id: number;
    name: string;
  };
  menu: Menu;
}
