# Local Setup

## Requirements

- Node `>=20.9.0`
- Bun `1.3.13` or compatible

## Install

From the repo root:

```bash
bun install
```

## Environment Files

Fill in the local env files before running the full auth flow:

- root [/.env.local](/Users/kingtom91/Documents/Projects/Paideia2/paideia/.env.local:1)
- web app [apps/web/.env.local](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/.env.local:1)

Reference templates:

- [/.env.example](/Users/kingtom91/Documents/Projects/Paideia2/paideia/.env.example:1)
- [apps/web/.env.example](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/.env.example:1)

## Development Commands

Run the monorepo dev command:

```bash
bun run dev
```

Or run just the web app:

```bash
bunx turbo run dev --filter=web
```

## Convex Sync

After changing Convex config or backend auth settings:

```bash
npx convex dev --once
```

## Validation Commands

Typecheck:

```bash
bun run check-types
```

Lint:

```bash
bun run lint
```

Build the web app:

```bash
bunx turbo run build --filter=web
```

## Current Flow To Test

1. Open `/auth`
2. Sign in or sign up through Clerk
3. Confirm redirect to `/dashboard`
4. Sign out
5. Confirm visiting `/dashboard` while signed out redirects back to `/auth`
