# Stack Rules

These are the working rules for this repo right now. They are intentionally practical and tied to the stack we chose.

## Monorepo Rules

- Keep package tasks in package `package.json` files.
- Root scripts should delegate with `turbo run ...`.
- Do not add root scripts that bypass Turborepo orchestration.
- Keep shared code in `packages/`, not hidden inside an app folder.

## Next.js Rules

- Use the App Router.
- Default to Server Components and only add client boundaries where needed.
- Keep protected-route checks in server code as well as middleware/proxy.
- Use a unified `/auth` route for the current Clerk flow.
- Keep local package usage monorepo-safe through `transpilePackages`.

## Clerk Rules

- Treat Clerk as the identity layer, not the application data model.
- Use middleware/proxy to send unauthenticated users to `/auth`.
- Do not add unnecessary auth env vars when a local prop-based route setup is enough.
- Prefer one intentional auth surface over multiple overlapping auth routes.

## Convex Rules

- Read `convex/_generated/ai/guidelines.md` before doing serious Convex work.
- Always include validators for Convex functions.
- Prefer indexes over filters.
- Use bounded queries and pagination patterns instead of unbounded collects by default.
- Use `ctx.auth.getUserIdentity()` for auth checks.
- Avoid storing unbounded child collections inside a single document.

## Environment Rules

- Root env is for root tooling and Convex CLI concerns.
- App env stays inside the app package that consumes it.
- Do not casually move package runtime env vars to the repo root.
- If a variable is only used by `apps/web`, it belongs in `apps/web/.env.local`.

## Product Rebuild Rules

- Ground the tutor in real class or student materials.
- Keep the writing product voice-aware and rubric-aware.
- Treat teachers as first-class actors in the system, not an afterthought.
- Prefer reversible architecture decisions while the domain model is still taking shape.
