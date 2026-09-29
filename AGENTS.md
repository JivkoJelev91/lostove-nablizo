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
pnpm doctor                           # diagnose dependency and config issues
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

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `pnpm exec eas-cli <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Coding conventions

Enforced where a rule can be mechanical. The "enforced by" column names the rule that fails the build, so you can trust it rather than guessing.

| Rule                            | How to follow it                                                                | Enforced by                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Strict TypeScript               | `strict` plus `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals` | `tsconfig.json` + `tsc --noEmit`                                                    |
| No `any`                        | Use `unknown` at a boundary and narrow it, or model the shape                   | `@typescript-eslint/no-explicit-any`                                                |
| Functional components           | `function` components, no classes, no `this`                                    | `react/no-this-in-sfc` (warn), review                                               |
| Hooks for reusable behaviour    | Extract to `src/hooks/` or the owning feature; never call hooks conditionally   | `react-hooks/rules-of-hooks` (error)                                                |
| Feature-based organisation      | Business logic lives in `src/features/<name>/`, not in `components/`            | layout, review                                                                      |
| Small components, no huge files | Split before a file passes 300 lines or a function 120                          | `max-lines`, `max-lines-per-function` (error)                                       |
| No duplicated logic             | One owner per behaviour; reuse instead of re-implementing                       | `import/no-duplicates` (warn, imports only); review for logic                       |
| No hardcoded secrets            | Everything through `EXPO_PUBLIC_*` in a gitignored `.env`                       | `src/lib/env.ts` validation; never commit `.env`                                    |
| No scattered API calls          | Screens and shared components import a feature/lib function, never `fetch`      | `no-restricted-globals` (error) on `src/app/` and `src/components/`                 |
| Reusable types                  | `type` over `interface`, `import type` for type-only imports                    | `@typescript-eslint/consistent-type-definitions`, `consistent-type-imports` (error) |
| Clear naming                    | Names describe what a thing is, not how it works                                | review                                                                              |

Notes:

- Rules marked _warn_ come from `eslint-config-expo` and are not upgraded here. They still print on `pnpm lint`; promoting them to errors is a deliberate decision, not an oversight.
- `react/function-component-definition` is **not** enabled, so "use a function component" is held by review and by `react/no-this-in-sfc` only.
- `exactOptionalPropertyTypes` and type-aware linting are deliberately **off**. They fight React component props and need a type-checking ESLint project, which is more machinery than this codebase earns yet.
- Duplicate _logic_ cannot be linted without an extra plugin. `import/no-duplicates` only catches repeated import statements.
- `env.ts` throws on import by design, so a missing variable fails immediately instead of surfacing later as an unrelated error.

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `pnpm exec expo run:ios|android` locally, or `pnpm exec eas-cli build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
