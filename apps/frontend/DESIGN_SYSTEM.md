# Design System

## Visual Direction
- Brand tone: luxury-tech corporate with deep navy, cool cyan highlights, and minimal soft-gold accents.
- Core feeling: layered depth, translucent glass surfaces, subtle geometric structure, and calm motion.
- Functional guarantee: routes/auth/i18n/RTL/API behavior remain unchanged.

## Tokens
- Source of truth: `apps/frontend/app/globals.css`.
- Core color tokens:
  - `--bg`, `--card`, `--muted`, `--primary`, `--primary-foreground`, `--border`, `--ring`
  - `--brand-900` (deep navy), `--brand-700`, `--brand-500` (cool cyan), `--accent-500` (soft gold)
- Radius tokens:
  - `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- Shadow tokens:
  - `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, plus `--shadow-soft`, `--shadow-strong`
- Layout rhythm:
  - `--page-gutter`, `--section-space`

## Background System
- Components:
  - `apps/frontend/components/background/background-shell.tsx`
  - `apps/frontend/components/background/mesh-gradient.tsx`
  - `apps/frontend/components/background/noise-overlay.tsx`
  - `apps/frontend/components/background/pattern-overlay.tsx`
  - `apps/frontend/components/background/glow-blob.tsx`
- Variant model:
  - `home`, `default`, `auth`, `admin`
  - Automatically inferred from path in `BackgroundShell` (with optional prop override)
- Layer stack:
  - Mesh gradient base (`bg-mesh-*`)
  - Pattern overlays (`pattern-grid`, `pattern-dots`, `pattern-diagonal`)
  - Corner/hero glows (`GlowBlob`)
  - Noise overlay (`bg-noise`)
  - Vignette (`bg-vignette`)

## Background Tuning
- Intensity is controlled by:
  - `bg-mesh-home`, `bg-mesh-default`, `bg-mesh-auth`, `bg-mesh-admin`
  - Opacity values passed to `PatternOverlay`, `GlowBlob`, `NoiseOverlay` in `BackgroundShell`
- To make a variant calmer:
  - Reduce glow opacity first, then pattern opacity, then mesh alpha.
- To make a variant richer:
  - Increase mesh alpha first, then glow size/opacity (keep noise subtle).

## Motion Rules
- Mesh gradient uses slow animation (`mesh-drift`) for ambient depth.
- Reduced motion:
  - Global `prefers-reduced-motion` disables mesh animation and minimizes transitions.
- Interaction motion:
  - Cards use subtle lift and shadow.
  - Route/page transitions and staggered entrances remain quick and non-distracting.

## Shape Language Rules
- Use rounded geometry consistently:
  - Large containers: `rounded-[2rem]+`
  - Content cards: tokenized radius (`--radius-lg` / `--radius-xl`)
- Use premium borders:
  - `gradient-border` for key surfaces and cards.
- Use translucent hero surfaces:
  - `glass-panel` for spotlight areas (hero info blocks, highlight modules).
- Use separators sparingly:
  - `section-divider` between major narrative blocks.

## Typography
- EN/FR: `Inter` via `next/font/google` in `apps/frontend/app/[locale]/layout.tsx`.
- AR: `Cairo` only for Arabic locale; RTL spacing/line-height helpers remain in `globals.css`.
- Scale:
  - `display-title` for hero headlines.
  - `section-title` and `section-subtitle` for section rhythm.

