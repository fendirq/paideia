# Paideia — Design Specification

> AI-powered Socratic tutoring platform for Drew School, built as a senior project by Mic.

---

## 1. Overview

Paideia is a full-stack web application that provides Drew School students and teachers with an AI-powered tutoring system. Students upload coursework, describe what they're struggling with, and engage in interactive Socratic tutoring sessions powered by Kimi K2.5. Over time, uploads form a cumulative resource library — a living archive of every course at Drew.

**Name origin**: Paideia (Greek: παιδεία) — education, upbringing, the complete formation of a student.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router), TypeScript (strict mode) |
| Styling | Tailwind CSS + Framer Motion (animations, parallax) |
| Database | PostgreSQL + Prisma ORM + pgvector extension |
| Auth | NextAuth.js — Google OAuth, @drewschool.org only |
| File Storage | Vercel Blob |
| LLM | Kimi K2.5 via Together.ai (OpenAI-compatible API) — requires `TOGETHER_API_KEY` env var |
| Fallback LLM | Llama 3.1 70B or similar via Together.ai (silent failover, same API key) |
| Embeddings | bge-large-en-v1.5 or text-embedding-3-small |
| Hosting | Vercel |
| Repo | GitHub — `paideia` |

---

## 3. Design System

### Color Palette (Claude-inspired warm dark + green accent)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#1a1915` | Deepest background, user message bubbles |
| `bg-surface` | `#2d2b28` | Chat background, cards, panels |
| `bg-elevated` | `#3d3a37` | Hover states, separators, secondary surfaces |
| `accent` | `#4a9d5b` | Primary accent — buttons, badges, highlights |
| `accent-light` | `#6bc47d` | Secondary accent — progress bars, status indicators |
| `text-primary` | `#e8e0d8` | Primary text (warm off-white) |
| `text-secondary` | `#a39e98` | Secondary text, labels |
| `text-muted` | `#706b65` | Placeholder text, timestamps |

### Typography

Distinctive display font for headings (Clash Display, Satoshi, General Sans, or Cabinet Grotesk) paired with a clean body font. No generic Inter/Roboto.

### Consistency

All pages share the same Tailwind theme config — colors, fonts, spacing, and border radii are defined once in `tailwind.config.ts` and used everywhere. No per-page overrides. The result should feel like one cohesive product (similar to how Claude maintains visual consistency across chat, settings, and marketing pages).

### Design Principles

- Desktop-first (optimized for laptops, stacked/tabbed fallback for mobile)
- Dark mode by default with light mode toggle
- No emojis in the UI
- Parallax scrolling on **landing page only** (hero section + scroll-triggered feature sections). All app pages (chat, dashboards, library) use standard scrolling.
- Framer Motion for page transitions and scroll-triggered animations (landing page)
- Skeleton loading states, not spinners

---

## 4. Authentication & Roles

### Login Page (First Page)

The login page is the **first thing users see** when visiting Paideia. No landing page or marketing content before login.

- **Google OAuth**: "Sign in with your Drew email" button via NextAuth.js
- Restricted to `@drewschool.org` email addresses
- Non-Drew emails see: "Paideia is exclusively for Drew School students and faculty."
- First login: role selection screen — "I'm a Student" / "I'm a Teacher"
- Role stored in User record, immutable after selection

### Guest Passcode Access

Below the Google sign-in button, a secondary option:
- Small text link: "Enter with passcode"
- Expanding input field for a 6-digit passcode
- Hardcoded passcode: `082600`
- Guest access grants a temporary session (not stored in the database, no User record created)
- Guests can browse the library and view resources but cannot upload, start tutoring sessions, or leave ratings
- Session expires on browser close

### Session Management

- JWT session management for authenticated users
- Middleware protects all `/app/*` routes
- Guest sessions use a lightweight cookie (no DB persistence)

---

## 5. Upload & Inquiry System

### Student Upload Flow

Intake form fields:
- Name (auto-filled from Google profile)
- Subject (dropdown: Mathematics, English, History, Science, Mandarin, Humanities, Other)
- Teacher Name (text input with autocomplete from previously entered names)
- Unit / Topic Name (free text)
- "What are you struggling with?" (textarea)
- File upload — drag-and-drop, supports .pdf, .docx, .doc, .png, .jpg, .jpeg, .heic

### Teacher Upload Flow

Same form but with:
- "Course / Class" field instead of "What are you struggling with?"
- Materials are tagged as teacher-uploaded in the library

### File Limits

- 5 files per inquiry
- 25MB max per file
- 100MB total per inquiry

### Backend Processing

On submit:
1. Store inquiry metadata in DB
2. Upload files to Vercel Blob
3. Extract text:
   - PDFs → pdf-parse
   - Word docs → mammoth
   - Images → OCR / vision model (handwritten homework support)
4. Chunk text into ~500 token segments with 100 token overlap
5. Generate embeddings via embedding model
6. Store chunks + vectors in pgvector, linked to inquiry ID, subject, teacher

---

## 6. Master Resource Library

### Browse Hierarchy

Level 1 — **Subject grid**: Subject blocks showing resource count, teacher count, unit count, latest upload date.

Level 2 — **Teacher rows**: Inside a subject, clean row list of teachers with their courses and resource counts.

Level 3 — **Unit rows**: Inside a teacher, unit names with resource counts.

Level 4 — **Individual resources**: Inside a unit, each resource shows:
- Title
- Original struggle description (student uploads) or course description (teacher uploads)
- Upload date
- Last studied date
- Number of tutoring sessions
- File type and count
- "Study This" button

### Search

Inline expanding search bar with filter tabs:
- Tabs: All / Teachers / Units / Resources
- Results grouped by category, not a flat list
- Filters: subject, teacher, date range
- Backed by both text search and vector similarity search

### Legacy Effect

All resources persist indefinitely with clear date metadata. Students can browse and study from past years' materials.

---

## 7. Interactive Socratic Tutoring Sessions

### Session Start

Two entry points:
1. **From own upload**: After submitting an inquiry, click "Start Tutoring Session"
2. **From library**: Browse to any resource, click "Study This"

Both lead to the same chat experience — the difference is whether RAG context comes from the student's own upload or an existing library resource.

### Chat UI

- **Background**: `bg-surface` (#2d2b28)
- **User messages**: Dark bubbles (`bg-base` #1a1915), right-aligned
- **AI responses**: Open text on the grey background — no bubble. Full markdown rendering with bold headings, bullet lists, inline emphasis, LaTeX/KaTeX for math.
- **Streaming**: Tokens stream in real-time

### Action Panel (Claude-style)

Floating panel pinned to the bottom of the chat:
- Header: "What do you want to do?" with close (X) button
- 4 numbered contextual suggestions — AI generates these alongside each response
- "Something else" option with pencil icon (opens text input)
- "Skip" button
- First option highlighted with green badge, rest have subtle bordered badges
- Thin separator lines between options

The AI returns structured JSON per response:
```json
{
  "message": "markdown text...",
  "suggestedActions": [
    "Show me the full substitution",
    "Why can I ignore the constant?",
    "Try a different example",
    "Quiz me on this"
  ]
}
```

### Socratic Behavior (System Prompt)

Core instructions:
- Never give answers directly — ask guiding questions first
- Diagnose confusion before teaching
- Break problems into steps, check comprehension after each
- Use analogies and multiple representations
- Celebrate progress without being patronizing
- Adapt to student's level (simplify or increase complexity)
- Reference uploaded material directly via RAG
- Periodically check understanding ("explain back in your own words")
- End sessions with a summary and next steps
- If student explicitly asks to see the full solution ("break it down for me"), adapt and show complete step-by-step walkthrough, then move to practice problems

### Context Management

- Kimi K2.5 context window: 128k tokens
- System prompt + subject context: ~500 tokens
- RAG chunks (top 5-8): ~3,000-4,000 tokens
- Rolling window: last 20 messages (~6,000-10,000 tokens)
- Auto-summary of older messages: ~500 tokens
- Per-message input limit: 2,000 characters
- Leaves ~110k+ tokens for AI response — no practical constraint

### Session Features

- Sessions are saved and resumable
- Session rating at end: 1-5 stars + optional comment
- Export session as PDF study guide
- Model fallback: if Kimi K2.5 fails, silently switch to backup model

---

## 8. Student Dashboard

- Welcome header: "Welcome back, [name]"
- Quick stats: total sessions, subjects studied, current streak
- Weekly activity tracker: M-T-W-T-F-S-S row (green = active, grey = inactive)
- Subject progress bars: per-subject session counts
- Recent sessions: list with subject, unit, timestamp, status
- My uploads: all student's uploaded materials
- Suggested resources: based on their subjects/teachers
- Quick actions: "Upload New Work" and "Continue Last Session"

---

## 9. Teacher Dashboard

- Overview stats: total resources, total student sessions, most-studied units
- Upload materials: upload form with "Course / Class" field
- My resources: all teacher's uploads with edit/delete controls
- Student struggle analytics (anonymized):
  - Top topics students struggle with, ranked by frequency
  - Sessions per unit over time
  - Average session ratings per unit
  - Most-studied resources
  - Weekly/monthly activity trends
- Curate library: pin recommended resources, flag/remove inappropriate content
- Export analytics as PDF report

---

## 10. Landing / Home Page (Post-Login)

After login, authenticated users land on this page. It serves as the app's home and introduction.

- **Hero**: Full-width looping video background (`hero-bg.mp4`), muted, autoplay, dark overlay. Bold headline, subtitle, quick-action buttons ("Start Tutoring", "Browse Library").
- **How It Works**: 3-step scroll-triggered animation (Upload > AI Diagnoses > Socratic Session)
- **Subject Library Preview**: Subject grid with resource counts, scroll-triggered entrance
- **Features Showcase**: Panels — Socratic learning, curriculum-specific, growing knowledge base, file support
- **For Students / For Teachers**: Split section with value props for each audience
- **Footer**: Links, Drew branding, "Built by Mic — Drew Class of [year]"
- Parallax layering and Framer Motion throughout this page (landing page is the only page with parallax)

---

## 11. Content Moderation

- Light moderation approach — trust the @drewschool.org email gate
- Strict file type and size validation (client + server)
- Flag/report button on uploads and chat content
- Teachers can flag/remove content in their subject area
- No AI content scanning

---

## 12. Database Schema

```prisma
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

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatarUrl String?
  role      Role
  inquiries Inquiry[]
  sessions  TutoringSession[]
  createdAt DateTime @default(now())
}

model Inquiry {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  subject     Subject
  teacherName String
  unitName    String
  description String
  files       File[]
  chunks      TextChunk[]
  sessions    TutoringSession[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model File {
  id            String   @id @default(cuid())
  inquiryId     String
  inquiry       Inquiry  @relation(fields: [inquiryId], references: [id])
  fileName      String
  fileUrl       String
  fileType      String
  extractedText String?
  chunks        TextChunk[]
  createdAt     DateTime @default(now())
}

model TextChunk {
  id         String   @id @default(cuid())
  fileId     String
  file       File     @relation(fields: [fileId], references: [id])
  inquiryId  String
  inquiry    Inquiry  @relation(fields: [inquiryId], references: [id])
  content    String
  embedding  Unsupported("vector(1536)")
  chunkIndex Int
  createdAt  DateTime @default(now())
}

model TutoringSession {
  id        String        @id @default(cuid())
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  inquiryId String
  inquiry   Inquiry       @relation(fields: [inquiryId], references: [id])
  messages  Message[]
  rating    Int?
  ratingComment String?
  status    SessionStatus @default(ACTIVE)
  startedAt DateTime      @default(now())
  endedAt   DateTime?
}

model Message {
  id        String   @id @default(cuid())
  sessionId String
  session   TutoringSession @relation(fields: [sessionId], references: [id])
  role      String
  content   String
  suggestedActions String[]
  createdAt DateTime @default(now())
}

model Report {
  id          String   @id @default(cuid())
  reporterId  String
  targetType  String
  targetId    String
  reason      String
  status      String   @default("pending")
  createdAt   DateTime @default(now())
}
```

---

## 13. API Routes

```
/api/auth/[...nextauth]        — Authentication
/api/inquiries                  — POST: create inquiry, GET: list user inquiries
/api/inquiries/[id]             — GET: inquiry details
/api/upload                     — POST: file upload to Vercel Blob
/api/library                    — GET: browse library (subjects > teachers > units)
/api/library/search             — GET: inline search with filters + vector similarity
/api/sessions                   — POST: start session, GET: list user sessions
/api/sessions/[id]              — GET: session detail with messages
/api/sessions/[id]/chat         — POST: send message, receive streaming AI response + suggested actions
/api/sessions/[id]/rate         — POST: rate a session
/api/sessions/[id]/export       — GET: export session as PDF
/api/reports                    — POST: flag content
/api/teacher/analytics          — GET: anonymized struggle analytics
/api/teacher/resources          — GET/PUT/DELETE: manage teacher uploads
```

---

## 14. RAG Pipeline

### On Upload
1. Extract raw text (PDF, DOCX, or OCR for images)
2. Clean and normalize text
3. Split into chunks (~500 tokens, 100 token overlap)
4. Generate embeddings via embedding model
5. Store chunks + embeddings in pgvector

### On Chat Message
1. Take student's message + recent conversation history
2. Generate embedding of the query
3. Cosine similarity search against chunks from the relevant inquiry (and optionally related inquiries in same subject/unit)
4. Retrieve top 5-8 most relevant chunks
5. Inject retrieved context into system prompt
6. Send to Kimi K2.5 with Socratic instructions
7. Stream response + suggested actions back to client

---

## 15. Performance & Quality

- Lighthouse score > 90 on all metrics
- Skeleton loading states throughout
- Graceful error boundaries with helpful messages
- Responsive (desktop-first, stacked/tabbed mobile fallback)
- Accessibility: ARIA labels, keyboard navigation, color contrast compliance
- Rate limiting on API routes
- File validation on client and server
- Conventional commits, clean branch strategy (main > dev > feature branches)
- Zero-error Vercel deployment from day one

---

## 16. Drew School Context

Paideia is designed with Drew School's policies in mind:

- **AI Policy**: Drew's default is no AI unless teacher-explicitly permits it. Paideia is positioned as an approved platform. All interactions are logged and exportable so students can cite AI usage and share documentation with teachers per policy requirements.
- **Academic Integrity**: The Socratic approach aligns with Drew's emphasis on students owning their learning. The system guides rather than answers.
- **Existing Infrastructure**: Drew uses Google Workspace for Education and DrewNet. Google OAuth integration leverages existing accounts.
- **Tutoring Context**: The Herbst Learning Center already coordinates tutoring. Paideia extends this as a digital, always-available complement.
