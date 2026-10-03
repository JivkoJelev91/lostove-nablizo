import { useState } from 'react';
import { Text, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { GhostButton, PasswordInput, PrimaryButton, ScreenShell, TextInput } from '@/components';
import { isAuthFailure, signIn } from '@/features/auth/auth-api';
import { isKnownRoute } from '@/features/auth/return-route';
import { validateEmail, validatePasswordEntry } from '@/features/auth/validation';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

export default function SignInScreen() {
  const { next } = useLocalSearchParams<{ next?: string | string[] }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);

  // Where to go after signing in. A guard that pushed this screen came from somewhere specific, and
  // `replace` there is what makes "sign in to save this spot" end at that spot rather than on the
  // home tab. An unrecognised or absent value falls back to the feed.
  const destination = typeof next === 'string' && isKnownRoute(next) ? next : '/';

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
      router.replace(destination);
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
        <PasswordInput
          label={t('auth.password')}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
        />

        {problem !== null ? (
          <Text className="font-regular text-bodySmall text-status-bad">{t(problem)}</Text>
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
