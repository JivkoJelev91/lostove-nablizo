import { useState } from 'react';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

import { GhostButton, PrimaryButton, ScreenShell, TextInput } from '@/components';
import { isAuthFailure, signIn } from '@/features/auth/auth-api';
import { validateEmail, validatePasswordEntry } from '@/features/auth/validation';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const firstProblem = validateEmail(email) ?? validatePasswordEntry(password);

    if (firstProblem !== null) {
      setProblem(firstProblem);
      return;
    }

    setProblem(null);
    setBusy(true);

    try {
      await signIn(email, password);
      router.replace('/');
    } catch (failure: unknown) {
      setProblem(isAuthFailure(failure) ? failure.key : 'auth.error.generic');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell description={t('auth.signInDescription')} scroll title={t('auth.signInTitle')}>
      <View className="gap-space-12">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label={t('auth.email')}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
        />
        <TextInput
          label={t('auth.password')}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
          value={password}
        />

        {problem !== null ? (
          <Text className="text-bodySmall text-status-bad">{t(problem)}</Text>
        ) : null}
      </View>

      <View className="gap-space-8">
        <PrimaryButton
          label={t('auth.signIn')}
          loading={busy}
          onPress={() => {
            void submit();
          }}
        />
        <GhostButton
          label={t('auth.createAccountLink')}
          onPress={() => router.push('/auth/sign-up')}
        />
      </View>
    </ScreenShell>
  );
}
