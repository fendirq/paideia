# Paideia UI Overhaul — Design Spec

**Date:** 2026-04-02
**Status:** Approved (pending final user review)
**Scope:** Complete visual redesign of the Paideia Socratic AI tutoring platform for Drew School

---

## 1. Overview

Paideia is a Socratic AI tutoring platform where Drew School students upload coursework, select classes, and engage in AI-driven tutoring sessions. This spec covers a full UI overhaul — moving from a sidebar-based layout to an immersive, glass-layered design with a video hero homepage, top navbar, and cohesive dark theme throughout.

**Tech stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma 7 + PostgreSQL (Neon), NextAuth v4, Vercel Blob, Together AI (LLM), KaTeX (math rendering).

---

## 2. Design System

### 2.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#1a1915` | Homepage base (behind video) |
| `--bg-inner` | `#22211e` | Inner page backgrounds (warm grey) |
| `--bg-surface` | `#2d2b28` | Card/panel backgrounds |
| `--bg-elevated` | `#3d3a37` | Elevated surfaces, hover states |
| `--accent` | `#4a9d5b` | Primary green accent |
| `--accent-light` | `#6bc47d` | Lighter green for text, highlights |
| `--text-primary` | `#e8e0d8` | Primary body text |
| `--text-secondary` | `#a39e98` | Secondary/supporting text |
| `--text-muted` | `#706b65` | Muted labels, metadata |

**Subject colors** (used for class identification throughout):
- Math: `#5b9bd5`
- History: `#e8a838`
- English: `#c57bdb`
- Science: `#4a9d5b`

### 2.2 Typography

| Context | Font | Weight | Size |
|---------|------|--------|------|
| Headings, display, PAIDEIA logo | Space Grotesk | 600–700 | 16–28px |
| UI elements (nav, buttons, labels, metadata) | Inter | 400–600 | 11–15px |
| Chat body text, explanations, step text | Libre Baskerville | 400, 700 | 15px |
| Step labels, problem box labels | Space Grotesk | 600 | 12–13px |
| Code blocks | JetBrains Mono | 400–500 | 14px |
| Math (KaTeX) | KaTeX default | — | 1.05em |

### 2.3 Glass Morphism

Used on all homepage overlays (navbar, class grid, hero content):

```css
background: rgba(26, 25, 21, 0.6);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.06);
border-radius: 16px;
```

### 2.4 Backgrounds

- **Homepage:** Full-screen `<video>` element, `position: fixed`, covering entire viewport. Mountain timelapse MP4 (1280x720, 5MB, 18s loop). All content overlays the video via glass panels.
- **Inner pages** (sessions, analytics, chat, file cabinet): Solid warm grey `#22211e`. No video, no gradient. Cards use `#2b2a26` with `1px solid rgba(255,255,255,0.04)` borders.

---

## 3. Navigation

### 3.1 Navbar

- **Position:** Fixed top, transparent, glass overlay on homepage. On inner pages, uses `#1d1c19` background.
- **Left:** "PAIDEIA" logo in Space Grotesk 700, letter-spacing 0.1em.
- **Right — Start Chat button:** Standalone green pill, visually distinct from nav capsule.
  ```css
  background: var(--accent);
  border: 2px solid var(--accent-light);
  box-shadow: 0 0 20px rgba(74, 157, 91, 0.3);
  border-radius: 50px;
  padding: 8px 20px;
  ```
  Text only, no icon.
- **Right — Nav capsule:** Contains Home, Sessions, Analytics, Search, and avatar. Overarching capsule with individual pills inside.
  ```css
  background: rgba(26, 25, 21, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 4px;
  ```
  Active pill: `background: rgba(255, 255, 255, 0.08)`.

### 3.2 Page Structure

Navigation items map to routes:
- **Home** → `/app` (homepage with video hero + class grid)
- **Sessions** → `/app/sessions` (grouped by class)
- **Analytics** → `/app/analytics` (stats, progress, goals)
- **Search** → `/app/search` (search across sessions/files)
- **Start Chat** → Opens class selection (if not already in a class context), then creates a new tutoring session for the selected inquiry

---

## 4. Homepage

### 4.1 Hero Section

- Full-viewport video background (`position: fixed; inset: 0; z-index: 0; object-fit: cover`).
- Video source: `/public/hero-video.mp4` (mountain timelapse, loops, muted, autoplay).
- "PAIDEIA" text centered, fades in/out. Space Grotesk 700, large size, white with subtle text shadow.
- Scroll indicator at bottom.

### 4.2 Parallax Scroll to Class Grid

- As user scrolls past the hero, content scrolls up over the fixed video.
- The video persists as background throughout the entire homepage — no black gaps, no solid backgrounds.
- Glass scrim over video: `rgba(26, 25, 21, 0.55)` increases opacity slightly as user scrolls deeper.

### 4.3 Class Grid

- **Layout:** 2-column grid, responsive.
- **Cards:** Glass morphism panels. Each card shows class name, teacher, unit count.
- **Hover:** Green accent top-bar appears (`3px solid var(--accent)`), subtle lift.
- **Click:** Navigates to the File Cabinet view for that class (inquiry).
- Classes are populated from the user's Inquiry records in the database.

---

## 5. File Cabinet (Folder View)

- **Layout:** Two-panel — folder list on the left, file contents on the right.
- **Left panel:** List of uploaded files for the selected inquiry. Each file shows name, type, upload date.
- **Right panel:** File preview or extracted text content.
- **"Start Session" button:** Prominent green CTA at the top of the right panel. Starts a new tutoring session for this inquiry.
- Matches the warm grey inner page background (`#22211e`).

---

## 6. Chat Interface

### 6.1 Layout

- **Full-page takeover** — chat fills the entire viewport when active.
- Top bar with session info (class name, unit, back button).
- Message area scrolls vertically, input bar fixed at bottom.

### 6.2 AI Messages

- **No bubble/wrapper.** AI text flows as clean prose, like reading a document.
- Font: Libre Baskerville, 15px, line-height 1.75.
- Separated by: `border-bottom: 1px solid rgba(255, 255, 255, 0.04)`.
- Headings within AI responses: Space Grotesk 600.

### 6.3 User Messages

- Right-aligned with subtle bubble:
  ```css
  border-radius: 20px 20px 6px 20px;
  background: rgba(74, 157, 91, 0.3);
  border: 1px solid rgba(74, 157, 91, 0.15);
  padding: 12px 18px;
  ```
- Font: Libre Baskerville, 15px.

### 6.4 Problem Box

- Style A — rounded card with green left accent bar:
  ```css
  background: rgba(45, 43, 40, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 3px solid var(--accent);
  border-radius: 12px;
  padding: 16px 20px;
  ```
- "PROBLEM" label: Space Grotesk 600, 11px, uppercase, `var(--accent-light)`.
- Math content: KaTeX rendered, 17px.

### 6.5 Step Chain

- Style: Green accent bar with labeled steps, explanation + math block.
- Container: `border-left: 2px solid rgba(74, 157, 91, 0.3); padding-left: 22px`.
- Each step separated by `border-bottom: 1px solid rgba(255, 255, 255, 0.04)`.
- Per step, three layers:
  1. **Label:** Space Grotesk 600, 13px, `var(--accent-light)`. Format: "Step N — Description".
  2. **Explanation:** Libre Baskerville, 15px, `var(--text-secondary)`. Plain-language context.
  3. **Math block:** Boxed area (`background: rgba(45, 43, 40, 0.5); border-radius: 8px; padding: 10px 14px`). KaTeX rendered, 16px.

### 6.6 Math Rendering

- KaTeX for all math expressions (inline and display).
- No broken symbols — all math must render through KaTeX, never as raw text with `^` or `_` characters.
- Inline math: `1.05em` relative size.
- Display math: Centered, with margin above and below.

---

## 7. Sessions Page

### 7.1 Layout

- **Grouped by class** — sessions organized under class headers.
- Background: warm grey `#22211e`.

### 7.2 Class Sections

- **Header:** Subject color dot + class name (Space Grotesk 600) + teacher name + session count badge.
- **Cards:** 2-column grid within each class.
  - Subject color top-bar (3px).
  - Card background: `rgba(45, 43, 40, 0.5)`.
  - Content: Unit name (600 weight), detail line (chapter, message count), status badge + date.
  - Hover: border lightens, subtle translateY(-1px).
- **"See more" link:** Bottom-right of each class section when more sessions exist than displayed. Links to filtered view.

### 7.3 Status Badges

- Active: `background: rgba(74, 157, 91, 0.12); color: var(--accent-light); border: 1px solid rgba(74, 157, 91, 0.2)`.
- Completed: `background: rgba(255, 255, 255, 0.04); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.06)`.

---

## 8. Analytics Page

### 8.1 Layout

Three sections stacked vertically:

1. **Stat cards** (2x2 grid)
2. **Study breakdown + Upcoming exams** (2-column)
3. **To Study queue** (full-width)

Background: warm grey `#22211e`.

### 8.2 Stat Cards

- 2x2 grid of cards, each showing:
  - Large number (Space Grotesk 700, 36px).
  - Label (Inter 13px, muted).
  - Week-over-week trend badge (green pill with "+N").
  - Sub-label for context.
- Stats tracked: Sessions this week, Time studied, Day streak, Classes active.

### 8.3 Study Breakdown (Left Panel)

- Donut chart showing time/session distribution across classes.
- Donut uses subject colors (Math blue, History amber, English purple, Science green).
- Center of donut: total session count.
- Legend beside donut: class name + percentage.

### 8.4 Upcoming Exams (Right Panel)

- List of upcoming tests/exams.
- Each exam shows:
  - Days remaining (large number, color-coded: red < 3, amber < 7, green >= 7).
  - Exam name and class.
  - Readiness percentage with progress bar.
- Goals are **class-driven** — auto-generated based on uploaded coursework and class materials. Students use these to understand what to study before walking into a test.

### 8.5 To Study Queue

- Full-width checklist below the two-column section.
- Each item: circle checkbox + topic name + class/chapter + status tag.
- Status tags:
  - **New** (blue pill) — topic not yet studied.
  - **Review** (amber pill) — topic needs revisiting.
  - **Practiced** (green pill) — topic covered in a session.
- Completed items: green filled checkbox, strikethrough text.
- Topics are auto-generated from class materials, linked to upcoming exams.

---

## 9. Data Model Considerations

The existing Prisma schema supports most of this design. New considerations:

- **Exam/test tracking:** Currently no model for upcoming exams. Options:
  - Add an `Exam` model (linked to Inquiry) with `name`, `date`, `topics[]`.
  - Or derive from file/chunk metadata if teachers include test dates in uploaded materials.
- **To Study items:** Could be a `StudyItem` model linked to Inquiry + Exam, with status (NEW, REVIEW, PRACTICED) and topic text.
- **Study stats:** Session duration isn't currently tracked. Add `duration` (in seconds) to `TutoringSession`, computed from first to last message timestamp, or tracked client-side.
- **Streak tracking:** Can be computed from `TutoringSession.startedAt` dates per user.

These schema additions should be addressed in the implementation plan.

---

## 10. Video Asset

- **Source file:** Mountain peak timelapse, Himalayan landscape with golden sunlight and drifting clouds.
- **Specs:** 1280x720, H.264, 5MB, 18 seconds, 30fps, no audio.
- **Deployment:** Copy to `public/hero-video.mp4`. Served statically.
- **Attributes:** `autoPlay muted loop playsInline` on the `<video>` element.
- **Fallback:** Static gradient background (same mountain tones) for browsers that don't support autoplay video.

---

## 11. Responsive Considerations

- Class grid: 2 columns on desktop, 1 column on mobile.
- Session cards: 2 columns on desktop, 1 column on mobile.
- Analytics stat cards: 2x2 on desktop, stacked on mobile.
- Analytics two-column (donut + exams): stacked on mobile.
- Chat: full-width on all sizes, input bar stays fixed.
- Navbar: pill capsule collapses to hamburger on mobile (implementation detail).

---

## 12. Migration from Current UI

The current app uses a 264px fixed left sidebar (`app-shell.tsx`). This overhaul replaces it entirely:

- **Remove:** `app-shell.tsx` sidebar component.
- **Replace with:** Top navbar component (glass on homepage, solid on inner pages).
- **Update:** `app/layout.tsx` and `app/app/layout.tsx` to use new navigation.
- **Update:** All page components to remove sidebar padding assumptions.
- **Move:** Upload/library flows into the File Cabinet view within each class.

---

## 13. Mockup Reference

All visual mockups are preserved in:
```
.superpowers/brainstorm/65943-1775158999/content/  (original session)
.superpowers/brainstorm/69809-1775170601/content/  (second session)
.superpowers/brainstorm/73779-1775183847/content/  (third session)
```

Key mockups:
- `parallax-v1.html` — Homepage with video hero + parallax class grid
- `folders-v1.html` — File Cabinet view
- `chat-refined-v1.html` — Chat interface (no AI bubbles)
- `step-chains-v4.html` — Step chain with Libre Baskerville serif font
- `sessions-v2.html` — Sessions grouped by class (Option A, color-top cards)
- `analytics-v2.html` — Analytics dashboard (Option A with to-study queue)
- `backgrounds-v2.html` — Inner page grey backgrounds (Option B, warm grey)
