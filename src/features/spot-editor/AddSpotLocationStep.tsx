import { Text, View } from 'react-native';

import { SectionHeader } from '@/components';
import type { Coordinate } from '@/features/spots/types';
import { LocationPicker } from '@/features/spot-editor/LocationPicker';

export type AddSpotLocationStepProps = {
  coordinate: Coordinate;
  onChangeCoordinate: (coordinate: Coordinate) => void;
};

/** Step 1: park the pin on the spot. The map fills whatever the header and footer leave. */
export function AddSpotLocationStep({ coordinate, onChangeCoordinate }: AddSpotLocationStepProps) {
  return (
    <View className="flex-1 gap-space-16 px-screen-px pt-space-16">
      <SectionHeader title="Where is the spot?" titleSize="h1" />

      <View className="flex-1 overflow-hidden rounded-xl border border-border">
        <LocationPicker coordinate={coordinate} onChange={onChangeCoordinate} />
      </View>

      <Text className="text-bodySmall text-text-secondary">
        Drag the pin to the exact location.
      </Text>
    </View>
  );
}
