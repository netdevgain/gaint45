import { ArrowUpRight, Building2, Globe2, Mail, MapPin, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Card, CardContent } from '@/components/ui/card';

interface ContactEntry {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

export default async function ContactPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('contact');
  const tFooter = await getTranslations('footer');

  const entries: ContactEntry[] = [
    {
      label: t('addressLabel'),
      value: tFooter('address'),
      icon: MapPin
    },
    {
      label: t('websiteLabel'),
      value: tFooter('website'),
      icon: Globe2,
      href: tFooter('website')
    },
    {
      label: t('phoneLabel'),
      value: tFooter('contactPhones'),
      icon: Phone
    },
    {
      label: t('emailLabel'),
      value: tFooter('contactEmail'),
      icon: Mail,
      href: `mailto:${tFooter('contactEmail')}`
    }
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <section className="brand-gradient hero-grid relative overflow-hidden rounded-[1.9rem] px-6 py-9 text-white shadow-[0_30px_90px_rgba(5,20,58,0.28)] md:px-10 md:py-11">
          <div className="relative z-[1] grid gap-6 md:grid-cols-[1.35fr,1fr] md:items-end">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/90">
                <Building2 size={14} />
                {t('title')}
              </p>
              <h1 className="section-title text-white md:max-w-xl">{t('subtitle')}</h1>
              <p className="max-w-2xl text-sm leading-7 text-white/80 md:text-[0.98rem]">{t('description')}</p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">{t('cardTitle')}</p>
              <p className="mt-2 text-sm font-medium text-white/95">{tFooter('company')}</p>
            </div>
          </div>
        </section>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => {
          const Icon = entry.icon;

          return (
            <StaggerItem key={entry.label}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-700">
                    <Icon size={18} />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.13em] text-slateInk">{entry.label}</p>

                  {entry.href ? (
                    <a
                      href={entry.href}
                      target={entry.href.startsWith('http') ? '_blank' : undefined}
                      rel={entry.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-500 focus-visible:rounded-md"
                    >
                      {entry.value}
                      <ArrowUpRight size={14} className="mirror-rtl" />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm leading-7 text-slateInk">{entry.value}</p>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>

      <FadeIn>
        <Card className="ar-card-accent">
          <CardContent className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slateInk">{t('cardTitle')}</p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slateInk">{t('description')}</p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
