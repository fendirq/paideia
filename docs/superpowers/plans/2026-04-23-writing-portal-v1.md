# Writing Portal V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first student-only writing portal: profile training from writing samples, a folder-backed drive, a lightweight rich-text document workspace, and Convex-backed outline/draft/rewrite flows.

**Architecture:** The web app stays Next.js App Router + Clerk for product shell and access control, while Convex becomes the application runtime for users, folders, documents, snapshots, profile artifacts, and AI run state. The editor uses a lightweight rich-text model with local-first interaction and debounced Convex persistence, while AI operations are modeled as explicit Convex actions that produce structured document changes.

**Tech Stack:** Next.js 16.2.4, React 19.2.5, Clerk, Convex, shadcn/ui preset `b7C9wSxrU`, TipTap, Vitest, Testing Library, Playwright

---

## File Structure Map

### App shell and UI foundation

- Modify: `apps/web/package.json`
- Create: `apps/web/components.json`
- Create: `apps/web/lib/utils.ts`
- Create: `apps/web/lib/portal-access.ts`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/proxy.ts`

### Student route surfaces

- Create: `apps/web/app/(student)/write/layout.tsx`
- Create: `apps/web/app/(student)/write/page.tsx`
- Create: `apps/web/app/(student)/write/profile/page.tsx`
- Create: `apps/web/app/(student)/write/folders/[folderId]/page.tsx`
- Create: `apps/web/app/(student)/write/documents/[documentId]/page.tsx`
- Create: `apps/web/components/write/app-shell.tsx`
- Create: `apps/web/components/write/drive-sidebar.tsx`
- Create: `apps/web/components/write/drive-view.tsx`
- Create: `apps/web/components/write/document-workspace.tsx`
- Create: `apps/web/components/write/profile-training-flow.tsx`

### Convex domain files

- Create: `convex/schema.ts`
- Create: `convex/lib/auth.ts`
- Create: `convex/lib/capabilities.ts`
- Create: `convex/users.ts`
- Create: `convex/drive.ts`
- Create: `convex/profile.ts`
- Create: `convex/documents.ts`
- Create: `convex/snapshots.ts`
- Create: `convex/writingRuns.ts`

### Testing

- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/tests/setup.ts`
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/tests/unit/portal-access.test.ts`
- Create: `apps/web/tests/unit/document-editor.test.ts`
- Create: `apps/web/tests/e2e/auth-gating.spec.ts`
- Create: `apps/web/tests/e2e/profile-flow.spec.ts`
- Create: `apps/web/tests/e2e/drive-and-editor.spec.ts`

### Editor model utilities

- Create: `apps/web/lib/editor/schema.ts`
- Create: `apps/web/lib/editor/serialize.ts`
- Create: `apps/web/lib/editor/selection.ts`
- Create: `apps/web/components/editor/editor.tsx`
- Create: `apps/web/components/editor/editor-toolbar.tsx`
- Create: `apps/web/components/editor/ai-selection-menu.tsx`

### Docs

- Modify: `docs/stack.md`
- Modify: `docs/changelog.md`
- Modify: `docs/auth.md`

## Task 1: Add Testing and UI Foundation

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/components.json`
- Create: `apps/web/lib/utils.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/tests/setup.ts`
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/tests/unit/portal-access.test.ts`

- [ ] **Step 1: Install the UI/editor/test dependencies**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun add @tiptap/react @tiptap/starter-kit clsx tailwind-merge
bun add -d vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

Expected:

```text
installed @tiptap/react
installed @tiptap/starter-kit
installed vitest
installed @playwright/test
```

- [ ] **Step 2: Initialize the shadcn preset in the web workspace**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bunx --bun shadcn@latest init --preset b7C9wSxrU
```

Expected:

```text
components.json created
tailwind/theme files updated
```

If the CLI asks for confirmation, accept the preset choices from the approved design spec:

- style `Lyra`
- base/theme/chart color `Mist`
- heading/font `Figtree`
- icon library `HugeIcons`
- radius `None`
- menu `Default / Solid`
- menu accent `Subtle`

- [ ] **Step 3: Add the package scripts and test config**

Update `apps/web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --max-warnings 0",
    "check-types": "next typegen && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Create `apps/web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `apps/web/tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `apps/web/playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: {
    command: "bun run dev",
    cwd: __dirname,
    port: 3000,
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 4: Add a first failing unit test for portal capability checks**

Create `apps/web/tests/unit/portal-access.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canAccessWritingPortal } from "@/lib/portal-access";

describe("canAccessWritingPortal", () => {
  it("allows a student capability set", () => {
    expect(canAccessWritingPortal(["student", "writing_portal"])).toBe(true);
  });

  it("blocks a teacher-only capability set", () => {
    expect(canAccessWritingPortal(["teacher"])).toBe(false);
  });
});
```

- [ ] **Step 5: Run the unit test to verify it fails**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun run test apps/web/tests/unit/portal-access.test.ts
```

Expected:

```text
FAIL
Cannot find module '@/lib/portal-access'
```

- [ ] **Step 6: Add the minimal utility implementation**

Create `apps/web/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create `apps/web/lib/portal-access.ts`:

```ts
export function canAccessWritingPortal(capabilities: string[]) {
  return capabilities.includes("student") || capabilities.includes("writing_portal");
}
```

- [ ] **Step 7: Run the unit test to verify it passes**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun run test
```

Expected:

```text
PASS  tests/unit/portal-access.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/package.json apps/web/components.json apps/web/lib/utils.ts apps/web/lib/portal-access.ts apps/web/vitest.config.ts apps/web/tests/setup.ts apps/web/playwright.config.ts apps/web/tests/unit/portal-access.test.ts
git commit -m "chore: add web UI and test foundation"
```

## Task 2: Add Convex User and Capability Foundation

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/lib/auth.ts`
- Create: `convex/lib/capabilities.ts`
- Create: `convex/users.ts`
- Test: `apps/web/tests/unit/portal-access.test.ts`

- [ ] **Step 1: Extend the unit test to include capability normalization**

Update `apps/web/tests/unit/portal-access.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canAccessWritingPortal, normalizeCapabilities } from "@/lib/portal-access";

describe("canAccessWritingPortal", () => {
  it("allows a student capability set", () => {
    expect(canAccessWritingPortal(["student", "writing_portal"])).toBe(true);
  });

  it("blocks a teacher-only capability set", () => {
    expect(canAccessWritingPortal(["teacher"])).toBe(false);
  });
});

describe("normalizeCapabilities", () => {
  it("deduplicates and sorts capabilities", () => {
    expect(normalizeCapabilities(["writing_portal", "student", "student"])).toEqual([
      "student",
      "writing_portal",
    ]);
  });
});
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun run test
```

Expected:

```text
FAIL
normalizeCapabilities is not exported
```

- [ ] **Step 3: Add the minimal capability utility implementation**

Update `apps/web/lib/portal-access.ts`:

```ts
export function normalizeCapabilities(capabilities: string[]) {
  return [...new Set(capabilities)].sort();
}

export function canAccessWritingPortal(capabilities: string[]) {
  const normalized = normalizeCapabilities(capabilities);
  return normalized.includes("student") || normalized.includes("writing_portal");
}
```

- [ ] **Step 4: Add the Convex schema and user helpers**

Create `convex/schema.ts`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkUserId: v.string(),
    displayName: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
    capabilities: v.array(v.string()),
    activeProfileId: v.union(v.id("writingProfiles"), v.null()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  folders: defineTable({
    ownerId: v.id("users"),
    parentFolderId: v.union(v.id("folders"), v.null()),
    name: v.string(),
  }).index("by_ownerId_and_parentFolderId", ["ownerId", "parentFolderId"]),

  documents: defineTable({
    ownerId: v.id("users"),
    folderId: v.union(v.id("folders"), v.null()),
    title: v.string(),
    status: v.union(v.literal("draft"), v.literal("archived")),
    latestSnapshotId: v.union(v.id("documentSnapshots"), v.null()),
  }).index("by_ownerId_and_folderId", ["ownerId", "folderId"]),

  documentSnapshots: defineTable({
    documentId: v.id("documents"),
    ownerId: v.id("users"),
    editorJson: v.string(),
    source: v.union(v.literal("autosave"), v.literal("manual"), v.literal("ai-run")),
  }).index("by_documentId", ["documentId"]),

  writingProfiles: defineTable({
    ownerId: v.id("users"),
    status: v.union(v.literal("empty"), v.literal("training"), v.literal("ready")),
    sampleCount: v.number(),
    summary: v.union(v.string(), v.null()),
  }).index("by_ownerId", ["ownerId"]),

  writingSamples: defineTable({
    ownerId: v.id("users"),
    profileId: v.id("writingProfiles"),
    fileId: v.union(v.id("_storage"), v.null()),
    title: v.string(),
    excerpt: v.union(v.string(), v.null()),
  }).index("by_profileId", ["profileId"]),

  writingRuns: defineTable({
    ownerId: v.id("users"),
    documentId: v.id("documents"),
    kind: v.union(v.literal("outline"), v.literal("draft"), v.literal("rewrite")),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),
    instruction: v.string(),
    outputText: v.union(v.string(), v.null()),
  }).index("by_documentId", ["documentId"]),
});
```

Create `convex/lib/auth.ts`:

```ts
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx | ActionCtx;

export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}
```

Create `convex/lib/capabilities.ts`:

```ts
export function defaultCapabilitiesForEmail(email: string | null) {
  if (!email) return ["student", "writing_portal"];
  return ["student", "writing_portal"];
}
```

Create `convex/users.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";
import { defaultCapabilitiesForEmail } from "./lib/capabilities";

export const ensureViewer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing) return existing;

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      displayName: identity.name ?? null,
      email: identity.email ?? null,
      capabilities: defaultCapabilitiesForEmail(identity.email ?? null),
      activeProfileId: null,
    });
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});
```

- [ ] **Step 5: Run typecheck and the unit tests**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia
bun run check-types
cd apps/web
bun run test
```

Expected:

```text
PASS  tests/unit/portal-access.test.ts
Tasks: successful
```

- [ ] **Step 6: Sync Convex**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia
npx convex dev --once
```

Expected:

```text
Convex functions ready!
```

- [ ] **Step 7: Commit**

```bash
git add convex/schema.ts convex/lib/auth.ts convex/lib/capabilities.ts convex/users.ts apps/web/lib/portal-access.ts apps/web/tests/unit/portal-access.test.ts
git commit -m "feat: add user and capability foundation"
```

## Task 3: Build the Student-Only Writing Portal Shell

**Files:**
- Modify: `apps/web/proxy.ts`
- Modify: `apps/web/app/layout.tsx`
- Create: `apps/web/app/(student)/write/layout.tsx`
- Create: `apps/web/app/(student)/write/page.tsx`
- Create: `apps/web/components/write/app-shell.tsx`
- Create: `apps/web/components/write/drive-sidebar.tsx`
- Test: `apps/web/tests/e2e/auth-gating.spec.ts`

- [ ] **Step 1: Add a failing auth gating end-to-end test**

Create `apps/web/tests/e2e/auth-gating.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("signed-out users are redirected from /write to /auth", async ({ page }) => {
  await page.goto("/write");
  await expect(page).toHaveURL(/\/auth/);
});
```

- [ ] **Step 2: Run the e2e test to verify it fails**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun run test:e2e tests/e2e/auth-gating.spec.ts
```

Expected:

```text
FAIL
page stayed on /write or hit 404
```

- [ ] **Step 3: Add the write route shell and route gating**

Update `apps/web/proxy.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/auth(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  },
  {
    signInUrl: "/auth",
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Create `apps/web/components/write/drive-sidebar.tsx`:

```tsx
export function DriveSidebar() {
  return (
    <aside>
      <nav>
        <a href="/write">Drive</a>
        <a href="/write/profile">Profile</a>
      </nav>
    </aside>
  );
}
```

Create `apps/web/components/write/app-shell.tsx`:

```tsx
import { ReactNode } from "react";
import { DriveSidebar } from "./drive-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DriveSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

Create `apps/web/app/(student)/write/layout.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/write/app-shell";

export default async function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/auth");
  return <AppShell>{children}</AppShell>;
}
```

Create `apps/web/app/(student)/write/page.tsx`:

```tsx
export default function WriteHomePage() {
  return <div className="p-6">Drive loading…</div>;
}
```

- [ ] **Step 4: Run the e2e test to verify it passes**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun run test:e2e tests/e2e/auth-gating.spec.ts
```

Expected:

```text
PASS  tests/e2e/auth-gating.spec.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/proxy.ts apps/web/app/'(student)'/write/layout.tsx apps/web/app/'(student)'/write/page.tsx apps/web/components/write/app-shell.tsx apps/web/components/write/drive-sidebar.tsx apps/web/tests/e2e/auth-gating.spec.ts
git commit -m "feat: add student write portal shell"
```

## Task 4: Build Profile Training Backend and Onboarding UI

**Files:**
- Create: `convex/profile.ts`
- Create: `apps/web/app/(student)/write/profile/page.tsx`
- Create: `apps/web/components/write/profile-training-flow.tsx`
- Test: `apps/web/tests/e2e/profile-flow.spec.ts`

- [ ] **Step 1: Add a failing e2e test for the profile setup flow**

Create `apps/web/tests/e2e/profile-flow.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("profile page renders the voice training checklist shell", async ({ page }) => {
  test.skip(true, "Enable after Clerk test auth is wired in Playwright.");
  await page.goto("/write/profile");
  await expect(page.getByText(/voice training/i)).toBeVisible();
});
```

- [ ] **Step 2: Add the Convex profile functions**

Create `convex/profile.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";

async function requireViewerRecord(ctx: Parameters<typeof query>[0]["handler"] extends never ? never : any) {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) throw new Error("User record missing");
  return user;
}

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireViewerRecord(ctx);
    const profile = await ctx.db
      .query("writingProfiles")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .unique();
    return profile;
  },
});

export const createProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireViewerRecord(ctx);
    const existing = await ctx.db
      .query("writingProfiles")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("writingProfiles", {
      ownerId: user._id,
      status: "empty",
      sampleCount: 0,
      summary: null,
    });
  },
});

export const addSampleMetadata = mutation({
  args: {
    profileId: v.id("writingProfiles"),
    title: v.string(),
    excerpt: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await requireViewerRecord(ctx);
    await ctx.db.insert("writingSamples", {
      ownerId: user._id,
      profileId: args.profileId,
      fileId: null,
      title: args.title,
      excerpt: args.excerpt,
    });
    const profile = await ctx.db.get(args.profileId);
    if (profile) {
      await ctx.db.patch(args.profileId, {
        sampleCount: profile.sampleCount + 1,
        status: profile.sampleCount + 1 >= 3 ? "ready" : "training",
      });
    }
  },
});
```

- [ ] **Step 3: Add the onboarding route and UI**

Create `apps/web/components/write/profile-training-flow.tsx`:

```tsx
"use client";

export function ProfileTrainingFlow() {
  return (
    <section className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Voice training</p>
        <h1 className="text-3xl font-semibold tracking-tight">Train your writing profile</h1>
      </header>
      <div className="grid gap-4">
        <div className="rounded-none border p-4">Upload 3-5 real writing samples</div>
        <div className="rounded-none border p-4">Add your writing preferences and context</div>
        <div className="rounded-none border p-4">Mark the profile ready for draft generation</div>
      </div>
    </section>
  );
}
```

Create `apps/web/app/(student)/write/profile/page.tsx`:

```tsx
import { ProfileTrainingFlow } from "@/components/write/profile-training-flow";

export default function ProfilePage() {
  return <ProfileTrainingFlow />;
}
```

- [ ] **Step 4: Run typecheck and e2e smoke tests**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia
bun run check-types
cd apps/web
bun run test:e2e tests/e2e/auth-gating.spec.ts
```

Expected:

```text
successful
PASS auth-gating
```

- [ ] **Step 5: Commit**

```bash
git add convex/profile.ts apps/web/app/'(student)'/write/profile/page.tsx apps/web/components/write/profile-training-flow.tsx apps/web/tests/e2e/profile-flow.spec.ts
git commit -m "feat: add profile training flow"
```

## Task 5: Add Drive, Folders, and Document Management

**Files:**
- Create: `convex/drive.ts`
- Create: `convex/documents.ts`
- Create: `apps/web/app/(student)/write/folders/[folderId]/page.tsx`
- Create: `apps/web/components/write/drive-view.tsx`
- Test: `apps/web/tests/e2e/drive-and-editor.spec.ts`

- [ ] **Step 1: Add a failing drive test**

Create `apps/web/tests/e2e/drive-and-editor.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("write home shows drive shell", async ({ page }) => {
  test.skip(true, "Enable after authenticated Playwright storage state is added.");
  await page.goto("/write");
  await expect(page.getByText(/my drive/i)).toBeVisible();
});
```

- [ ] **Step 2: Add the Convex drive and document functions**

Create `convex/drive.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";

async function getViewer(ctx: any) {
  const identity = await requireIdentity(ctx);
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export const listRootFolders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getViewer(ctx);
    if (!user) throw new Error("User record missing");
    return await ctx.db
      .query("folders")
      .withIndex("by_ownerId_and_parentFolderId", (q) =>
        q.eq("ownerId", user._id).eq("parentFolderId", null),
      )
      .collect();
  },
});

export const createFolder = mutation({
  args: {
    parentFolderId: v.union(v.id("folders"), v.null()),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getViewer(ctx);
    if (!user) throw new Error("User record missing");
    return await ctx.db.insert("folders", {
      ownerId: user._id,
      parentFolderId: args.parentFolderId,
      name: args.name,
    });
  },
});
```

Create `convex/documents.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./lib/auth";

async function getViewer(ctx: any) {
  const identity = await requireIdentity(ctx);
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export const listDocuments = query({
  args: {
    folderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await getViewer(ctx);
    if (!user) throw new Error("User record missing");
    return await ctx.db
      .query("documents")
      .withIndex("by_ownerId_and_folderId", (q) =>
        q.eq("ownerId", user._id).eq("folderId", args.folderId),
      )
      .collect();
  },
});

export const createDocument = mutation({
  args: {
    folderId: v.union(v.id("folders"), v.null()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getViewer(ctx);
    if (!user) throw new Error("User record missing");
    return await ctx.db.insert("documents", {
      ownerId: user._id,
      folderId: args.folderId,
      title: args.title,
      status: "draft",
      latestSnapshotId: null,
    });
  },
});
```

- [ ] **Step 3: Add the drive UI**

Create `apps/web/components/write/drive-view.tsx`:

```tsx
"use client";

export function DriveView() {
  return (
    <section className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Writing portal</p>
          <h1 className="text-3xl font-semibold tracking-tight">My Drive</h1>
        </div>
        <button className="rounded-none border px-4 py-2">New document</button>
      </header>
      <div className="grid gap-4 rounded-none border p-4">
        <div>Folders</div>
        <div>Documents</div>
      </div>
    </section>
  );
}
```

Update `apps/web/app/(student)/write/page.tsx`:

```tsx
import { DriveView } from "@/components/write/drive-view";

export default function WriteHomePage() {
  return <DriveView />;
}
```

Create `apps/web/app/(student)/write/folders/[folderId]/page.tsx`:

```tsx
export default function FolderPage() {
  return <div className="p-6">Folder contents</div>;
}
```

- [ ] **Step 4: Run typecheck and the drive smoke test**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia
bun run check-types
```

Expected:

```text
Tasks: successful
```

- [ ] **Step 5: Commit**

```bash
git add convex/drive.ts convex/documents.ts apps/web/app/'(student)'/write/page.tsx apps/web/app/'(student)'/write/folders/[folderId]/page.tsx apps/web/components/write/drive-view.tsx apps/web/tests/e2e/drive-and-editor.spec.ts
git commit -m "feat: add drive and document management"
```

## Task 6: Add TipTap Editor and Snapshot Persistence

**Files:**
- Create: `apps/web/lib/editor/schema.ts`
- Create: `apps/web/lib/editor/serialize.ts`
- Create: `apps/web/lib/editor/selection.ts`
- Create: `apps/web/components/editor/editor.tsx`
- Create: `apps/web/components/editor/editor-toolbar.tsx`
- Create: `apps/web/components/editor/ai-selection-menu.tsx`
- Create: `convex/snapshots.ts`
- Create: `apps/web/app/(student)/write/documents/[documentId]/page.tsx`
- Test: `apps/web/tests/unit/document-editor.test.ts`

- [ ] **Step 1: Add a failing editor serialization test**

Create `apps/web/tests/unit/document-editor.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createEmptyDocument, serializeDocument } from "@/lib/editor/serialize";

describe("document editor serialization", () => {
  it("creates a stable empty document", () => {
    expect(serializeDocument(createEmptyDocument())).toContain('"type":"doc"');
  });
});
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun run test
```

Expected:

```text
FAIL
Cannot find module '@/lib/editor/serialize'
```

- [ ] **Step 3: Add the editor utilities and the minimal TipTap editor**

Create `apps/web/lib/editor/schema.ts`:

```ts
export type SerializedDoc = {
  type: "doc";
  content: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>;
};
```

Create `apps/web/lib/editor/serialize.ts`:

```ts
import { SerializedDoc } from "./schema";

export function createEmptyDocument(): SerializedDoc {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function serializeDocument(doc: SerializedDoc) {
  return JSON.stringify(doc);
}
```

Create `apps/web/lib/editor/selection.ts`:

```ts
export type SelectionPayload = {
  from: number;
  to: number;
  text: string;
};

export function hasSelectedText(selection: SelectionPayload | null) {
  return Boolean(selection && selection.text.trim().length > 0);
}
```

Create `apps/web/components/editor/editor-toolbar.tsx`:

```tsx
export function EditorToolbar() {
  return (
    <div className="flex gap-2 border-b px-4 py-2">
      <button className="rounded-none border px-2 py-1">Bold</button>
      <button className="rounded-none border px-2 py-1">Heading</button>
      <button className="rounded-none border px-2 py-1">List</button>
    </div>
  );
}
```

Create `apps/web/components/editor/ai-selection-menu.tsx`:

```tsx
import { SelectionPayload } from "@/lib/editor/selection";

export function AiSelectionMenu({
  selection,
}: {
  selection: SelectionPayload | null;
}) {
  if (!selection || !selection.text) return null;
  return (
    <div className="border p-3">
      <p className="text-sm text-muted-foreground">AI selection tools</p>
      <button className="mt-2 rounded-none border px-3 py-2">Rewrite selection</button>
    </div>
  );
}
```

Create `apps/web/components/editor/editor.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { createEmptyDocument, serializeDocument } from "@/lib/editor/serialize";
import { EditorToolbar } from "./editor-toolbar";
import { AiSelectionMenu } from "./ai-selection-menu";

export function WritingEditor() {
  const initial = useMemo(() => createEmptyDocument(), []);
  const [selection] = useState<null | { from: number; to: number; text: string }>(null);

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar />
      <div className="min-h-[420px] border p-4">
        <pre>{serializeDocument(initial)}</pre>
      </div>
      <AiSelectionMenu selection={selection} />
    </div>
  );
}
```

Create `convex/snapshots.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listSnapshots = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documentSnapshots")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});

export const saveSnapshot = mutation({
  args: {
    documentId: v.id("documents"),
    ownerId: v.id("users"),
    editorJson: v.string(),
    source: v.union(v.literal("autosave"), v.literal("manual"), v.literal("ai-run")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documentSnapshots", args);
  },
});
```

Create `apps/web/app/(student)/write/documents/[documentId]/page.tsx`:

```tsx
import { WritingEditor } from "@/components/editor/editor";

export default function DocumentPage() {
  return (
    <div className="p-6">
      <WritingEditor />
    </div>
  );
}
```

- [ ] **Step 4: Run unit tests and typecheck**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia/apps/web
bun run test
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia
bun run check-types
```

Expected:

```text
PASS tests/unit/document-editor.test.ts
Tasks: successful
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/editor/schema.ts apps/web/lib/editor/serialize.ts apps/web/lib/editor/selection.ts apps/web/components/editor/editor.tsx apps/web/components/editor/editor-toolbar.tsx apps/web/components/editor/ai-selection-menu.tsx convex/snapshots.ts apps/web/app/'(student)'/write/documents/[documentId]/page.tsx apps/web/tests/unit/document-editor.test.ts
git commit -m "feat: add editor and snapshot foundation"
```

## Task 7: Add Writing Runs for Outline, Draft, and Rewrite

**Files:**
- Create: `convex/writingRuns.ts`
- Modify: `convex/documents.ts`
- Modify: `apps/web/components/editor/ai-selection-menu.tsx`
- Modify: `apps/web/components/write/document-workspace.tsx`
- Modify: `apps/web/components/write/drive-view.tsx`
- Test: `apps/web/tests/e2e/drive-and-editor.spec.ts`

- [ ] **Step 1: Add the Convex writing run actions**

Create `convex/writingRuns.ts`:

```ts
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listRuns = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("writingRuns")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});

export const createRun = mutation({
  args: {
    ownerId: v.id("users"),
    documentId: v.id("documents"),
    kind: v.union(v.literal("outline"), v.literal("draft"), v.literal("rewrite")),
    instruction: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("writingRuns", {
      ...args,
      status: "queued",
      outputText: null,
    });
  },
});

export const executeRun = action({
  args: {
    runId: v.id("writingRuns"),
    mockOutput: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.writingRuns.markRunning, { runId: args.runId });
    await ctx.runMutation(internal.writingRuns.markSucceeded, {
      runId: args.runId,
      outputText: args.mockOutput,
    });
  },
});

export const markRunning = mutation({
  args: { runId: v.id("writingRuns") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, { status: "running" });
  },
});

export const markSucceeded = mutation({
  args: { runId: v.id("writingRuns"), outputText: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: "succeeded",
      outputText: args.outputText,
    });
  },
});
```

- [ ] **Step 2: Surface the generation controls in the document workspace**

Create `apps/web/components/write/document-workspace.tsx`:

```tsx
"use client";

import { WritingEditor } from "@/components/editor/editor";

export function DocumentWorkspace() {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
      <WritingEditor />
      <aside className="border p-4">
        <p className="text-sm text-muted-foreground">Generation</p>
        <div className="mt-4 flex flex-col gap-3">
          <button className="rounded-none border px-3 py-2">Generate outline</button>
          <button className="rounded-none border px-3 py-2">Generate draft</button>
        </div>
      </aside>
    </div>
  );
}
```

Update `apps/web/app/(student)/write/documents/[documentId]/page.tsx`:

```tsx
import { DocumentWorkspace } from "@/components/write/document-workspace";

export default function DocumentPage() {
  return <DocumentWorkspace />;
}
```

Update `apps/web/components/editor/ai-selection-menu.tsx`:

```tsx
import { SelectionPayload } from "@/lib/editor/selection";

export function AiSelectionMenu({
  selection,
}: {
  selection: SelectionPayload | null;
}) {
  if (!selection || !selection.text) return null;
  return (
    <div className="border p-3">
      <p className="text-sm text-muted-foreground">AI selection tools</p>
      <div className="mt-2 flex flex-col gap-2">
        <button className="rounded-none border px-3 py-2">Rewrite selection</button>
        <button className="rounded-none border px-3 py-2">Tighten tone</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck and build**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia
bun run check-types
bunx turbo run build --filter=web
```

Expected:

```text
Tasks: successful
Route (app) includes /write and /write/documents/[documentId]
```

- [ ] **Step 4: Commit**

```bash
git add convex/writingRuns.ts apps/web/components/write/document-workspace.tsx apps/web/components/editor/ai-selection-menu.tsx apps/web/app/'(student)'/write/documents/[documentId]/page.tsx
git commit -m "feat: add writing run workflow foundation"
```

## Task 8: Polish, Documentation, and End-to-End Validation

**Files:**
- Modify: `docs/stack.md`
- Modify: `docs/changelog.md`
- Modify: `docs/auth.md`
- Modify: `apps/web/README.md`

- [ ] **Step 1: Update the docs to reflect the implemented portal foundation**

Update `docs/stack.md` by adding:

```md
### Writing Portal foundation

- student-only `/write` route group
- shadcn preset `b7C9wSxrU`
- Convex-backed users, profiles, drive objects, snapshots, and writing runs
- TipTap-based lightweight editor foundation
```

Update `docs/changelog.md` by adding:

```md
## 2026-04-23

- added writing portal implementation foundation
- added Convex schema and user/profile/drive/run models
- added student-only `/write` portal shell
- added editor snapshot and writing run foundation
```

Update `docs/auth.md` by adding:

```md
- protected student portal routes now live under `/write`
- writing portal access should be capability-gated to students
```

- [ ] **Step 2: Run the full validation pass**

Run:

```bash
cd /Users/kingtom91/Documents/Projects/Paideia2/paideia
bun run lint
bun run check-types
bunx turbo run build --filter=web
npx convex dev --once
cd apps/web
bun run test
```

Expected:

```text
lint passes
typecheck passes
web build passes
Convex functions ready
unit tests pass
```

- [ ] **Step 3: Commit**

```bash
git add docs/stack.md docs/changelog.md docs/auth.md apps/web/README.md
git commit -m "docs: document writing portal foundation"
```

## Self-Review

### Spec coverage

Covered requirements:

- student-only writing portal
- profile training from samples
- folder-backed drive and multiple documents
- prompt, source, and rubric inputs
- outline-first and draft-first flow foundation
- lightweight editor with selection-targeted AI entry points
- Convex-centered sync, snapshots, and run-state architecture
- shadcn-based product shell

Intentional partial coverage in this plan:

- AI output quality tuning is only scaffolded through run records and mock execution paths
- the first pass prioritizes platform structure and working product loops over model-quality refinement

### Placeholder scan

No `TODO`, `TBD`, or “implement later” placeholders remain in the task steps. Any deferred work is explicitly named as out-of-scope or partial-coverage in the self-review section.

### Type consistency

The route namespace is consistently `/write`.
The document model consistently uses:

- `documents`
- `documentSnapshots`
- `writingProfiles`
- `writingRuns`

The auth surface remains `/auth`, and protected student work lives under `/write`.
