import { Text, View } from 'react-native';

import { BottomSheet, GhostButton, PrimaryButton } from '@/components';
import { EquipmentFilterChip, EQUIPMENT_FILTERS } from '@/features/spots/equipment-filters';

export type FilterSheetProps = {
  visible: boolean;
  selectedNames: readonly string[];
  /** How many spots the current selection leaves on the map. */
  resultCount: number;
  onClose: () => void;
  onClear: () => void;
  onToggle: (name: string) => void;
};

/**
 * The full filter UI behind the map's "Filters" chip.
 *
 * Toggles apply to the map live, so the sheet reports state rather than collecting a draft;
 * "Show N spots" simply says what the map has and closes.
 */
export function FilterSheet({
  visible,
  selectedNames,
  resultCount,
  onClose,
  onClear,
  onToggle,
}: FilterSheetProps) {
  return (
    <BottomSheet onClose={onClose} title="Filters" visible={visible}>
      <View className="gap-space-12">
        <Text className="font-medium text-caption text-text-secondary">Equipment</Text>

        <View className="flex-row flex-wrap gap-space-8">
          {EQUIPMENT_FILTERS.map((filter) => (
            <EquipmentFilterChip
              key={filter.name}
              filter={filter}
              onToggle={onToggle}
              selected={selectedNames.includes(filter.name)}
            />
          ))}
        </View>
      </View>

      <View className="flex-row gap-space-8">
        <View className="flex-1">
          <GhostButton fullWidth label="Clear all" onPress={onClear} />
        </View>

        <View className="flex-1">
          <PrimaryButton
            fullWidth
            label={`Show ${resultCount} ${resultCount === 1 ? 'spot' : 'spots'}`}
            onPress={onClose}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
