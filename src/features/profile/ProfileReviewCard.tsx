import { useCallback } from 'react';

import { router } from 'expo-router';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { ReviewCard } from '@/components';
import type { OwnReview } from '@/features/reviews/useOwnReviewsQuery';
import { formatMonthDayYearTime } from '@/utils/dates';

export type ProfileReviewCardProps = {
  review: OwnReview;
};

/**
 * One of the athlete's reviews, titled with the spot it is about and linking back to it, so a
 * review is never a dead end on the profile. It fades in on mount, matching the spot rows.
 *
 * The spot's name arrives with the review; the card does not look it up, because a lookup that
 * fails would silently leave the review untitled.
 */
export function ProfileReviewCard({ review }: ProfileReviewCardProps) {
  const openSpot = useCallback(() => {
    router.push({ pathname: '/spot/[id]', params: { id: review.spotId } });
  }, [review.spotId]);

  return (
    <Animated.View entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}>
      <ReviewCard
        dateLabel={formatMonthDayYearTime(review.date)}
        onPress={openSpot}
        rating={review.rating}
        spotName={review.spotName ?? undefined}
        text={review.text}
      />
    </Animated.View>
  );
}
