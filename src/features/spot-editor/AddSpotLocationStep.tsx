import { Text, View } from 'react-native';

import { SectionHeader } from '@/components';
import type { Coordinate } from '@/features/spots/types';
import { LocationCapture } from '@/features/spot-editor/LocationCapture';

export type AddSpotLocationStepProps = {
  coordinate: Coordinate | null;
  errorText?: string;
  onChangeCoordinate: (coordinate: Coordinate) => void;
};

/** Step 1: capture where the contributor is standing, which becomes the spot's location. */
export function AddSpotLocationStep({
  coordinate,
  errorText,
  onChangeCoordinate,
}: AddSpotLocationStepProps) {
  return (
    <View className="flex-1 gap-space-16 px-screen-px pt-space-16">
      <SectionHeader title="Where is the spot?" titleSize="h1" />

      <View className="gap-space-4">
        <LocationCapture coordinate={coordinate} onCapture={onChangeCoordinate} />

        {errorText === undefined ? null : (
          <Text className="text-caption text-status-bad">{errorText}</Text>
        )}
      </View>

      <Text className="text-bodySmall text-text-secondary">
        Stand at the spot so your phone captures the right position.
      </Text>
    </View>
  );
}
