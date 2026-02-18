import { ArrowRight, BriefcaseBusiness, MapPin, SlidersHorizontal } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlgeriaLocationSelects } from '@/components/algeria-location-selects';
import { serverApiFetch } from '@/lib/server-api';
import { MobileFilterDrawer } from '@/components/mobile-filter-drawer';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Glow } from '@/components/background/glow';
import { DotsPattern, GridPattern } from '@/components/background/patterns';

interface ServiceItem {
  id: string;
  name: string;
}

interface JobItem {
  id: string;
  title: string;
  description: string;
  contractType: string;
  wilaya: string;
  city: string;
  experienceYears: number;
  publishedAt: string;
  service: { id: string; name: string };
}

interface JobsResponse {
  data: {
    items: JobItem[];
    total: number;
    page: number;
    pageSize: number;
  };
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function mapContract(contractType: string): string {
  if (contractType === 'STAGE') {
    return 'Stage';
  }
  return contractType;
}

function EmptyJobsIllustration(): React.JSX.Element {
  return (
    <svg viewBox="0 0 320 160" aria-hidden="true" className="mx-auto h-28 w-full max-w-sm text-brand-500/35">
      <rect x="24" y="28" width="272" height="104" rx="22" fill="currentColor" fillOpacity="0.1" />
      <rect x="54" y="56" width="212" height="16" rx="8" fill="currentColor" fillOpacity="0.25" />
      <rect x="54" y="86" width="150" height="11" rx="5.5" fill="currentColor" fillOpacity="0.18" />
      <rect x="54" y="107" width="110" height="11" rx="5.5" fill="currentColor" fillOpacity="0.14" />
      <circle cx="268" cy="34" r="14" fill="currentColor" fillOpacity="0.22" />
    </svg>
  );
}

export default async function JobsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;
  const qs = await searchParams;
  const tJobs = await getTranslations('jobs');
  const tCommon = await getTranslations('common');

  const page = Math.max(1, Number(firstValue(qs.page)) || 1);
  const pageSize = 9;
  const view = firstValue(qs.view) === 'list' ? 'list' : 'grid';

  const filters = {
    search: firstValue(qs.search),
    serviceId: firstValue(qs.serviceId),
    contractType: firstValue(qs.contractType),
    wilaya: firstValue(qs.wilaya),
    city: firstValue(qs.city),
    experienceYears: firstValue(qs.experienceYears)
  };

  const [jobsPayload, servicesPayload] = await Promise.all([
    serverApiFetch<JobsResponse>('/jobs', {
      query: {
        locale,
        page,
        pageSize,
        search: filters.search || undefined,
        serviceId: filters.serviceId || undefined,
        contractType: filters.contractType || undefined,
        wilaya: filters.wilaya || undefined,
        city: filters.city || undefined,
        experienceYears: filters.experienceYears || undefined
      }
    }),
    serverApiFetch<{ items: ServiceItem[] }>('/services', {
      query: {
        locale
      }
    })
  ]);

  const jobs = jobsPayload.data.items;
  const totalPages = Math.max(1, Math.ceil(jobsPayload.data.total / jobsPayload.data.pageSize));

  const queryWithPage = (nextPage: number): Record<string, string> => {
    const query: Record<string, string> = {
      page: String(nextPage),
      view
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query[key] = value;
      }
    });

    return query;
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const DesktopFilters = (
    <form className="space-y-3">
      <input type="hidden" name="view" value={view} />
      <Input name="search" placeholder={tJobs('searchPlaceholder')} defaultValue={filters.search} />

      <Select name="serviceId" defaultValue={filters.serviceId}>
        <option value="">{tJobs('department')}</option>
        {servicesPayload.items.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </Select>

      <Select name="contractType" defaultValue={filters.contractType}>
        <option value="">{tJobs('contract')}</option>
        <option value="CDI">CDI</option>
        <option value="CDD">CDD</option>
        <option value="STAGE">Stage</option>
      </Select>

      <AlgeriaLocationSelects
        locale={locale}
        defaultWilaya={filters.wilaya}
        defaultCity={filters.city}
        wilayaPlaceholder={tJobs('wilaya')}
        cityPlaceholder={tJobs('city')}
        className="grid gap-3"
      />

      <Input
        name="experienceYears"
        type="number"
        min={0}
        placeholder={tJobs('experience')}
        defaultValue={filters.experienceYears}
      />

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" className="w-full">
          {tCommon('search')}
        </Button>
        {hasFilters ? (
          <Link href="/jobs" className="w-full">
            <Button type="button" variant="ghost" className="w-full">
              {tJobs('clearFilters')}
            </Button>
          </Link>
        ) : null}
      </div>
    </form>
  );

  const MobileFilters = (
    <form className="space-y-3">
      <input type="hidden" name="view" value={view} />
      <Input name="search" placeholder={tJobs('searchPlaceholder')} defaultValue={filters.search} />

      <Select name="serviceId" defaultValue={filters.serviceId}>
        <option value="">{tJobs('department')}</option>
        {servicesPayload.items.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </Select>

      <Select name="contractType" defaultValue={filters.contractType}>
        <option value="">{tJobs('contract')}</option>
        <option value="CDI">CDI</option>
        <option value="CDD">CDD</option>
        <option value="STAGE">Stage</option>
      </Select>

      <AlgeriaLocationSelects
        locale={locale}
        defaultWilaya={filters.wilaya}
        defaultCity={filters.city}
        wilayaPlaceholder={tJobs('wilaya')}
        cityPlaceholder={tJobs('city')}
        className="grid gap-3"
      />
      <Input
        name="experienceYears"
        type="number"
        min={0}
        placeholder={tJobs('experience')}
        defaultValue={filters.experienceYears}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="w-full">
          {tCommon('search')}
        </Button>
        {hasFilters ? (
          <Link href="/jobs" className="w-full">
            <Button type="button" variant="ghost" className="w-full">
              {tJobs('clearFilters')}
            </Button>
          </Link>
        ) : null}
      </div>
    </form>
  );

  return (
    <div className="page-stack">
      <FadeIn>
        <section className="hero-grid relative overflow-hidden rounded-[2rem] border border-white/55 bg-white/70 px-6 py-8 shadow-strong backdrop-blur lg:px-10 lg:py-10 gradient-border">
          <GridPattern className="opacity-[0.2] text-brand-500" />
          <DotsPattern className="opacity-[0.25] text-brand-900" />
          <Glow className="-left-24 -top-28 h-[420px] w-[420px]" variant="brand" />
          <Glow className="-right-28 -bottom-36 h-[460px] w-[460px]" variant="neutral" />

          <div className="relative z-[1] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="section-title">{tJobs('title')}</h1>
              <p className="section-subtitle max-w-2xl">{tJobs('subtitle')}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/75 px-4 py-3 text-sm text-slateInk shadow-xs">
              <BriefcaseBusiness size={15} className="text-brand-700" />
              <span className="font-semibold text-ink">{jobsPayload.data.total}</span>
              <span>{tJobs('title')}</span>
            </div>
          </div>
        </section>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr] lg:items-start">
        <FadeIn className="hidden lg:block">
          <Card className="lg:sticky lg:top-24 border-transparent gradient-border">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slateInk">
                <SlidersHorizontal size={14} />
                <span>{tCommon('filters')}</span>
              </div>
              {DesktopFilters}
            </CardContent>
          </Card>
        </FadeIn>

        <div className="space-y-4">
          <FadeIn className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-slateInk">
              <span className="hidden sm:inline">{tCommon('filters')}:</span>
              <span className="font-semibold text-ink">{hasFilters ? tJobs('filtered') : tJobs('allJobs')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MobileFilterDrawer>{MobileFilters}</MobileFilterDrawer>
              <Link href={{ pathname: '/jobs', query: { ...queryWithPage(1), view: 'grid' } }}>
                <Button type="button" size="sm" variant={view === 'grid' ? 'primary' : 'secondary'}>
                  {tJobs('grid')}
                </Button>
              </Link>
              <Link href={{ pathname: '/jobs', query: { ...queryWithPage(1), view: 'list' } }}>
                <Button type="button" size="sm" variant={view === 'list' ? 'primary' : 'secondary'}>
                  {tJobs('list')}
                </Button>
              </Link>
            </div>
          </FadeIn>

          {jobs.length === 0 ? (
            <FadeIn>
              <Card className="border-transparent gradient-border">
                <CardContent className="space-y-3 p-8 text-center text-slateInk">
                  <EmptyJobsIllustration />
                  <p className="text-sm">{tJobs('noJobs')}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ) : (
            <Stagger className={view === 'list' ? 'space-y-4' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>
              {jobs.map((job) => (
                <StaggerItem key={job.id}>
                  <Card className="group overflow-hidden border-transparent gradient-border">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{mapContract(job.contractType)}</Badge>
                        <Badge className="border-slate-300 bg-slate-100 text-slateInk">{job.service.name}</Badge>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-lg font-bold text-ink">{job.title}</h2>
                        <p className="flex items-center gap-1 text-sm text-slateInk">
                          <MapPin size={14} />
                          {job.wilaya} - {job.city}
                        </p>
                      </div>

                      <p className="text-sm text-slateInk">
                        {tJobs('experience')}: {job.experienceYears} {tJobs('years')}
                      </p>

                      <p className="line-clamp-3 text-sm leading-7 text-slateInk">{job.description}</p>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <Link href={`/jobs/${job.id}`} className="inline-flex">
                          <Button size="sm" variant="secondary">
                            {tJobs('details')}
                            <ArrowRight size={14} className="mirror-rtl" />
                          </Button>
                        </Link>
                        <Link href={`/jobs/${job.id}/apply`} className="inline-flex">
                          <Button size="sm">{tJobs('apply')}</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          )}

          <FadeIn delay={0.05}>
            <Card className="border-transparent gradient-border">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <span className="text-sm text-slateInk">
                  {tCommon('page')} {page} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Link href={{ pathname: '/jobs', query: queryWithPage(Math.max(1, page - 1)) }}>
                    <Button variant="secondary" disabled={page <= 1}>
                      {tCommon('previous')}
                    </Button>
                  </Link>
                  <Link href={{ pathname: '/jobs', query: queryWithPage(Math.min(totalPages, page + 1)) }}>
                    <Button variant="secondary" disabled={page >= totalPages}>
                      {tCommon('next')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
