import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getRestaurants } from '@/api/client';
import { BottomBar, Empty, OpenBadge, Panel, Photo, Screen, SkeletonList } from '@/components/ui';
import { matches, openStatus } from '@/utils/format';
import { colors, layout } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurants'>;

export default function RestaurantsScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  const list = (data ?? []).filter((r) => matches(query, r.name, r.description, r.address));

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch} footer={<BottomBar current="home" />}>
      <View style={styles.hero}>
        <Text style={styles.brand}>LocalMenu</Text>
        <Text variant="headlineSmall" style={styles.heroTitle}>
          Peça para retirar
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.muted }}>
          Escolha o restaurante, monte o pedido e busque quando estiver pronto.
        </Text>
      </View>
      <Searchbar
        placeholder="Buscar restaurante"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        inputStyle={styles.searchInput}
      />

      {isLoading ? <SkeletonList count={3} height={210} /> : null}
      {error ? <Empty title="Não deu para carregar" text={errorMessage(error)} /> : null}
      {data && !list.length ? (
        <Empty
          title={query ? 'Nada encontrado' : 'Nenhum restaurante ainda'}
          text={query ? `Nenhum restaurante com "${query}".` : undefined}
        />
      ) : null}

      {list.map((r) => {
        const ready = !!r.menuId;
        const status = openStatus(r.hours ?? []);
        return (
          <Pressable
            key={r.id}
            disabled={!ready}
            accessibilityRole="link"
            accessibilityLabel={r.name}
            onPress={() => navigation.navigate('Restaurant', { slug: r.slug })}
          >
            {({ pressed }) => (
              <Panel style={[styles.card, pressed && styles.pressed, !ready && styles.disabled]}>
                <Photo url={r.coverUrl} name={r.name} rounded={0} style={styles.cover} />
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <Photo url={r.logoUrl} name={r.name} rounded={10} style={styles.logo} />
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={styles.name}>
                        {r.name}
                      </Text>
                      {r.description ? (
                        <Text variant="bodySmall" style={styles.muted} numberOfLines={1}>
                          {r.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    {ready ? (
                      <OpenBadge status={status} />
                    ) : (
                      <Text variant="labelMedium" style={{ color: colors.warn }}>
                        Cardápio em breve
                      </Text>
                    )}
                    {r.address ? (
                      <Text
                        variant="bodySmall"
                        style={[styles.muted, { flex: 1 }]}
                        numberOfLines={1}
                      >
                        {r.address}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Panel>
            )}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 10, padding: 14 },
  brand: { color: colors.brand, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  card: { overflow: 'hidden', padding: 0 },
  cover: { aspectRatio: 16 / 7, width: '100%' },
  disabled: { opacity: 0.6 },
  hero: { gap: 4, marginTop: 8 },
  heroTitle: { color: colors.ink, fontWeight: '800' },
  logo: { height: layout.touch, width: layout.touch },
  metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muted: { color: colors.muted },
  name: { color: colors.ink, fontWeight: '700' },
  pressed: { borderColor: colors.brand },
  search: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: layout.radius,
    borderWidth: 1,
  },
  // 16 px: abaixo disso o iPhone dá zoom ao focar o campo
  searchInput: { fontSize: 16 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
});
