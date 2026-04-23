# Changelog

## 2026-04-23 — Writing Portal V1 foundation

### Added

- Student-only `/write` route group with shadcn-based AppShell and DriveSidebar
- `/write/profile` voice-training flow with sample upload, progress, and readiness state
- `/write` drive with folders + documents + folder routing at `/write/folders/[folderId]`
- `/write/documents/[documentId]` workspace with TipTap rich-text editor
- Generation sidebar with Inputs (prompt/sources/rubric), Generation (outline + draft buttons), and Run History
- Selection-aware AI menu for rewrite/tighten/expand transformations
- Convex schema: `users`, `folders`, `documents`, `documentSnapshots`, `writingProfiles`, `writingSamples`, `writingRuns`
- Convex modules: `users.ts`, `profile.ts`, `drive.ts`, `documents.ts`, `snapshots.ts`, `writingRuns.ts`, plus `lib/auth.ts` and `lib/capabilities.ts`
- shadcn preset `b7C9wSxrU` (Lyra/Mist/Figtree, dark premium) with Tailwind v4
- HugeIcons icon library wired via `@hugeicons/react` + `@hugeicons/core-free-icons`
- Vitest for unit tests, Playwright for e2e (with auth-gating, profile, and drive specs)

### Changed

- Replaced the warm-light landing-page palette in `globals.css` with the dark Lyra/Mist tokens and Figtree typography
- Wired Figtree via `next/font/google` in the root layout; added the `dark` class to `<html>` so the portal renders dark by default
- Snapshot writes are now deduped against the document's latest snapshot to avoid no-op writes
- Snapshot and sample queries are bounded with `take(N)` instead of unbounded `collect`

### Notes

- AI generation is mocked end-to-end so the full UI loop runs today; the action boundary is set up to swap a real LLM provider in cleanly
- Profile and drive e2e tests are scaffolded behind `test.skip` pending a Clerk test storage state for Playwright
- The legacy landing page (`/`) and dashboard (`/dashboard`) still use their original CSS modules and are not part of the writing portal redesign

## 2026-04-22

### Repo initialization and stack baseline

- Confirmed the repo is a Bun workspace monorepo using Turborepo.
- Confirmed `apps/web` already existed as a Next.js app and normalized it instead of re-scaffolding over it.
- Upgraded the app baseline to:
  - `next@16.2.4`
  - `react@19.2.5`
  - `react-dom@19.2.5`
  - `@next/eslint-plugin-next@16.2.4`
- Raised the Node runtime requirement to `>=20.9.0`.
- Added monorepo-safe Next.js config in `apps/web/next.config.js`:
  - `transpilePackages`
  - `outputFileTracingRoot`

### UI and placeholder rebuild shell

- Replaced the stock Turborepo starter page in `apps/web` with a rebuild-oriented landing page tied to the Paideia concept brief.
- Updated root layout metadata and base styling to reflect the product direction rather than the default scaffold.
- Added a protected dashboard placeholder as the first authenticated route.

### Auth foundation

- Chose Clerk as the auth provider.
- Installed `@clerk/nextjs@7.2.5`.
- Wrapped the App Router root layout with `ClerkProvider`.
- Added a client-side Convex bridge using `ConvexProviderWithClerk`.
- Added Clerk middleware/proxy route protection.
- Switched from separate sign-in/sign-up routes to a unified `/auth` route.
- Updated Clerk middleware to redirect protected-route unauthenticated traffic to `/auth`.
- Added Clerk/Convex auth configuration in `convex/auth.config.ts`.

### Env templates and setup posture

- Added root env templates for Convex CLI/backend auth validation.
- Added `apps/web` env templates for Next.js + Clerk runtime config.
- Split env ownership clearly:
  - root `.env.local` for Convex CLI/backend config
  - `apps/web/.env.local` for the web app
- Added a minimal `apps/docs/.env.example` placeholder.

### Convex typing fix

- Fixed Convex typechecking so `process.env` works inside `convex/auth.config.ts`.
- Added root `@types/node`.
- Added `"types": ["node"]` to `convex/tsconfig.json`.

### Validation completed

The following checks were run successfully during setup:

- `bun install`
- `bun run check-types`
- `bun run lint`
- `bunx turbo run build --filter=web`
- `npx convex dev --once`

### Not done yet

- No real Convex schema has been added yet for app-level users, classes, materials, or sessions.
- The dashboard currently proves auth wiring, but it does not yet load an actual app-level user document.
- The UI system is still intentionally lightweight and not finalized.
