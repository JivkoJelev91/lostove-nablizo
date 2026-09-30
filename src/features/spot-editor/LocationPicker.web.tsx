import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { formatCoordinate } from '@/features/spot-editor/coordinates';
import type { LocationPickerProps } from '@/features/spot-editor/types';
import { useScheme } from '@/hooks/useScheme';

/**
 * The web stand-in for the native pin picker.
 *
 * The map is a native view, so the browser keeps the draft's default coordinate and says so
 * instead of rendering a map it cannot draw. The wizard still validates and submits.
 */
export function LocationPicker({ coordinate }: LocationPickerProps) {
  const scheme = useScheme();

  return (
    <View className="flex-1 items-center justify-center gap-space-12 bg-bg-surface px-screen-px">
      <View className="h-icon-xl w-icon-xl items-center justify-center rounded-pill bg-bg-main">
        <Ionicons color={schemeTextMuted[scheme]} name="map-outline" size={iconSizeValues.md} />
      </View>

      <View className="gap-space-4">
        <Text className="text-center font-semibold text-h3 text-text-primary">
          Choose the pin in the app
        </Text>
        <Text className="text-center text-bodySmall text-text-secondary">
          The place picker is a native map. In the browser the pin stays at these coordinates.
        </Text>
      </View>

      <Text className="text-caption text-text-muted">{formatCoordinate(coordinate)}</Text>
    </View>
  );
}
