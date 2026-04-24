# Environment Variables

This repo currently uses two local env files on purpose.

## Root Env

File: [/.env.local](/Users/kingtom91/Documents/Projects/Paideia2/paideia/.env.local:1)

This file is for:

- Convex CLI configuration
- Convex backend auth validation

Current vars:

- `CONVEX_DEPLOYMENT`
- `CONVEX_URL`
- `CONVEX_SITE_URL`
- `CLERK_JWT_ISSUER_DOMAIN`

Why it lives here:

- `npx convex dev` runs from the repo root and reads this file
- `convex/auth.config.ts` depends on `CLERK_JWT_ISSUER_DOMAIN`

## Web App Env

File: [apps/web/.env.local](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/.env.local:1)

This file is for:

- Next.js runtime configuration
- Clerk keys used by the web app
- the frontend Convex URL

Current vars:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Why it lives here:

- These values are consumed by the Next.js app in `apps/web`
- keeping them app-local is cleaner than normalizing a monorepo-wide root `.env` pattern

## Templates

- Root template: [/.env.example](/Users/kingtom91/Documents/Projects/Paideia2/paideia/.env.example:1)
- Web template: [apps/web/.env.example](/Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web/.env.example:1)

## Current Rule

Do not add new app-specific env vars to the root `.env.local` unless they are genuinely needed by root-level tooling.

The default rule is:

- root env for root tooling and Convex CLI
- package env for package runtime
