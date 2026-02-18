import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-52" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
