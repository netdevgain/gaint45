import { cn } from '@/lib/utils';

type MeshIntensity = 'home' | 'default' | 'auth' | 'admin';

export function MeshGradient({
  intensity,
  className
}: {
  intensity: MeshIntensity;
  className?: string;
}): React.JSX.Element {
  return <div aria-hidden="true" className={cn('absolute inset-0', `bg-mesh-${intensity}`, className)} />;
}

