# Repository Guidelines

## Project Structure & Module Organization
`App.tsx` wires Expo providers, navigation, and theme tokens before deferring to `src/`. Reusable UI elements live under `src/components`, navigation stacks in `src/navigation`, screens in `src/screens`, and shared tokens/helpers in `src/theme`, `src/types`, and `src/utils`. Static media (icons, fonts, templates) belong in `assets/`; keep filenames descriptive so Expo's asset bundler can resolve them.

## Build, Test, and Development Commands
- `npm run start` – Launch Expo with Metro, enabling QR codes plus the local web preview.
- `npm run ios` – Boot Expo Dev Client against the iOS simulator (requires an open Xcode simulator).
- `npm run android` – Launch Expo Dev Client against the default Android emulator.
- `npm run web` – Serve the bundle through Expo's web renderer for responsive checks.
If Metro cache misbehaves, run `npx expo start --clear` before reloading devices.

## Coding Style & Naming Conventions
TypeScript runs in `strict` mode via `tsconfig.json`; rely on the `@/*` path alias instead of deep relative imports. Use 2-space indentation, functional components, and React Hooks; keep component files PascalCase (`VideoFeed.tsx`) and hook/util modules camelCase (`useTemplateStore.ts`, `authHelpers.ts`). Co-locate styles with the component unless they are shared tokens, in which case place them in `src/theme`.

## Testing Guidelines
Automated tests are not bootstrapped yet, so add coverage when modifying logic-heavy files. Prefer Jest with React Native Testing Library, storing specs as `ComponentName.test.tsx` beside the implementation or under `src/__tests__/` for larger suites. Until Jest is configured in CI, manually verify flows on at least one mobile simulator and the web renderer, and report the device/OS combo in the PR description.

## Commit & Pull Request Guidelines
History shows short, imperative subjects ("Add Clerk authentication", "Fix responsive design"); follow that pattern and reference issues in the body when relevant. Group related UI + logic changes together, and explain any user-visible impact plus new env vars in the description. PRs should include a concise summary, screenshots or screen recordings for UI work, and the test notes (manual steps or Jest output).

## Security & Configuration Tips
Keep API keys, Clerk publishable keys, and service URLs out of version control—load them via `.env` or an `app.config.ts` shim consumed by `app.json`. Use `expo-secure-store` for persisting session data rather than AsyncStorage, and rely on `expo-linking` to normalize redirect URIs across platforms. Document any new required secrets inside the PR so other contributors can sync their local config.
