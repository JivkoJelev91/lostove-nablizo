import { MOCK_PROFILE } from '@/features/profile/mock-profile';

/**
 * The athlete the app currently treats as signed in.
 *
 * There is no session yet — Clerk arrives later — so the mock profile that owns the Profile tab
 * is also the one whose reviews can be written. Kept to one export so connecting the real
 * session later changes this file and nothing else.
 */
export const CURRENT_REVIEWER_NAME = MOCK_PROFILE.displayName;
