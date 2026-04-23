# Paideia Web App

Next.js 16 App Router app for the Paideia platform — sign-in/sign-out flow, dashboard placeholder, and the student writing portal under `/write`.

## Surfaces

- `/` — landing page (legacy CSS modules)
- `/auth` — Clerk unified sign-in/sign-up
- `/dashboard` — auth wiring proof-of-life
- `/write` — student writing portal (drive)
- `/write/profile` — voice training flow
- `/write/folders/[folderId]` — folder contents
- `/write/documents/[documentId]` — lightweight rich-text editor + generation sidebar

The writing portal uses the locked shadcn preset `b7C9wSxrU` (Lyra style, Mist colors, Figtree font, HugeIcons, radius None, dark premium creative-studio). See [`docs/design-system.md`](../../docs/design-system.md) for the locked tokens and application rules.

## Local commands

From the repo root, all package tasks go through Turborepo:

- `bun run dev` — start every dev server
- `bun run check-types` — typecheck every package
- `bun run lint` — lint every package
- `bunx --bun turbo run build --filter=web` — production build of just this app

From `apps/web`:

- `bun run dev` — Next dev on http://127.0.0.1:3000
- `bun run test` — Vitest unit tests
- `bun run test:e2e` — Playwright (uses `webServer.reuseExistingServer`, so run `bun run dev` separately if you want a hot-reload session)

After changing Convex schema or auth config, sync from the repo root:

```bash
npx convex dev --once
```

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`. The Convex/Clerk JWT issuer config lives in the repo root `.env.local` (`CLERK_JWT_ISSUER_DOMAIN`).

## Stack snapshot

- Next.js 16.2.4 (App Router) on React 19.2.5
- Clerk 7 for identity (`@clerk/nextjs`)
- Convex 1.36 for the realtime backend (`convex/react` + `ConvexProviderWithClerk`)
- Tailwind v4 + shadcn primitives in `components/ui/*`
- TipTap 3 for the editor
- Vitest 4 + Testing Library for unit tests; Playwright for e2e
