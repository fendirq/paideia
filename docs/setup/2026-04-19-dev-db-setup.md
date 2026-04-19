# Dev DB setup (one-time)

Unblocks Prisma migrations (`prisma migrate dev`) for the class-announcements, material-structure, and any future schema work. Local `.env.local` currently points `DATABASE_URL` at production Neon, which is why `migrate dev` would reset prod.

## Fastest path: Neon dev branch (~5 min)

Neon supports branching a database from any moment on your prod branch — schema + data cloned, isolated compute, reset-safe.

1. Open the Neon console → select the Paideia project → **Branches** → **Create branch**.
2. Name it `dev` (or `dev-<your-name>`). Source: `main` (or whatever the prod branch is called). Compute size: minimum tier is fine.
3. Once created, click the dev branch → **Connection string** → copy the pooled `postgres://…?sslmode=require` URL.
4. Create `.env.development` in the repo root:

   ```
   # Dev Postgres — isolated Neon branch. Safe for `prisma migrate dev`.
   DATABASE_URL="<paste the dev-branch connection string here>"
   DIRECT_URL="<paste the same URL, but swap the pooled host for the direct-connect host — Neon shows both in the connection panel>"
   ```

   `DIRECT_URL` is the non-pooled variant Prisma uses for migrations. Both are shown in the same Neon connection card.

5. Add `.env.development` to `.gitignore` if it isn't already:

   ```bash
   git check-ignore .env.development || echo ".env.development" >> .gitignore
   ```

6. Confirm the wiring:

   ```bash
   npx dotenv -e .env.development -- npx prisma migrate status
   ```

   Should print something like `Database schema is up to date!` (or list pending migrations if a branch has some). If it tries to touch prod (you'll see the prod host in the output), stop and re-check step 4.

7. To actually run migrations against dev:

   ```bash
   npx dotenv -e .env.development -- npx prisma migrate dev --name <migration-name>
   ```

   Or set up an npm script: `"migrate:dev": "dotenv -e .env.development -- prisma migrate dev"` in `package.json`.

## Notes

- The dev branch is cheap — Neon's free tier includes branching. When you're done with a migration cycle, you can delete the branch and re-create from main if you want a fresh clone.
- `prisma migrate dev` creates a migration file in `prisma/migrations/` AND applies it. Commit the migration file. Production applies via `prisma migrate deploy` in your CI/deploy step.
- Do NOT point `.env.local` at dev — `.env.local` is for runtime dev-server connections where you want to hit real data. `.env.development` is migration-only.

## Alternative: local Postgres

If you prefer self-hosted:

```bash
brew install postgresql@16 pgvector
brew services start postgresql@16
createdb paideia_dev
psql paideia_dev -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Then `DATABASE_URL="postgres://<your-mac-user>@localhost:5432/paideia_dev"` in `.env.development`. The Neon route is easier because schemas + extensions match prod exactly.

## First migration once this is done

```bash
npx dotenv -e .env.development -- npx prisma migrate dev --name add_material_structure_columns
```

That will apply the material-structure columns (`structureKind`, `structure`, `structureExtractedAt`, `structureModel`) to `File` + `ClassMaterialFile`, and generate the corresponding migration SQL under `prisma/migrations/`.
