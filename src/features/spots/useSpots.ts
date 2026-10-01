import { use } from 'react';

import { SpotsContext } from '@/features/spots/SpotsProvider';
import type { SpotsValue } from '@/features/spots/SpotsProvider';

/**
 * Reads the spots every screen shows or changes. Going through one store keeps a submission
 * from being public on one screen while it still waits for review on another.
 */
export function useSpots(): SpotsValue {
  const value = use(SpotsContext);

  if (value === null) {
    throw new Error('useSpots needs a SpotsProvider above it in the tree.');
  }

  return value;
}
