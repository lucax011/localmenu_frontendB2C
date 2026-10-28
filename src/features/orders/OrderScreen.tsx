import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getOrder } from '@/api/client';
import { Empty, Panel, Screen, SectionTitle } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import {
  isOpenOrder,
  money,
  PAYMENT_LABEL,
  shortDate,
  STATUS_LABEL,
  STATUS_STEPS,
  stepIndex,
} from '@/utils/format';
import { colors } from '@/theme';
import LoginRequired from '../auth/LoginRequired';
import StatusChip from './StatusChip';

type Props = NativeStackScreenProps<RootStackParamList, 'Order'>;

const HINT: Record<string, string> = {
  PENDING: 'O restaurante recebe o pedido assim que ele for pago.',
  CONFIRMED: 'O restaurante recebeu seu pedido.',
  PREPARING: 'Seu pedido está sendo preparado.',
  READY: 'Pode buscar no balcão. Diga o número do pedido.',
  COMPLETED: 'Pedido retirado. Bom apetite!',
  CANCELLED: 'O pedido foi cancelado pelo restaurante.',
};

export default function OrderScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const logged = useAuthStore((s) => !!s.accessToken);
  const {
    data: order,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['orders', id],
    enabled: logged,
    queryFn: () => getOrder(id),
    // acompanha a cozinha a cada 5 s até o pedido terminar
    refetchInterval: (q) => (q.state.data && !isOpenOrder(q.state.data.status) ? false : 5000),
  });

  useEffect(() => {
    if (order) navigation.setOptions({ title: `Pedido #${order.orderNumber}` });
  }, [navigation, order]);

  if (!logged) return <LoginRequired />;
  if (isLoading) return <ActivityIndicator style={{ marginTop: 48 }} />;
  if (error || !order) {
    return (
      <Screen>
        <Empty title="Pedido não encontrado" text={error ? errorMessage(error) : undefined} />
      </Screen>
    );
  }

  const current = stepIndex(order.status);

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Panel style={{ gap: 8 }}>
        <View style={styles.row}>
          <Text variant="titleMedium" style={styles.ink}>
            {order.restaurant.name}
          </Text>
          <StatusChip status={order.status} />
        </View>
        <Text variant="displaySmall" style={styles.number}>
          #{order.orderNumber}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.ink }}>
          {HINT[order.status]}
        </Text>
        {order.restaurant.address ? (
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            Retirada: {order.restaurant.address}
          </Text>
        ) : null}
      </Panel>

      {order.status !== 'CANCELLED' && order.status !== 'PENDING' ? (
        <Panel style={{ gap: 12 }}>
          {STATUS_STEPS.map((s, i) => {
            const reached = i <= current;
            return (
              <View key={s} style={styles.step}>
                <View
                  style={[
                    styles.bullet,
                    reached && { backgroundColor: colors.brand, borderColor: colors.brand },
                  ]}
                />
                <Text
                  variant="bodyMedium"
                  style={{
                    color: reached ? colors.ink : colors.muted,
                    fontWeight: i === current ? '700' : '400',
                  }}
                >
                  {STATUS_LABEL[s]}
                </Text>
              </View>
            );
          })}
        </Panel>
      ) : null}

      {order.status === 'PENDING' && !order.payment ? (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Payment', { orderId: order.id })}
          contentStyle={{ paddingVertical: 6 }}
        >
          {`Pagar ${money(order.total)}`}
        </Button>
      ) : null}

      <SectionTitle>Itens</SectionTitle>
      <Panel style={{ gap: 8 }}>
        {order.items.map((i) => (
          <View key={i.id} style={styles.row}>
            <Text variant="bodyMedium" style={{ color: colors.ink, flex: 1 }}>
              {i.quantity}× {i.nameSnapshot}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.ink }}>
              {money(i.totalPrice)}
            </Text>
          </View>
        ))}
        <View style={[styles.row, styles.totalRow]}>
          <Text variant="titleMedium" style={styles.ink}>
            Total
          </Text>
          <Text variant="titleMedium" style={styles.ink}>
            {money(order.total)}
          </Text>
        </View>
        {order.customerNotes ? (
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            Observações: {order.customerNotes}
          </Text>
        ) : null}
        <Text variant="bodySmall" style={{ color: colors.muted }}>
          {order.payment
            ? `Pago com ${PAYMENT_LABEL[order.payment.method].toLowerCase()} (simulado)`
            : 'Ainda não pago'}
          {` · feito em ${shortDate(order.createdAt)}`}
        </Text>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bullet: {
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    width: 14,
  },
  ink: { color: colors.ink, fontWeight: '700' },
  number: { color: colors.ink, fontWeight: '800' },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  step: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  totalRow: { borderTopColor: colors.line, borderTopWidth: 1, paddingTop: 8 },
});
