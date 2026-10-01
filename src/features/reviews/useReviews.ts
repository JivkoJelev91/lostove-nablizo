import { use } from 'react';

import { ReviewsContext } from '@/features/reviews/ReviewsProvider';
import type { ReviewsValue } from '@/features/reviews/ReviewsProvider';

/**
 * Reads the reviews this athlete can see and write. Every surface that shows or changes a
 * review goes through this, so the list, the average and the form stay in step.
 */
export function useReviews(): ReviewsValue {
  const value = use(ReviewsContext);

  if (value === null) {
    throw new Error('useReviews needs a ReviewsProvider above it in the tree.');
  }

  return value;
}
