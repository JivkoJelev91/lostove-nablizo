import { SpotReviewsSection } from '@/features/reviews/SpotReviewsSection';
import { useSpotReviewsQuery } from '@/features/reviews/useReviewsQuery';
import type { Spot } from '@/features/spots/types';

export type SpotReviewsProps = {
  spot: Spot;
};

/**
 * The reviews block with its own query, so the spot page reads as layout.
 *
 * The hook is re-exported from `SpotReviewsSection`'s side rather than called by the screen:
 * review writes invalidate this query, and keeping the pair together is what stops a screen from
 * wiring the callbacks to the wrong refetch.
 */
export function SpotReviews({ spot }: SpotReviewsProps) {
  const reviews = useSpotReviewsQuery(spot.id);

  return (
    <SpotReviewsSection
      deleting={reviews.isDeleting}
      error={reviews.isError}
      loading={reviews.isLoading}
      onDeleteReview={reviews.deleteReview}
      onRetry={() => void reviews.refetch()}
      onSaveReview={reviews.writeReview}
      ownReview={reviews.ownReview}
      reviews={reviews.reviews}
      saving={reviews.isSaving}
      spot={spot}
    />
  );
}
