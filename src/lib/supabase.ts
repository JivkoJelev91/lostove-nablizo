/**
 * The application's single Supabase client.
 *
 * This module is the only place `createClient` is called. Screens and shared components
 * import `supabase` from here; features call it from `src/features/`. Nothing else should
 * construct a client, because each one opens its own connection pool, its own realtime
 * socket and its own session state — several clients on a phone is a reliable way to end up
 * with duplicate sockets and stale tokens.
 *
 * Configuration comes from `@/lib/env`, which validates the environment on import, so a
 * missing or malformed project URL or key fails immediately with an actionable message
 * rather than as an opaque network error on the first query.
 *
 * Supabase Auth is the identity provider, so the client owns the session: `persistSession`
 * writes it to storage and `autoRefreshToken` keeps the access token fresh. The store is
 * AsyncStorage rather than a keychain because a session is larger than the 2 KB SecureStore warns
 * about on Android, and the refresh token has to survive a restart or the athlete is signed out
 * every time the app is opened; `auth-storage.ts` is what keeps that store from breaking the web
 * prerender. Refresh is not left running on its own: `SessionProvider` starts and stops it with the
 * app's foreground state, which is what Supabase's React Native guide asks for, so a backgrounded
 * app is not waking up to refresh a token nobody is using.
 *
 * There is no redirect to detect: sign-in is a request and a response, not a trip through a
 * browser, so `detectSessionInUrl` is off and no callback URL is needed anywhere.
 *
 * `detectSessionInUrl` stays off. There is no browser URL holding an OAuth code in a native
 * app, and leaving it on costs a pointless parse on every launch.
 *
 * @example
 * const { data, error } = await supabase.from('spots').select('id, name');
 */

import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

import { authStorage } from './auth-storage';
import { env } from './env';

import type { Database } from '@/types/database';

export type { Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from '@/types/database';

/**
 * How long an API request may hang before it is treated as a failure, in milliseconds.
 *
 * A stalled connection can leave a fetch pending forever, and every screen would then wait on a
 * request that will never answer. The timeout turns the hang into an ordinary error, which the
 * retry policy and the screens' retry buttons already know what to do with.
 */
const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Storage object uploads carry photo bytes and legitimately take minutes on mobile data, so they
 * get their own bound rather than the request one.
 */
const UPLOAD_TIMEOUT_MS = 120_000;

/** The path every Storage object write goes through. */
const STORAGE_OBJECT_PATH = '/storage/v1/object/';

/** The request's URL, whichever of the three shapes fetch accepts it in. */
function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

/**
 * `fetch` with a deadline, so no Supabase call can hang the UI indefinitely.
 *
 * The caller's own abort signal is honoured by forwarding it to the internal controller, because
 * Supabase aborts requests itself (auth refresh, query cancellation) and the timeout must not
 * swallow that.
 */
const fetchWithTimeout: typeof fetch = async (input, init) => {
  const timeout = urlOf(input).includes(STORAGE_OBJECT_PATH)
    ? UPLOAD_TIMEOUT_MS
    : REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, timeout);

  init?.signal?.addEventListener('abort', abort);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    init?.signal?.removeEventListener('abort', abort);
  }
};

/**
 * The shared, typed Supabase client.
 *
 * `Database` is the generated schema type, so table names, column names, insert shapes and
 * RPC signatures are all checked at compile time.
 */
export const supabase = createClient<Database>(env.supabase.url, env.supabase.publishableKey, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: { fetch: fetchWithTimeout },
});
