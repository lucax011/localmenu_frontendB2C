import React from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { Empty, Screen } from '@/components/ui';

// Mostrado nas telas de pedido quando ninguém está logado (ex.: link aberto direto no navegador)
export default function LoginRequired({ footer }: { footer?: React.ReactNode }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Screen footer={footer}>
      <Empty
        title="Entre para ver seus pedidos"
        text="Seus pedidos ficam guardados na sua conta."
      />
      <Button mode="contained" onPress={() => navigation.navigate('Auth')}>
        Entrar
      </Button>
    </Screen>
  );
}
