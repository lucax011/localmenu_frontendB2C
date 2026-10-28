import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, RadioButton, Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getOrder, payOrder } from '@/api/client';
import type { PaymentMethod } from '@/api/types';
import { Empty, Panel, Screen } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { money, PAYMENT_LABEL } from '@/utils/format';
import { colors } from '@/theme';
import LoginRequired from '../auth/LoginRequired';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

// Dinheiro fica de fora: no pagamento simulado ele seria marcado como pago na hora
const METHODS: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD'];

export default function PaymentScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const logged = useAuthStore((s) => !!s.accessToken);
  const qc = useQueryClient();
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [error, setError] = useState<string | null>(null);

  const {
    data: order,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ['orders', orderId],
    enabled: logged,
    queryFn: () => getOrder(orderId),
  });
  const pay = useMutation({
    mutationFn: () => payOrder(orderId, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigation.replace('Order', { id: orderId });
    },
    onError: (e) => setError(errorMessage(e, 'O pagamento não foi aprovado.')),
  });

  if (!logged) return <LoginRequired />;
  if (isLoading) return <ActivityIndicator style={{ marginTop: 48 }} />;
  if (loadError || !order) {
    return (
      <Screen>
        <Empty
          title="Pedido não encontrado"
          text={loadError ? errorMessage(loadError) : undefined}
        />
      </Screen>
    );
  }

  const payable = order.status === 'PENDING' && !order.payment;

  return (
    <Screen>
      <Panel style={{ gap: 4 }}>
        <Text variant="labelLarge" style={{ color: colors.ok }}>
          Pedido #{order.orderNumber} criado
        </Text>
        <Text variant="titleMedium" style={styles.ink}>
          {order.restaurant.name}
        </Text>
        <Text variant="headlineSmall" style={[styles.ink, { fontWeight: '800' }]}>
          {money(order.total)}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.muted }}>
          {order.items.reduce((n, i) => n + i.quantity, 0)} itens · retirada no balcão
        </Text>
      </Panel>

      {payable ? (
        <>
          <Panel style={{ paddingVertical: 8 }}>
            <RadioButton.Group onValueChange={(v) => setMethod(v as PaymentMethod)} value={method}>
              {METHODS.map((m) => (
                <RadioButton.Item key={m} value={m} label={PAYMENT_LABEL[m]} />
              ))}
            </RadioButton.Group>
          </Panel>
          <View style={styles.notice}>
            <Text variant="bodySmall" style={{ color: colors.brandDark }}>
              Pagamento simulado: nenhum valor é cobrado. Ao pagar, o pedido vai para o restaurante.
            </Text>
          </View>
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
          <Button
            mode="contained"
            onPress={() => {
              setError(null);
              pay.mutate();
            }}
            loading={pay.isPending}
            disabled={pay.isPending}
            contentStyle={{ paddingVertical: 6 }}
          >
            {`Pagar ${money(order.total)}`}
          </Button>
          <Button onPress={() => navigation.replace('Order', { id: orderId })}>Pagar depois</Button>
        </>
      ) : (
        <>
          <Empty
            title={
              order.payment ? 'Este pedido já está pago' : 'Este pedido não pode mais ser pago'
            }
          />
          <Button mode="contained" onPress={() => navigation.replace('Order', { id: orderId })}>
            Acompanhar pedido
          </Button>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  ink: { color: colors.ink },
  notice: { backgroundColor: '#FFEDD5', borderRadius: 12, padding: 12 },
});
