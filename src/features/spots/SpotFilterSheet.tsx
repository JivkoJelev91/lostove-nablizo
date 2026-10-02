import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { BottomSheet, FilterChip, GhostButton, PrimaryButton } from '@/components';
import type { EquipmentCondition } from '@/components';
import { EQUIPMENT_FILTERS, EquipmentFilterChip } from '@/features/spots/equipment-filters';
import type { Spot } from '@/features/spots/types';
import { filterSpots, NO_FILTERS, toggleEquipmentFilter } from '@/features/spots/useSpotFilters';
import type { SpotFilters } from '@/features/spots/useSpotFilters';
import { t } from '@/i18n';

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View className="gap-space-8">
      <Text className="font-medium text-bodySmall text-text-secondary">{title}</Text>
      <View className="flex-row flex-wrap gap-space-8">{children}</View>
    </View>
  );
}

/** A maximum distance in metres; 0 is "any". The largest option is the feed's own radius. */
const DISTANCE_VALUES = [0, 1000, 5000, 25000] as const;

/** A minimum average rating; 0 accepts unrated spots too. */
const RATING_VALUES = [0, 3, 4, 4.5] as const;

const CONDITION_VALUES: readonly EquipmentCondition[] = ['good', 'worn', 'damaged'];

function toggleCondition(
  conditions: readonly EquipmentCondition[],
  condition: EquipmentCondition,
): readonly EquipmentCondition[] {
  return conditions.includes(condition)
    ? conditions.filter((item) => item !== condition)
    : [...conditions, condition];
}

function distanceLabel(value: number): string {
  switch (value) {
    case 1000:
      return t('filters.distance1');
    case 5000:
      return t('filters.distance5');
    case 25000:
      return t('filters.distance25');
    default:
      return t('filters.distanceAny');
  }
}

function ratingLabel(value: number): string {
  switch (value) {
    case 3:
      return t('filters.rating3');
    case 4:
      return t('filters.rating4');
    case 4.5:
      return t('filters.rating45');
    default:
      return t('filters.ratingAny');
  }
}

function conditionLabel(condition: EquipmentCondition): string {
  switch (condition) {
    case 'worn':
      return t('condition.worn');
    case 'damaged':
      return t('condition.damaged');
    default:
      return t('condition.good');
  }
}

export type SpotFilterSheetProps = {
  visible: boolean;
  /** The filters in force; the sheet copies them on mount and applies the copy on confirm. */
  filters: SpotFilters;
  /** The unfiltered list the result count is computed from. */
  spots: readonly Spot[];
  /** Whether the feed was measured from a position, so a distance filter means anything. */
  hasDistance: boolean;
  onApply: (filters: SpotFilters) => void;
  /**
   * Clears the filters in force immediately. Reset is the one control that must not wait for
   * confirm: it is what an athlete presses when the screen looks wrong, and leaving the main
   * page filtered after it said "clear" is the bug that made them open the sheet in the first
   * place.
   */
  onReset: () => void;
  onClose: () => void;
};

/**
 * The full filter sheet: distance, rating, condition and equipment, with the count the current
 * draft would leave.
 *
 * The draft lives here and is applied on confirm, so a choice can be changed without the list
 * behind the sheet rearranging on every tap. The caller remounts the sheet (via `key`) each time
 * it opens, which is what starts the draft from the filters actually in force.
 *
 * An open/closed toggle is deliberately absent: the public lists already contain only approved,
 * open spots, so the control would be a switch that changes nothing.
 */
export function SpotFilterSheet({
  visible,
  filters,
  spots,
  hasDistance,
  onApply,
  onReset,
  onClose,
}: SpotFilterSheetProps) {
  const [draft, setDraft] = useState(filters);
  const resultCount = useMemo(() => filterSpots(spots, draft).length, [draft, spots]);

  return (
    <BottomSheet onClose={onClose} title={t('filters.title')} visible={visible}>
      {hasDistance ? (
        <FilterSection title={t('filters.distance')}>
          {DISTANCE_VALUES.map((value) => (
            <FilterChip
              key={value}
              label={distanceLabel(value)}
              onPress={() => setDraft((current) => ({ ...current, maxDistanceM: value }))}
              selected={draft.maxDistanceM === value}
            />
          ))}
        </FilterSection>
      ) : null}

      <FilterSection title={t('filters.rating')}>
        {RATING_VALUES.map((value) => (
          <FilterChip
            key={value}
            label={ratingLabel(value)}
            onPress={() => setDraft((current) => ({ ...current, minRating: value }))}
            selected={draft.minRating === value}
          />
        ))}
      </FilterSection>

      <FilterSection title={t('filters.condition')}>
        {CONDITION_VALUES.map((condition) => (
          <FilterChip
            key={condition}
            label={conditionLabel(condition)}
            onPress={() =>
              setDraft((current) => ({
                ...current,
                conditions: toggleCondition(current.conditions, condition),
              }))
            }
            selected={draft.conditions.includes(condition)}
          />
        ))}
      </FilterSection>

      <FilterSection title={t('filters.verification')}>
        <FilterChip
          label={t('filters.verifiedRecently')}
          onPress={() =>
            setDraft((current) => ({ ...current, verifiedRecently: !current.verifiedRecently }))
          }
          selected={draft.verifiedRecently}
        />
      </FilterSection>

      <FilterSection title={t('filters.equipment')}>
        {EQUIPMENT_FILTERS.map((filter) => (
          <EquipmentFilterChip
            key={filter.name}
            filter={filter}
            onToggle={(name) => setDraft((current) => toggleEquipmentFilter(current, name))}
            selected={draft.equipment.includes(filter.name)}
          />
        ))}
      </FilterSection>

      <View className="flex-row gap-space-8">
        <View className="flex-1">
          <GhostButton
            fullWidth
            label={t('filters.reset')}
            onPress={() => {
              setDraft(NO_FILTERS);
              onReset();
            }}
          />
        </View>

        <View className="flex-1">
          <PrimaryButton
            fullWidth
            label={
              resultCount === 1
                ? t('filters.applyOne')
                : t('filters.applyMany', { count: resultCount })
            }
            onPress={() => onApply(draft)}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
