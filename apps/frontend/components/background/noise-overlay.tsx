import { cn } from '@/lib/utils';

export function NoiseOverlay({ className }: { className?: string }): React.JSX.Element {
  return <div aria-hidden="true" className={cn('bg-noise absolute inset-0', className)} />;
}

