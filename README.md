# lostove-nablizo

Work-in-progress repository.

Public documentation for this project has not been written yet.

## Development

Requires Node.js 20+ and npm.

```bash
npm install
npm start
```

Scan the QR code with Expo Go on a physical device. No Android Studio, Android SDK or Xcode is
needed at this stage.

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm start`            | Start the Metro dev server                          |
| `npm run android`      | Start Metro and open the Android emulator           |
| `npm run ios`          | Start Metro and open the iOS simulator (macOS only) |
| `npm run web`          | Start Metro and open the web version                |
| `npm run lint`         | Run ESLint                                          |
| `npm run typecheck`    | Run `tsc --noEmit`                                  |
| `npm run format`       | Format with Prettier                                |
| `npm run format:check` | Verify formatting                                   |
| `npm run doctor`       | Run `expo-doctor`                                   |

Run `npm run typecheck && npm run lint && npm run format:check` before considering a task done.

### Dependencies

Always install Expo-managed packages with `npx expo install <package>` so the version matches the
SDK. Use `npx expo install --check` to verify, and `npx expo install --fix` to correct.

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
src/app/        Expo Router routes — every file here is a screen
src/lib/        framework and third-party integrations (env, supabase, …)
src/components/ reusable, presentation-only components
assets/         icons and images
app.json        Expo app configuration
AGENTS.md       conventions for AI agents working in this repo
```

`ios/` and `android/` are generated. Configure native behaviour in `app.json`, never by editing
them by hand.

## License

MIT — see [LICENSE](./LICENSE).
