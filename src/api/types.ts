// Formatos devolvidos pela API do LocalMenu (localmenu_backend).
// Ids são texto (cuid) e valores em dinheiro já chegam como número.

export type UserType = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  userType: UserType;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

// GET /public/restaurants
export type RestaurantSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  // fotos: https://… ou /static/… (relativo à API, ver imageSrc)
  logoUrl?: string | null;
  coverUrl?: string | null;
  hours: OpeningHour[];
  menuId: string | null;
};

export type DayOfWeek =
  'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export type OpeningHour = {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  isAvailable: boolean;
  imageUrl?: string | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  order: number;
  items: MenuItem[];
};

// GET /public/r/:slug
export type PublicRestaurant = {
  restaurant: Omit<RestaurantSummary, 'menuId'>;
  menu: { id: string; name: string; categories: MenuCategory[] } | null;
};

export type OrderStatus =
  'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string | null;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  customerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: Payment | null;
  restaurant: { id: string; name: string; slug: string; address?: string | null };
};
