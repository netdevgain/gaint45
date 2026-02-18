import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/brand/geant-logo.png"
        alt="Geant Electronics"
        width={compact ? 122 : 170}
        height={compact ? 40 : 56}
        priority
        className="h-auto w-auto"
      />
      {!compact ? (
        <div className="hidden min-[980px]:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slateInk">SARL LOTFI ELECTRONICS</p>
          <p className="text-sm font-bold text-brand-900">Careers Platform</p>
        </div>
      ) : null}
    </div>
  );
}
