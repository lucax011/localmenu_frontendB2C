import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Modal, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MenuItem } from '@/api/types';
import { Photo } from '@/components/ui';
import { MAX_QTY } from '@/utils/cart';
import { money } from '@/utils/format';
import { colors, layout } from '@/theme';

// Detalhe do prato numa folha que sobe de baixo: foto grande, descrição e quantidade
export default function ItemSheet({
  item,
  inCart,
  onDismiss,
  onAdd,
}: {
  item: MenuItem | null;
  inCart: number;
  onDismiss: () => void;
  onAdd: (item: MenuItem, quantity: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState(1);
  useEffect(() => setQty(1), [item?.id]);

  const room = MAX_QTY - inCart;
  return (
    <Portal>
      <Modal
        visible={!!item}
        onDismiss={onDismiss}
        style={styles.modal}
        contentContainerStyle={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        {item ? (
          <>
            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 8 }}>
              <View style={styles.handle} />
              {item.imageUrl ? (
                <Photo url={item.imageUrl} name={item.name} style={styles.photo} />
              ) : null}
              <View style={styles.titleRow}>
                <Text variant="titleLarge" style={styles.name} accessibilityRole="header">
                  {item.name}
                </Text>
                <IconButton icon="close" accessibilityLabel="Fechar" onPress={onDismiss} />
              </View>
              {item.description ? (
                <Text variant="bodyLarge" style={{ color: colors.ink }}>
                  {item.description}
                </Text>
              ) : null}
              <Text variant="titleMedium" style={styles.price}>
                {money(item.price)}
              </Text>
              {inCart ? (
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  Já tem {inCart} no carrinho.
                </Text>
              ) : null}
            </ScrollView>

            <View style={styles.actions}>
              <View style={styles.stepper}>
                <IconButton
                  icon="minus"
                  disabled={qty <= 1}
                  accessibilityLabel="Menos um"
                  onPress={() => setQty(qty - 1)}
                />
                <Text style={styles.qty} accessibilityLabel={`Quantidade: ${qty}`}>
                  {qty}
                </Text>
                <IconButton
                  icon="plus"
                  disabled={qty >= room}
                  accessibilityLabel="Mais um"
                  onPress={() => setQty(qty + 1)}
                />
              </View>
              <Button
                mode="contained"
                style={{ borderRadius: 14, flex: 1 }}
                contentStyle={{ minHeight: 52 }}
                labelStyle={{ fontSize: 16 }}
                disabled={room <= 0}
                onPress={() => onAdd(item, qty)}
              >
                {room <= 0 ? 'Limite no carrinho' : `Adicionar · ${money(item.price * qty)}`}
              </Button>
            </View>
          </>
        ) : null}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 16 },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.line,
    borderRadius: 3,
    height: 5,
    marginBottom: 4,
    width: 40,
  },
  modal: { justifyContent: 'flex-end', margin: 0 },
  name: { color: colors.ink, flex: 1, fontWeight: '800' },
  photo: { aspectRatio: 16 / 10, width: '100%' },
  price: { color: colors.ink, fontWeight: '700' },
  qty: { color: colors.ink, fontSize: 18, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  sheet: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    maxWidth: layout.maxWidth,
    padding: layout.gutter,
    width: '100%',
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.sand,
    borderRadius: 999,
    flexDirection: 'row',
  },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
});
