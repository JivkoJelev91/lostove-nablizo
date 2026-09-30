import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { ScreenShell, SearchInput } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';

export default function MapScreen() {
  return (
    <ScreenShell description="Calisthenics spots near you" title="Map" variant="tab">
      <SearchInput placeholder="Search street spots" />

      <View className="flex-1 items-center justify-center gap-space-12 pb-section-gap">
        <View className="h-icon-xl w-icon-xl items-center justify-center rounded-pill bg-bg-surface">
          <Ionicons color={brandColors.primary} name="map-outline" size={iconSizeValues.md} />
        </View>
        <Text className="text-center text-bodySmall text-text-secondary">
          The map lands here: spot pins, your location and the distance to each spot.
        </Text>
      </View>
    </ScreenShell>
  );
}
