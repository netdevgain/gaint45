import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.JSX.Element {
  return (
    <div className="page-stack">
      <Skeleton className="h-5 w-44 bg-slate-200/60" />

      <section className="hero-grid relative overflow-hidden rounded-[2rem] border border-white/55 bg-white/70 px-6 py-8 shadow-strong backdrop-blur lg:px-10 lg:py-10 gradient-border">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full bg-slate-200/60" />
            <Skeleton className="h-6 w-32 rounded-full bg-slate-200/60" />
          </div>
          <Skeleton className="h-10 w-[min(720px,100%)] bg-slate-200/60" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-48 rounded-full bg-slate-200/55" />
            <Skeleton className="h-8 w-40 rounded-full bg-slate-200/55" />
            <Skeleton className="h-8 w-44 rounded-full bg-slate-200/55" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px] lg:items-start">
        <Card className="border-transparent gradient-border">
          <CardHeader>
            <Skeleton className="h-5 w-40 bg-slate-200/60" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-[92%] bg-slate-200/55" />
            <Skeleton className="h-4 w-[88%] bg-slate-200/55" />
            <Skeleton className="h-4 w-[76%] bg-slate-200/55" />
            <Skeleton className="h-4 w-[90%] bg-slate-200/55" />
            <Skeleton className="h-4 w-[82%] bg-slate-200/55" />
          </CardContent>
        </Card>

        <Card className="border-transparent gradient-border lg:sticky lg:top-24">
          <CardHeader>
            <Skeleton className="h-5 w-44 bg-slate-200/60" />
            <Skeleton className="mt-2 h-4 w-[80%] bg-slate-200/55" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl bg-slate-200/55" />
            <Skeleton className="h-12 w-full bg-slate-200/60" />
            <Skeleton className="h-12 w-full bg-slate-200/60" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

