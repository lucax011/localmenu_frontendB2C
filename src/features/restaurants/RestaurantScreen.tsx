import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Badge, Button, Chip, IconButton, Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getRestaurantBySlug } from '@/api/client';
import type { MenuItem } from '@/api/types';
import { ConfirmDialog, Empty, OpenBadge, Photo, Screen, Skeleton } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { cartCount, cartTotal, CartRestaurant, MAX_QTY } from '@/utils/cart';
import { filterMenu, money, openStatus, todayHours } from '@/utils/format';
import { colors, layout } from '@/theme';
import ItemSheet from './ItemSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;

// altura da faixa fixa (busca + categorias), descontada ao rolar até uma categoria
const STICKY_OFFSET = 128;

export default function RestaurantScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<MenuItem | null>(null);
  const [pending, setPending] = useState<MenuItem | null>(null);
  const scroll = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => getRestaurantBySlug(slug),
  });

  const cart = useCartStore();
  const restaurant = data?.restaurant;

  useEffect(() => {
    if (restaurant) navigation.setOptions({ title: restaurant.name });
  }, [navigation, restaurant]);

  const back = () =>
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Restaurants');

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Skeleton style={{ borderRadius: 0, height: 200 }} />
        <View style={[styles.col, { gap: 12, padding: layout.gutter }]}>
          <Skeleton style={{ height: 96 }} />
          <Skeleton style={{ height: 112 }} />
          <Skeleton style={{ height: 112 }} />
        </View>
      </View>
    );
  }
  if (error || !restaurant) {
    return (
      <Screen>
        <Empty title="Restaurante não encontrado" text={error ? errorMessage(error) : undefined} />
        <Button mode="contained" onPress={() => navigation.navigate('Restaurants')}>
          Ver restaurantes
        </Button>
      </Screen>
    );
  }

  const target: CartRestaurant = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
  };
  const categories = data.menu?.categories ?? [];
  const visible = filterMenu(categories, query);
  const mine = cart.restaurant?.id === restaurant.id ? cart.lines : [];
  const qtyOf = (id: string) => mine.find((l) => l.itemId === id)?.quantity ?? 0;
  const status = openStatus(restaurant.hours);
  const hours = todayHours(restaurant.hours);
  const current = active ?? visible[0]?.id ?? null;

  const add = (item: MenuItem, quantity = 1) => {
    const before = qtyOf(item.id);
    if (!cart.add(target, item)) {
      setPending(item);
      return;
    }
    if (quantity > 1) cart.setQty(item.id, Math.min(MAX_QTY, before + quantity));
  };

  // categoria ativa = a última cujo título já passou da faixa fixa
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + STICKY_OFFSET + 8;
    let id: string | null = visible[0]?.id ?? null;
    for (const c of visible) if ((sectionY.current[c.id] ?? Infinity) <= y) id = c.id;
    if (id !== active) setActive(id);
  };

  const goTo = (id: string) => {
    setActive(id);
    const y = sectionY.current[id];
    if (y !== undefined) scroll.current?.scrollTo({ y: y - STICKY_OFFSET + 4, animated: true });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scroll}
        stickyHeaderIndices={[2]}
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* 0: capa */}
        <View>
          <Photo
            url={restaurant.coverUrl}
            name={restaurant.name}
            rounded={0}
            style={styles.cover}
          />
          <View style={styles.coverShade} />
          <View style={[styles.coverActions, { top: insets.top + 8 }]}>
            <IconButton
              icon="arrow-left"
              mode="contained"
              containerColor={colors.card}
              iconColor={colors.ink}
              accessibilityLabel="Voltar"
              onPress={back}
            />
            <View>
              <IconButton
                icon="basket-outline"
                mode="contained"
                containerColor={colors.card}
                iconColor={colors.ink}
                accessibilityLabel="Carrinho"
                onPress={() => navigation.navigate('Cart')}
              />
              {mine.length ? (
                <Badge style={styles.cartBadge} size={18}>
                  {cartCount(mine)}
                </Badge>
              ) : null}
            </View>
          </View>
        </View>

        {/* 1: dados do restaurante, sobre a capa */}
        <View style={[styles.col, styles.infoWrap]}>
          <View style={styles.info}>
            <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
              {restaurant.name}
            </Text>
            {restaurant.description ? (
              <Text variant="bodyMedium" style={{ color: colors.ink }}>
                {restaurant.description}
              </Text>
            ) : null}
            <OpenBadge status={status} />
            <Text variant="bodySmall" style={styles.muted}>
              {['Retirada no balcão', restaurant.address].filter(Boolean).join(' · ')}
            </Text>
            {hours || restaurant.phone ? (
              <Text variant="bodySmall" style={styles.muted}>
                {[hours, restaurant.phone].filter(Boolean).join(' · ')}
              </Text>
            ) : null}
          </View>
        </View>

        {/* 2: faixa fixa com busca e categorias */}
        <View style={styles.sticky}>
          <View style={[styles.col, { gap: 8 }]}>
            <Searchbar
              placeholder="Buscar no cardápio"
              value={query}
              onChangeText={(q) => {
                setQuery(q);
                setActive(null);
              }}
              style={styles.search}
              inputStyle={{ fontSize: 16, minHeight: 0 }}
            />
            {visible.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chips}>
                  {visible.map((c) => (
                    <Chip
                      key={c.id}
                      selected={current === c.id}
                      showSelectedCheck={false}
                      style={current === c.id ? styles.chipOn : styles.chip}
                      textStyle={current === c.id ? styles.chipOnText : undefined}
                      onPress={() => goTo(c.id)}
                    >
                      {c.name}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>

        {!categories.length ? (
          <View style={[styles.col, styles.pad]}>
            <Empty title="Cardápio vazio" text="Este restaurante ainda não cadastrou itens." />
          </View>
        ) : null}
        {categories.length && !visible.length ? (
          <View style={[styles.col, styles.pad]}>
            <Empty title="Nada encontrado" text={`Nenhum item com "${query}".`} />
          </View>
        ) : null}

        {visible.map((c) => (
          <View
            key={c.id}
            style={[styles.col, styles.pad, { gap: 4 }]}
            onLayout={(e: LayoutChangeEvent) => {
              sectionY.current[c.id] = e.nativeEvent.layout.y;
            }}
          >
            <Text variant="titleMedium" style={styles.section} accessibilityRole="header">
              {c.name}
            </Text>
            {c.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                qty={qtyOf(item.id)}
                onOpen={() => setOpen(item)}
                onAdd={() => add(item)}
                onLess={() => cart.setQty(item.id, qtyOf(item.id) - 1)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {mine.length ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button
            mode="contained"
            icon="basket"
            onPress={() => navigation.navigate('Cart')}
            contentStyle={styles.footerContent}
            labelStyle={{ fontSize: 16 }}
            style={styles.footerButton}
          >
            {`Ver carrinho · ${cartCount(mine)} ${cartCount(mine) === 1 ? 'item' : 'itens'} · ${money(cartTotal(mine))}`}
          </Button>
        </View>
      ) : null}

      <ItemSheet
        item={open}
        inCart={open ? qtyOf(open.id) : 0}
        onDismiss={() => setOpen(null)}
        onAdd={(item, quantity) => {
          setOpen(null);
          add(item, quantity);
        }}
      />
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
    </View>
  );
}

// Prato: texto à esquerda, foto à direita com o botão de adicionar sobre ela
function ItemRow({
  item,
  qty,
  onOpen,
  onAdd,
  onLess,
}: {
  item: MenuItem;
  qty: number;
  onOpen: () => void;
  onAdd: () => void;
  onLess: () => void;
}) {
  const off = !item.isAvailable;
  const control = off ? (
    <Text style={styles.soldOut}>Esgotado</Text>
  ) : qty ? (
    <View style={styles.stepper}>
      <IconButton
        icon={qty === 1 ? 'trash-can-outline' : 'minus'}
        size={18}
        style={styles.stepBtn}
        accessibilityLabel={`Tirar um ${item.name}`}
        onPress={onLess}
      />
      <Text style={styles.stepQty}>{qty}</Text>
      <IconButton
        icon="plus"
        size={18}
        style={styles.stepBtn}
        disabled={qty >= MAX_QTY}
        accessibilityLabel={`Mais um ${item.name}`}
        onPress={onAdd}
      />
    </View>
  ) : (
    <IconButton
      icon="plus"
      mode="contained"
      size={22}
      containerColor={colors.brand}
      iconColor="#FFFFFF"
      style={styles.addBtn}
      accessibilityLabel={`Adicionar ${item.name}`}
      onPress={onAdd}
    />
  );

  return (
    <Pressable
      onPress={onOpen}
      disabled={off}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${money(item.price)}. Ver detalhes`}
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.sand }]}
    >
      <View style={[styles.itemText, off && styles.off]}>
        <Text variant="titleSmall" style={styles.itemName}>
          {item.name}
        </Text>
        {item.description ? (
          <Text variant="bodySmall" style={styles.muted} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text variant="titleSmall" style={styles.price}>
          {money(item.price)}
        </Text>
      </View>
      {item.imageUrl ? (
        <View style={styles.photoCol}>
          <Photo url={item.imageUrl} name={item.name} style={[styles.photo, off && styles.off]} />
          <View style={qty && !off ? styles.controlCenter : styles.controlCorner}>{control}</View>
        </View>
      ) : (
        <View style={styles.noPhotoCol}>{control}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addBtn: { margin: 0 },
  cartBadge: { position: 'absolute', right: 2, top: 2 },
  chip: { backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1 },
  chipOn: { backgroundColor: colors.ink },
  chipOnText: { color: '#FFFFFF', fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  col: { alignSelf: 'center', maxWidth: layout.maxWidth, width: '100%' },
  controlCenter: { alignItems: 'center', bottom: -14, left: 0, position: 'absolute', right: 0 },
  controlCorner: { bottom: -10, position: 'absolute', right: -6 },
  cover: { height: 200, width: '100%' },
  coverActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 8,
    position: 'absolute',
    right: 8,
  },
  coverShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,25,23,0.18)' },
  footer: {
    backgroundColor: colors.cream,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  footerButton: { alignSelf: 'center', borderRadius: 14, maxWidth: layout.maxWidth, width: '100%' },
  footerContent: { minHeight: 52 },
  info: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: layout.radius,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  infoWrap: { marginTop: -28, paddingHorizontal: layout.gutter },
  item: {
    alignItems: 'flex-start',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
  },
  itemName: { color: colors.ink, fontWeight: '700' },
  itemText: { flex: 1, gap: 4 },
  muted: { color: colors.muted },
  noPhotoCol: { alignItems: 'flex-end', justifyContent: 'center', minHeight: 72, minWidth: 96 },
  off: { opacity: 0.45 },
  pad: { paddingHorizontal: layout.gutter },
  photo: { height: 104, width: 104 },
  photoCol: { marginBottom: 8 },
  price: { color: colors.ink, marginTop: 2 },
  root: { backgroundColor: colors.cream, flex: 1 },
  search: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: layout.radius,
    borderWidth: 1,
    height: 48,
  },
  section: { color: colors.ink, fontWeight: '800', marginTop: 20 },
  soldOut: {
    backgroundColor: colors.sand,
    borderRadius: 999,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepBtn: { margin: 0 },
  stepQty: { color: colors.ink, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
  },
  sticky: {
    backgroundColor: colors.cream,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    paddingHorizontal: layout.gutter,
    paddingVertical: 10,
  },
  title: { color: colors.ink, fontWeight: '800' },
});
