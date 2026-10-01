import { router } from 'expo-router';
import { View } from 'react-native';

import { GhostButton, PrimaryButton, ScreenShell, TextInput } from '@/components';
import { t } from '@/i18n';

export default function SignInScreen() {
  return (
    <ScreenShell description={t('auth.signInDescription')} scroll title={t('auth.signInTitle')}>
      <View className="gap-space-12">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
        />
        <TextInput
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
        />
      </View>

      <View className="gap-space-8">
        <PrimaryButton label={t('auth.signIn')} onPress={() => {}} />
        <GhostButton
          label={t('auth.createAccountLink')}
          onPress={() => router.push('/auth/sign-up')}
        />
      </View>
    </ScreenShell>
  );
}
