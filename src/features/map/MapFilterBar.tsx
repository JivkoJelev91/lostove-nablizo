import { ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { FilterChip } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { EquipmentFilterChip, EQUIPMENT_FILTERS } from '@/features/spots/equipment-filters';

export type MapFilterBarProps = {
  selectedNames: readonly string[];
  onToggle: (name: string) => void;
  onOpenFilters: () => void;
};

/**
 * The row directly under the search bar: a control that opens the full filter sheet and
 * quick equipment toggles that apply without leaving the map.
 */
export function MapFilterBar({ selectedNames, onToggle, onOpenFilters }: MapFilterBarProps) {
  return (
    <ScrollView
      contentContainerClassName="gap-space-8 px-screen-px"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <FilterChip
        accessibilityLabel="Open filters"
        label="Filters"
        leftIcon={
          <Ionicons color={brandColors.primary} name="options-outline" size={iconSizeValues.xs} />
        }
        onPress={onOpenFilters}
      />

      {EQUIPMENT_FILTERS.map((filter) => (
        <EquipmentFilterChip
          key={filter.name}
          filter={filter}
          onToggle={onToggle}
          selected={selectedNames.includes(filter.name)}
        />
      ))}
    </ScrollView>
  );
}
