import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { BottomBar, Empty, Panel, Screen } from '@/components/ui';
import InstallBanner from '@/components/InstallBanner';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

export default function AccountScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logged = useAuthStore((s) => !!s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();

  return (
    <Screen footer={<BottomBar current="account" />}>
      {logged && user ? (
        <>
          <Panel style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.name}>
                {user.name}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {[user.email, user.phone].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </Panel>
          <Button
            mode="contained-tonal"
            icon="receipt"
            onPress={() => navigation.navigate('Orders')}
          >
            Meus pedidos
          </Button>
          <Button
            icon="logout"
            textColor={colors.danger}
            onPress={() => {
              qc.removeQueries({ queryKey: ['orders'] });
              logout();
            }}
          >
            Sair
          </Button>
        </>
      ) : (
        <>
          <Empty
            title="Entre na sua conta"
            text="A conta só é pedida na hora de pagar. Seus pedidos ficam guardados nela."
          />
          <Button mode="contained" onPress={() => navigation.navigate('Auth')}>
            Entrar ou criar conta
          </Button>
        </>
      )}
      <InstallBanner />
      <Text variant="bodySmall" style={styles.note}>
        Versão de testes: o pagamento é simulado e nenhum valor é cobrado.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: { color: colors.brandDark, fontSize: 22, fontWeight: '800' },
  name: { color: colors.ink, fontWeight: '700' },
  note: { color: colors.muted, marginTop: 8, textAlign: 'center' },
  profile: { alignItems: 'center', flexDirection: 'row', gap: 14 },
});
