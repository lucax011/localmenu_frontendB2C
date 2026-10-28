import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, IconButton, Text } from 'react-native-paper';
import {
  canPromptInstall,
  dismissInstall,
  installDismissed,
  isInstalled,
  isIosSafari,
  onInstallChange,
  promptInstall,
} from '@/pwa';
import { colors } from '@/theme';

// Convite para instalar o app, mostrado depois do primeiro pedido (não na entrada)
export default function InstallBanner() {
  const [, refresh] = useState(0);
  const [hidden, setHidden] = useState(installDismissed);
  useEffect(() => onInstallChange(() => refresh((n) => n + 1)), []);

  const ios = isIosSafari();
  if (hidden || isInstalled() || (!canPromptInstall() && !ios)) return null;

  const close = () => {
    dismissInstall();
    setHidden(true);
  };

  return (
    <View style={styles.box}>
      <Icon source="cellphone-arrow-down" size={28} color={colors.brandDark} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="titleSmall" style={styles.title}>
          Tenha o LocalMenu na tela inicial
        </Text>
        <Text variant="bodySmall" style={{ color: colors.brandDark }}>
          {ios
            ? 'No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.'
            : 'Abre mais rápido, direto da tela do celular.'}
        </Text>
        {!ios ? (
          <Button
            mode="contained"
            compact
            style={{ alignSelf: 'flex-start', marginTop: 6 }}
            onPress={async () => {
              if (await promptInstall()) setHidden(true);
            }}
          >
            Instalar
          </Button>
        ) : null}
      </View>
      <IconButton icon="close" size={18} accessibilityLabel="Fechar convite" onPress={close} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'flex-start',
    backgroundColor: colors.brandSoft,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    paddingLeft: 14,
    paddingVertical: 12,
  },
  title: { color: colors.brandDark, fontWeight: '700' },
});
