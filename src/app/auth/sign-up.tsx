import { router } from 'expo-router';
import { View } from 'react-native';

import { GhostButton, PrimaryButton, ScreenShell, TextInput } from '@/components';

export default function SignUpScreen() {
  return (
    <ScreenShell description="Join the Street Fit community" scroll title="Sign up">
      <View className="gap-space-12">
        <TextInput autoCapitalize="words" label="Name" placeholder="Alex Petrov" />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          placeholder="you@example.com"
        />
        <TextInput label="Password" placeholder="At least 8 characters" secureTextEntry />
      </View>

      <View className="gap-space-8">
        <PrimaryButton label="Create account" onPress={() => {}} />
        <GhostButton
          label="I already have an account"
          onPress={() => router.push('/auth/sign-in')}
        />
      </View>
    </ScreenShell>
  );
}
