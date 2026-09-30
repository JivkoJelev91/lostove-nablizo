import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { LocationPickerProps } from '@/features/spot-editor/types';

/** The map is a native view, so it takes a style object rather than a className. */
const MAP_STYLE = { flex: 1 } as const;

/** How close the initial camera sits to the pin: a neighbourhood, not the whole city. */
const PIN_REGION = { latitudeDelta: 0.012, longitudeDelta: 0.01 } as const;

/**
 * The native pin picker: a map with a draggable lime pin.
 *
 * Tapping anywhere drops the pin there, and dragging refines the spot; both routes report
 * through `onChange`, so the wizard stays the single owner of the chosen coordinate.
 */
export function LocationPicker({ coordinate, onChange }: LocationPickerProps) {
  return (
    <MapView
      accessibilityLabel="Map for choosing the spot location"
      initialRegion={{ ...coordinate, ...PIN_REGION }}
      onPress={(event) => onChange(event.nativeEvent.coordinate)}
      pitchEnabled={false}
      rotateEnabled={false}
      style={MAP_STYLE}
      toolbarEnabled={false}
    >
      <Marker
        accessibilityLabel="Spot location pin"
        anchor={{ x: 0.5, y: 0.5 }}
        coordinate={coordinate}
        draggable
        onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
      >
        <View className="h-icon-xl w-icon-xl items-center justify-center rounded-pill border-2 border-on-map bg-primary shadow-card-elevated">
          <View className="h-2 w-2 rounded-pill bg-on-map" />
        </View>
      </Marker>
    </MapView>
  );
}
