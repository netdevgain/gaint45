import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-brand-500/25 bg-gradient-to-r from-brand-500/14 via-brand-500/7 to-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]',
        className
      )}
    >
      {children}
    </span>
  );
}
