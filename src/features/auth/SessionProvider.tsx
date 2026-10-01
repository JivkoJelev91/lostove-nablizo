import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';

import { loadProfile } from '@/features/auth/auth-api';
import type { ProfileRow } from '@/features/auth/auth-api';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

/** `loading` until the stored session has been read, which is what the first frame waits on. */
export type SessionStatus = 'loading' | 'signedIn' | 'signedOut';

export type SessionValue = {
  status: SessionStatus;
  session: Session | null;
  user: User | null;
  /** The athlete's `profiles` row, or `null` when signed out or not loaded yet. */
  profile: ProfileRow | null;
};

/** Null until a provider is above it, so the hook can tell a missing provider from a signed-out app. */
export const SessionContext = createContext<SessionValue | null>(null);

/** A profile row together with the account it was loaded for, so it cannot outlive that account. */
type ProfileLoad = {
  userId: string;
  row: ProfileRow | null;
};

/**
 * Owns the app's session and the profile row that goes with it.
 *
 * Two things make this the source of truth for "who is using the app". The session is read from
 * storage on launch and then kept in step with `onAuthStateChange`, so a sign-in, a sign-out or a
 * refreshed token updates every screen at once; and the profile row is loaded whenever the user
 * changes, so screens read an identity rather than assembling one from the session each time.
 *
 * The profile is loaded in an effect rather than inside the auth callback on purpose. Supabase
 * holds a lock while that callback runs, so awaiting another client call from inside it is how
 * people deadlock this library; an effect that reacts to the user is both safer and simpler.
 *
 * A failed profile load is not fatal and is not reported here: the session still identifies the
 * athlete, so the screens fall back to the account's own details, and the next sign-in or launch
 * tries the row again.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<ProfileLoad | null>(null);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setSession(data.session);
      setStatus(data.session === null ? 'signedOut' : 'signedIn');
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession === null ? 'signedOut' : 'signedIn');
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;

  useEffect(() => {
    if (user === null) {
      return;
    }

    let active = true;

    const settle = (row: ProfileRow | null) => {
      if (active) {
        setLoadedProfile({ row, userId: user.id });
      }
    };

    void loadProfile(user)
      .then(settle)
      .catch(() => {
        // The session is still the identity; only the row is missing. Storing the empty result lets
        // the screens fall back to the account's own details, and the next sign-in tries again.
        settle(null);
      });

    return () => {
      active = false;
    };
  }, [user]);

  // Derived rather than stored, so signing out cannot leave the previous athlete's profile behind
  // for a frame, and a row loaded for one account can never be shown against another.
  const profile = user !== null && loadedProfile?.userId === user.id ? loadedProfile.row : null;

  // Supabase refreshes the access token on a timer, which is wasted work while the app is in the
  // background and can race the phone's own sleep. Tying the timer to the app being in front is
  // what its React Native guidance asks for.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    });

    return () => subscription.remove();
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ profile, session, status, user }),
    [profile, session, status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
