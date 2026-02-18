import { Clock3, Headset, Mail, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';
import { Card, CardContent } from '@/components/ui/card';

interface SavEntry {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

export default async function SavPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('sav');
  const tFooter = await getTranslations('footer');

  const entries: SavEntry[] = [
    {
      label: t('phoneLabel'),
      value: tFooter('savPhones'),
      icon: PhoneCall
    },
    {
      label: t('emailLabel'),
      value: tFooter('savEmail'),
      icon: Mail,
      href: `mailto:${tFooter('savEmail')}`
    },
    {
      label: t('addressLabel'),
      value: tFooter('address'),
      icon: MapPin
    },
    {
      label: t('hoursLabel'),
      value: t('hours'),
      icon: Clock3
    }
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <section className="panel hero-grid relative overflow-hidden rounded-[1.9rem] border-brand-500/20 bg-gradient-to-br from-white via-white to-brand-500/10 px-6 py-9 md:px-10 md:py-11">
          <div className="relative z-[1] grid gap-6 md:grid-cols-[1.35fr,1fr] md:items-end">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
                <Headset size={14} />
                {t('title')}
              </p>
              <h1 className="section-title md:max-w-xl">{t('subtitle')}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slateInk md:text-[0.98rem]">
                {t('title')} - {t('hoursLabel')}: {t('hours')}
              </p>
            </div>

            <div className="rounded-2xl border border-brand-500/15 bg-white/80 p-4 shadow-xs backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                <ShieldCheck size={14} />
                {t('hoursLabel')}
              </p>
              <p className="mt-2 text-sm font-medium text-slateInk">{t('hours')}</p>
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
                      className="mt-2 inline-flex items-center text-sm font-semibold text-brand-700 transition hover:text-brand-500"
                    >
                      {entry.value}
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
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slateInk">{t('title')}</p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slateInk">{t('subtitle')}</p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
