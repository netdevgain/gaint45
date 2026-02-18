'use client';

import { Facebook, Globe2, Linkedin, Mail, Phone, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { BrandLogo } from '@/components/brand-logo';
import { cn } from '@/lib/utils';

export function Footer(): React.JSX.Element {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="mt-20">
      <div className="shell-container">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
      </div>

      <div className="shell-container py-12">
        <div className="grid gap-6 md:grid-cols-[1.5fr,1fr,1fr,0.9fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
            <BrandLogo compact />
            <p className="text-sm font-semibold text-brand-900">{t('company')}</p>
            <p className="text-sm text-slateInk">{t('address')}</p>
            <a
              href={t('website')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
              target="_blank"
              rel="noreferrer"
            >
              <Globe2 size={14} />
              {t('website')}
            </a>

            <div className="grid gap-2 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slateInk shadow-xs">
              <p className="inline-flex items-center gap-2">
                <Phone size={14} className="text-brand-700" />
                {t('contactPhones')}
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail size={14} className="text-brand-700" />
                {t('contactEmail')}
              </p>
              <p className="pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slateInk">{nav('sav')}</p>
              <p className="text-sm text-slateInk">{t('savPhones')}</p>
              <p className="text-sm text-slateInk">{t('savEmail')}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm shadow-sm backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slateInk">{t('navigation')}</p>
            <div className="grid gap-1 text-ink">
              <Link href="/" className="transition hover:text-brand-700">
                {nav('home')}
              </Link>
              <Link href="/about" className="transition hover:text-brand-700">
                {nav('about')}
              </Link>
              <Link href="/jobs" className="transition hover:text-brand-700">
                {nav('jobs')}
              </Link>
              <Link href="/contact" className="transition hover:text-brand-700">
                {nav('contact')}
              </Link>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm shadow-sm backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slateInk">{t('support')}</p>
            <div className="grid gap-1 text-ink">
              <Link href="/sav" className="transition hover:text-brand-700">
                {nav('sav')}
              </Link>
              <Link href="/catalog" className="transition hover:text-brand-700">
                {nav('catalog')}
              </Link>
              <Link href="/news" className="transition hover:text-brand-700">
                {nav('news')}
              </Link>
              <Link href="/showroom" className="transition hover:text-brand-700">
                {nav('showroom')}
              </Link>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-sm shadow-sm backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slateInk">{t('follow')}</p>
            <p className="text-sm text-slateInk">{t('followHint')}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Youtube, label: 'YouTube' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={item.label}
                    className={cn(
                      'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slateInk shadow-xs transition',
                      'hover:-translate-y-0.5 hover:border-brand-500/35 hover:text-brand-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35'
                    )}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-200/70 pt-4 text-xs text-slateInk">
          © {new Date().getFullYear()} {t('company')} · {t('rights')}
        </p>
      </div>
    </footer>
  );
}
