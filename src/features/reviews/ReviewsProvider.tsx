import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { displayNameFromUser } from '@/features/auth/identity';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { MOCK_REVIEWS } from '@/features/spots/mock-reviews';
import type { Spot, SpotReview } from '@/features/spots/types';

export type SpotRatingSummary = {
  /** The average across every review, including this athlete's most recent one. */
  average: number;
  count: number;
};

export type ReviewsValue = {
  /** Every review this athlete wrote, newest first. */
  ownReviews: readonly SpotReview[];
  /** Every review on a spot: this athlete's first, then the rest newest first. */
  reviewsFor: (spotId: string) => readonly SpotReview[];
  /** This athlete's single review of the spot, if there is one. */
  ownReviewFor: (spotId: string) => SpotReview | undefined;
  /** Everyone else's reviews of the spot, newest first. */
  otherReviewsFor: (spotId: string) => readonly SpotReview[];
  /** The spot's rating, adjusted for this athlete's review so a new rating moves the average. */
  summaryFor: (spot: Spot) => SpotRatingSummary;
  /** Adds or replaces this athlete's review, keeping one review per spot. */
  saveReview: (spotId: string, rating: number, text: string) => void;
};

/** Null until a provider is above it, so the hook can tell a missing provider from no reviews. */
export const ReviewsContext = createContext<ReviewsValue | null>(null);

const byNewestFirst = (first: SpotReview, second: SpotReview) =>
  second.date.getTime() - first.date.getTime();

/**
 * The label a review written while signed out is stored under.
 *
 * Reviews belong to an account in the database, so a signed-out visitor has no name to write one
 * under; this keeps the store honest about there being no athlete rather than inventing one, and
 * the read paths below still treat such a review as somebody else's. Gating the form itself behind
 * sign-in is the protected-actions pass.
 */
const GUEST_AUTHOR = 'Гост';

/**
 * The rating carried by this athlete's seeded mock review of a spot, if one exists.
 *
 * The stored spot aggregate already counts every seeded review, so an edit has to replace this
 * rating rather than add to the total. Without it, changing a rating would leave the average
 * unmoved because the old value could no longer be found.
 */
function seededOwnRating(spotId: string, authorName: string): number | undefined {
  return MOCK_REVIEWS.find((review) => review.spotId === spotId && review.authorName === authorName)
    ?.rating;
}

/**
 * Owns the reviews the spot page lists and writes.
 *
 * The database enforces one review per athlete per spot, so this store treats a save as an
 * upsert: the athlete's existing review is replaced, never duplicated. Holding the reviews here
 * rather than in the screen means the list, the average and the form cannot disagree, and it
 * gives one place to swap the mock array for Supabase rows.
 *
 * "This athlete" is the signed-in account: the name is the one given at sign-up, so the reviews a
 * screen calls the athlete's own are the ones that account wrote. Signed out, no review is theirs
 * — there is nobody for it to belong to.
 */
export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<readonly SpotReview[]>(MOCK_REVIEWS);
  const { profile, user } = useCurrentUser();

  const ownName = displayNameFromUser(user) ?? profile?.username ?? null;
  const authoredName = ownName ?? GUEST_AUTHOR;

  const ownReviews = useMemo(
    () =>
      ownName === null
        ? []
        : reviews.filter((review) => review.authorName === ownName).sort(byNewestFirst),
    [ownName, reviews],
  );

  const ownReviewFor = useCallback(
    (spotId: string) =>
      ownName === null
        ? undefined
        : reviews
            .filter((review) => review.spotId === spotId && review.authorName === ownName)
            .sort(byNewestFirst)[0],
    [ownName, reviews],
  );

  const otherReviewsFor = useCallback(
    (spotId: string) =>
      reviews
        .filter((review) => review.spotId === spotId && review.authorName !== ownName)
        .sort(byNewestFirst),
    [ownName, reviews],
  );

  const reviewsFor = useCallback(
    (spotId: string) => {
      const own = ownReviewFor(spotId);

      return own === undefined ? otherReviewsFor(spotId) : [own, ...otherReviewsFor(spotId)];
    },
    [otherReviewsFor, ownReviewFor],
  );

  const summaryFor = useCallback(
    (spot: Spot): SpotRatingSummary => {
      const own = ownReviewFor(spot.id);

      if (own === undefined || ownName === null) {
        return { average: spot.rating, count: spot.reviewCount };
      }

      const seeded = seededOwnRating(spot.id, ownName);
      const total =
        spot.rating * spot.reviewCount + (seeded === undefined ? own.rating : own.rating - seeded);
      const count = seeded === undefined ? spot.reviewCount + 1 : spot.reviewCount;

      return { average: total / count, count };
    },
    [ownName, ownReviewFor],
  );

  const saveReview = useCallback(
    (spotId: string, rating: number, text: string) => {
      setReviews((previous) => {
        const existing = previous.find(
          (review) => review.spotId === spotId && review.authorName === authoredName,
        );
        const next: SpotReview = {
          id: existing?.id ?? `review-${spotId}-own`,
          spotId,
          authorName: authoredName,
          rating,
          text,
          date: new Date(),
        };

        return existing === undefined
          ? [next, ...previous]
          : previous.map((review) => (review.id === existing.id ? next : review));
      });
    },
    [authoredName],
  );

  const value = useMemo<ReviewsValue>(
    () => ({ otherReviewsFor, ownReviewFor, ownReviews, reviewsFor, saveReview, summaryFor }),
    [otherReviewsFor, ownReviewFor, ownReviews, reviewsFor, saveReview, summaryFor],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}
