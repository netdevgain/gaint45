import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-xl border border-slate-200 bg-white/92 px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 backdrop-blur transition focus-visible:-translate-y-[1px] focus-visible:border-brand-500/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20',
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
