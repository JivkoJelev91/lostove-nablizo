import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';
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

/**
 * Owns every spot the app renders: the seeded ones and whatever this athlete submits.
 *
 * This is the frontend's stand-in for the `spots` table, so it carries the same facts the
 * database will: a status only `approved` spots are public with, and an owner id that decides
 * who may edit. Discovery screens read {@link SpotsValue.approvedSpots} and never see a spot
 * that moderation has not cleared; the profile reads {@link SpotsValue.ownedSpots} so the
 * athlete always sees what happened to their own submissions.
 *
 * The owner is the signed-in account, not a constant. Signed out there is no athlete, so nothing
 * is owned and a submitted spot carries no owner — which is the honest mock of a database whose
 * `created_by` comes from `auth.uid()`.
 */
export function SpotsProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<readonly Spot[]>(MOCK_SPOTS);
  const { user } = useCurrentUser();

  const ownerId = user?.id ?? null;

  const approvedSpots = useMemo(() => spots.filter((spot) => spot.status === 'approved'), [spots]);

  const ownedSpots = useMemo(
    () => (ownerId === null ? [] : spots.filter((spot) => spot.ownerId === ownerId)),
    [ownerId, spots],
  );

  const spotById = useCallback(
    (spotId: string) => spots.find((spot) => spot.id === spotId),
    [spots],
  );

  const addSpot = useCallback(
    (submission: SpotSubmission): Spot => {
      const spot: Spot = {
        id: `submitted-${Date.now()}`,
        name: submission.name.trim(),
        coordinate: submission.coordinate,
        rating: 0,
        reviewCount: 0,
        equipment: submission.equipment,
        condition: 'good',
        description: submission.description.trim(),
        distanceMeters: null,
        images: submission.photos.map((photo) => ({ uri: photo.uri })),
        photos: [],
        status: 'under_review',
        ...(ownerId === null ? {} : { ownerId }),
      };

      setSpots((previous) => [spot, ...previous]);

      return spot;
    },
    [ownerId],
  );

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
              images: edits.photos.map((photo) => ({ uri: photo.uri })),
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
