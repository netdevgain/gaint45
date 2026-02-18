'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MeshGradient } from '@/components/background/mesh-gradient';
import { NoiseOverlay } from '@/components/background/noise-overlay';
import { PatternOverlay } from '@/components/background/pattern-overlay';
import { GlowBlob } from '@/components/background/glow-blob';

type BackgroundVariant = 'home' | 'default' | 'auth' | 'admin';

const localeSet = new Set(['fr', 'en', 'ar']);
const authSegmentSet = new Set(['login', 'register', 'forgot-password', 'reset-password']);

function inferVariant(pathname: string | null): BackgroundVariant {
  if (!pathname || pathname === '/') {
    return 'home';
  }

  const segments = pathname.split('/').filter(Boolean);
  const effectiveSegments = localeSet.has(segments[0] ?? '') ? segments.slice(1) : segments;
  const rootSegment = effectiveSegments[0] ?? '';

  if (!rootSegment) {
    return 'home';
  }
  if (rootSegment === 'admin') {
    return 'admin';
  }
  if (authSegmentSet.has(rootSegment)) {
    return 'auth';
  }
  return 'default';
}

export function BackgroundShell({
  children,
  className,
  variant
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BackgroundVariant;
}): React.JSX.Element {
  const pathname = usePathname();
  const resolvedVariant = useMemo(() => variant ?? inferVariant(pathname), [variant, pathname]);

  return (
    <div className={cn('relative min-h-screen overflow-x-clip', className)}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <MeshGradient intensity={resolvedVariant} />

        <PatternOverlay variant="grid" className={cn('text-brand-500', resolvedVariant === 'admin' ? 'opacity-[0.08]' : 'opacity-[0.16]')} />
        <PatternOverlay
          variant={resolvedVariant === 'admin' ? 'diagonal' : 'dots'}
          className={cn('text-brand-900', resolvedVariant === 'admin' ? 'opacity-[0.07]' : 'opacity-[0.2]')}
        />

        <GlowBlob tone="navy" className={cn('-top-44 h-[520px] w-[520px]', resolvedVariant === 'admin' ? '-left-28 opacity-45' : '-left-40 opacity-75')} />
        <GlowBlob tone="cyan" className={cn('-right-44 -top-36 h-[560px] w-[560px]', resolvedVariant === 'auth' ? 'opacity-45' : 'opacity-62')} />
        {resolvedVariant === 'home' ? <GlowBlob tone="gold" className="-bottom-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 opacity-56" /> : null}
        {resolvedVariant !== 'admin' ? <GlowBlob tone="smoke" className="-bottom-36 right-1/4 h-[460px] w-[460px] opacity-42" /> : null}

        <NoiseOverlay className={resolvedVariant === 'admin' ? 'opacity-[0.034]' : 'opacity-[0.055]'} />
        <div className={cn('absolute inset-0 bg-vignette', resolvedVariant === 'admin' ? 'opacity-75' : 'opacity-100')} />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

