/**
 * The mock athlete whose profile the Profile tab shows.
 *
 * Only ids live here. The spot data stays owned by `mock-spots`, and the reviews are owned by
 * the reviews store, so a spot added to the athlete's profile is the same spot the feed and the
 * spot page render, and there is still one copy of its facts. Reviews are matched by
 * `displayName`, which the mock authors in `MOCK_REVIEWS` use.
 */
export type Profile = {
  displayName: string;
  /** Shown after an `@`, the way a community directory writes a handle. */
  username: string;
  /** The spots this athlete added. */
  spotIds: readonly string[];
};

export const MOCK_PROFILE: Profile = {
  displayName: 'Alex Ivanov',
  username: 'alex',
  spotIds: ['trakia-fitness-park', 'vitosha-view-park'],
};
