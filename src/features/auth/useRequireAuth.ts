import { useCallback } from 'react';

import { router, usePathname } from 'expo-router';

import { useCurrentUser } from '@/features/auth/useCurrentUser';

export type RequireAuth = {
  /** False while the stored session is still being read, so a guard can wait instead of redirecting. */
  checking: boolean;
  signedIn: boolean;
  /**
   * Runs `action` when an athlete is signed in, and otherwise sends them to sign in.
   *
   * Returns whether the action ran, so a caller can treat the guard as a question rather than
   * assuming: a form that opened a sheet for a review must not also start the write.
   */
  requireAuth: (action: () => void) => boolean;
};

/**
 * The one place an action asks whether it may run.
 *
 * A write is not blocked by hiding its button alone. Hiding it leaves the athlete looking at a
 * screen that cannot do the thing it exists for, and it leaves the write reachable from anywhere
 * else the same component is rendered. So every protected action asks here first, the route
 * `/auth` refuses guests, and the RLS policies refuse them again on the database: three layers,
 * because each one fails differently and none of them is the only one standing.
 *
 * `checking` exists so a guard can tell "not signed in" from "have not found out yet". Redirecting
 * during the first frames of a cold start would sign a signed-in athlete out of their own screen.
 *
 * The current pathname travels to the sign-in screen as `next`, so signing in returns the athlete
 * to the spot they were reading rather than to the home tab. It is a hint only: the sign-in screen
 * checks it against its own allowlist before following it, because a query parameter is whatever
 * a link made it.
 */
export function useRequireAuth(): RequireAuth {
  const { status, user } = useCurrentUser();
  const pathname = usePathname();

  const signedIn = status === 'signedIn' && user !== null;

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!signedIn) {
        router.push({ pathname: '/auth', params: { next: pathname } });
        return false;
      }

      action();
      return true;
    },
    [pathname, signedIn],
  );

  return { checking: status === 'loading', requireAuth, signedIn };
}
