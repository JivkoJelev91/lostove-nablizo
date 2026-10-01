import { useCallback } from 'react';

import { router } from 'expo-router';

import { ReviewCard } from '@/components';
import { useSpots } from '@/features/spots/useSpots';
import type { SpotReview } from '@/features/spots/types';
import { formatMonthDayYear } from '@/utils/dates';

export type ProfileReviewCardProps = {
  review: SpotReview;
};

/**
 * One of the athlete's reviews, titled with the spot it is about and linking back to it, so a
 * review is never a dead end on the profile.
 */
export function ProfileReviewCard({ review }: ProfileReviewCardProps) {
  const { spotById } = useSpots();
  const spot = spotById(review.spotId);

  const openSpot = useCallback(() => {
    router.push({ pathname: '/spot/[id]', params: { id: review.spotId } });
  }, [review.spotId]);

  return (
    <ReviewCard
      dateLabel={formatMonthDayYear(review.date)}
      onPress={spot === undefined ? undefined : openSpot}
      rating={review.rating}
      spotName={spot?.name}
      text={review.text}
    />
  );
}
