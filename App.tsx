import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Badge, IconButton, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { useCartStore } from './src/store/cartStore';
import { cartCount } from './src/utils/cart';
import { colors, theme } from './src/theme';
import RestaurantsScreen from './src/features/restaurants/RestaurantsScreen';
import RestaurantScreen from './src/features/restaurants/RestaurantScreen';
import CartScreen from './src/features/cart/CartScreen';
import AuthScreen from './src/features/auth/AuthScreen';
import PaymentScreen from './src/features/orders/PaymentScreen';
import OrdersScreen from './src/features/orders/OrdersScreen';
import OrderScreen from './src/features/orders/OrderScreen';

export type RootStackParamList = {
  Restaurants: undefined;
  Restaurant: { slug: string };
  Cart: undefined;
  Auth: undefined;
  Payment: { orderId: string };
  Orders: undefined;
  Order: { id: string };
};

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

// Endereços no navegador: /r/brasa-burger abre direto o cardápio
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Restaurants: '',
      Restaurant: 'r/:slug',
      Cart: 'carrinho',
      Auth: 'entrar',
      Payment: 'pagamento/:orderId',
      Orders: 'pedidos',
      Order: 'pedidos/:id',
    },
  },
};

type Nav = { navigate: (screen: keyof RootStackParamList) => void };

function HeaderActions({ navigation }: { navigation: Nav }) {
  const count = useCartStore((s) => cartCount(s.lines));
  const logged = useAuthStore((s) => !!s.accessToken);
  return (
    <View style={{ flexDirection: 'row' }}>
      <IconButton
        icon={logged ? 'receipt' : 'account-circle-outline'}
        accessibilityLabel={logged ? 'Meus pedidos' : 'Entrar'}
        onPress={() => navigation.navigate(logged ? 'Orders' : 'Auth')}
      />
      <View>
        <IconButton
          icon="basket-outline"
          accessibilityLabel="Carrinho"
          onPress={() => navigation.navigate('Cart')}
        />
        {count > 0 ? (
          <Badge style={{ position: 'absolute', right: 4, top: 4 }} size={18}>
            {count}
          </Badge>
        ) : null}
      </View>
    </View>
  );
}

function LogoutButton() {
  const logged = useAuthStore((s) => !!s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  if (!logged) return null;
  return (
    <IconButton
      icon="logout"
      accessibilityLabel="Sair"
      onPress={() => {
        queryClient.removeQueries({ queryKey: ['orders'] });
        logout();
      }}
    />
  );
}

function RootNavigator() {
  return (
    <NavigationContainer
      theme={navTheme}
      linking={linking}
      documentTitle={{ formatter: (o) => (o?.title ? `${o.title} · LocalMenu` : 'LocalMenu') }}
    >
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.cream },
          headerRight: () => <HeaderActions navigation={navigation} />,
        })}
      >
        <Stack.Screen
          name="Restaurants"
          component={RestaurantsScreen}
          options={{ title: 'LocalMenu' }}
        />
        <Stack.Screen
          name="Restaurant"
          component={RestaurantScreen}
          options={{ title: 'Cardápio' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: 'Carrinho', headerRight: undefined }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ title: 'Entrar', headerRight: undefined }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Pagamento', headerRight: undefined }}
        />
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            title: 'Meus pedidos',
            headerRight: () => <LogoutButton />,
          }}
        />
        <Stack.Screen name="Order" component={OrderScreen} options={{ title: 'Pedido' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <RootNavigator />
        <StatusBar style="dark" />
      </PaperProvider>
    </QueryClientProvider>
  );
}
