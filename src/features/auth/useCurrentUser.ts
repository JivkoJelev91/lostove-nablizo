import { use } from 'react';

import { SessionContext } from '@/features/auth/SessionProvider';
import type { SessionValue } from '@/features/auth/SessionProvider';

/**
 * Reads the signed-in athlete, or the absence of one.
 *
 * Every screen that needs to know who is using the app goes through this, so a sign-in or a
 * sign-out cannot be observed in one place and missed in another.
 */
export function useCurrentUser(): SessionValue {
  const value = use(SessionContext);

  if (value === null) {
    throw new Error('useCurrentUser needs a SessionProvider above it in the tree.');
  }

  return value;
}
