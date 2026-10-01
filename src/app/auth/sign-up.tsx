import { router } from 'expo-router';
import { View } from 'react-native';

import { GhostButton, PrimaryButton, ScreenShell, TextInput } from '@/components';
import { t } from '@/i18n';

export default function SignUpScreen() {
  return (
    <ScreenShell description={t('auth.signUpDescription')} scroll title={t('auth.signUpTitle')}>
      <View className="gap-space-12">
        <TextInput
          autoCapitalize="words"
          label={t('auth.name')}
          placeholder={t('auth.namePlaceholder')}
        />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
        />
        <TextInput
          label={t('auth.password')}
          placeholder={t('auth.newPasswordPlaceholder')}
          secureTextEntry
        />
      </View>

      <View className="gap-space-8">
        <PrimaryButton label={t('auth.createAccount')} onPress={() => {}} />
        <GhostButton label={t('auth.haveAccount')} onPress={() => router.push('/auth/sign-in')} />
      </View>
    </ScreenShell>
  );
}
