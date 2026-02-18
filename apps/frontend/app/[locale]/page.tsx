import { ArrowRight, ArrowUpRight, BriefcaseBusiness, FileText, Globe2, MessageSquare, Quote, ScanSearch, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serverApiFetch } from '@/lib/server-api';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Glow } from '@/components/background/glow';
import { DotsPattern, GridPattern } from '@/components/background/patterns';

interface JobItem {
  id: string;
  title: string;
  city: string;
  wilaya: string;
  contractType: string;
  service: { id: string; name: string };
}

interface JobsPayload {
  data: {
    items: JobItem[];
    total: number;
    page: number;
    pageSize: number;
  };
}

function mapContractLabel(value: string): string {
  if (value === 'STAGE') {
    return 'Stage';
  }
  return value;
}

function EmptyJobsIllustration(): React.JSX.Element {
  return (
    <svg viewBox="0 0 320 160" aria-hidden="true" className="mx-auto h-32 w-full max-w-sm text-brand-500/35">
      <defs>
        <linearGradient id="job-empty" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.26" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="24" y="28" width="272" height="104" rx="22" fill="url(#job-empty)" />
      <rect x="54" y="56" width="212" height="16" rx="8" fill="currentColor" fillOpacity="0.26" />
      <rect x="54" y="86" width="150" height="11" rx="5.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="54" y="107" width="110" height="11" rx="5.5" fill="currentColor" fillOpacity="0.16" />
      <circle cx="268" cy="34" r="14" fill="currentColor" fillOpacity="0.22" />
    </svg>
  );
}

function AbstractShapes({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 520 520" fill="none">
      <defs>
        <linearGradient id="shape-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F94D6" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#081C4D" stopOpacity="0.22" />
          <stop offset="1" stopColor="#C9994C" stopOpacity="0.32" />
        </linearGradient>
        <filter id="shape-blur" x="-40" y="-40" width="600" height="600" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <g filter="url(#shape-blur)">
        <path
          d="M343 73c74 45 105 111 84 187-21 76-80 85-126 133-46 48-64 122-151 92-87-30-133-101-119-176 14-75 69-86 115-132 46-46 123-148 197-104z"
          fill="url(#shape-grad)"
        />
      </g>
    </svg>
  );
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;
  const tHome = await getTranslations('home');
  const tCommon = await getTranslations('common');

  let jobs: JobItem[] = [];

  try {
    const payload = await serverApiFetch<JobsPayload>('/jobs', {
      query: {
        locale,
        page: 1,
        pageSize: 6
      }
    });
    jobs = payload.data.items;
  } catch {
    jobs = [];
  }

  const testimonials = [
    {
      quote: tHome('testimonial1Quote'),
      name: tHome('testimonial1Name'),
      role: tHome('testimonial1Role')
    },
    {
      quote: tHome('testimonial2Quote'),
      name: tHome('testimonial2Name'),
      role: tHome('testimonial2Role')
    },
    {
      quote: tHome('testimonial3Quote'),
      name: tHome('testimonial3Name'),
      role: tHome('testimonial3Role')
    }
  ];

  return (
    <div className="page-stack">
      <section className="hero-grid relative overflow-hidden rounded-[2.25rem] border border-white/55 bg-white/62 px-6 py-10 shadow-strong backdrop-blur lg:px-12 lg:py-14 gradient-border">
        <GridPattern className="opacity-[0.22] text-brand-500" />
        <DotsPattern className="opacity-[0.28] text-brand-900" />
        <Glow className="-left-24 -top-28 h-[420px] w-[420px]" variant="brand" />
        <Glow className="-right-24 -bottom-32 h-[460px] w-[460px]" variant="neutral" />
        <AbstractShapes className="pointer-events-none absolute -right-24 -top-32 h-[520px] w-[520px] opacity-60" />

        <Stagger className="relative grid gap-10 lg:grid-cols-[1.35fr,1fr] lg:items-end">
          <div className="glass-panel space-y-6 p-5 lg:p-7">
            <StaggerItem>
              <Badge>{tHome('badge')}</Badge>
            </StaggerItem>
            <StaggerItem>
              <h1 className="display-title max-w-2xl text-ink">{tHome('heroTitle')}</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="section-subtitle max-w-2xl">{tHome('heroDescription')}</p>
            </StaggerItem>
            <StaggerItem>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-700">{tHome('heroSecondary')}</p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-wrap gap-3">
                <Link href="/jobs">
                  <Button size="xl">
                    {tCommon('viewJobs')}
                    <ArrowRight size={16} className="mirror-rtl" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="xl" variant="secondary">
                    {tCommon('applyNow')}
                  </Button>
                </Link>
              </div>
            </StaggerItem>
          </div>

          <Stagger className="glass-panel grid gap-3 p-4" delayChildren={0.18}>
            <StaggerItem>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slateInk">{tHome('innovation')}</p>
                <p className="mt-1 text-xl font-bold text-ink">R&D / Product / Digital</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slateInk">{tHome('growth')}</p>
                <p className="mt-1 text-xl font-bold text-ink">{tHome('statsCountries')}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slateInk">{tHome('values')}</p>
                <p className="mt-1 text-xl font-bold text-ink">{tHome('statsEmployees')}</p>
              </div>
            </StaggerItem>
          </Stagger>
        </Stagger>
      </section>
      <div className="section-divider" />

      <section className="space-y-4">
        <FadeIn className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-title text-[1.9rem]">{tHome('trustTitle')}</h2>
            <p className="section-subtitle max-w-2xl">{tHome('trustDescription')}</p>
          </div>
          <Link href="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            {tHome('trustLink')}
            <ArrowUpRight size={14} className="mirror-rtl" />
          </Link>
        </FadeIn>

        <Stagger className="grid gap-4 lg:grid-cols-3">
          <StaggerItem>
            <Card className="border-transparent gradient-border">
              <CardContent className="flex items-start gap-3 p-6">
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-700">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slateInk">{tHome('innovation')}</p>
                  <p className="mt-2 text-sm leading-7 text-slateInk">{tHome('innovationText')}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-transparent gradient-border">
              <CardContent className="flex items-start gap-3 p-6">
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-700">
                  <Globe2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slateInk">{tHome('growth')}</p>
                  <p className="mt-2 text-sm leading-7 text-slateInk">{tHome('growthText')}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-transparent gradient-border">
              <CardContent className="flex items-start gap-3 p-6">
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-700">
                  <BriefcaseBusiness size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slateInk">{tHome('values')}</p>
                  <p className="mt-2 text-sm leading-7 text-slateInk">{tHome('valuesText')}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </Stagger>
      </section>
      <div className="section-divider" />

      <section className="space-y-4">
        <FadeIn className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title text-[1.9rem]">{tHome('featuredTitle')}</h2>
            <p className="section-subtitle">{tHome('featuredDescription')}</p>
          </div>
          <Link href="/jobs" className="text-sm font-semibold text-brand-700">
            {tCommon('viewJobs')}
          </Link>
        </FadeIn>

        {jobs.length === 0 ? (
          <FadeIn>
            <Card className="border-transparent gradient-border">
              <CardContent className="space-y-3 p-8 text-center text-slateInk">
                <EmptyJobsIllustration />
                <p>{tCommon('empty')}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <StaggerItem key={job.id}>
                <Card className="group h-full overflow-hidden border-transparent gradient-border">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{mapContractLabel(job.contractType)}</Badge>
                      <Badge className="border-slate-300 bg-slate-100 text-slateInk">{job.service.name}</Badge>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-ink">{job.title}</h3>
                      <p className="text-sm text-slateInk">
                        {job.wilaya} - {job.city}
                      </p>
                    </div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
                    >
                      {tCommon('details')}
                      <ArrowRight size={14} className="transition group-hover:translate-x-0.5 mirror-rtl" />
                    </Link>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <FadeIn>
        <section className="panel-soft rounded-[1.9rem] p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-ink">{tHome('processTitle')}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700">
                <FileText size={18} />
              </div>
              <p className="mt-4 text-sm font-bold text-brand-700">{tHome('processStep1Title')}</p>
              <p className="mt-2 text-sm leading-7 text-slateInk">{tHome('processStep1Text')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700">
                <ScanSearch size={18} />
              </div>
              <p className="mt-4 text-sm font-bold text-brand-700">{tHome('processStep2Title')}</p>
              <p className="mt-2 text-sm leading-7 text-slateInk">{tHome('processStep2Text')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700">
                <MessageSquare size={18} />
              </div>
              <p className="mt-4 text-sm font-bold text-brand-700">{tHome('processStep3Title')}</p>
              <p className="mt-2 text-sm leading-7 text-slateInk">{tHome('processStep3Text')}</p>
            </div>
          </div>
        </section>
      </FadeIn>

      <section className="space-y-4">
        <FadeIn>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="section-title text-[1.9rem]">{tHome('testimonialsTitle')}</h3>
              <p className="section-subtitle max-w-2xl">{tHome('testimonialsDescription')}</p>
            </div>
          </div>
        </FadeIn>

        <Stagger className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <StaggerItem key={item.name}>
              <Card className="h-full border-transparent gradient-border">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700">
                    <Quote size={18} />
                  </div>
                  <p className="text-sm leading-7 text-slateInk">{item.quote}</p>
                  <div className="mt-auto pt-2">
                    <p className="text-sm font-bold text-ink">{item.name}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slateInk">{item.role}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <FadeIn>
        <section className="brand-gradient hero-grid relative overflow-hidden rounded-[1.9rem] px-6 py-8 text-white shadow-strong lg:px-10 lg:py-10">
          <GridPattern className="opacity-[0.16] text-white" />
          <Glow className="-left-24 -top-28 h-[420px] w-[420px]" variant="neutral" />
          <Glow className="-right-24 -bottom-40 h-[460px] w-[460px]" variant="accent" />

          <div className="relative z-[1] grid gap-6 lg:grid-cols-[1.35fr,1fr] lg:items-end">
            <div>
              <h3 className="text-3xl font-bold tracking-[-0.02em]">{tHome('ctaTitle')}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90">{tHome('ctaDescription')}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/jobs">
                <Button variant="secondary" size="lg">
                  {tHome('ctaButton')}
                  <ArrowRight size={16} className="mirror-rtl" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" size="lg" className="border border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                  {tCommon('applyNow')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
