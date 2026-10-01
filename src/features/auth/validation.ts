import type { TranslationKey } from '@/i18n';

/**
 * Form checks for the auth screens.
 *
 * These exist to answer before the network does: an email with no `@` is a typo, not a failed
 * sign-in, and saying so immediately is both faster and less alarming than a round trip that comes
 * back "wrong email or password". Everything the server alone can know — whether an account exists,
 * whether a password is correct — is deliberately not guessed at here.
 */

/** The shortest password Supabase Auth's own default policy accepts. */
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks an email address, for both sign-in and sign-up. */
export function validateEmail(email: string): TranslationKey | null {
  const value = email.trim();

  if (value.length === 0) {
    return 'auth.error.emailRequired';
  }

  return EMAIL.test(value) ? null : 'auth.error.invalidEmail';
}

/** Checks that a name was given, for sign-up. */
export function validateName(name: string): TranslationKey | null {
  return name.trim().length === 0 ? 'auth.error.nameRequired' : null;
}

/** Checks a password being chosen, for sign-up. */
export function validateNewPassword(password: string): TranslationKey | null {
  return password.length < MIN_PASSWORD_LENGTH ? 'auth.error.weakPassword' : null;
}

/**
 * Checks that a password was typed, for sign-in.
 *
 * Length is not checked here on purpose: an account whose password predates this rule would be
 * rejected by the client before the server ever saw it, and the only honest answer about a wrong
 * password is the one the server gives.
 */
export function validatePasswordEntry(password: string): TranslationKey | null {
  return password.length === 0 ? 'auth.error.passwordRequired' : null;
}
