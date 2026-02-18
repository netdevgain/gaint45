import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
