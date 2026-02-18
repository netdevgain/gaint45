import * as React from 'react';
import { cn } from '@/lib/utils';

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>): React.JSX.Element {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl border border-slate-200 bg-white/92 px-3.5 text-sm text-ink backdrop-blur transition focus-visible:-translate-y-[1px] focus-visible:border-brand-500/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20',
        className
      )}
      {...props}
    />
  );
}
