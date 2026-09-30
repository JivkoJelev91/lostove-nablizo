import { View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { Spot } from '@/features/spots/types';
import { cn } from '@/utils/cn';

export type SpotMarkerProps = {
  spot: Spot;
  selected: boolean;
  onPress: () => void;
};

/**
 * A spot pin.
 *
 * The selected pin grows and gains a dark core, so the emphasis reads at a glance while
 * the unselected pins stay small and quiet. Selection is a prop, not marker state, so the
 * screen stays the single owner of what is selected.
 */
export function SpotMarker({ spot, selected, onPress }: SpotMarkerProps) {
  return (
    <Marker
      accessibilityLabel={spot.name}
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={spot.coordinate}
      identifier={spot.id}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      zIndex={selected ? 1 : 0}
    >
      <View
        className={cn(
          'items-center justify-center rounded-pill border-on-map bg-primary',
          selected
            ? 'h-icon-xl w-icon-xl border-2 shadow-card-elevated'
            : 'h-icon-lg w-icon-lg border',
        )}
      >
        {selected ? <View className="h-2 w-2 rounded-pill bg-on-map" /> : null}
      </View>
    </Marker>
  );
}
