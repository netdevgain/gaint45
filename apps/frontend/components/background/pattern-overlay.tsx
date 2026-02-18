import { cn } from '@/lib/utils';

type PatternVariant = 'grid' | 'dots' | 'diagonal';

export function PatternOverlay({
  variant,
  className
}: {
  variant: PatternVariant;
  className?: string;
}): React.JSX.Element {
  return <div aria-hidden="true" className={cn('absolute inset-0 pointer-events-none', `pattern-${variant}`, className)} />;
}

