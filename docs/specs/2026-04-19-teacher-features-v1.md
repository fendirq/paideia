# Teacher Features v1 — Design Spec

**Date:** 2026-04-19
**Status:** approved to design, not yet implemented (needs dev DB before schema migration can be validated against prod)
**References:** `docs/research/teacher-features.md` (gap analysis), browser QA Phase 5 (confirmed gaps match on live teacher flow)

---

## Scope rationale

The research doc identified three **MUST-have** gaps (submission inbox, grading/return, coursework analytics) that total 8–16 hrs of work. Those are v2 — a dedicated PR stack per gap. This v1 ships the highest-ROI **SHOULD-have** that can land as a single self-contained PR without touching the submission/grading data model: **class announcements**.

A teacher posting a class-wide update ("Paper due Thursday, use the rubric in Materials section 3") is load-bearing for a solo teacher running coursework. Canvas, Classroom, and Schoology all treat it as first-class. Paideia currently has `Class.pinnedNote` — one string — which is not a feed.

## v1 scope

### New model

```prisma
model ClassAnnouncement {
  id        String   @id @default(cuid())
  classId   String
  class     Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation("teacherAnnouncements", fields: [authorId], references: [id])
  title     String?           // optional — body can stand alone
  body      String            // length-capped at 2000 chars at API layer
  pinned    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([classId, createdAt])
}
```

User side adds: `teacherAnnouncements ClassAnnouncement[] @relation("teacherAnnouncements")`.
Class side adds: `announcements ClassAnnouncement[]`.

### Migration

`prisma/migrations/<ts>_add_class_announcements/migration.sql` with a single `CREATE TABLE "ClassAnnouncement"` + the two FK constraints + the (classId, createdAt) index. No data migration.

### API

- `POST /api/teacher/classes/[id]/announcements` — create. Auth: teacher owns the class. Body: `{ title?: string; body: string; pinned?: boolean }`. 201 with the created row.
- `GET /api/classes/[id]/announcements` — list. Auth: teacher owns OR student enrolled. Returns ordered by `pinned desc, createdAt desc`. Length cap 50.
- `PATCH /api/teacher/classes/[id]/announcements/[announcementId]` — update (body/title/pinned). Teacher-only, must own.
- `DELETE /api/teacher/classes/[id]/announcements/[announcementId]` — soft delete or hard delete (hard is fine for v1; small table).

### Teacher UI

On `/app/teacher/class/[id]` — add a "Announcements" section above Materials. Collapsed by default; open state shows:
- a "New announcement" form (title optional, body required, pin checkbox)
- a reverse-chronological list of existing announcements with pin/edit/delete controls

### Student UI

On `/app/enrolled/[classId]` — add an "Announcements" panel at top. Pinned rows render with an accent border. Newest non-pinned at the top below pinned.

### Validation

- `body` length: 1–2000 chars
- `title` length: 0–120 chars
- Rate limit: teacher can post ≤ 20 announcements per class per 24h (prevents accidental-loop-from-retry spam)

### Tests

- `POST` — teacher-of-class succeeds; teacher-not-of-class returns 403; student returns 403.
- `GET` — enrolled student sees list; non-enrolled student returns 403; ordering respects pin.
- `PATCH pinned: true` moves the row to top of list.
- `DELETE` from another teacher's class returns 403.

## Why not shipped in this session

- Local dev session's `DATABASE_URL` points at the production Neon DB.
- `prisma migrate dev` against that DB triggers a schema-drift reset prompt (expected — prod applies migrations via `migrate deploy`, not `migrate dev`), which would nuke production if continued.
- Safe path: spin up a dev DB (local postgres, Neon dev branch, or sqlite-compat shim), run `migrate dev` there, commit the generated migration, then run `migrate deploy` as part of the Vercel build.
- That setup is out of scope for this session's context budget.

## Implementation order when a dev DB exists

1. Set `DATABASE_URL` to dev DB; run `npx prisma migrate dev --name add_class_announcements`.
2. Commit the migration and schema changes in one commit.
3. Write the POST/GET routes; tests; local verify.
4. Teacher-side UI.
5. Student-side UI.
6. Vercel deploy runs `migrate deploy` on the prod DB during build; no manual DB touch.
7. Smoke test: post an announcement from the QA teacher account, see it render on the enrolled-student page.

## Next candidates after v1

Per the research priority list, in order of ROI:

- **Per-student teacher notes** (SHOULD) — 1 new field on `ClassEnrollment` (`teacherNote: String?`), 1 teacher-only PATCH route, 1 UI line in the student table. Sub-1-hr.
- **Roster actions — remove student** (SHOULD) — 1 DELETE route, 1 UI button with confirmation. ~45 min.
- **Split assignments from resources** (SHOULD) — add `type: "assignment" | "resource"` to `ClassMaterial`; update the "Add Material" form; filter the teacher/student views. ~1–2 hr.
- **Submission inbox v0** (MUST #1) — new `AssignmentSubmission` model + student submit form + teacher review queue. 4–6 hr. Separate PR.
- **Grading + return** (MUST #2) — depends on submissions landing first. 2–3 hr.
