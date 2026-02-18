# Design Changelog

## Overview
Major frontend visual and motion upgrade completed in `apps/frontend` without changing backend APIs or business logic.

## Design System + Foundation
- Refined global design tokens in `apps/frontend/app/globals.css`:
  - Added/standardized `--bg`, `--card`, `--muted`, `--primary`, `--primary-foreground`, `--border`, `--ring`
  - Unified radius/shadow scales and premium surface styles (`panel`, `panel-soft`, `glass-nav`)
  - Added reusable visual utilities (`hero-grid`, `interactive-card`, shimmer skeletons, RTL helpers)
- Aligned Tailwind theme mapping in `apps/frontend/tailwind.config.ts` to token-based colors, shadows, and radii.
- Updated shadcn-style primitives for consistency:
  - `apps/frontend/components/ui/button.tsx`
  - `apps/frontend/components/ui/card.tsx`
  - `apps/frontend/components/ui/input.tsx`
  - `apps/frontend/components/ui/select.tsx`
  - `apps/frontend/components/ui/textarea.tsx`
  - `apps/frontend/components/ui/badge.tsx`
  - `apps/frontend/components/ui/skeleton.tsx`

## Motion + Interaction
- Added Framer Motion and global motion orchestration:
  - `apps/frontend/components/motion/motion-provider.tsx`
  - `apps/frontend/components/motion/route-transition.tsx`
  - `apps/frontend/components/motion/reveal.tsx`
- Added reduced-motion support globally (CSS + MotionConfig).
- Added animated toasts and provider:
  - `apps/frontend/components/ui/toast.tsx`
- Added animated/focus-managed dialog:
  - `apps/frontend/components/ui/dialog.tsx`
- Added mobile animated filter drawer:
  - `apps/frontend/components/mobile-filter-drawer.tsx`

## Navigation + Shell
- Premium sticky glass navbar with animated active states and mobile drawer:
  - `apps/frontend/components/navbar.tsx`
- Polished animated language switcher (flags + dropdown motion):
  - `apps/frontend/components/language-switcher.tsx`
- Upgraded footer visual hierarchy:
  - `apps/frontend/components/footer.tsx`
- Wired providers/transitions in locale layout:
  - `apps/frontend/app/[locale]/layout.tsx`

## Page Redesigns
- Home: hero, trust/value sections, stats, featured jobs motion polish:
  - `apps/frontend/app/[locale]/page.tsx`
- Jobs listing: desktop sidebar + mobile filter drawer + animated cards:
  - `apps/frontend/app/[locale]/jobs/page.tsx`
- Job details: cleaner hierarchy, reveal animations, sticky actions feel:
  - `apps/frontend/app/[locale]/jobs/[id]/page.tsx`
- Contact: premium hero + animated info cards sourced from locale content:
  - `apps/frontend/app/[locale]/contact/page.tsx`
- SAV: premium service support layout + animated cards:
  - `apps/frontend/app/[locale]/sav/page.tsx`
- About motion polish:
  - `apps/frontend/app/[locale]/about/page.tsx`
- Auth motion wrappers:
  - `apps/frontend/app/[locale]/login/page.tsx`
  - `apps/frontend/app/[locale]/register/page.tsx`
  - `apps/frontend/app/[locale]/forgot-password/page.tsx`
  - `apps/frontend/app/[locale]/reset-password/page.tsx`
- Candidate dashboard and admin visual/motion polish:
  - `apps/frontend/app/[locale]/dashboard/page.tsx`
  - `apps/frontend/app/[locale]/admin/page.tsx`
  - `apps/frontend/app/[locale]/admin/applications/page.tsx`
  - `apps/frontend/app/[locale]/admin/jobs/page.tsx`
  - `apps/frontend/app/[locale]/admin/services/page.tsx`
  - `apps/frontend/app/[locale]/admin/users/page.tsx`
  - `apps/frontend/app/[locale]/admin/settings/page.tsx`
  - `apps/frontend/components/admin-shell.tsx`

## Quality Checks
- Verified with production build:
  - `npm run build --workspace frontend` passed successfully.
- Type-safety fixes applied for strict event typing in:
  - `apps/frontend/components/mobile-filter-drawer.tsx`
  - `apps/frontend/components/navbar.tsx`
  - `apps/frontend/components/ui/dialog.tsx`
