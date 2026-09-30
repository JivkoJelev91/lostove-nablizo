import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { PrimaryButton, Screen } from '@/components';

export default function IndexScreen() {
  return (
    <Screen>
      {/* Layout lives on an explicit child rather than on `Screen`'s className: `Screen`
          applies that to the safe-area container, where `flex-1` on the inner wrapper makes
          `justify-center` a no-op and the classes never reach the content. */}
      <View className="flex-1 items-center justify-center gap-space-8">
        <View className="h-1.5 w-12 rounded-pill bg-primary" />
        <Text className="font-bold text-h1 text-text-primary">Street Fitness</Text>
        <Text className="text-center text-bodySmall text-text-secondary">
          Discover calisthenics spots near you.
        </Text>
        <View className="mt-space-8">
          <PrimaryButton label="View components" onPress={() => router.push('/components')} />
        </View>
      </View>
    </Screen>
  );
}
