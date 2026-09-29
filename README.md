# Street Fitness

Work-in-progress repository.

Public documentation for this project has not been written yet.

## Development

Requires Node.js 20+ and pnpm.

```bash
pnpm install
pnpm start
```

Scan the QR code with Expo Go on a physical device. No Android Studio, Android SDK or Xcode is
needed at this stage.

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `pnpm start`        | Start the Metro dev server                          |
| `pnpm android`      | Start Metro and open the Android emulator           |
| `pnpm ios`          | Start Metro and open the iOS simulator (macOS only) |
| `pnpm web`          | Start Metro and open the web version                |
| `pnpm lint`         | Run ESLint                                          |
| `pnpm typecheck`    | Run `tsc --noEmit`                                  |
| `pnpm format`       | Format with Prettier                                |
| `pnpm format:check` | Verify formatting                                   |
| `pnpm doctor`       | Run `expo-doctor`                                   |

Run `pnpm typecheck && pnpm lint && pnpm format:check` before considering a task done.

### Dependencies

Always install Expo-managed packages with `pnpm exec expo install <package>` so the version matches
the SDK. Use `pnpm exec expo install --check` to verify, and `pnpm exec expo install --fix` to
correct.

### Environment variables

Configuration lives in `src/lib/env.ts`, which reads and validates every variable in one place.
`.env.example` documents each one with empty placeholders. Copy it to `.env` and fill in real
values:

```bash
cp .env.example .env
```

`.env` is gitignored. Anything prefixed `EXPO_PUBLIC_` is inlined into the client bundle at build
time and is publicly readable, so it must never hold a secret — the Supabase and Clerk keys below
are safe to ship because Supabase Row Level Security and Clerk enforce access, not the key itself.

| Variable                            | Required | Purpose                                  |
| ----------------------------------- | -------- | ---------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`          | yes      | Supabase project URL                     |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`     | yes      | Supabase anon/publishable key            |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes      | Clerk publishable key                    |
| `EXPO_PUBLIC_SENTRY_DSN`            | no       | Error monitoring; leave empty to disable |
| `EXPO_PUBLIC_ANALYTICS_ENABLED`     | no       | Product analytics, off by default        |
| `EXPO_PUBLIC_ANALYTICS_DEBUG`       | no       | Log analytics events to the console      |

Importing `@/lib/env` validates the environment once and throws a single error listing every
missing or malformed variable, rather than failing later at an unrelated call site. Nothing
imports it yet, so the app still starts without a `.env` file.

## Structure

```
src/app/         Expo Router routes — every file here is a screen
src/features/    business logic, one directory per feature
src/components/  reusable, presentation-only components
src/hooks/       shared hooks
src/lib/         framework and third-party integrations (env, supabase, …)
src/constants/   design tokens
src/utils/       pure helpers
src/types/       shared type definitions
scripts/         repository maintenance scripts
assets/          icons and images
app.json         Expo app configuration
designSystem.json design tokens and component rules, mirrored by src/constants/theme.ts
AGENTS.md        conventions for AI agents working in this repo
```

`ios/` and `android/` are generated. Configure native behaviour in `app.json`, never by editing
them by hand.

## Agent skills

Skills live in `.agents/skills/` and are **gitignored**: the React Native best-practices skill
alone is 6+ MB, mostly reference screenshots. `skills-lock.json` records each skill's source and a
content hash, so a fresh clone re-fetches and verifies them instead of carrying the images in git
history.

## License

MIT — see [LICENSE](./LICENSE).
