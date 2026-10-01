import type { User } from '@supabase/supabase-js';

import { avatarUrlFromUser, FALLBACK_USERNAME, usernameFromUser } from '@/features/auth/identity';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import type { TranslationKey } from '@/i18n';

/** A `public.profiles` row, as the generated database types describe it. */
export type ProfileRow = Tables<'profiles'>;

/**
 * The sentence a failed auth call should show, as a translation key rather than a message.
 *
 * Supabase reports its errors as codes; the screen owns the copy. Mapping here means the screens
 * never branch on a string like `invalid_credentials`, and an unmapped code degrades to one honest
 * "something went wrong" instead of leaking a server message to the athlete.
 */
const ERROR_KEYS: Record<string, TranslationKey> = {
  email_address_invalid: 'auth.error.invalidEmail',
  email_exists: 'auth.error.emailTaken',
  email_not_confirmed: 'auth.error.emailNotConfirmed',
  invalid_credentials: 'auth.error.invalidCredentials',
  over_email_send_rate_limit: 'auth.error.tooManyAttempts',
  over_request_rate_limit: 'auth.error.tooManyAttempts',
  user_already_exists: 'auth.error.emailTaken',
  weak_password: 'auth.error.weakPassword',
};

/** A failed auth call, carrying the key of the sentence to show. */
export class AuthFailure extends Error {
  readonly key: TranslationKey;

  constructor(key: TranslationKey) {
    super(key);
    this.name = 'AuthFailure';
    this.key = key;
  }
}

/** Narrows a caught value to {@link AuthFailure}, so a screen can show `failure.key`. */
export function isAuthFailure(value: unknown): value is AuthFailure {
  return value instanceof AuthFailure;
}

/** Maps a Supabase error to the sentence to show, falling back to a generic one. */
function failureFor(
  error: { code?: string | null } | null,
  fallback: TranslationKey = 'auth.error.generic',
): AuthFailure {
  const code = error?.code ?? null;

  return new AuthFailure(code === null ? fallback : (ERROR_KEYS[code] ?? fallback));
}

/** What the sign-up screen collects. */
export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

/**
 * Creates an account.
 *
 * The name travels as metadata: the sign-up trigger reads it there and creates the profile row in
 * the same transaction as the account, so an athlete who has just signed up already has a profile.
 *
 * @returns Whether the athlete is signed in already. With email confirmation off — how the project
 *   is configured — an account is its own session and this is `true`, so sign-up and sign-in are the
 *   same thing from the athlete's side. If confirmation is ever switched on, the account exists but
 *   has no session, and the caller has to say so rather than send anybody into the app.
 */
export async function signUp({
  fullName,
  email,
  password,
}: SignUpInput): Promise<{ signedIn: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: fullName.trim() } },
  });

  if (error !== null) {
    throw failureFor(error);
  }

  return { signedIn: data.session !== null };
}

/** Signs in with email and password. */
export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

  if (error !== null) {
    throw failureFor(error);
  }
}

/**
 * Ends the session on this device.
 *
 * A global sign-out first, so the refresh token is revoked on the server and the session cannot be
 * replayed elsewhere. When the server cannot be reached the athlete still asked to be signed out,
 * so this falls back to a local sign-out: the tokens are deleted here and the server's copy simply
 * expires. Refusing to sign out because the phone is offline would be the worse failure of the two.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error === null) {
    return;
  }

  const { error: localError } = await supabase.auth.signOut({ scope: 'local' });

  if (localError !== null) {
    throw failureFor(localError);
  }
}

/** The athlete's own profile row, or `null` when there is none yet. */
async function selectProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error !== null) {
    throw failureFor(error);
  }

  return data;
}

/**
 * The signed-in athlete's profile row, created from the account when it is missing.
 *
 * The sign-up trigger creates it in the same transaction as the account, so this is normally a
 * single select. The insert is the repair path for the one case the trigger cannot cover: a row
 * that never landed. It is not treated as a failure when it loses a race, because losing that race
 * means the row is now there, which is the outcome the caller wanted — so a failed insert re-reads
 * before it reports anything.
 */
export async function loadProfile(user: User): Promise<ProfileRow | null> {
  const existing = await selectProfile(user.id);

  if (existing !== null) {
    return existing;
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    username: usernameFromUser(user) ?? FALLBACK_USERNAME,
    avatar_url: avatarUrlFromUser(user),
  });

  if (error !== null) {
    const raced = await selectProfile(user.id);

    if (raced !== null) {
      return raced;
    }

    throw failureFor(error);
  }

  return selectProfile(user.id);
}
