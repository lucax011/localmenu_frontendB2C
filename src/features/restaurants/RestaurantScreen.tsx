import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, IconButton, Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getRestaurantBySlug } from '@/api/client';
import type { MenuItem } from '@/api/types';
import { ConfirmDialog, Empty, Panel, Screen, SectionTitle } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { cartCount, cartTotal, CartRestaurant, MAX_QTY } from '@/utils/cart';
import { filterMenu, money, todayHours } from '@/utils/format';
import { colors } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;

export default function RestaurantScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [pending, setPending] = useState<MenuItem | null>(null);
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => getRestaurantBySlug(slug),
  });

  const cart = useCartStore();
  const restaurant = data?.restaurant;

  useEffect(() => {
    if (restaurant) navigation.setOptions({ title: restaurant.name });
  }, [navigation, restaurant]);

  if (isLoading) return <ActivityIndicator style={{ marginTop: 48 }} />;
  if (error || !restaurant) {
    return (
      <Screen>
        <Empty title="Restaurante não encontrado" text={error ? errorMessage(error) : undefined} />
      </Screen>
    );
  }

  const target: CartRestaurant = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
  };
  const categories = data.menu?.categories ?? [];
  const visible = filterMenu(
    categoryId ? categories.filter((c) => c.id === categoryId) : categories,
    query
  );
  const qtyOf = (id: string) =>
    cart.restaurant?.id === restaurant.id
      ? (cart.lines.find((l) => l.itemId === id)?.quantity ?? 0)
      : 0;
  const mine = cart.restaurant?.id === restaurant.id ? cart.lines : [];
  const hours = todayHours(restaurant.hours);

  const add = (item: MenuItem) => {
    if (!cart.add(target, item)) setPending(item);
  };

  return (
    <Screen
      refreshing={isRefetching}
      onRefresh={refetch}
      footer={
        <>
          {mine.length ? (
            <View style={styles.footer}>
              <Button
                mode="contained"
                icon="basket"
                onPress={() => navigation.navigate('Cart')}
                contentStyle={{ paddingVertical: 6 }}
                style={styles.footerButton}
              >
                {`Ver carrinho · ${cartCount(mine)} ${cartCount(mine) === 1 ? 'item' : 'itens'} · ${money(cartTotal(mine))}`}
              </Button>
            </View>
          ) : null}
          <ConfirmDialog
            visible={!!pending}
            title="Começar outro pedido?"
            text={`Seu carrinho tem itens de ${cart.restaurant?.name}. Um pedido é de um restaurante só: para adicionar este item, o carrinho atual será esvaziado.`}
            confirmLabel="Esvaziar e adicionar"
            onDismiss={() => setPending(null)}
            onConfirm={() => {
              if (pending) cart.replaceWith(target, pending);
              setPending(null);
            }}
          />
        </>
      }
    >
      <Panel style={{ gap: 4 }}>
        <Text variant="headlineSmall" style={styles.title}>
          {restaurant.name}
        </Text>
        {restaurant.description ? <Text variant="bodyMedium">{restaurant.description}</Text> : null}
        {restaurant.address ? (
          <Text variant="bodySmall" style={styles.muted}>
            {restaurant.address}
          </Text>
        ) : null}
        {restaurant.phone || hours ? (
          <Text variant="bodySmall" style={styles.muted}>
            {[hours, restaurant.phone].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        <Text variant="labelMedium" style={{ color: colors.ok, marginTop: 4 }}>
          Retirada no balcão
        </Text>
      </Panel>

      <Searchbar
        placeholder="Buscar no cardápio"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      {categories.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            <Chip selected={!categoryId} onPress={() => setCategoryId(null)}>
              Tudo
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c.id}
                selected={categoryId === c.id}
                onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
              >
                {c.name}
              </Chip>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {!categories.length ? (
        <Empty title="Cardápio vazio" text="Este restaurante ainda não cadastrou itens." />
      ) : null}
      {categories.length && !visible.length ? (
        <Empty title="Nada encontrado" text={`Nenhum item com "${query}".`} />
      ) : null}

      {visible.map((c) => (
        <View key={c.id} style={{ gap: 8 }}>
          <SectionTitle>{c.name}</SectionTitle>
          {c.items.map((item) => {
            const qty = qtyOf(item.id);
            return (
              <Panel key={item.id} style={[styles.item, !item.isAvailable && styles.off]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleSmall" style={styles.itemName}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text variant="bodySmall" style={styles.muted}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text variant="titleSmall" style={{ color: colors.ink, marginTop: 2 }}>
                    {money(item.price)}
                  </Text>
                </View>
                {!item.isAvailable ? (
                  <Text variant="labelMedium" style={styles.muted}>
                    Indisponível
                  </Text>
                ) : qty ? (
                  <View style={styles.stepper}>
                    <IconButton
                      icon="minus"
                      size={18}
                      accessibilityLabel={`Tirar um ${item.name}`}
                      onPress={() => cart.setQty(item.id, qty - 1)}
                    />
                    <Text variant="titleSmall">{qty}</Text>
                    <IconButton
                      icon="plus"
                      size={18}
                      disabled={qty >= MAX_QTY}
                      accessibilityLabel={`Mais um ${item.name}`}
                      onPress={() => add(item)}
                    />
                  </View>
                ) : (
                  <Button mode="contained-tonal" icon="plus" onPress={() => add(item)}>
                    Adicionar
                  </Button>
                )}
              </Panel>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8 },
  footer: {
    backgroundColor: colors.cream,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 12,
    position: 'absolute',
    right: 0,
  },
  footerButton: { alignSelf: 'center', maxWidth: 760, width: '100%' },
  item: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  itemName: { color: colors.ink, fontWeight: '700' },
  muted: { color: colors.muted },
  off: { opacity: 0.55 },
  search: { backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1 },
  stepper: {
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderRadius: 20,
    flexDirection: 'row',
  },
  title: { color: colors.ink, fontWeight: '800' },
});
