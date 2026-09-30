import { router } from 'expo-router';
import { View } from 'react-native';

import { GhostButton, PrimaryButton, ScreenShell, TextInput } from '@/components';

export default function SignInScreen() {
  return (
    <ScreenShell description="Welcome back to Street Fit" scroll title="Sign in">
      <View className="gap-space-12">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          placeholder="you@example.com"
        />
        <TextInput label="Password" placeholder="Enter your password" secureTextEntry />
      </View>

      <View className="gap-space-8">
        <PrimaryButton label="Sign in" onPress={() => {}} />
        <GhostButton label="Create an account" onPress={() => router.push('/auth/sign-up')} />
      </View>
    </ScreenShell>
  );
}
