import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading(): React.JSX.Element {
  return (
    <div className="page-stack">
      <section className="hero-grid relative overflow-hidden rounded-[2rem] border border-white/55 bg-white/70 px-6 py-8 shadow-strong backdrop-blur lg:px-10 lg:py-10 gradient-border">
        <div className="space-y-3">
          <Skeleton className="h-6 w-44 bg-slate-200/60" />
          <Skeleton className="h-10 w-[min(520px,100%)] bg-slate-200/60" />
          <Skeleton className="h-5 w-[min(680px,100%)] bg-slate-200/55" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr] lg:items-start">
        <Card className="hidden lg:block border-transparent gradient-border">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-4 w-28 bg-slate-200/60" />
            <div className="space-y-3">
              <Skeleton className="h-11 w-full bg-slate-200/60" />
              <Skeleton className="h-11 w-full bg-slate-200/60" />
              <Skeleton className="h-11 w-full bg-slate-200/60" />
              <Skeleton className="h-11 w-full bg-slate-200/60" />
              <Skeleton className="h-11 w-full bg-slate-200/60" />
              <Skeleton className="h-11 w-full bg-slate-200/60" />
              <Skeleton className="h-11 w-full bg-slate-200/60" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40 bg-slate-200/60" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24 bg-slate-200/60" />
              <Skeleton className="h-10 w-16 bg-slate-200/60" />
              <Skeleton className="h-10 w-16 bg-slate-200/60" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-transparent gradient-border">
                <CardContent className="space-y-4 p-6">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-200/60" />
                    <Skeleton className="h-6 w-28 rounded-full bg-slate-200/60" />
                  </div>
                  <Skeleton className="h-6 w-[80%] bg-slate-200/60" />
                  <Skeleton className="h-4 w-[60%] bg-slate-200/55" />
                  <Skeleton className="h-4 w-[70%] bg-slate-200/55" />
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Skeleton className="h-9 w-24 bg-slate-200/60" />
                    <Skeleton className="h-9 w-24 bg-slate-200/60" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
