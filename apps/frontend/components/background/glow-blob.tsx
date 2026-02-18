import { cn } from '@/lib/utils';

type GlowTone = 'navy' | 'cyan' | 'gold' | 'smoke';

const toneClassName: Record<GlowTone, string> = {
  navy: 'bg-[radial-gradient(circle_at_center,rgba(15,46,108,0.45),transparent_66%)]',
  cyan: 'bg-[radial-gradient(circle_at_center,rgba(47,148,214,0.35),transparent_66%)]',
  gold: 'bg-[radial-gradient(circle_at_center,rgba(201,153,76,0.25),transparent_64%)]',
  smoke: 'bg-[radial-gradient(circle_at_center,rgba(67,82,116,0.22),transparent_66%)]'
};

export function GlowBlob({
  tone,
  className
}: {
  tone: GlowTone;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute rounded-full blur-3xl', toneClassName[tone], className)}
    />
  );
}

