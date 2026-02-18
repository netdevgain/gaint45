import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-slate-200 bg-white/92 px-3.5 text-sm text-ink placeholder:text-slate-400 shadow-[inset_0_1px_1px_rgba(16,26,51,0.03)] backdrop-blur transition focus-visible:-translate-y-[1px] focus-visible:border-brand-500/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
