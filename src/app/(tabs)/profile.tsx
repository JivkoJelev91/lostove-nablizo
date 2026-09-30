import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Avatar, Card, PrimaryButton, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';

export default function ProfileScreen() {
  const scheme = useScheme();

  return (
    <ScreenShell description="Your account and preferences" scroll title="Profile" variant="tab">
      <Card>
        <View className="flex-row items-center gap-space-12">
          <Avatar name="Alex Petrov" size="lg" />
          <View className="flex-1 gap-space-2">
            <Text className="font-semibold text-h3 text-text-primary">Alex Petrov</Text>
            <Text className="text-bodySmall text-text-secondary">Not signed in</Text>
          </View>
        </View>

        <PrimaryButton label="Sign in" onPress={() => router.push('/auth/sign-in')} />
      </Card>

      <Card accessibilityLabel="Open settings" onPress={() => router.push('/settings')}>
        <View className="flex-row items-center justify-between gap-space-12">
          <View className="flex-1 gap-space-2">
            <Text className="font-semibold text-h3 text-text-primary">Settings</Text>
            <Text className="text-bodySmall text-text-secondary">
              Notifications, units and appearance
            </Text>
          </View>

          <Ionicons
            color={schemeTextMuted[scheme]}
            name="chevron-forward"
            size={iconSizeValues.sm}
          />
        </View>
      </Card>
    </ScreenShell>
  );
}
