'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { routing } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils';

const localeConfig = {
  fr: { name: 'FR', flag: '/flags/fr.svg' },
  en: { name: 'EN', flag: '/flags/en.svg' },
  ar: { name: 'AR', flag: '/flags/ar.svg' }
} as const;

export function LanguageSwitcher(): React.JSX.Element {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const updateLocale = (nextLocale: string): void => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    localStorage.setItem('preferredLocale', nextLocale);
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  };

  const current = localeConfig[locale as keyof typeof localeConfig] ?? localeConfig.fr;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-2.5 text-xs font-semibold text-ink shadow-xs transition hover:border-brand-500/30 hover:text-brand-700"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('language')}
      >
        <Image src={current.flag} alt={current.name} width={16} height={16} className="h-4 w-4 rounded-full" />
        <span>{current.name}</span>
        <ChevronDown
          size={14}
          className={cn('transition-transform', open ? 'rotate-180' : 'rotate-0')}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute right-0 z-[90] mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="listbox"
          >
            {routing.locales.map((item) => {
              const cfg = localeConfig[item];
              const active = locale === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateLocale(item)}
                  aria-label={t('switchTo', { locale: cfg.name })}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition',
                    active
                      ? 'bg-brand-500/10 text-brand-700'
                      : 'text-slateInk hover:bg-slate-100 hover:text-ink'
                  )}
                >
                  <Image src={cfg.flag} alt={cfg.name} width={16} height={16} className="h-4 w-4 rounded-full" />
                  <span>{cfg.name}</span>
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

