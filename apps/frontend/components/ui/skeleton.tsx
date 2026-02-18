import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }): React.JSX.Element {
  return <div className={cn('shimmer rounded-xl bg-slate-200/70', className)} />;
}
