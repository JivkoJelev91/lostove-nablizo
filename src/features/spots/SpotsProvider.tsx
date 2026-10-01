import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { CURRENT_USER_ID } from '@/features/profile/current-user';
import { distanceKmBetween } from '@/features/spots/distance';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';
import { MOCK_USER_COORDINATE } from '@/features/spots/mock-location';
import type { Spot, SpotEdits, SpotSubmission } from '@/features/spots/types';

export type SpotsValue = {
  /** Every spot the app knows, whatever its moderation state. */
  spots: readonly Spot[];
  /** The approved spots the public surfaces may show. */
  approvedSpots: readonly Spot[];
  /** The spots this athlete added, whatever their state, in seed order with new ones first. */
  ownedSpots: readonly Spot[];
  spotById: (spotId: string) => Spot | undefined;
  /** Records a submission as waiting for moderation and returns the stored spot. */
  addSpot: (submission: SpotSubmission) => Spot;
  /** Applies an owner's edits and puts the spot back under review. */
  updateSpot: (spotId: string, edits: SpotEdits) => void;
};

/** Null until a provider is above it, so the hook can tell a missing provider from no spots. */
export const SpotsContext = createContext<SpotsValue | null>(null);

const roundToTenth = (value: number): number => Math.round(value * 10) / 10;

/**
 * Owns every spot the app renders: the seeded ones and whatever this athlete submits.
 *
 * This is the frontend's stand-in for the `spots` table, so it carries the same facts the
 * database will: a status only `approved` spots are public with, and an owner id that decides
 * who may edit. Discovery screens read {@link SpotsValue.approvedSpots} and never see a spot
 * that moderation has not cleared; the profile reads {@link SpotsValue.ownedSpots} so the
 * athlete always sees what happened to their own submissions.
 */
export function SpotsProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<readonly Spot[]>(MOCK_SPOTS);

  const approvedSpots = useMemo(() => spots.filter((spot) => spot.status === 'approved'), [spots]);

  const ownedSpots = useMemo(
    () => spots.filter((spot) => spot.ownerId === CURRENT_USER_ID),
    [spots],
  );

  const spotById = useCallback(
    (spotId: string) => spots.find((spot) => spot.id === spotId),
    [spots],
  );

  const addSpot = useCallback((submission: SpotSubmission): Spot => {
    const spot: Spot = {
      id: `submitted-${Date.now()}`,
      name: submission.name.trim(),
      coordinate: submission.coordinate,
      rating: 0,
      reviewCount: 0,
      equipment: submission.equipment,
      condition: 'good',
      description: submission.description.trim(),
      distanceKm: roundToTenth(distanceKmBetween(MOCK_USER_COORDINATE, submission.coordinate)),
      images: submission.images,
      status: 'under_review',
      ownerId: CURRENT_USER_ID,
    };

    setSpots((previous) => [spot, ...previous]);

    return spot;
  }, []);

  const updateSpot = useCallback((spotId: string, edits: SpotEdits) => {
    setSpots((previous) =>
      previous.map((spot) =>
        spot.id === spotId
          ? {
              ...spot,
              name: edits.name.trim(),
              description: edits.description.trim(),
              equipment: edits.equipment,
              condition: edits.condition,
              images: edits.images,
              status: 'under_review',
            }
          : spot,
      ),
    );
  }, []);

  const value = useMemo<SpotsValue>(
    () => ({ addSpot, approvedSpots, ownedSpots, spotById, spots, updateSpot }),
    [addSpot, approvedSpots, ownedSpots, spotById, spots, updateSpot],
  );

  return <SpotsContext.Provider value={value}>{children}</SpotsContext.Provider>;
}
