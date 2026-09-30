import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenShell } from '@/components';

export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenShell description={`Spot ${id} · 1.2 km away`} scroll title="Trakia Fitness Park">
      <View className="items-center justify-center gap-space-8 rounded-lg bg-bg-surface px-space-16 py-space-32">
        <Text className="text-center text-bodySmall text-text-secondary">
          The spot page lands here: photo grid, equipment list, equipment condition and the reviews
          left by other athletes.
        </Text>
      </View>
    </ScreenShell>
  );
}
