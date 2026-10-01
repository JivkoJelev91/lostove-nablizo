/**
 * The mock athlete whose profile the Profile tab shows.
 *
 * Only the identity lives here. The spot data stays owned by the spots store, which stamps
 * `ownerId` on every spot the athlete adds, and the reviews are owned by the reviews store,
 * so a spot in the profile is the same spot the feed would render and there is still one copy
 * of its facts.
 */
export type Profile = {
  /** Matches the owner id the spots store stamps on spots this athlete adds. */
  id: string;
  displayName: string;
  /** Shown after an `@`, the way a community directory writes a handle. */
  username: string;
};

export const MOCK_PROFILE: Profile = {
  id: 'user-alex-ivanov',
  displayName: 'Alex Ivanov',
  username: 'alex',
};
