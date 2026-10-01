/**
 * Typed application configuration, read from Expo environment variables.
 *
 * Every value comes from an `EXPO_PUBLIC_` variable, which Expo inlines into the JavaScript
 * bundle at build time. Those variables are public by design — anyone with the app can read
 * them. `.env.example` documents which values are safe to put behind this prefix.
 *
 * Importing this module validates the whole environment once. If anything is missing or
 * malformed it throws {@link EnvValidationError} listing every problem at the same time,
 * rather than letting an unrelated call site fail later with a vague error.
 *
 * Two rules from https://docs.expo.dev/guides/environment-variables, which the layout below
 * exists to respect:
 *
 *   1. A variable is only inlined when read as a static dot-notation property of `process.env`.
 *      Computed lookups such as `process.env['KEY']` are not inlined, so every reference is
 *      written out in full rather than built from a variable name.
 *   2. Code inside `node_modules` is never inlined, so config cannot be read from a dependency.
 *
 * @example
 * import { env } from '@/lib/env';
 *
 * const client = createClient(env.supabase.url, env.supabase.publishableKey);
 */

/** Validated, ready-to-use application configuration. */
export type Env = {
  /** Supabase project. The publishable key is public by design; data is protected by RLS. */
  supabase: {
    url: string;
    publishableKey: string;
  };
  /** Error monitoring. `dsn` is `null` when monitoring is not configured. */
  sentry: {
    dsn: string | null;
  };
  /** Product analytics. Disabled unless explicitly enabled. */
  analytics: {
    enabled: boolean;
    debug: boolean;
  };
};

/** Thrown when the environment is missing a required variable or holds a malformed value. */
export class EnvValidationError extends Error {
  /** One sentence per problem, in the order the variables are declared below. */
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(
      [
        'Invalid environment configuration:',
        ...issues.map((issue) => `  - ${issue}`),
        '',
        'Copy .env.example to .env, fill in the values, then restart the dev server.',
      ].join('\n'),
    );
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

const HTTP_URL = /^https?:\/\/[^\s/?#]+[^\s]*$/;
const SENTRY_DSN = /^https:\/\/[^\s@]+@[^\s/]+\/\d+$/;
const TRUTHY = new Set(['true', '1', 'yes', 'on']);
const FALSY = new Set(['false', '0', 'no', 'off', '']);

/**
 * Reads a required variable.
 *
 * @param check Optional format check; returns a sentence describing what is wrong.
 * @returns The trimmed value, or `null` after pushing a problem onto `issues`.
 */
function required(
  issues: string[],
  name: string,
  value: string | undefined,
  check?: (value: string) => string | undefined,
): string | null {
  if (value === undefined || value.trim().length === 0) {
    issues.push(`${name} is required but is missing or empty.`);
    return null;
  }

  const trimmed = value.trim();
  const problem = check?.(trimmed);

  if (problem !== undefined) {
    issues.push(`${name} ${problem}`);
    return null;
  }

  return trimmed;
}

/**
 * Reads an optional variable.
 *
 * An absent or empty value is not a problem: the feature is simply off. A present-but-malformed
 * value still fails, because that is a typo rather than a choice to disable.
 */
function optional(
  issues: string[],
  name: string,
  value: string | undefined,
  check: (value: string) => string | undefined,
): string | null {
  return value === undefined || value.trim().length === 0
    ? null
    : required(issues, name, value, check);
}

/** Reads a boolean flag, falling back to `fallback` when unset and pushing a problem when unparseable. */
function flag(
  issues: string[],
  name: string,
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (TRUTHY.has(normalized)) {
    return true;
  }

  if (FALSY.has(normalized)) {
    return false;
  }

  issues.push(`${name} must be a boolean (true/false, 1/0, yes/no, on/off), received "${value}".`);
  return fallback;
}

function parseEnv(): Env {
  const issues: string[] = [];

  const supabaseUrl = required(
    issues,
    'EXPO_PUBLIC_SUPABASE_URL',
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    (value) =>
      HTTP_URL.test(value)
        ? undefined
        : `must be an http(s) URL such as "https://<project-ref>.supabase.co", received "${value}".`,
  );
  const supabasePublishableKey = required(
    issues,
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const sentryDsn = optional(
    issues,
    'EXPO_PUBLIC_SENTRY_DSN',
    process.env.EXPO_PUBLIC_SENTRY_DSN,
    (value) =>
      SENTRY_DSN.test(value)
        ? undefined
        : `must look like "https://<key>@<host>/<project-id>", received "${value}".`,
  );
  const analyticsEnabled = flag(
    issues,
    'EXPO_PUBLIC_ANALYTICS_ENABLED',
    process.env.EXPO_PUBLIC_ANALYTICS_ENABLED,
    false,
  );
  const analyticsDebug = flag(
    issues,
    'EXPO_PUBLIC_ANALYTICS_DEBUG',
    process.env.EXPO_PUBLIC_ANALYTICS_DEBUG,
    false,
  );

  if (issues.length > 0 || supabaseUrl === null || supabasePublishableKey === null) {
    throw new EnvValidationError(issues);
  }

  return {
    supabase: { url: supabaseUrl, publishableKey: supabasePublishableKey },
    sentry: { dsn: sentryDsn },
    analytics: { enabled: analyticsEnabled, debug: analyticsDebug },
  };
}

/**
 * Validated application configuration.
 *
 * Importing this module validates the environment, so a missing or malformed value fails
 * immediately with an actionable message instead of surfacing later as an unrelated failure.
 */
export const env: Env = parseEnv();
