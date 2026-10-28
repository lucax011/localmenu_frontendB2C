import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getOrder } from '@/api/client';
import { ActionBar, bigButton, Empty, Panel, Screen, SectionTitle } from '@/components/ui';
import InstallBanner from '@/components/InstallBanner';
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

  const ready = order.status === 'READY';

  return (
    <Screen
      refreshing={isRefetching}
      onRefresh={refetch}
      footer={
        order.status === 'PENDING' && !order.payment ? (
          <ActionBar>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Payment', { orderId: order.id })}
              {...bigButton}
            >
              {`Pagar ${money(order.total)}`}
            </Button>
          </ActionBar>
        ) : undefined
      }
    >
      {/* número grande para mostrar no balcão */}
      <View style={[styles.ticket, ready && { backgroundColor: colors.ok }]}>
        <Text style={styles.ticketLabel}>{ready ? 'Pronto! Mostre no balcão' : 'Seu pedido'}</Text>
        <Text style={styles.number} accessibilityLabel={`Pedido número ${order.orderNumber}`}>
          #{order.orderNumber}
        </Text>
        <Text style={styles.ticketPlace}>{order.restaurant.name}</Text>
      </View>

      <Panel style={{ gap: 8 }}>
        <StatusChip status={order.status} />
        <Text variant="bodyLarge" style={{ color: colors.ink }}>
          {HINT[order.status]}
        </Text>
        {order.restaurant.address ? (
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            Retirada: {order.restaurant.address}
          </Text>
        ) : null}

        {order.status !== 'CANCELLED' && order.status !== 'PENDING' ? (
          <View style={styles.track} accessibilityRole="progressbar">
            {STATUS_STEPS.map((st, i) => {
              const reached = i <= current;
              return (
                <View key={st} style={styles.stepCol}>
                  <View style={[styles.bar, reached && { backgroundColor: colors.brand }]} />
                  <Text
                    style={[
                      styles.stepText,
                      reached && { color: colors.ink },
                      i === current && { fontWeight: '700' },
                    ]}
                  >
                    {STATUS_LABEL[st]}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </Panel>

      {order.status !== 'PENDING' && order.status !== 'CANCELLED' ? <InstallBanner /> : null}

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
  bar: { backgroundColor: colors.line, borderRadius: 3, height: 6 },
  ink: { color: colors.ink, fontWeight: '700' },
  number: { color: '#FFFFFF', fontSize: 56, fontWeight: '800', letterSpacing: 1 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  stepCol: { flex: 1, gap: 6 },
  stepText: { color: colors.muted, fontSize: 12 },
  ticket: { alignItems: 'center', backgroundColor: colors.brand, borderRadius: 20, padding: 20 },
  ticketLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', opacity: 0.9 },
  ticketPlace: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  totalRow: { borderTopColor: colors.line, borderTopWidth: 1, paddingTop: 8 },
  track: { flexDirection: 'row', gap: 6, marginTop: 8 },
});
