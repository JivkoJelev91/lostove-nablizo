/**
 * The mock athlete whose profile the Profile tab shows.
 *
 * Only ids live here. The spot and review data stays owned by `mock-spots` and `mock-reviews`,
 * so a spot added to the athlete's profile is the same spot the feed and the spot page render,
 * and there is still one copy of its facts.
 */
export type Profile = {
  displayName: string;
  /** Shown after an `@`, the way a community directory writes a handle. */
  username: string;
  /** The spots this athlete added. */
  spotIds: readonly string[];
  /** The reviews this athlete wrote. The authors in `MOCK_REVIEWS` must match `displayName`. */
  reviewIds: readonly string[];
};

export const MOCK_PROFILE: Profile = {
  displayName: 'Alex Ivanov',
  username: 'alex',
  spotIds: ['trakia-fitness-park', 'vitosha-view-park'],
  reviewIds: ['review-trakia-3', 'review-vitosha-2'],
};
