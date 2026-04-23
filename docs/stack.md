# Stack Decisions

Last updated: 2026-04-22

## Purpose

This file tracks the baseline engineering decisions for the Paideia rebuild so the product, platform, and deployment choices stay explicit while we redesign the app.

The concept brief gives us the product shape:

- A grounded Socratic tutor
- A voice-matched writing portal
- A teacher workspace that provides the context both systems rely on

That means the stack needs to support:

- Realtime, stateful product surfaces
- Strong TypeScript ergonomics across frontend and backend
- Fast iteration in a monorepo
- Safe deployment on Vercel
- A data model that can grow into class context, materials, sessions, and writing profiles

## Confirmed Baseline

Validated on 2026-04-22 against current Context7 docs for Next.js, Turborepo, Convex, and Vercel, plus npm registry version checks.

## Current Implemented State

The repo is no longer just an empty starter. The current baseline includes:

- A working Turborepo monorepo rooted at this repository
- `apps/web` running on Next.js App Router
- Monorepo-safe Next.js config for workspace package transpilation and output tracing
- Clerk auth wired into the web app with a unified `/auth` route
- Convex auth validation configured for Clerk tokens
- Local env templates split between root Convex config and app-level Next.js config

This is still a platform foundation, not the finished product model. We have auth, routing, and deployment posture in place, but we have not yet implemented the first real domain schema for users, classes, materials, or sessions.

### Monorepo

- Package manager: Bun (`bun@1.3.13`)
- Workspace layout: Bun workspaces + Turborepo
- Root scripts delegate to `turbo run ...`
- Package tasks stay in package `package.json` files, not in the root

Why:

- Turborepo remains the right fit for a multi-app repo with shared packages
- It gives us clear task orchestration, caching, and package boundaries without overcommitting to a more complex platform story yet

### Web App

- Framework: Next.js `16.2.4`
- Rendering model: App Router
- React: `19.2.5`
- Runtime baseline: Node `>=20.9.0`

Why:

- Next.js 16 is the right baseline for a Vercel-hosted product rebuild
- App Router matches the architecture we want for server-first pages, streaming, route handlers, and selective client interactivity
- React 19.2.x keeps us aligned with the current Next.js line

### Backend

- Backend platform: Convex `1.36.0`
- Convex remains the primary application backend and realtime data layer
- Convex code lives at the repo root for now

Why:

- The product is collaborative, session-heavy, and likely realtime in multiple places
- Convex fits the tutor/session/material model better than bolting together a separate ORM, API layer, websocket story, and job system on day one

### Deployment

- Default deployment target: Vercel
- Primary production app: `apps/web`
- Turborepo remains compatible with Vercel monorepo deployment and remote caching

Why:

- The repo already points in this direction
- Next.js + Vercel is the lowest-friction deployment path for the web surface
- We can still keep Convex as the backend without fighting the hosting model

## Repo Conventions We Are Keeping

### Turborepo conventions

- Root scripts only delegate to `turbo run`
- Build outputs are declared in `turbo.json`
- `dev` stays uncached and persistent
- Environment-sensitive tasks must declare env inputs in Turborepo config when those envs affect outputs

### Next.js monorepo conventions

- Use `transpilePackages` for local workspace packages consumed by the app
- Use `outputFileTracingRoot` so deploys can trace files outside `apps/web`
- Keep authorization checks in server code, not only in proxy/middleware-style routing
- Prefer App Router server components by default and push client boundaries down
- Keep auth flows on the unified `/auth` route unless we make a deliberate product decision to split them later

### Convex conventions

- Follow `convex/_generated/ai/guidelines.md`
- Keep validators explicit in Convex functions
- Prefer indexes over filters
- Avoid unbounded collections and large embedded arrays in documents
- Use `ctx.auth.getUserIdentity()` for backend auth checks, not client-supplied user ids

## Decisions Made So Far

1. Keep the Bun + Turborepo monorepo instead of collapsing back to a single-app repo.
2. Upgrade the Next.js apps to `16.2.4`.
3. Upgrade React and React DOM to `19.2.5`.
4. Raise the Node runtime requirement to `>=20.9.0`.
5. Configure `apps/web` for monorepo-safe package transpilation and output tracing.
6. Keep Convex as a core stack choice instead of treating it as optional infrastructure.
7. Choose Clerk as the auth provider for the rebuild.
8. Use a unified `/auth` route instead of separate `/sign-in` and `/sign-up` pages.
9. Split env ownership by runtime:
   - root `.env.local` for Convex CLI/backend auth config
   - `apps/web/.env.local` for Next.js + Clerk frontend/server runtime config

## Open Decisions

These are important but not locked yet.

### Auth

Chosen provider: Clerk

Current package baseline:

- `@clerk/nextjs@7.2.5`

Implementation direction:

- Clerk handles frontend and session auth for the Next.js app
- Convex validates Clerk-issued tokens via `convex/auth.config.ts`
- We use a public-first route strategy with explicit protection for app routes
- The App Router root layout wraps `ClerkProvider`, and Convex is bridged through `ConvexProviderWithClerk`
- Middleware explicitly points unauthenticated protected-route traffic at `/auth`

Why:

- Clerk gives us a mature hosted auth surface with fast Next.js integration
- It fits the product need for student + teacher identity without us hand-rolling session infrastructure
- The Convex integration path is well documented and keeps backend authorization server-verified

Still to decide later:

- Whether we want organizations enabled early for school / class administration
- Whether any onboarding rules differ by teacher vs student capability
- Whether we mirror Clerk users into a first-class Convex `users` table immediately or only when the app model requires it

### UI system

We have not locked the component/design system yet.

Current stance:

- Keep the initial shell lightweight
- Decide deliberately before installing a large UI dependency surface

Likely direction:

- Tailwind CSS v4 + a curated component layer, if it helps us move faster without flattening the visual identity

### Data model boundaries

We still need to decide how aggressively to separate the following concepts:

- Student-owned material vs teacher-owned material
- Tutoring sessions vs writing sessions
- Class context vs personal workspace context
- Capability-based permissions vs rigid role enums

### Retrieval / context strategy

The concept brief strongly suggests we should revisit how grounding works.

Current product direction:

- Full-file context for smaller uploads when that is simpler and more reliable
- Structured parsing for materials where type matters deeply, like worksheets, prompts, and problem sets
- Retrieval as an implementation detail, not the headline feature

## Short-Term Next Steps

1. Decide the UI foundation before heavy frontend implementation starts.
2. Define the first shared domain package boundaries.
3. Write the first-pass application schema around users, classes, materials, and sessions.
4. Establish environment variable placement so we do not normalize a root `.env` pattern long-term.
5. Replace the placeholder dashboard/auth proof-of-life with the first real authenticated data flow from Convex.

## Writing Portal V1 (landed 2026-04-23)

The first product slice of the rebuild — student-only writing portal — is implemented end-to-end on top of the platform baseline.

### Surfaces

- Student-only `/write` route group with auth-gated layout and shadcn-based AppShell + DriveSidebar
- `/write/profile` for voice training (sample upload UI + readiness state)
- `/write` and `/write/folders/[folderId]` for the personal drive (folders, documents, last-updated cards)
- `/write/documents/[documentId]` for the lightweight TipTap editor with selection-aware AI tools and a generation sidebar (Inputs / Generation / Run History)

### Convex domain model

- `users`, `folders`, `documents`, `documentSnapshots`, `writingProfiles`, `writingSamples`, `writingRuns`
- All mutations derive identity from `ctx.auth.getUserIdentity()`; no client-supplied owner ids
- All collection queries scoped via `withIndex` (`by_ownerId_and_folderId`, `by_documentId`, `by_profileId`, `by_ownerId`, etc.)
- Writing runs are first-class records with status/inputs/outputs/references; the V1 action path uses a mock output, ready to swap for an LLM provider later

### UI system

- shadcn preset `b7C9wSxrU` (Lyra style, Mist colors, Figtree font, HugeIcons, radius None, dark premium creative-studio)
- Tailwind v4 wired via `@tailwindcss/postcss`
- Locked tokens are documented in `docs/design-system.md` and applied across every portal surface

### Editor

- TipTap React with StarterKit (heading levels 1–3, bold/italic/lists/blockquote/code)
- SSR-safe via `immediatelyRender: false`
- Editor-managed debounced autosave to `documentSnapshots` with content dedup
- Selection-aware AI menu (rewrite / tighten / expand) wired into the writing-run pipeline

### Testing posture

- Unit: Vitest + Testing Library for portal-access and editor serialization
- E2E: Playwright with auth-gating coverage; profile + drive smoke tests scaffolded behind `test.skip` pending Clerk test storage state
