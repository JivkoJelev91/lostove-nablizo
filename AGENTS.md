This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

This project uses **pnpm**. There is no `bun.lock` or `package-lock.json`, and `package.json`
declares `"packageManager": "pnpm@12.3.4"`. Run local binaries with `pnpm exec` (or `pnpm <script>`
for the scripts already defined in `package.json`) — do not use `npx`, which bypasses pnpm and can
install a different version than the lockfile pins.

```bash
pnpm install                          # install dependencies
pnpm exec expo install <package>      # ALWAYS use instead of pnpm add — resolves SDK-compatible versions
pnpm start                            # start the dev server
pnpm lint                             # lint
pnpm typecheck                        # typecheck
pnpm run doctor                      # expo-doctor: diagnose dependency and config issues (bare `pnpm doctor` runs pnpm's own command, not this script)
pnpm exec expo install --fix          # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

Never reintroduce an npm or yarn lockfile. EAS selects the package manager from whichever lockfile
it finds, so two lockfiles make build behaviour unpredictable.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

EAS builds, signs and submits the app in the cloud (`eas build`, `eas submit`) and ships over-the-air updates (`eas update`) with no local Xcode or Android Studio. Nothing in this project uses EAS yet — Expo Go runs everything, including on a device — so there is no `eas.json` and the CLI is not a dependency: `expo-doctor` fails a project that pins it, and its server API moves faster than a lockfile does. Run it at latest through pnpm when the first store build is needed — `pnpx eas-cli@latest <command>` — and add `eas.json` with the profiles that build requires.

A build becomes necessary when a library with native code is added: Expo Go only carries its bundled modules, so that library would need `expo-dev-client` plus a development build (`pnpx eas-cli@latest build --profile development --platform android`, or `pnpm exec expo run:android` with a local SDK).

Build-time configuration does **not** come from `.env`, which is gitignored and never uploaded. The `EXPO_PUBLIC_*` values belong in EAS environment variables (`pnpx eas-cli@latest env:set`) for a store build; a build without them compiles and then dies at launch with `EnvValidationError`.
Docs: https://docs.expo.dev/eas/index.md

## Supabase

Supabase is the only backend: hosted PostgreSQL + Storage + RLS. No Prisma, no custom Node backend, no separately managed database. The CLI is a **pinned devDependency**, so run it through pnpm (`pnpm exec supabase <command>`, never a global `supabase`).

```bash
pnpm exec supabase migration new <name>   # write a timestamped migration
pnpm exec supabase migration up --local   # apply migrations to the local database
pnpm exec supabase db push                # apply migrations to the linked cloud project
pnpm exec supabase db lint                # check the schema
```

- Schema changes go through migration files in `supabase/migrations/`, never through the dashboard's table editor. `supabase/config.toml` and `supabase/migrations/` are committed; `supabase/.temp/` is not.
- `pnpm exec supabase start` needs Docker Desktop, which is **not installed** on this machine. Until it is, or until a cloud project is linked with `pnpm exec supabase link --project-ref <ref>`, no database can be reached — migrations can be written but not applied.
- The database password is asked for interactively by `link` (or stored in the OS keychain). Never put it in `.env`, which Expo reads and inlines into the bundle.
- Screens and shared components never touch Supabase directly (enforced by `no-restricted-globals` on `fetch`). Data access lives in `src/lib/` and `src/features/`.

Docs: https://supabase.com/docs/guides/cli/getting-started

## Coding conventions

Enforced where a rule can be mechanical. The "enforced by" column names the rule that fails the build, so you can trust it rather than guessing.

| Rule                            | How to follow it                                                                             | Enforced by                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Strict TypeScript               | `strict` plus `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`              | `tsconfig.json` + `tsc --noEmit`                                                    |
| No `any`                        | Use `unknown` at a boundary and narrow it, or model the shape                                | `@typescript-eslint/no-explicit-any`                                                |
| Functional components           | `function` components, no classes, no `this`                                                 | `react/no-this-in-sfc` (warn), review                                               |
| Hooks for reusable behaviour    | Extract to `src/hooks/` or the owning feature; never call hooks conditionally                | `react-hooks/rules-of-hooks` (error)                                                |
| Feature-based organisation      | Business logic lives in `src/features/<name>/`, not in `components/`                         | layout, review                                                                      |
| Small components, no huge files | Split before a file passes 300 lines or a function 120                                       | `max-lines`, `max-lines-per-function` (error)                                       |
| No duplicated logic             | One owner per behaviour; reuse instead of re-implementing                                    | `import/no-duplicates` (warn, imports only); review for logic                       |
| No hardcoded secrets            | Everything through `EXPO_PUBLIC_*` in a gitignored `.env`                                    | `src/lib/env.ts` validation; never commit `.env`                                    |
| No scattered API calls          | Screens and shared components import a feature/lib function, never `fetch`                   | `no-restricted-globals` (error) on `src/app/` and `src/components/`                 |
| Reusable types                  | `type` over `interface`, `import type` for type-only imports                                 | `@typescript-eslint/consistent-type-definitions`, `consistent-type-imports` (error) |
| Styling through tokens          | Use NativeWind `className` and existing design tokens; never a raw colour or a one-off style | review; `prettier-plugin-tailwindcss` sorts class order                             |
| Clear naming                    | Names describe what a thing is, not how it works                                             | review                                                                              |

Notes:

- Rules marked _warn_ come from `eslint-config-expo` and are not upgraded here. They still print on `pnpm lint`; promoting them to errors is a deliberate decision, not an oversight.
- `react/function-component-definition` is **not** enabled, so "use a function component" is held by review and by `react/no-this-in-sfc` only.
- `exactOptionalPropertyTypes` and type-aware linting are deliberately **off**. They fight React component props and need a type-checking ESLint project, which is more machinery than this codebase earns yet.
- Duplicate _logic_ cannot be linted without an extra plugin. `import/no-duplicates` only catches repeated import statements.
- `env.ts` throws on import by design, so a missing variable fails immediately instead of surfacing later as an unrelated error.

## Styling and theming

Styling is **NativeWind** over `designSystem.json`. Use `className`, not `StyleSheet`. The token chain is `designSystem.json` → `tailwind.config.js` → generated `global.css`; see DEVELOPMENT.md's Styling section for the workflow.

- Tailwind emits CSS only for classes it sees as literal text. Write `text-text-primary`; never build a class name by interpolation such as `text-${token}`.
- `global.css` is generated by `scripts/write-theme-css.mjs` from `tailwind.config.js`. Never hand-edit it; regenerate it instead.
- Dark mode belongs to NativeWind (`darkMode: 'class'`, following the system). Scheme-dependent colours resolve through CSS variables, so `bg-bg-main` adapts without a `dark:` prefix.
- The dark variable block in `global.css` must use the selector `.dark:root`. NativeWind only recognises that form (bare `.dark` and `:root.dark` are silently dropped, leaving the dark values unused). `scripts/write-theme-css.mjs` emits it; do not "simplify" it by hand.
- For APIs that take a colour string (navigators, `StatusBar`), read `src/constants/design-tokens.ts` — do not paste hex values.
- Never put `className` and `style` on the same animated component (`Animated.View`, `Animated.Text`, anything from Reanimated). Reanimated replaces the props of its own components, so the classes are dropped on a device while react-native-web keeps applying them — the element looks right in `pnpm start` on web and is broken in Expo Go. Put the classes on a plain `View` around it and the animation on the inner animated view, as `Button`, `Skeleton` and `ImageCarousel` do. Do not "fix" this with `cssInterop`: it was tried, did not apply on device, and only hid the problem on web.
- Same trap with size: a class like `h-space-12` is 12 **pixels**, so a particle sized that way is invisible in practice. Read `spacingValues` from `src/constants/design-tokens.ts` when something is measured in TypeScript.
- `boxShadow` tokens must be CSS shadow strings. RN style objects (`{ shadowColor, ... }`) crash Tailwind's parser, and inside Metro that crash surfaces only as a bundler hang, not an error.

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `pnpm exec expo run:ios|android` locally, or `pnpm exec eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
