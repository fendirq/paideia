# Paideia UI Polish — Full Sweep Design Spec

## Goal

Bring every page in the Paideia app up to the quality of the landing page. The design direction is **cinematic** — editorial typography, dramatic spacing, subtle motion, and a premium feel throughout.

## Design Direction

- **Cinematic feel**: Serif headings (Libre Baskerville), generous whitespace, hover-lift cards, subtle gradient orbs
- **Full Bleed backgrounds** on auth pages: radial gradient orbs + grid overlay, glassmorphism cards
- **Consistent theme**: Dark palette (`#1a1915` base), green accent (`#4a9d5b`), subject color system
- **Fonts**: Space Grotesk (UI/labels), Libre Baskerville (headings/prose), Inter (body)

## New Feature: Class Management

The upload page introduces a **sidebar class list** where students save their classes (subject, teacher, unit). Once saved, classes appear as selectable items across the app — the upload form auto-fills based on the selected class.

## Pages

### 1. Login — Full Bleed

**Current**: Basic centered form, no brand presence.

**New**: Full bleed immersive background with radial gradient orbs (green, blue, gold) and subtle grid overlay. Centered content stack: large PAIDEIA logo, serif headline ("Your Socratic tutor, *always ready.*"), subtitle, glassmorphism form card with Google OAuth button + passcode input. No trust stats.

**Files to modify**: `src/app/login/page.tsx`, `src/components/login-form.tsx`

### 2. Onboarding — Full Bleed (matches login)

**Current**: Two plain buttons for Student/Teacher.

**New**: Same full bleed background as login (visual continuity). PAIDEIA logo, "How will you use Paideia?" headline. Two glassmorphism cards side by side — icon + title only (no description text). Student card has graduation cap icon, Teacher card has person icon.

**Files to modify**: `src/app/onboarding/page.tsx`, `src/components/role-selector.tsx`

### 3. Dashboard — Cinematic Hero

**Current**: Video hero + basic class grid.

**New**: Editorial welcome section with gradient background and radial green glow. Serif heading: "Welcome back, {name}." Subtitle with session summary. Below: "YOUR CLASSES" label, then 3-column card grid. Each card has a subject-color accent bar, Space Grotesk title, meta line (subject + teacher), stats row (session count, last active). Cards hover-lift with shadow.

**Files to modify**: `src/app/app/page.tsx`, `src/components/class-grid.tsx`, `src/components/video-hero.tsx`

### 4. Upload — Sidebar Class List + Form

**Current**: Single-column form with dropdown subject selector.

**New**: Two-panel layout. **Left sidebar** (240px): persistent class list showing saved classes with subject dot, name, teacher. Selected class highlighted with green border. "+ Add class" dashed button at bottom. **Right panel**: Upload form for the selected class — "What are you struggling with?" textarea + file drop zone + submit button. The form is shorter since subject/teacher/unit come from the selected class.

When adding a new class (no saved classes or "+ New class" clicked), the right panel shows the full form: subject chips (colored pills, not dropdown), teacher name + unit side by side, description, file drop zone.

**New data model**: Classes are stored as a concept — either a new `Class` model or reuse `Inquiry` as the class container. Each class has: subject, teacherName, unitName. Uploads link to a class.

**Files to modify**: `src/app/app/upload/page.tsx`, `src/components/upload-form.tsx` (significant rewrite)
**New files**: Possibly `src/components/class-sidebar.tsx`

### 5. Sessions — Compact List with Recent + Past

**Current**: All sessions listed with cards grouped by class.

**New**: Serif heading "Your sessions" with count subtitle. Subject filter pills (All / Math / History / English). Sessions grouped by class with uppercase divider labels. Each session is a compact row: subject dot, bold title, description, message count + time on the right, chevron arrow.

**Key change**: Only the **2 most recent sessions** per group are visible by default. Below each group, a "Past chats →" link reveals the rest (either inline expand or separate view). This keeps the page scannable.

**Files to modify**: `src/app/app/sessions/page.tsx`, `src/components/session-card.tsx` (rewrite to row format)

### 6. Library — File Cards Grid

**Current**: List view with search and filters.

**New**: Serif heading "Library" with subtitle. Search bar + subject filter pills. 3-column grid of cards. Each card: subject-color banner (5px top), emoji icon for the subject type, Space Grotesk title, "Subject · Teacher" meta, file count + session count at bottom. Cards hover-lift.

**Files to modify**: `src/app/app/library/page.tsx`, `src/components/library-view.tsx`

### 7. Analytics — Full Dashboard

**Current**: Basic stat cards + donut chart + exam countdown + study queue.

**New**: Serif heading "Analytics" with subtitle. **Top row**: 4 stat cards (Sessions, Day Streak, Messages, Subjects) with trend badges. **Middle row**: Weekly activity bar chart (green bars, Mon-Sun) + donut chart with subject legend, side by side. **Exams section**: Countdown tiles (red <3 days, gold <7, green 14+) with subject + readiness progress bar. **Study queue**: Checklist items with checkboxes, subject tag, and status badges (New/Review/Practiced).

**Files to modify**: `src/app/app/analytics/page.tsx`, `src/components/stat-card.tsx`, `src/components/donut-chart.tsx`, `src/components/exam-countdown.tsx`, `src/components/study-queue.tsx`
**New files**: `src/components/activity-chart.tsx` (weekly bar chart)

### 8. Chat — Already Done (bug fixes applied)

No design changes needed. Three bugs were fixed in this session:
- Removed duplicate input bar (textarea hidden when action panel visible)
- Stripped `[N]` prefix from action text
- Fallback actions always generated when AI doesn't provide them

### 9. Search — Coming Soon (no changes)

Remains as placeholder.

## Shared Component Updates

### Navbar
No structural changes. Already polished with capsule nav links.

### Cards Pattern
All card components should share the same treatment:
- `bg-inner` background with `rgba(255,255,255,0.04)` border
- `border-radius: 14-16px`
- Hover: `translateY(-2px)`, `box-shadow: 0 12px 28px rgba(0,0,0,0.2)`, border brightens
- Transition: `cubic-bezier(0.16, 1, 0.3, 1)` for smooth lift

### Subject Chips
Reusable component for subject selection:
- Rounded pills with subject-color dot
- Selected state: green border + green tint background
- Used in Upload form and potentially filters

### Full Bleed Background
Shared between Login and Onboarding:
- Radial gradient orbs (green, blue, gold)
- Grid overlay (`60px` squares, `0.015` opacity white lines)
- Glassmorphism cards: `rgba(34,33,30,0.7)` + `backdrop-filter: blur(20px)`

## Implementation Priority

1. **Login + Onboarding** (share Full Bleed background — build once, use twice)
2. **Dashboard** (cinematic hero + card grid)
3. **Upload** (biggest change — sidebar class list + form rewrite)
4. **Sessions** (compact list + recent/past split)
5. **Library** (file cards grid)
6. **Analytics** (full dashboard with new activity chart)

## Out of Scope

- Search page (remains "coming soon")
- Landing page (already polished)
- Chat interface (bugs fixed, no design changes)
- Mobile responsive breakpoints (can be a follow-up)
- Dark/light theme toggle
