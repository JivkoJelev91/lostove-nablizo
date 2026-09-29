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

No environment variables are required. No secrets are stored in this repository. Real values, if
any are added later, belong in a gitignored `.env` file; anything prefixed `EXPO_PUBLIC_` is
inlined into the client bundle and is publicly readable, so it must never hold a secret.

## Structure

```
src/app/        Expo Router routes — every file here is a screen
src/components/ reusable, presentation-only components
assets/         icons and images
app.json        Expo app configuration
AGENTS.md       conventions for AI agents working in this repo
```

`ios/` and `android/` are generated. Configure native behaviour in `app.json`, never by editing
them by hand.

## License

MIT — see [LICENSE](./LICENSE).
