# Dev DB setup (one-time)

Unblocks Prisma migrations (`prisma migrate dev`) for the class-announcements, material-structure, and any future schema work. Local `.env.local` currently points `DATABASE_URL` at production Neon, which is why `migrate dev` would reset prod.

## Fastest path: Neon dev branch (~5 min)

Neon supports branching a database from any moment on your prod branch — schema + data cloned, isolated compute, reset-safe.

1. Open the Neon console → select the Paideia project → **Branches** → **Create branch**.
2. Name it `dev`. Parent branch: `production` (whatever your current prod branch is called). **Uncheck** "Automatically delete branch after" — otherwise the branch disappears on you mid-cycle. Include data: **Current data**.
3. Once created, click the branch → **Connect** button → the connection panel opens.
4. Copy the **pooled** connection string (hostname contains `-pooler`).
5. Flip the **Connection pooling** toggle OFF. Copy the **direct** connection string that appears (hostname without `-pooler`).
6. Create `.env.development.local` in the repo root (`.local` suffix = auto-gitignored by the existing `.env*.local` rule, no gitignore edit needed):

   ```
   # Dev Postgres — isolated Neon branch. Safe for `prisma migrate dev`.
   DATABASE_URL="<paste the POOLED connection string here>"
   DIRECT_URL="<paste the DIRECT connection string here>"
   ```

7. Confirm the wiring:

   ```bash
   set -a && source .env.development.local && set +a && npx prisma migrate status
   ```

   Should print `Database schema is up to date!` and show the dev-branch hostname (with `-pooler`) in the `Datasource` line. If it shows your prod hostname, stop and re-check step 6.

8. To actually run migrations against dev:

   ```bash
   set -a && source .env.development.local && set +a && npx prisma migrate dev --name <migration-name>
   ```

   The `set -a && source ... && set +a` prefix loads the dev env vars into the shell for just this command — overrides anything Prisma would auto-load from `.env.local`. Same pattern works for any other Prisma command against dev (`db push`, `db seed`, etc.).

   Optional npm-script shortcut — add to `package.json`:
   ```json
   "scripts": {
     "migrate:dev": "bash -c 'set -a && source .env.development.local && set +a && prisma migrate dev'"
   }
   ```
   Then: `npm run migrate:dev -- --name my-migration`.

## Notes

- The dev branch is cheap — Neon's free tier includes branching. When you're done with a migration cycle, you can delete the branch and re-create from main if you want a fresh clone.
- `prisma migrate dev` creates a migration file in `prisma/migrations/` AND applies it. Commit the migration file. Production applies via `prisma migrate deploy` in your CI/deploy step.
- Do NOT point `.env.local` at dev — `.env.local` is for runtime dev-server connections where you want to hit real data. `.env.development.local` is migration-only.

## Alternative: local Postgres

If you prefer self-hosted:

```bash
brew install postgresql@16 pgvector
brew services start postgresql@16
createdb paideia_dev
psql paideia_dev -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Then `DATABASE_URL="postgres://<your-mac-user>@localhost:5432/paideia_dev"` + same URL for `DIRECT_URL` in `.env.development.local`. The Neon route is easier because schemas + extensions match prod exactly.

## First migration once this is done

```bash
set -a && source .env.development.local && set +a && npx prisma migrate dev --name add_material_structure_columns
```

That applies the material-structure columns (`structureKind`, `structure`, `structureExtractedAt`, `structureModel`) to `File` + `ClassMaterialFile`, and generates the corresponding migration SQL under `prisma/migrations/`.
