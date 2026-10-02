import { useCallback, useMemo, useState } from 'react';

import type { EquipmentCondition } from '@/components';
import type { Spot } from '@/features/spots/types';

/** The filter set the discovery screens combine. Empty and zero mean "everything". */
export type SpotFilters = {
  /** Spots must carry every selected piece. */
  equipment: readonly string[];
  /** Minimum average rating; 0 accepts unrated spots too. */
  minRating: number;
  /** Acceptable conditions; empty means any. */
  conditions: readonly EquipmentCondition[];
  /** Maximum straight-line distance in metres; 0 means any distance, known or not. */
  maxDistanceM: number;
};

export const NO_FILTERS: SpotFilters = {
  conditions: [],
  equipment: [],
  maxDistanceM: 0,
  minRating: 0,
};

/** How many filter groups are active, for the button's count. */
export function countActiveFilters(filters: SpotFilters): number {
  return (
    (filters.equipment.length > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.conditions.length > 0 ? 1 : 0) +
    (filters.maxDistanceM > 0 ? 1 : 0)
  );
}

/**
 * The spots carrying every selected piece of equipment, in the order they arrived.
 *
 * Kept as its own rule because the equipment chips are their own control: the quick row above the
 * feed toggles just this part of the filter set, and the sheet's equipment section must agree with
 * it rather than re-implementing "has all of these".
 */
export function filterSpotsByEquipment(
  spots: readonly Spot[],
  selectedNames: readonly string[],
): readonly Spot[] {
  if (selectedNames.length === 0) {
    return spots;
  }

  return spots.filter((spot) =>
    selectedNames.every((name) => spot.equipment.some((item) => item.name === name)),
  );
}

/** Every filter applied at once, over a list the caller already has in memory. */
export function filterSpots(spots: readonly Spot[], filters: SpotFilters): readonly Spot[] {
  return filterSpotsByEquipment(spots, filters.equipment).filter((spot) => {
    if (spot.rating < filters.minRating) {
      return false;
    }

    if (filters.conditions.length > 0 && !filters.conditions.includes(spot.condition)) {
      return false;
    }

    if (filters.maxDistanceM > 0) {
      const distance = spot.distanceMeters;

      if (distance === null || distance > filters.maxDistanceM) {
        return false;
      }
    }

    return true;
  });
}

/** The filter set with one equipment chip toggled on or off. */
export function toggleEquipmentFilter(filters: SpotFilters, name: string): SpotFilters {
  return {
    ...filters,
    equipment: filters.equipment.includes(name)
      ? filters.equipment.filter((item) => item !== name)
      : [...filters.equipment, name],
  };
}

/**
 * The discovery screens' filters: the set itself, the apply/clear actions the sheet calls, and
 * the list already narrowed by it.
 *
 * Filtering happens here rather than in a query because it costs nothing extra: the screen has
 * already asked the database for its list — the nearby radius or the directory — and every filter
 * only reads a field that list already carries. The database search is what stays server-side;
 * these narrow its answer the same way they narrow the feed.
 */
export function useSpotFilters(spots: readonly Spot[]) {
  const [filters, setFilters] = useState<SpotFilters>(NO_FILTERS);

  const toggle = useCallback((name: string) => {
    setFilters((current) => toggleEquipmentFilter(current, name));
  }, []);

  const apply = useCallback((next: SpotFilters) => setFilters(next), []);

  const clear = useCallback(() => setFilters(NO_FILTERS), []);

  const filtered = useMemo(() => filterSpots(spots, filters), [filters, spots]);

  return {
    activeCount: countActiveFilters(filters),
    apply,
    clear,
    filtered,
    filters,
    toggle,
  };
}
