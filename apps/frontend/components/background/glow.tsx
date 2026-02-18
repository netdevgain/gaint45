import { GlowBlob } from '@/components/background/glow-blob';

export function Glow({
  className,
  variant = 'brand'
}: {
  className?: string;
  variant?: 'brand' | 'accent' | 'neutral';
}): React.JSX.Element {
  const tone = variant === 'brand' ? 'cyan' : variant === 'accent' ? 'gold' : 'navy';
  return <GlowBlob tone={tone} className={className} />;
}
