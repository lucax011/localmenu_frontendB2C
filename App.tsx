import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, theme } from './src/theme';
import { setupPwa } from './src/pwa';
import RestaurantsScreen from './src/features/restaurants/RestaurantsScreen';
import RestaurantScreen from './src/features/restaurants/RestaurantScreen';
import CartScreen from './src/features/cart/CartScreen';
import AuthScreen from './src/features/auth/AuthScreen';
import AccountScreen from './src/features/auth/AccountScreen';
import PaymentScreen from './src/features/orders/PaymentScreen';
import OrdersScreen from './src/features/orders/OrdersScreen';
import OrderScreen from './src/features/orders/OrderScreen';

export type RootStackParamList = {
  Restaurants: undefined;
  Restaurant: { slug: string };
  Cart: undefined;
  Auth: undefined;
  Account: undefined;
  Payment: { orderId: string };
  Orders: undefined;
  Order: { id: string };
};

setupPwa();

const Stack = createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 20 },
  },
});

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream, primary: colors.brand },
};

// Endereços no navegador: /r/brasa-burger abre direto o cardápio (é o link do QR code)
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Restaurants: '',
      Restaurant: 'r/:slug',
      Cart: 'carrinho',
      Auth: 'entrar',
      Account: 'conta',
      Payment: 'pagamento/:orderId',
      Orders: 'pedidos',
      Order: 'pedidos/:id',
    },
  },
};

function RootNavigator() {
  return (
    <NavigationContainer
      theme={navTheme}
      linking={linking}
      documentTitle={{ formatter: (o) => (o?.title ? `${o.title} · LocalMenu` : 'LocalMenu') }}
    >
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.cream },
        }}
      >
        {/* Início e cardápio desenham o próprio topo (capa, busca) */}
        <Stack.Screen
          name="Restaurants"
          component={RestaurantsScreen}
          options={{ title: 'LocalMenu', headerShown: false }}
        />
        <Stack.Screen
          name="Restaurant"
          component={RestaurantScreen}
          options={{ title: 'Cardápio', headerShown: false }}
        />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho' }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Entrar' }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pagamento' }} />
        {/* abas de baixo: sem seta de voltar, a navegação é pela barra */}
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ title: 'Meus pedidos', headerBackVisible: false, animation: 'none' }}
        />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{ title: 'Conta', headerBackVisible: false, animation: 'none' }}
        />
        <Stack.Screen name="Order" component={OrderScreen} options={{ title: 'Pedido' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <RootNavigator />
          <StatusBar style="dark" />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
