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
needed — every native module the app uses ships inside Expo Go.

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

### Supabase

Supabase is the backend: one hosted **PostgreSQL** database with **Storage**, **Row Level
Security** and database functions. The app reaches it through one typed client in `src/lib/`, and
no screen or shared component talks to Supabase directly. There is no Prisma, no custom Node
backend and no separately managed PostgreSQL server — the database _is_ the Supabase project, so
auth, storage and RLS stay in one place.

The Supabase CLI is a **pinned devDependency** (`supabase`), not a global install, so every
developer and CI run uses the same version:

```bash
pnpm exec supabase --help
```

| Command                                   | Description                                       |
| ----------------------------------------- | ------------------------------------------------- |
| `pnpm exec supabase init`                 | Create `supabase/config.toml` (already committed) |
| `pnpm exec supabase start`                | Run the whole stack locally (needs Docker)        |
| `pnpm exec supabase stop`                 | Stop the local stack                              |
| `pnpm exec supabase status`               | Show what is running and its local credentials    |
| `pnpm exec supabase link`                 | Link this directory to a cloud project            |
| `pnpm exec supabase migration new <name>` | Write a timestamped migration file                |
| `pnpm exec supabase migration up --local` | Apply migrations to the local database            |
| `pnpm exec supabase db push`              | Apply pending migrations to the linked project    |
| `pnpm exec supabase db diff -f <name>`    | Snapshot local schema changes as a migration      |
| `pnpm exec supabase db lint`              | Check the schema for mistakes                     |

`supabase/config.toml` and `supabase/migrations/` are committed: the config is the local
environment's definition and the migrations are the schema's history. Everything the CLI writes
while running (`supabase/.temp/`, branches, local secrets) is ignored by `supabase/.gitignore`.

There are two ways to run the database, and the app is pointed at whichever one is in use by
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`:

- **Local stack** — `pnpm exec supabase start` prints the local URL and publishable key. Requires
  [Docker Desktop](https://docs.docker.com/desktop); nothing is written to the cloud.
- **Cloud project** — create a project at [supabase.com/dashboard](https://supabase.com/dashboard),
  then run `pnpm exec supabase link --project-ref <ref>` and paste the database password when
  asked. Migrations reach it with `pnpm exec supabase db push`. The password is asked for
  interactively or stored in the OS keychain; it does not belong in `.env`, which Expo reads.

Schema changes always go through a migration file, never through the dashboard's table editor, so
that local, cloud and review all see the same history.

### Location

The Add Spot flow records the spot's position from the device rather than a map pin, so it asks for
foreground location access the first time the button is tapped. `expo-location` handles the request
and the app never reads the position in the background; the permission prompt text lives in
`app.json` under the `expo-location` plugin. There is no map in the app: Google Maps needed a
project-owned API key baked into the binary, which does not work in Expo Go, so V1 uses coordinates
only.

## Structure

```
src/app/         Expo Router routes — every file here is a screen
src/features/    business logic, one directory per feature
src/components/  reusable, presentation-only components
src/hooks/       shared hooks
src/lib/         framework and third-party integrations (env, supabase, …)
src/constants/   values TypeScript needs directly (see Styling)
src/utils/       pure helpers
src/types/       shared type definitions
scripts/         repository maintenance scripts
assets/          icons and images
app.json         Expo app configuration
designSystem.json source of truth for colours, typography, spacing and shadows
tailwind.config.js maps designSystem.json to Tailwind/NativeWind classes
global.css       generated theme variables — do not edit by hand (see Styling)
AGENTS.md        conventions for AI agents working in this repo
```

`ios/` and `android/` are generated. Configure native behaviour in `app.json`, never by editing
them by hand.

## Styling

Styling is **NativeWind** (Tailwind utilities) over a design system defined in
`designSystem.json`. Use classes in `className` rather than `StyleSheet`:

```tsx
<View className="rounded-lg bg-surface-card p-card-pad shadow-card">
  <Text className="font-medium text-bodySmall text-text-primary">Hello</Text>
</View>
```

Tailwind only emits CSS for classes it can see as literal text, so write `text-text-primary`,
never a template such as `text-${token}`.

Tokens reach CSS through one chain, so there is a single place to change a value:

1. `designSystem.json` holds the raw values.
2. `tailwind.config.js` maps them to utilities and exposes scheme-dependent colours as CSS
   variables.
3. `pnpm exec node scripts/write-theme-css.mjs` regenerates `global.css` from that config. It runs
   as part of the theme workflow; `global.css` is generated and must not be hand-edited.

Dark mode is owned by NativeWind (`darkMode: 'class'`, driven by the system via
`useColorScheme`). Colours that differ per scheme resolve through the CSS variables in
`global.css`, so a class such as `bg-bg-main` adapts on its own — you rarely need a `dark:`
prefix. `app.json` sets `userInterfaceStyle: 'automatic'`.

For the few APIs that need a colour string instead of a class (navigator options, `StatusBar`),
read `src/constants/design-tokens.ts`, which loads the same `designSystem.json`. Never paste a raw
hex value into a screen or component.

## Agent skills

Skills live in `.agents/skills/` and are **gitignored**: the React Native best-practices skill
alone is 6+ MB, mostly reference screenshots. `skills-lock.json` records each skill's source and a
content hash, so a fresh clone re-fetches and verifies them instead of carrying the images in git
history.

## License

MIT — see [LICENSE](./LICENSE).
