import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';
import { errorMessage, login, register } from '@/api/client';
import type { AuthResponse } from '@/api/types';
import { Screen } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { RegisterForm, registerSchema, loginSchema } from '@/utils/validators';
import { colors } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;
type Mode = 'login' | 'register';

export default function AuthScreen({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RegisterForm>({
    // no login só e-mail e senha são validados
    resolver: zodResolver(
      mode === 'login' ? loginSchema : registerSchema
    ) as Resolver<RegisterForm>,
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      let res: AuthResponse;
      if (mode === 'login') {
        res = await login(data.email.trim(), data.password);
      } else {
        res = await register({
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
          phone: data.phone?.trim() || undefined,
        });
      }
      if (res.user.userType !== 'CUSTOMER') {
        setError('Esta conta é de restaurante. Use o app LocalMenu para restaurantes.');
        return;
      }
      setSession(res.accessToken, res.refreshToken, res.user);
      // volta para onde o cliente estava (normalmente o carrinho)
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.replace('Restaurants');
    } catch (e) {
      setError(
        errorMessage(
          e,
          mode === 'login' ? 'Não foi possível entrar.' : 'Não foi possível criar a conta.'
        )
      );
    }
  };

  const field = (
    name: keyof RegisterForm,
    label: string,
    extra: Partial<React.ComponentProps<typeof TextInput>> = {}
  ) => (
    <View>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            mode="outlined"
            label={label}
            value={value}
            onChangeText={onChange}
            error={!!errors[name]}
            testID={`campo-${name}`}
            {...extra}
          />
        )}
      />
      <HelperText type="error" visible={!!errors[name]}>
        {errors[name]?.message}
      </HelperText>
    </View>
  );

  return (
    <Screen>
      <View style={styles.card}>
        <Text variant="headlineSmall" style={styles.title}>
          {mode === 'login' ? 'Entre para pedir' : 'Crie sua conta'}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Seu carrinho continua guardado enquanto isso.
        </Text>
        <SegmentedButtons
          value={mode}
          onValueChange={(v) => {
            setMode(v as Mode);
            setError(null);
          }}
          buttons={[
            { value: 'login', label: 'Já tenho conta' },
            { value: 'register', label: 'Criar conta' },
          ]}
          style={{ marginBottom: 16 }}
        />

        {mode === 'register' ? field('name', 'Nome') : null}
        {field('email', 'E-mail', { autoCapitalize: 'none', keyboardType: 'email-address' })}
        {field('password', 'Senha', {
          secureTextEntry: true,
          onSubmitEditing: handleSubmit(onSubmit),
        })}
        {mode === 'register'
          ? field('phone', 'Celular (opcional)', { keyboardType: 'phone-pad' })
          : null}

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          contentStyle={{ paddingVertical: 6 }}
        >
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </Button>

        {__DEV__ && mode === 'login' ? (
          <Text variant="bodySmall" style={styles.hint}>
            Ambiente local: cliente@localmenu.dev / localmenu123
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    maxWidth: 440,
    padding: 24,
    width: '100%',
  },
  hint: { color: colors.muted, marginTop: 16, textAlign: 'center' },
  subtitle: { color: colors.muted, marginBottom: 16, marginTop: 4 },
  title: { color: colors.ink, fontWeight: '700' },
});
