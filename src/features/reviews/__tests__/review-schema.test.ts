import { REVIEW_TEXT_MAX_LENGTH, reviewDraftSchema } from '@/features/reviews/review-schema';

describe('reviewDraftSchema', () => {
  it('accepts a whole-number rating and a comment inside the limit', () => {
    expect(reviewDraftSchema.safeParse({ rating: 1, text: '' }).success).toBe(true);
    expect(
      reviewDraftSchema.safeParse({ rating: 5, text: 'x'.repeat(REVIEW_TEXT_MAX_LENGTH) }).success,
    ).toBe(true);
  });

  it('refuses a rating outside 1 to 5, or one that is not a whole number', () => {
    for (const rating of [0, 6, -1, 3.5, Number.NaN]) {
      expect(reviewDraftSchema.safeParse({ rating, text: '' }).success).toBe(false);
    }
  });

  it('refuses a comment past the limit', () => {
    expect(
      reviewDraftSchema.safeParse({ rating: 4, text: 'x'.repeat(REVIEW_TEXT_MAX_LENGTH + 1) })
        .success,
    ).toBe(false);
  });

  it('refuses a rating sent as a string, which is what a loose form hands over', () => {
    expect(reviewDraftSchema.safeParse({ rating: '4', text: '' }).success).toBe(false);
  });
});
