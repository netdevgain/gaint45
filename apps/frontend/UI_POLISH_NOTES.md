# UI Polish Notes

## Background System
- Global wrapper: `apps/frontend/components/background/background-shell.tsx` (wired in `apps/frontend/app/[locale]/layout.tsx`).
- Layers (CSS utilities in `apps/frontend/app/globals.css`):
  - `bg-mesh`: subtle gradient mesh base.
  - `pattern-grid` + `pattern-dots`: faint geometric patterns (masked to fade out).
  - `bg-noise`: CSS-only noise overlay via an inline SVG data URL (`--noise`).
  - `bg-vignette`: soft vignette for depth and focus.
- Reusable utilities:
  - `Glow` in `apps/frontend/components/background/glow.tsx` for decorative radial glows.
  - `GridPattern` / `DotsPattern` in `apps/frontend/components/background/patterns.tsx`.

## Motion System
- Core motion plumbing:
  - `apps/frontend/components/motion/motion-provider.tsx` (reduced-motion aware `MotionConfig`).
  - `apps/frontend/components/motion/route-transition.tsx` (page transitions).
  - `apps/frontend/components/motion/reveal.tsx` (`FadeIn`/`Stagger` now animate on scroll via `whileInView` and respect reduced motion).
- Micro-interactions:
  - Animated toasts: `apps/frontend/components/ui/toast.tsx`.
  - Animated dialog: `apps/frontend/components/ui/dialog.tsx`.
  - Mobile filter drawer: `apps/frontend/components/mobile-filter-drawer.tsx`.

## Design Tokens
- Token source: `apps/frontend/app/globals.css` + Tailwind mapping in `apps/frontend/tailwind.config.ts`.
- Key token groups:
  - Color tokens: `--bg`, `--card`, `--muted`, `--primary`, `--border`, `--ring`.
  - Radius/shadows: `--radius-*`, `--shadow-*`.
  - Layout rhythm: `--page-gutter`, `--section-space` (used via `.page-stack`).
- Premium card borders:
  - `gradient-border` class adds a subtle gradient-stroked border using masking.

