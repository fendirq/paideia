# Paideia Design System

Last updated: 2026-04-23

Status: Locked for the Writing Portal V1. Apply consistently across all student-facing surfaces.

## Source of truth

- Visual reference: shadcn preset `b7C9wSxrU`
- Component primitives: shadcn/ui (installed via `shadcn@latest`)
- Tailwind: v4 (installed by `shadcn init`)
- Theme installer: `bunx --bun shadcn@latest init` with the shadcn preset `b7C9wSxrU` (the exact CLI argument form is determined at install time by checking current shadcn CLI docs)

## Design language

Dark, premium, creative-studio aesthetic. Editorial restraint with high-contrast typography, sharp 0-radius corners, and subtle borders that earn their weight.

The portal is a working surface for a writer — not a marketing page. Density should feel intentional but never crowded. White space carries as much meaning as a label.

## Locked tokens (shadcn preset `b7C9wSxrU`)

| Token            | Value             |
| ---------------- | ----------------- |
| Style            | Lyra              |
| Base color       | Mist              |
| Theme            | Mist              |
| Chart color      | Mist              |
| Heading font     | Figtree           |
| Body font        | Figtree           |
| Icon library     | HugeIcons         |
| Radius           | None (`rounded-none`) |
| Menu style       | Default / Solid   |
| Menu accent      | Subtle            |

## Application rules

1. Every new component must use shadcn primitives unless a primitive does not exist for the use case. If something custom is needed, build it on top of the same Tailwind tokens — never introduce a new color, radius, or font.
2. Corners are sharp: prefer `rounded-none` everywhere (cards, buttons, inputs, badges, popovers). Do not soften corners for individual screens.
3. Borders use `border-border` (the shadcn token) at 1px. Heavier elevation comes from contrast and spacing, not shadows.
4. Iconography: HugeIcons. Do not mix Lucide, Tabler, or Heroicons into the same surface.
5. Typography:
   - Headings: `font-sans` (Figtree), tight tracking (`tracking-tight`), generous size scale (`text-3xl`+ for page titles).
   - Body: `font-sans` (Figtree), default tracking, comfortable line-height for prose.
   - Use `text-muted-foreground` for secondary copy, never a custom gray.
6. Color: stick to the shadcn tokens (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `accent`, `muted`, `border`, `destructive`, `ring`). Avoid hex literals in JSX.
7. Surfaces: cards use `bg-card`, the canvas uses `bg-background`. Sidebar uses `bg-card` or a slightly elevated tone via the same tokens.
8. Buttons: shadcn `Button` only. No raw `<button>` styled inline outside primitives.
9. Inputs: shadcn `Input`, `Textarea`, `Select`, `Slider`, `Switch`, `Tabs`, `Dialog`. Build forms by composition, never one-off styling.

## Layout patterns

- Application chrome sits inside an `AppShell` with a left `DriveSidebar` and a `<main>` region.
- Sidebar width: `w-72` (288px) on desktop, collapses below the standard breakpoint.
- Page headers follow a consistent pattern: small uppercase eyebrow (`text-sm text-muted-foreground`), then a `text-3xl font-semibold tracking-tight` page title.
- Lists, cards, and tables share consistent vertical rhythm (`gap-4` for tight stacks, `gap-6` for sections, `p-6` page padding).

## Surface inventory (apply this language across)

- Drive (folders + documents listing)
- Profile training flow
- Document workspace (editor + generation panel)
- Generation/AI controls
- Snapshots and run history
- Empty states and loading states
- Toasts, dialogs, popovers, dropdown menus

## Out of scope (do not introduce)

- Custom palettes per page
- Rounded corners ("just for this card")
- Alternate font families (Geist, Inter, Helvetica, etc.)
- Inline icon SVGs not from HugeIcons
- Drop shadows beyond what the preset defines
- Marketing-style gradients or radial backgrounds inside the portal
