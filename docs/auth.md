# Auth

## Current Provider

- Clerk for frontend/session auth
- Convex for backend token validation and app-side authorization

## Current Auth Shape

### Routes

- Public:
  - `/`
  - `/auth`
- Protected:
  - `/dashboard`
  - any future route not listed as public in `apps/web/proxy.ts`

### User flow

1. A signed-out user visits `/auth`
2. Clerk renders the unified sign-in-or-sign-up flow through `<SignIn withSignUp />`
3. Successful auth redirects to `/dashboard`
4. Protected-route middleware sends signed-out users to `/auth`
5. Convex receives Clerk-backed auth through `ConvexProviderWithClerk`

## Files Involved

- Clerk/route protection:
  - [apps/web/proxy.ts](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/proxy.ts:1)
- Unified auth page:
  - [apps/web/app/(auth)/auth/[[...auth]]/page.tsx](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/app/(auth)/auth/[[...auth]]/page.tsx:1)
- App layout/provider wiring:
  - [apps/web/app/layout.tsx](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/app/layout.tsx:1)
- Clerk to Convex bridge:
  - [apps/web/components/convex-client-provider.tsx](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/components/convex-client-provider.tsx:1)
- Convex backend auth validation:
  - [convex/auth.config.ts](/Users/kingtom91/Documents/Projects/Paideia2/paideia/convex/auth.config.ts:1)

## Environment Variables

### In `apps/web/.env.local`

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL`

### In `/.env.local`

- `CLERK_JWT_ISSUER_DOMAIN`

## Important Rules

- Do not trust client-supplied user ids in Convex functions.
- Use `ctx.auth.getUserIdentity()` for backend auth checks.
- Do not rely on middleware/proxy as the only authorization layer.
- Keep the auth surface unified on `/auth` unless we intentionally redesign it.

## What Still Needs To Be Built

- A first-class app-level `users` table in Convex, if we decide to mirror Clerk users there
- Role or capability modeling for student vs teacher behavior
- Real protected queries/mutations that use `ctx.auth.getUserIdentity()`

## Writing Portal Access

- Protected student portal lives under `/write` (route group `(student)`).
- The route group's `layout.tsx` does a server-side `auth()` redirect to `/auth` for unauthenticated users — defense in depth on top of the proxy.
- Capability gating helper: `apps/web/lib/portal-access.ts` exports `canAccessWritingPortal(capabilities)` and `normalizeCapabilities(capabilities)`. Capability strings are stored on the Convex `users.capabilities` array. The default policy seeds new users with `["student", "writing_portal"]`.
- Convex mutations and queries always derive identity via `ctx.auth.getUserIdentity()` and look the viewer up via the `users.by_tokenIdentifier` index. No mutation accepts a client-supplied `userId` or `ownerId`.
- Ownership checks (folder/document/snapshot/profile) verify `doc.ownerId === viewer._id` before reading or mutating.
