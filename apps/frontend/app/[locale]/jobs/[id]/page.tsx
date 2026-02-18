import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, BriefcaseBusiness, Layers, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { serverApiFetch } from '@/lib/server-api';
import { ShareJobButton } from '@/components/share-job-button';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Glow } from '@/components/background/glow';
import { DotsPattern, GridPattern } from '@/components/background/patterns';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  contractType: string;
  wilaya: string;
  city: string;
  experienceYears: number;
  publishedAt?: string | null;
  closingAt?: string | null;
  service: { id: string; name: string };
}

function mapContract(contractType: string): string {
  if (contractType === 'STAGE') {
    return 'Stage';
  }
  return contractType;
}

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<React.JSX.Element> {
  const { locale, id } = await params;
  const t = await getTranslations('jobs');

  let job: JobDetail | null = null;

  try {
    const payload = await serverApiFetch<{ item: JobDetail }>(`/jobs/${id}`, {
      query: {
        locale
      }
    });
    job = payload.item;
  } catch {
    job = null;
  }

  if (!job) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const shareUrl = `${siteUrl}/${locale}/jobs/${job.id}`;

  return (
    <div className="page-stack">
      <FadeIn>
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
          <ArrowLeft size={14} className="mirror-rtl" />
          {t('returnToResults')}
        </Link>
      </FadeIn>

      <FadeIn>
        <section className="hero-grid relative overflow-hidden rounded-[2rem] border border-white/55 bg-white/70 px-6 py-8 shadow-strong backdrop-blur lg:px-10 lg:py-10 gradient-border">
          <GridPattern className="opacity-[0.2] text-brand-500" />
          <DotsPattern className="opacity-[0.25] text-brand-900" />
          <Glow className="-left-28 -top-36 h-[440px] w-[440px]" variant="brand" />
          <Glow className="-right-28 -bottom-40 h-[480px] w-[480px]" variant="neutral" />

          <div className="relative z-[1] space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{mapContract(job.contractType)}</Badge>
              <Badge className="border-slate-300 bg-slate-100 text-slateInk">{job.service.name}</Badge>
            </div>

            <h1 className="section-title text-[2.15rem] leading-tight">{job.title}</h1>

            <div className="flex flex-wrap gap-3 text-sm text-slateInk">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/75 px-3 py-1.5 shadow-xs">
                <MapPin size={14} className="text-brand-700" />
                {job.wilaya} - {job.city}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/75 px-3 py-1.5 shadow-xs">
                <BriefcaseBusiness size={14} className="text-brand-700" />
                {job.experienceYears}+ {t('years')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/75 px-3 py-1.5 shadow-xs">
                <Layers size={14} className="text-brand-700" />
                {job.service.name}
              </span>
            </div>
          </div>
        </section>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px] lg:items-start">
        <article className="space-y-6">
          <FadeIn>
            <Card className="border-transparent gradient-border">
              <CardHeader>
                <CardTitle>{t('jobSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <article className="prose max-w-none prose-headings:font-bold prose-headings:text-ink prose-p:text-slateInk prose-li:text-slateInk">
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{job.description}</ReactMarkdown>
                </article>
              </CardContent>
            </Card>
          </FadeIn>
        </article>

        <FadeIn className="lg:sticky lg:top-24" delay={0.04}>
          <Card className="border-transparent gradient-border">
            <CardHeader className="space-y-2">
              <CardTitle>{t('stickyTitle')}</CardTitle>
              <p className="text-sm leading-7 text-slateInk">{t('stickyText')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Stagger className="grid gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slateInk shadow-xs" delayChildren={0.05}>
                <StaggerItem>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-brand-700" />
                    {job.wilaya} - {job.city}
                  </p>
                </StaggerItem>
                <StaggerItem>
                  <p className="flex items-center gap-2">
                    <BriefcaseBusiness size={14} className="text-brand-700" />
                    {job.experienceYears}+ {t('years')}
                  </p>
                </StaggerItem>
                <StaggerItem>
                  <p className="flex items-center gap-2">
                    <Layers size={14} className="text-brand-700" />
                    {job.service.name}
                  </p>
                </StaggerItem>
              </Stagger>

              <Link href={`/jobs/${job.id}/apply`} className="block">
                <Button className="w-full" size="lg">
                  {t('apply')}
                </Button>
              </Link>
              <ShareJobButton url={shareUrl} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
