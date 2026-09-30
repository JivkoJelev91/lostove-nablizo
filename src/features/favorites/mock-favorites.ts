/**
 * The spots the mock athlete has already saved, so Favorites has something to show before the
 * database owns saved spots. Ids rather than spots: the spot data stays owned by `mock-spots`,
 * which keeps one copy of every spot's facts.
 */
export const MOCK_FAVORITE_IDS: readonly string[] = ['trakia-fitness-park', 'north-park-corner'];
