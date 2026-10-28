import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, getRestaurants } from '@/api/client';
import { Empty, Panel, Screen } from '@/components/ui';
import { matches } from '@/utils/format';
import { colors } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurants'>;

export default function RestaurantsScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  const list = (data ?? []).filter((r) => matches(query, r.name, r.description, r.address));

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <View style={styles.hero}>
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
      />

      {isLoading ? <ActivityIndicator style={{ marginTop: 24 }} /> : null}
      {error ? <Empty title="Não deu para carregar" text={errorMessage(error)} /> : null}
      {data && !list.length ? (
        <Empty
          title={query ? 'Nada encontrado' : 'Nenhum restaurante ainda'}
          text={query ? `Nenhum restaurante com "${query}".` : undefined}
        />
      ) : null}

      {list.map((r) => {
        const ready = !!r.menuId;
        return (
          <Pressable
            key={r.id}
            disabled={!ready}
            accessibilityRole="link"
            onPress={() => navigation.navigate('Restaurant', { slug: r.slug })}
          >
            {({ pressed }) => (
              <Panel style={[styles.card, pressed && styles.pressed, !ready && styles.disabled]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{r.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleMedium" style={styles.name}>
                    {r.name}
                  </Text>
                  {r.description ? (
                    <Text variant="bodyMedium" style={{ color: colors.ink }} numberOfLines={2}>
                      {r.description}
                    </Text>
                  ) : null}
                  {r.address ? (
                    <Text variant="bodySmall" style={{ color: colors.muted }}>
                      {r.address}
                    </Text>
                  ) : null}
                  {!ready ? (
                    <Text variant="labelMedium" style={{ color: colors.warn }}>
                      Cardápio em breve
                    </Text>
                  ) : null}
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
  avatar: {
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: { color: colors.brandDark, fontSize: 20, fontWeight: '800' },
  card: { alignItems: 'flex-start', flexDirection: 'row', gap: 14 },
  disabled: { opacity: 0.6 },
  hero: { gap: 4, marginTop: 4 },
  heroTitle: { color: colors.ink, fontWeight: '800' },
  name: { color: colors.ink, fontWeight: '700' },
  pressed: { borderColor: colors.brand },
  search: { backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1 },
});
