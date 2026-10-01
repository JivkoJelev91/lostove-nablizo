import type { ComponentType } from 'react';
import { ScrollView } from 'react-native';

import { FilterChip } from '@/components';
import type { EquipmentIconProps } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { EQUIPMENT_ICONS } from '@/features/spots/equipment-icons';
import { equipmentLabel } from '@/i18n/equipment';

export type EquipmentFilter = {
  /** Matches the equipment names used by `Spot.equipment`. */
  name: string;
  Icon: ComponentType<EquipmentIconProps>;
};

/**
 * The equipment the discovery screens can filter by, each drawn with the chips' own icon.
 *
 * One entry per {@link EquipmentName}, so adding a piece to the equipment vocabulary adds its
 * chip here too instead of leaving a filter the editor offers but discovery cannot use.
 */
export const EQUIPMENT_FILTERS: readonly EquipmentFilter[] = [
  { name: 'Pull-up', Icon: EQUIPMENT_ICONS['Pull-up'] },
  { name: 'Rings', Icon: EQUIPMENT_ICONS.Rings },
  { name: 'Dips', Icon: EQUIPMENT_ICONS.Dips },
  { name: 'Monkey bars', Icon: EQUIPMENT_ICONS['Monkey bars'] },
  { name: 'Ladder', Icon: EQUIPMENT_ICONS.Ladder },
  { name: 'Sit-up bench', Icon: EQUIPMENT_ICONS['Sit-up bench'] },
  { name: 'Push-up bars', Icon: EQUIPMENT_ICONS['Push-up bars'] },
];

export type EquipmentFilterIconProps = {
  filter: EquipmentFilter;
};

/** The lime equipment glyph every filter chip carries. */
export function EquipmentFilterIcon({ filter }: EquipmentFilterIconProps) {
  const { Icon } = filter;

  return <Icon color={brandColors.primary} size={iconSizeValues.xs} />;
}

export type EquipmentFilterChipProps = {
  filter: EquipmentFilter;
  selected: boolean;
  onToggle: (name: string) => void;
};

/** One equipment filter chip, so every row wires the same label, icon and selection. */
export function EquipmentFilterChip({ filter, selected, onToggle }: EquipmentFilterChipProps) {
  return (
    <FilterChip
      label={equipmentLabel(filter.name)}
      leftIcon={<EquipmentFilterIcon filter={filter} />}
      onPress={() => onToggle(filter.name)}
      selected={selected}
    />
  );
}

export type EquipmentFilterChipsProps = {
  selectedNames: readonly string[];
  onToggle: (name: string) => void;
};

/**
 * The horizontally scrollable equipment row. The container keeps its own screen padding so
 * the chips can bleed to the edge while the first one still lines up with the content.
 */
export function EquipmentFilterChips({ selectedNames, onToggle }: EquipmentFilterChipsProps) {
  return (
    <ScrollView
      contentContainerClassName="gap-space-8 px-screen-px"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
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
