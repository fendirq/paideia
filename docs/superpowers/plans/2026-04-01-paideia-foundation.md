# Paideia Foundation & Authentication — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Paideia Next.js app with a working auth system — Google OAuth for Drew emails, guest passcode access, role selection, and protected routes.

**Architecture:** Next.js 15 App Router with TypeScript strict mode. NextAuth v5 handles auth (Google OAuth + Credentials provider for passcode). Prisma + Neon PostgreSQL for persistence. JWT session strategy so middleware can run on Edge without DB calls. Role check happens in the app layout server component, not middleware.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma, NextAuth v5, Neon PostgreSQL, Vitest, React Testing Library

---

## Plan Sequence

This is **Plan 1 of 5** for the Paideia project:

1. **Foundation & Authentication** (this plan) — scaffolding, design system, database, auth, login, protected routes
2. **Upload System & RAG Pipeline** — file upload, text extraction, chunking, embeddings
3. **Tutoring Chat Interface** — chat UI, Kimi K2.5 integration, streaming, action panel
4. **Resource Library** — browse hierarchy, search, filtering
5. **Dashboards & Landing Page** — student/teacher dashboards, landing page with parallax

Each plan produces working, deployable software.

---

## Prerequisites

Before starting, you need:

1. **Neon PostgreSQL database** — sign up at [neon.tech](https://neon.tech), create a project, copy the connection string
2. **Google OAuth credentials** — create at [Google Cloud Console](https://console.cloud.google.com/apis/credentials), set authorized redirect URI to `http://localhost:3000/api/auth/callback/google`
3. **Node.js 18+** (user has v25.1.0 — good)

---

## File Structure

```
paideia/                                    (project root)
├── .env.local                              # Local env vars (not committed)
├── .env.example                            # Template for env vars
├── next.config.ts                          # Next.js configuration
├── tailwind.config.ts                      # Design system tokens
├── vitest.config.ts                        # Test configuration
├── tsconfig.json                           # TypeScript strict mode
├── package.json
├── prisma/
│   └── schema.prisma                       # Full database schema
├── public/
│   └── hero-bg.mp4                         # Landing page video (existing)
├── src/
│   ├── auth.ts                             # NextAuth full config (providers, adapter, callbacks)
│   ├── auth.config.ts                      # Edge-safe auth config (for middleware)
│   ├── middleware.ts                        # Route protection
│   ├── types/
│   │   └── next-auth.d.ts                  # Session type augmentation
│   ├── lib/
│   │   ├── db.ts                           # Prisma client singleton
│   │   └── passcode.ts                     # Passcode validation
│   ├── app/
│   │   ├── globals.css                     # Base styles + Tailwind
│   │   ├── layout.tsx                      # Root layout (fonts, providers)
│   │   ├── page.tsx                        # Redirect to /login
│   │   ├── login/
│   │   │   └── page.tsx                    # Login page (OAuth + passcode)
│   │   ├── onboarding/
│   │   │   └── page.tsx                    # Role selection
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts            # NextAuth API handler
│   │   │   └── onboarding/
│   │   │       └── route.ts                # Set user role
│   │   └── app/
│   │       ├── layout.tsx                  # App shell (sidebar, role guard)
│   │       └── page.tsx                    # Home page (post-login)
│   ├── components/
│   │   ├── providers.tsx                   # SessionProvider wrapper
│   │   ├── login-form.tsx                  # Google sign-in + passcode UI
│   │   ├── role-selector.tsx               # Student/Teacher choice
│   │   └── app-shell.tsx                   # Sidebar + top bar
│   └── test/
│       └── setup.ts                        # Vitest setup
├── __tests__/
│   ├── lib/
│   │   └── passcode.test.ts               # Passcode validation tests
│   └── components/
│       ├── login-form.test.tsx             # Login form tests
│       └── role-selector.test.tsx          # Role selector tests
```

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.example`, `.env.local`
- Move: `hero-bg.mp4` → `public/hero-bg.mp4`

- [ ] **Step 1: Scaffold with create-next-app**

```bash
cd "/Users/kingtom91/Documents/Projects/Drew Senior Project"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --yes
```

If README.md conflict occurs, overwrite it. The scaffolder creates the base project structure.

- [ ] **Step 2: Move hero video to public/**

```bash
mv hero-bg.mp4 public/hero-bg.mp4
```

- [ ] **Step 3: Install all Plan 1 dependencies**

```bash
npm install next-auth@latest @auth/prisma-adapter @prisma/client prisma framer-motion
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Create .env.example**

Create `.env.example`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

- [ ] **Step 5: Create .env.local with actual values**

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — from Neon dashboard
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console

- [ ] **Step 6: Add .env.local to .gitignore**

Verify `.gitignore` includes `.env.local` and `.env*.local` (create-next-app should have added this).

- [ ] **Step 7: Commit scaffold**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with dependencies"
```

---

### Task 2: Configure Testing Infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create Vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: Create test setup file**

Create `src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify test infrastructure**

```bash
npx vitest run 2>&1 || echo "No tests yet — expected"
```

Expected: "No test files found" or similar — confirms Vitest is configured correctly.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json
git commit -m "feat: configure Vitest testing infrastructure"
```

---

### Task 3: Configure Design System

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Configure Tailwind with Paideia tokens**

Replace `tailwind.config.ts` with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base": "#1a1915",
        "bg-surface": "#2d2b28",
        "bg-elevated": "#3d3a37",
        accent: "#4a9d5b",
        "accent-light": "#6bc47d",
        "text-primary": "#e8e0d8",
        "text-secondary": "#a39e98",
        "text-muted": "#706b65",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Set up fonts in root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paideia — AI Tutoring for Drew School",
  description:
    "Socratic AI tutoring powered by your coursework. Upload, learn, grow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable}`}
    >
      <body className="bg-bg-base font-body text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Set up globals.css**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-display;
  }

  body {
    @apply bg-bg-base text-text-primary;
  }

  ::selection {
    @apply bg-accent/30 text-text-primary;
  }
}

@layer components {
  .btn-primary {
    @apply bg-accent hover:bg-accent-light text-bg-base font-medium px-6 py-3 rounded-lg transition-colors;
  }

  .btn-secondary {
    @apply bg-bg-elevated hover:bg-bg-surface text-text-primary border border-bg-elevated px-6 py-3 rounded-lg transition-colors;
  }

  .card {
    @apply bg-bg-surface rounded-xl border border-bg-elevated;
  }
}
```

- [ ] **Step 4: Verify design system renders**

Replace `src/app/page.tsx` with a temporary test page:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold">Paideia</h1>
        <p className="text-text-secondary">
          Design system verification — fonts, colors, and components.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-primary">Primary</button>
          <button className="btn-secondary">Secondary</button>
        </div>
        <div className="card p-6">
          <p className="text-text-muted text-sm">Card component</p>
        </div>
      </div>
    </main>
  );
}
```

Run `npm run dev` and verify at `http://localhost:3000`:
- Dark background (#1a1915)
- Space Grotesk heading, DM Sans body text
- Green primary button, elevated secondary button
- Card with surface background

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: configure Paideia design system — colors, fonts, components"
```

---

### Task 4: Set Up Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write the full Prisma schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

// ─── Enums ───

enum Role {
  STUDENT
  TEACHER
}

enum Subject {
  MATHEMATICS
  ENGLISH
  HISTORY
  SCIENCE
  MANDARIN
  HUMANITIES
  OTHER
}

enum SessionStatus {
  ACTIVE
  COMPLETED
}

// ─── NextAuth Models ───

model User {
  id               String            @id @default(cuid())
  name             String?
  email            String            @unique
  emailVerified    DateTime?
  image            String?
  role             Role?
  accounts         Account[]
  inquiries        Inquiry[]
  tutoringSessions TutoringSession[]
  createdAt        DateTime          @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// ─── App Models ───

model Inquiry {
  id          String            @id @default(cuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id])
  subject     Subject
  teacherName String
  unitName    String
  description String
  files       File[]
  chunks      TextChunk[]
  sessions    TutoringSession[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model File {
  id            String      @id @default(cuid())
  inquiryId     String
  inquiry       Inquiry     @relation(fields: [inquiryId], references: [id])
  fileName      String
  fileUrl       String
  fileType      String
  extractedText String?
  chunks        TextChunk[]
  createdAt     DateTime    @default(now())
}

model TextChunk {
  id         String                      @id @default(cuid())
  fileId     String
  file       File                        @relation(fields: [fileId], references: [id])
  inquiryId  String
  inquiry    Inquiry                     @relation(fields: [inquiryId], references: [id])
  content    String
  embedding  Unsupported("vector(1536)")
  chunkIndex Int
  createdAt  DateTime                    @default(now())
}

model TutoringSession {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  inquiryId     String
  inquiry       Inquiry       @relation(fields: [inquiryId], references: [id])
  messages      Message[]
  rating        Int?
  ratingComment String?
  status        SessionStatus @default(ACTIVE)
  startedAt     DateTime      @default(now())
  endedAt       DateTime?
}

model Message {
  id               String          @id @default(cuid())
  sessionId        String
  session          TutoringSession @relation(fields: [sessionId], references: [id])
  role             String
  content          String
  suggestedActions String[]
  createdAt        DateTime        @default(now())
}

model Report {
  id         String   @id @default(cuid())
  reporterId String
  targetType String
  targetId   String
  reason     String
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

- [ ] **Step 4: Run initial migration**

Ensure `DATABASE_URL` is set in `.env.local`, then:

```bash
npx prisma migrate dev --name init
```

Expected: Migration creates all tables. The `vector` extension enables pgvector. `TextChunk.embedding` uses `Unsupported` so Prisma won't manage it directly — a raw SQL migration adds the column.

- [ ] **Step 5: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ src/lib/db.ts
git commit -m "feat: set up Prisma schema with full data model and pgvector"
```

---

### Task 5: Passcode Validation (TDD)

**Files:**
- Create: `src/lib/passcode.ts`
- Create: `__tests__/lib/passcode.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/passcode.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { validatePasscode } from "@/lib/passcode";

describe("validatePasscode", () => {
  it("accepts the correct passcode", () => {
    expect(validatePasscode("082600")).toBe(true);
  });

  it("rejects an incorrect passcode", () => {
    expect(validatePasscode("000000")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validatePasscode("")).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(validatePasscode(null as unknown as string)).toBe(false);
    expect(validatePasscode(undefined as unknown as string)).toBe(false);
  });

  it("rejects passcode with extra whitespace", () => {
    expect(validatePasscode(" 082600 ")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/lib/passcode.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/passcode'`

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/passcode.ts`:

```typescript
const GUEST_PASSCODE = "082600";

export function validatePasscode(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return input === GUEST_PASSCODE;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/lib/passcode.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/passcode.ts __tests__/lib/passcode.test.ts
git commit -m "feat: add passcode validation with tests"
```

---

### Task 6: Configure NextAuth

**Files:**
- Create: `src/auth.config.ts`
- Create: `src/auth.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/components/providers.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create NextAuth type augmentation**

Create `src/types/next-auth.d.ts`:

```typescript
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string | null;
  }
}
```

- [ ] **Step 2: Create edge-safe auth config**

Create `src/auth.config.ts`:

```typescript
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAppRoute = nextUrl.pathname.startsWith("/app");
      const isOnboarding = nextUrl.pathname.startsWith("/onboarding");

      // Protect app routes and onboarding
      if (isAppRoute || isOnboarding) {
        return isLoggedIn;
      }

      // Redirect logged-in users away from login page
      if (nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/app", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Populated in auth.ts (not edge-safe)
} satisfies NextAuthConfig;
```

- [ ] **Step 3: Create full auth config**

Create `src/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { validatePasscode } from "@/lib/passcode";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      id: "passcode",
      name: "Passcode",
      credentials: {
        passcode: { label: "Passcode", type: "password" },
      },
      async authorize(credentials) {
        const passcode = credentials?.passcode;
        if (typeof passcode === "string" && validatePasscode(passcode)) {
          return {
            id: "guest",
            name: "Guest",
            email: "guest@paideia.local",
            role: "GUEST",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email ?? "";
        if (!email.endsWith("@drewschool.org")) {
          return "/login?error=drew-only";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? null;
      }
      // For Google users, refresh role from DB (might have been set during onboarding)
      if (token.userId && token.userId !== "guest" && !token.role) {
        const dbUser = await db.user.findUnique({
          where: { id: token.userId },
          select: { role: true },
        });
        if (dbUser?.role) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.role = token.role ?? null;
      }
      return session;
    },
  },
});
```

- [ ] **Step 4: Create API route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5: Create SessionProvider wrapper**

Create `src/components/providers.tsx`:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 6: Add Providers to root layout**

Update `src/app/layout.tsx` — wrap `{children}` with `<Providers>`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paideia — AI Tutoring for Drew School",
  description:
    "Socratic AI tutoring powered by your coursework. Upload, learn, grow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable}`}
    >
      <body className="bg-bg-base font-body text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/auth.ts src/auth.config.ts src/types/next-auth.d.ts src/app/api/auth/ src/components/providers.tsx src/app/layout.tsx
git commit -m "feat: configure NextAuth with Google OAuth and passcode provider"
```

---

### Task 7: Route Protection Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `src/middleware.ts`:

```typescript
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth (NextAuth handles its own routes)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public assets
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|hero-bg.mp4).*)",
  ],
};
```

- [ ] **Step 2: Verify middleware works**

Run `npm run dev`. Visit `http://localhost:3000/app` — should redirect to `/login`. Visit `http://localhost:3000/login` — should load (no redirect loop).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add route protection middleware"
```

---

### Task 8: Build Login Page

**Files:**
- Create: `src/components/login-form.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/page.tsx` (root redirect)
- Create: `__tests__/components/login-form.test.tsx`

- [ ] **Step 1: Write login form test**

Create `__tests__/components/login-form.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "@/components/login-form";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("LoginForm", () => {
  it("renders Google sign-in button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it("renders passcode toggle link", () => {
    render(<LoginForm />);
    expect(screen.getByText(/enter with passcode/i)).toBeInTheDocument();
  });

  it("shows passcode input when toggle is clicked", async () => {
    const { user } = await import("@testing-library/user-event");
    const userEvent = user.setup();
    render(<LoginForm />);
    await userEvent.click(screen.getByText(/enter with passcode/i));
    expect(screen.getByPlaceholderText(/passcode/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/components/login-form.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Build the LoginForm component**

Create `src/components/login-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    signIn("google", { callbackUrl: "/app" });
  }

  async function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("passcode", {
      passcode,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid passcode.");
      setLoading(false);
    } else {
      window.location.href = "/app";
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Paideia</h1>
        <p className="text-text-secondary text-sm">
          AI-powered tutoring for Drew School
        </p>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="btn-primary w-full flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-bg-elevated" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg-base px-2 text-text-muted">or</span>
        </div>
      </div>

      {!showPasscode ? (
        <button
          onClick={() => setShowPasscode(true)}
          className="w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Enter with passcode
        </button>
      ) : (
        <form onSubmit={handlePasscodeSubmit} className="space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !passcode}
            className="btn-secondary w-full disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter as Guest"}
          </button>
        </form>
      )}

      <p className="text-text-muted text-xs text-center">
        Paideia is exclusively for Drew School students and faculty.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create login page**

Create `src/app/login/page.tsx`:

```tsx
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
```

- [ ] **Step 5: Set root page to redirect to login**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
```

- [ ] **Step 6: Run tests**

```bash
npx vitest run __tests__/components/login-form.test.tsx
```

Expected: All 3 tests PASS.

- [ ] **Step 7: Verify visually**

Run `npm run dev`. Visit `http://localhost:3000`:
- Redirects to `/login`
- Shows "Paideia" heading, Google sign-in button, passcode toggle
- Clicking "Enter with passcode" reveals input field
- Design system colors and fonts are correct

- [ ] **Step 8: Commit**

```bash
git add src/components/login-form.tsx src/app/login/ src/app/page.tsx __tests__/components/
git commit -m "feat: build login page with Google OAuth and passcode access"
```

---

### Task 9: Build Role Selection (Onboarding)

**Files:**
- Create: `src/app/api/onboarding/route.ts`
- Create: `src/components/role-selector.tsx`
- Create: `src/app/onboarding/page.tsx`
- Create: `__tests__/components/role-selector.test.tsx`

- [ ] **Step 1: Write role selector test**

Create `__tests__/components/role-selector.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleSelector } from "@/components/role-selector";

describe("RoleSelector", () => {
  it("renders student and teacher options", () => {
    render(<RoleSelector />);
    expect(
      screen.getByRole("button", { name: /i'm a student/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i'm a teacher/i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/components/role-selector.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create the onboarding API route**

Create `src/app/api/onboarding/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.id === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const role = body.role;

  if (role !== "STUDENT" && role !== "TEACHER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Check if role is already set (immutable after selection)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role) {
    return NextResponse.json(
      { error: "Role already set" },
      { status: 409 }
    );
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Build the RoleSelector component**

Create `src/components/role-selector.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoleSelector() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function selectRole(role: "STUDENT" | "TEACHER") {
    setLoading(role);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      router.push("/app");
      router.refresh();
    } else {
      setLoading(null);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Paideia</h1>
        <p className="text-text-secondary">
          Tell us about yourself to get started.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => selectRole("STUDENT")}
          disabled={loading !== null}
          className="card p-6 text-center hover:border-accent transition-colors group disabled:opacity-50"
        >
          <div className="text-4xl mb-3">
            <svg
              className="w-10 h-10 mx-auto text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
              />
            </svg>
          </div>
          <span className="font-display font-semibold text-text-primary">
            {loading === "STUDENT" ? "Setting up..." : "I'm a Student"}
          </span>
        </button>

        <button
          onClick={() => selectRole("TEACHER")}
          disabled={loading !== null}
          className="card p-6 text-center hover:border-accent transition-colors group disabled:opacity-50"
        >
          <div className="text-4xl mb-3">
            <svg
              className="w-10 h-10 mx-auto text-text-secondary group-hover:text-accent transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <span className="font-display font-semibold text-text-primary">
            {loading === "TEACHER" ? "Setting up..." : "I'm a Teacher"}
          </span>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create onboarding page**

Create `src/app/onboarding/page.tsx`:

```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RoleSelector } from "@/components/role-selector";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.id === "guest") redirect("/app");
  if (session.user.role) redirect("/app");

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <RoleSelector />
    </main>
  );
}
```

- [ ] **Step 6: Run tests**

```bash
npx vitest run __tests__/components/role-selector.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/onboarding/ src/components/role-selector.tsx src/app/onboarding/ __tests__/components/role-selector.test.tsx
git commit -m "feat: build role selection onboarding flow"
```

---

### Task 10: Build App Shell & Home Page

**Files:**
- Create: `src/components/app-shell.tsx`
- Create: `src/app/app/layout.tsx`
- Create: `src/app/app/page.tsx`

- [ ] **Step 1: Build the app shell component**

Create `src/components/app-shell.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/app", label: "Home", icon: "home" },
  { href: "/app/upload", label: "Upload", icon: "upload" },
  { href: "/app/library", label: "Library", icon: "library" },
  { href: "/app/sessions", label: "Sessions", icon: "chat" },
];

function NavIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "home":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      );
    case "upload":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
      );
    case "library":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
      );
    case "chat":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
      );
    default:
      return null;
  }
}

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: string | null;
}

export function AppShell({ children, userName, userRole }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-surface border-r border-bg-elevated flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-display font-bold text-text-primary">
            Paideia
          </h2>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-bg-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary truncate">
                {userName ?? "Guest"}
              </p>
              <p className="text-xs text-text-muted">
                {userRole === "GUEST"
                  ? "Guest"
                  : userRole === "TEACHER"
                    ? "Teacher"
                    : userRole === "STUDENT"
                      ? "Student"
                      : ""}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-text-muted hover:text-text-primary transition-colors"
              title="Sign out"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create app layout with role guard**

Create `src/app/app/layout.tsx`:

```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");

  // Guests skip onboarding
  const isGuest = session.user.id === "guest";

  // Non-guest users without a role go to onboarding
  if (!isGuest && !session.user.role) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      userName={session.user.name ?? undefined}
      userRole={isGuest ? "GUEST" : session.user.role}
    >
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 3: Create home page**

Create `src/app/app/page.tsx`:

```tsx
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "Guest";
  const isGuest = session?.user?.id === "guest";

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {name}</h1>
      <p className="text-text-secondary mb-8">
        {isGuest
          ? "You're browsing as a guest. Sign in with your Drew email for the full experience."
          : "Ready to learn something new today?"}
      </p>

      <div className="grid grid-cols-2 gap-4">
        {!isGuest && (
          <a href="/app/upload" className="card p-6 hover:border-accent transition-colors">
            <h3 className="font-display font-semibold mb-1">Upload New Work</h3>
            <p className="text-text-secondary text-sm">
              Submit coursework and start a tutoring session.
            </p>
          </a>
        )}
        <a href="/app/library" className="card p-6 hover:border-accent transition-colors">
          <h3 className="font-display font-semibold mb-1">Browse Library</h3>
          <p className="text-text-secondary text-sm">
            Explore resources by subject, teacher, and unit.
          </p>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify the full flow**

Run `npm run dev` and test:

1. Visit `/` — redirects to `/login`
2. Login page renders with Google button + passcode toggle
3. Enter passcode `082600` — redirects to `/app`
4. App shell shows sidebar with navigation, "Guest" user label
5. Home page shows "Welcome back, Guest" with guest message
6. Sign out returns to `/login`

For Google OAuth (requires real credentials):
1. Click Google sign-in
2. Non-Drew email shows error
3. Drew email creates account, redirects to `/onboarding`
4. Select role, redirects to `/app`
5. Home page shows name and role

- [ ] **Step 5: Commit**

```bash
git add src/components/app-shell.tsx src/app/app/
git commit -m "feat: build app shell layout and post-login home page"
```

---

### Task 11: Final Verification

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (passcode: 5 tests, login-form: 3 tests, role-selector: 1 test).

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 4: Build for production**

```bash
npm run build
```

Expected: Build succeeds. No errors.

- [ ] **Step 5: Fix any issues and commit**

If any checks fail, fix the issues and commit:

```bash
git add -A
git commit -m "fix: resolve build/lint/type issues"
```

- [ ] **Step 6: Final commit — Plan 1 complete**

```bash
git add -A
git commit -m "chore: Plan 1 complete — foundation and authentication"
```

---

## Definition of Done

Plan 1 is complete when:

- [ ] Next.js app runs locally with `npm run dev`
- [ ] Design system (colors, fonts) renders correctly on all pages
- [ ] Database schema is migrated with all models
- [ ] Login page is the first page at `/login`
- [ ] Google OAuth works (restricted to @drewschool.org)
- [ ] Passcode `082600` grants guest browsing access
- [ ] First-time Google users see role selection at `/onboarding`
- [ ] App shell has sidebar navigation with working links
- [ ] Route protection redirects unauthenticated users to `/login`
- [ ] All tests pass, types check, lint passes, build succeeds

---

## What's Next

**Plan 2: Upload System & RAG Pipeline** will add:
- Student/teacher upload forms with drag-and-drop
- File upload to Vercel Blob
- Text extraction (PDF, DOCX, images via OCR)
- Text chunking and embedding generation
- pgvector storage and similarity search

**Plan 3: Tutoring Chat Interface** will add:
- Chat UI with streaming responses
- Kimi K2.5 integration via Together.ai
- RAG context retrieval during chat
- Claude-style action panel with suggested actions
- Session persistence and resumption

**Plan 4: Resource Library** will add:
- 4-level browse hierarchy (Subject > Teacher > Unit > Resource)
- Inline expanding search with filters
- Vector similarity search
- "Study This" entry point to tutoring sessions

**Plan 5: Dashboards & Landing Page** will add:
- Student dashboard (stats, activity tracker, recent sessions)
- Teacher dashboard (analytics, resource management)
- Landing page with hero video and parallax scrolling
