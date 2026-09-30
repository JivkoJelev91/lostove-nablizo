import { useCallback, useMemo, useState } from 'react';

import type { Spot } from '@/features/spots/types';

/**
 * Equipment filtering for the discovery screens.
 *
 * A spot must carry every selected item to stay visible, so narrowing to "Rings" and
 * "Dips" shows only spots that have both — the question a calisthenics athlete is asking.
 */
export function useSpotFilters(spots: readonly Spot[]) {
  const [selectedNames, setSelectedNames] = useState<readonly string[]>([]);

  const toggle = useCallback((name: string) => {
    setSelectedNames((previous) =>
      previous.includes(name) ? previous.filter((item) => item !== name) : [...previous, name],
    );
  }, []);

  const clear = useCallback(() => setSelectedNames([]), []);

  const filtered = useMemo(
    () =>
      selectedNames.length === 0
        ? spots
        : spots.filter((spot) =>
            selectedNames.every((name) => spot.equipment.some((item) => item.name === name)),
          ),
    [selectedNames, spots],
  );

  return { selectedNames, toggle, clear, filtered };
}
