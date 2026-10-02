import { supabase } from '@/lib/supabase';

/**
 * The signed-in athlete's id, or `null` for a guest.
 *
 * `getUser` rather than `getSession`: the id decides what a row is allowed to say its owner is,
 * so it is verified with the auth server instead of read from a token the device could be
 * holding past its expiry.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
