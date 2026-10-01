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
 * @example
 * const { data, error } = await supabase.from('spots').select('id, name');
 */

import { createClient } from '@supabase/supabase-js';

import { env } from './env';

import type { Database } from '@/types/database';

export type { Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from '@/types/database';

/**
 * The shared, typed Supabase client.
 *
 * `Database` is the generated schema type, so table names, column names, insert shapes and
 * RPC signatures are all checked at compile time.
 */
export const supabase = createClient<Database>(env.supabase.url, env.supabase.publishableKey, {
  auth: {
    // Clerk is the identity provider (see `[auth.third_party.clerk]` in supabase/config.toml),
    // so the Clerk JWT travels on each request as an Authorization header rather than as a
    // Supabase Auth session. Turning the session machinery off keeps the client from reaching
    // for storage that does not exist here, and avoids the "no storage adapter" warning.
    //
    // Revisit this when Clerk lands: if sign-in flows move to Supabase Auth, these three
    // become `true` and `storage` needs an adapter (`expo-sqlite/localStorage/install`).
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
