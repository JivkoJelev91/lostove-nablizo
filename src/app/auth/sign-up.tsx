import { useState } from 'react';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

import { GhostButton, PrimaryButton, ScreenShell, TextInput } from '@/components';
import { isAuthFailure, signUp } from '@/features/auth/auth-api';
import { validateEmail, validateName, validateNewPassword } from '@/features/auth/validation';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState<TranslationKey | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const firstProblem =
      validateName(name) ?? validateEmail(email) ?? validateNewPassword(password);

    if (firstProblem !== null) {
      setProblem(firstProblem);
      return;
    }

    setProblem(null);
    setCheckEmail(false);
    setBusy(true);

    try {
      const { signedIn } = await signUp({ email, fullName: name, password });

      if (signedIn) {
        router.replace('/');
      } else {
        // Only reachable if the project starts requiring a confirmed email again: the account
        // exists but has no session yet, and telling the athlete that is the whole next step.
        setCheckEmail(true);
      }
    } catch (failure: unknown) {
      setProblem(isAuthFailure(failure) ? failure.key : 'auth.error.generic');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell description={t('auth.signUpDescription')} scroll title={t('auth.signUpTitle')}>
      <View className="gap-space-12">
        <TextInput
          autoCapitalize="words"
          label={t('auth.name')}
          onChangeText={setName}
          placeholder={t('auth.namePlaceholder')}
          value={name}
        />
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
          placeholder={t('auth.newPasswordPlaceholder')}
          secureTextEntry
          value={password}
        />

        {problem !== null ? (
          <Text className="font-regular text-bodySmall text-status-bad">{t(problem)}</Text>
        ) : null}
      </View>

      <View className="gap-space-8">
        <PrimaryButton
          label={t('auth.createAccount')}
          loading={busy}
          onPress={() => {
            void submit();
          }}
        />

        {checkEmail ? (
          <Text className="font-regular text-bodySmall text-status-good">
            {t('auth.checkEmail')}
          </Text>
        ) : null}

        <GhostButton label={t('auth.haveAccount')} onPress={() => router.push('/auth')} />
      </View>
    </ScreenShell>
  );
}
