import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';
import type {
  AuthResponse,
  Order,
  Payment,
  PaymentMethod,
  PublicRestaurant,
  RestaurantSummary,
} from './types';

export const API_BASE =
  (Constants?.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ||
  'http://localhost:3000';

export const api = axios.create({ baseURL: API_BASE, timeout: 1000 * 30 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// O access token vale 15 min. Num 401, troca pelo refresh token uma vez e repete o pedido.
let refreshing: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthResponse>(`${API_BASE}/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    logout();
    return null;
  }
};

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  const isAuth = original?.url?.startsWith('/auth/');
  if (error.response?.status !== 401 || !original || original._retry || isAuth) throw error;
  original._retry = true;
  refreshing = refreshing ?? refreshAccessToken().finally(() => (refreshing = null));
  const token = await refreshing;
  if (!token) throw error;
  original.headers.Authorization = `Bearer ${token}`;
  return api(original);
});

// Mensagem legível de um erro da API (o Nest manda `message` como texto ou lista)
export const errorMessage = (e: unknown, fallback = 'Algo deu errado. Tente de novo.') => {
  const err = e as AxiosError<{ message?: string | string[] }>;
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join('\n');
  if (typeof msg === 'string') return msg;
  if (err?.code === 'ERR_NETWORK') return 'Sem conexão com a API.';
  return fallback;
};

// Auth
export const login = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export type RegisterPayload = { name: string; email: string; password: string; phone?: string };

export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    ...payload,
    userType: 'CUSTOMER',
  });
  return data;
};

// Vitrine pública (sem login)
export const getRestaurants = async () => {
  const { data } = await api.get<RestaurantSummary[]>('/public/restaurants');
  return data;
};

export const getRestaurantBySlug = async (slug: string) => {
  const { data } = await api.get<PublicRestaurant>(`/public/r/${encodeURIComponent(slug)}`);
  return data;
};

// Pedidos do cliente. O preço não vai no pedido: a API calcula pelo cardápio.
export type OrderPayload = {
  restaurantId: string;
  items: { menuItemId: string; quantity: number; notes?: string }[];
  customerNotes?: string;
};

export const createOrder = async (payload: OrderPayload) => {
  const { data } = await api.post<Order>('/orders', payload);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get<Order[]>('/orders/me');
  return data;
};

export const getOrder = async (id: string) => {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
};

// Pagamento simulado: nenhum gateway real, a API marca como pago e confirma o pedido
export const payOrder = async (orderId: string, method: PaymentMethod) => {
  const { data } = await api.post<Payment>('/payments', { orderId, method });
  return data;
};
