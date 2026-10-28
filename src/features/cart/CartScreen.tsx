import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Text, TextInput } from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { createOrder, errorMessage } from '@/api/client';
import { ActionBar, bigButton, Empty, Panel, Photo, Screen, SectionTitle } from '@/components/ui';
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
    <Screen
      footer={
        <ActionBar>
          {error ? (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          ) : null}
          {logged ? (
            <Button
              mode="contained"
              onPress={() => {
                setError(null);
                order.mutate();
              }}
              loading={order.isPending}
              disabled={order.isPending}
              {...bigButton}
            >
              {`Fazer pedido · ${money(total)}`}
            </Button>
          ) : (
            <Button
              mode="contained"
              icon="account"
              onPress={() => navigation.navigate('Auth')}
              {...bigButton}
            >
              Entrar para fazer o pedido
            </Button>
          )}
        </ActionBar>
      }
    >
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
            {l.imageUrl ? <Photo url={l.imageUrl} name={l.name} style={styles.thumb} /> : null}
            {/* nome e total em cima, quantidade embaixo: cabe em 360 px sem quebrar o nome */}
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.row}>
                <Text variant="titleSmall" style={{ color: colors.ink, flex: 1 }}>
                  {l.name}
                </Text>
                <Text variant="titleSmall" style={styles.lineTotal}>
                  {money(l.price * l.quantity)}
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {money(l.price)} cada
              </Text>
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
            </View>
          </View>
        ))}
      </Panel>

      <Text variant="labelLarge" style={{ color: colors.ink, marginBottom: -4 }}>
        Observações (opcional)
      </Text>
      <TextInput
        mode="outlined"
        accessibilityLabel="Observações (opcional)"
        placeholder="Ex.: sem cebola, ponto da carne"
        style={{ fontSize: 16 }}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, paddingVertical: 8 },
  lineTotal: { color: colors.ink, textAlign: 'right' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  stepper: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFEDD5',
    borderRadius: 20,
    flexDirection: 'row',
    marginTop: 6,
  },
  summary: { gap: 8 },
  thumb: { height: 48, width: 48 },
  total: { color: colors.ink, fontWeight: '800' },
});
