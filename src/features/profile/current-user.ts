import { MOCK_PROFILE } from '@/features/profile/mock-profile';

/**
 * The athlete the app currently treats as signed in.
 *
 * There is no session yet — Clerk arrives later — so the mock profile that owns the Profile tab
 * is also the identity behind its spots and reviews. Kept to one module so connecting the real
 * session later changes this file and nothing else.
 */
export const CURRENT_USER_ID = MOCK_PROFILE.id;

/** The name the athlete's reviews are written under. */
export const CURRENT_USER_NAME = MOCK_PROFILE.displayName;
