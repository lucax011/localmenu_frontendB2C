import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getMyOrders } from '@/api/client';
import type { Order } from '@/api/types';
import { BottomBar, Empty, Panel, Screen, SectionTitle, SkeletonList } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { isOpenOrder, money, shortDate } from '@/utils/format';
import { colors } from '@/theme';
import LoginRequired from '../auth/LoginRequired';
import StatusChip from './StatusChip';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

export default function OrdersScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logged = useAuthStore((s) => !!s.accessToken);
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['orders'],
    enabled: logged,
    queryFn: getMyOrders,
    // o status muda na cozinha; atualiza sozinho enquanto a tela está aberta
    refetchInterval: 10000,
  });

  const tabs = <BottomBar current="orders" />;
  if (!logged) return <LoginRequired footer={tabs} />;

  const all = data ?? [];
  const open = all.filter((o) => isOpenOrder(o.status));
  const done = all.filter((o) => !isOpenOrder(o.status));

  const card = (o: Order) => (
    <Pressable key={o.id} onPress={() => navigation.navigate('Order', { id: o.id })}>
      {({ pressed }) => (
        <Panel style={[styles.card, pressed && { borderColor: colors.brand }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="titleMedium" style={styles.ink}>
              {o.restaurant.name}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              #{o.orderNumber} · {shortDate(o.createdAt)}
            </Text>
            <StatusChip status={o.status} />
          </View>
          <Text variant="titleMedium" style={styles.ink}>
            {money(o.total)}
          </Text>
        </Panel>
      )}
    </Pressable>
  );

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch} footer={tabs}>
      {user ? (
        <Text variant="bodyMedium" style={{ color: colors.muted }}>
          Olá, {user.name.split(' ')[0]}.
        </Text>
      ) : null}
      {isLoading ? <SkeletonList count={3} height={88} /> : null}
      {error ? <Empty title="Não deu para carregar" text={errorMessage(error)} /> : null}
      {data && !all.length ? (
        <>
          <Empty
            title="Nenhum pedido ainda"
            text="Seus pedidos aparecem aqui assim que você pedir."
          />
          <Button mode="contained" onPress={() => navigation.navigate('Restaurants')}>
            Ver restaurantes
          </Button>
        </>
      ) : null}
      {open.length ? <SectionTitle>Em andamento</SectionTitle> : null}
      {open.map(card)}
      {done.length ? <SectionTitle>Anteriores</SectionTitle> : null}
      {done.map(card)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  ink: { color: colors.ink, fontWeight: '700' },
});
