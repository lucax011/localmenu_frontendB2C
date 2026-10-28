import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Text, TextInput } from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { createOrder, errorMessage } from '@/api/client';
import { Empty, Panel, Screen, SectionTitle } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cartTotal, MAX_QTY, toOrderPayload } from '@/utils/cart';
import { money } from '@/utils/format';
import { colors } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
  const { restaurant, lines, notes, setQty, setNotes, clear } = useCartStore();
  const logged = useAuthStore((s) => !!s.accessToken);
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const order = useMutation({
    mutationFn: () => createOrder(toOrderPayload(restaurant!.id, lines, notes)),
    onSuccess: (created) => {
      clear();
      qc.invalidateQueries({ queryKey: ['orders'] });
      navigation.replace('Payment', { orderId: created.id });
    },
    onError: (e) => setError(errorMessage(e, 'Não foi possível fazer o pedido.')),
  });

  if (!restaurant || !lines.length) {
    return (
      <Screen>
        <Empty title="Carrinho vazio" text="Escolha um restaurante e adicione itens do cardápio." />
        <Button mode="contained" onPress={() => navigation.navigate('Restaurants')}>
          Ver restaurantes
        </Button>
      </Screen>
    );
  }

  const total = cartTotal(lines);

  return (
    <Screen>
      <SectionTitle
        right={
          <Button
            compact
            onPress={() => navigation.navigate('Restaurant', { slug: restaurant.slug })}
          >
            Adicionar mais
          </Button>
        }
      >
        {restaurant.name}
      </SectionTitle>

      <Panel style={{ gap: 4, paddingVertical: 8 }}>
        {lines.map((l) => (
          <View key={l.itemId} style={styles.line}>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ color: colors.ink }}>
                {l.name}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {money(l.price)} cada
              </Text>
            </View>
            <View style={styles.stepper}>
              <IconButton
                icon={l.quantity === 1 ? 'trash-can-outline' : 'minus'}
                size={18}
                accessibilityLabel={l.quantity === 1 ? `Remover ${l.name}` : `Tirar um ${l.name}`}
                onPress={() => setQty(l.itemId, l.quantity - 1)}
              />
              <Text variant="titleSmall">{l.quantity}</Text>
              <IconButton
                icon="plus"
                size={18}
                disabled={l.quantity >= MAX_QTY}
                accessibilityLabel={`Mais um ${l.name}`}
                onPress={() => setQty(l.itemId, l.quantity + 1)}
              />
            </View>
            <Text variant="titleSmall" style={styles.lineTotal}>
              {money(l.price * l.quantity)}
            </Text>
          </View>
        ))}
      </Panel>

      <TextInput
        mode="outlined"
        label="Observações (opcional)"
        placeholder="Ex.: sem cebola, ponto da carne"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={300}
      />

      <Panel style={styles.summary}>
        <View style={styles.row}>
          <Text variant="bodyMedium">Retirada no balcão</Text>
          <Text variant="bodyMedium" style={{ color: colors.ok }}>
            Grátis
          </Text>
        </View>
        <View style={styles.row}>
          <Text variant="titleMedium" style={styles.total}>
            Total
          </Text>
          <Text variant="titleMedium" style={styles.total}>
            {money(total)}
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: colors.muted }}>
          O valor final é conferido pelo restaurante no momento do pedido.
        </Text>
      </Panel>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
      {logged ? (
        <Button
          mode="contained"
          onPress={() => {
            setError(null);
            order.mutate();
          }}
          loading={order.isPending}
          disabled={order.isPending}
          contentStyle={{ paddingVertical: 6 }}
        >
          {`Fazer pedido · ${money(total)}`}
        </Button>
      ) : (
        <Button
          mode="contained"
          icon="account"
          onPress={() => navigation.navigate('Auth')}
          contentStyle={{ paddingVertical: 6 }}
        >
          Entrar para fazer o pedido
        </Button>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 6 },
  lineTotal: { color: colors.ink, minWidth: 84, textAlign: 'right' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  stepper: {
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderRadius: 20,
    flexDirection: 'row',
  },
  summary: { gap: 8 },
  total: { color: colors.ink, fontWeight: '800' },
});
