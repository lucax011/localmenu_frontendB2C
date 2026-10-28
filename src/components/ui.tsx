import React from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Button, Dialog, Icon, Portal, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { imageSrc } from '@/api/client';
import type { OpenStatus } from '@/utils/format';
import { colors, layout } from '@/theme';

// Conteúdo rolável com largura máxima, para ficar bom no celular e no navegador
export function Screen({
  children,
  refreshing,
  onRefresh,
  footer,
}: {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
        }
      >
        <View style={styles.column}>{children}</View>
      </ScrollView>
      {footer}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {children}
      </Text>
      {right}
    </View>
  );
}

export function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="labelMedium" style={{ color: colors.muted }}>
        {label}
      </Text>
      <Text variant="headlineSmall" style={styles.statValue}>
        {value}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={{ color: colors.muted }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <Panel style={{ alignItems: 'center', paddingVertical: 32 }}>
      <Text variant="titleMedium">{title}</Text>
      {text ? (
        <Text
          variant="bodyMedium"
          style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}
        >
          {text}
        </Text>
      ) : null}
    </Panel>
  );
}

export function ConfirmDialog({
  visible,
  title,
  text,
  confirmLabel = 'Confirmar',
  danger,
  loading,
  onConfirm,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{text}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Voltar</Button>
          <Button
            mode="contained"
            buttonColor={danger ? colors.danger : undefined}
            loading={loading}
            onPress={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export const styles = StyleSheet.create({
  column: { alignSelf: 'center', gap: 12, maxWidth: 760, width: '100%' },
  dialog: { alignSelf: 'center', maxWidth: 440, width: '92%' },
  panel: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  root: { backgroundColor: colors.cream, flex: 1 },
  scroll: { padding: 16, paddingBottom: 96 },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: { color: colors.ink, fontWeight: '700' },
  stat: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    padding: 14,
  },
  statValue: { color: colors.ink, fontWeight: '700', marginTop: 2 },
});

// Foto de prato ou restaurante. Sem foto (ou com erro ao carregar) mostra a inicial sobre o creme.
export function Photo({
  url,
  name,
  style,
  rounded = 12,
}: {
  url?: string | null;
  name: string;
  style?: StyleProp<ViewStyle>;
  rounded?: number;
}) {
  const [failed, setFailed] = React.useState(false);
  const src = imageSrc(url);
  return (
    <View style={[{ borderRadius: rounded, overflow: 'hidden' }, extra.photoBox, style]}>
      {src && !failed ? (
        <Image
          source={{ uri: src }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={extra.photoInitial}>{name.slice(0, 1).toUpperCase()}</Text>
      )}
    </View>
  );
}

// Bloco cinza no lugar do conteúdo enquanto carrega (em vez de spinner)
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[extra.skeleton, style]} accessibilityElementsHidden />;
}

export function SkeletonList({ count = 3, height = 96 }: { count?: number; height?: number }) {
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Carregando">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} style={{ height }} />
      ))}
    </View>
  );
}

type Tab = 'home' | 'orders' | 'account';
const TABS: {
  key: Tab;
  label: string;
  icon: string;
  route: 'Restaurants' | 'Orders' | 'Account';
}[] = [
  { key: 'home', label: 'Início', icon: 'storefront-outline', route: 'Restaurants' },
  { key: 'orders', label: 'Pedidos', icon: 'receipt', route: 'Orders' },
  { key: 'account', label: 'Conta', icon: 'account-circle-outline', route: 'Account' },
];

// Navegação de baixo, onde o polegar alcança. Só nas telas principais.
export function BottomBar({ current }: { current: Tab }) {
  const navigation = useNavigation<{ navigate: (r: string) => void }>();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[extra.bottomBar, { paddingBottom: Math.max(insets.bottom, 6) }]}
      accessibilityRole="tablist"
    >
      {TABS.map((t) => {
        const active = t.key === current;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.label}
            onPress={() => !active && navigation.navigate(t.route)}
            style={extra.tab}
          >
            <Icon source={t.icon} size={24} color={active ? colors.brand : colors.muted} />
            <Text style={[extra.tabLabel, active && { color: colors.brand, fontWeight: '700' }]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Selo "Aberto · fecha às 23:00" / "Fechado · abre amanhã às 11:00"
export function OpenBadge({ status }: { status: OpenStatus | null }) {
  if (!status) return null;
  return (
    <View style={[extra.badge, { backgroundColor: status.open ? '#DCFCE7' : colors.sand }]}>
      <View style={[extra.badgeDot, { backgroundColor: status.open ? colors.ok : colors.muted }]} />
      <Text style={[extra.badgeText, { color: status.open ? colors.ok : colors.muted }]}>
        {status.label}
      </Text>
    </View>
  );
}

const extra = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDot: { borderRadius: 4, height: 8, width: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  bottomBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: 6,
  },
  photoBox: { alignItems: 'center', backgroundColor: colors.brandSoft, justifyContent: 'center' },
  photoInitial: { color: colors.brandDark, fontSize: 22, fontWeight: '800' },
  skeleton: { backgroundColor: colors.sand, borderRadius: layout.radius },
  tab: { alignItems: 'center', flex: 1, gap: 2, justifyContent: 'center', minHeight: layout.touch },
  tabLabel: { color: colors.muted, fontSize: 12 },
});

// Ação principal da tela, fixa embaixo (onde o polegar alcança)
export function ActionBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[bar.actionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.column, { gap: 4 }]}>{children}</View>
    </View>
  );
}

const bar = StyleSheet.create({
  actionBar: {
    backgroundColor: colors.cream,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
});

// Botão principal grande (52 px), usado nas barras de ação
export const bigButton = {
  contentStyle: { minHeight: 52 },
  labelStyle: { fontSize: 16 },
  style: { borderRadius: 14 },
};
