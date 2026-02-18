import { PatternOverlay } from '@/components/background/pattern-overlay';

export function DotsPattern({ className }: { className?: string }): React.JSX.Element {
  return <PatternOverlay variant="dots" className={className} />;
}

export function GridPattern({ className }: { className?: string }): React.JSX.Element {
  return <PatternOverlay variant="grid" className={className} />;
}
