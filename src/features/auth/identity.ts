import type { User } from '@supabase/supabase-js';

/**
 * The parts of an athlete's identity that live with the account rather than in `public.profiles`.
 *
 * The profile row carries the handle and the avatar. The name typed at sign-up does not have a
 * column of its own, so it sits in the auth user's metadata. Reading metadata for a name is fine —
 * Supabase's warning about it is that it is user-editable and must never decide access, and it does
 * not: every policy authorises against `auth.uid()`.
 */

/** The handle a profile starts with when nothing better is known, matching the sign-up trigger. */
export const FALLBACK_USERNAME = 'атлет';

/**
 * Reads a metadata value as a non-empty trimmed string.
 *
 * Metadata is untyped JSON that any client can write, so the value is narrowed rather than trusted:
 * an account whose name arrived as a number or an object is simply an account with no name, not a
 * crash in a screen somewhere.
 */
function readMetadata(metadata: User['user_metadata'] | undefined, key: string): string | null {
  const value: unknown = metadata?.[key];

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/** The name the athlete gave at sign-up, or `null` when the account has none. */
export function displayNameFromUser(user: User | null): string | null {
  return user === null ? null : readMetadata(user.user_metadata, 'full_name');
}

/**
 * The handle for an account whose profile row cannot be read.
 *
 * Deliberately the same derivation the sign-up trigger uses — metadata first, then the local part
 * of the email — so the handle shown while the profile is loading is the handle the row will have,
 * rather than something that changes under the athlete a moment later.
 */
export function usernameFromUser(user: User | null): string | null {
  if (user === null) {
    return null;
  }

  const fromMetadata = readMetadata(user.user_metadata, 'username');

  if (fromMetadata !== null) {
    return fromMetadata;
  }

  const localPart = user.email?.split('@')[0]?.trim();

  return localPart !== undefined && localPart.length > 0 ? localPart : null;
}

/** The avatar an identity provider sent, if the account has one. */
export function avatarUrlFromUser(user: User | null): string | null {
  if (user === null) {
    return null;
  }

  return (
    readMetadata(user.user_metadata, 'avatar_url') ?? readMetadata(user.user_metadata, 'picture')
  );
}
