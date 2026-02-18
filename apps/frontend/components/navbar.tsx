'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, Link, useRouter } from '@/lib/i18n/navigation';
import { useAuth } from './auth-provider';
import { BrandLogo } from './brand-logo';
import { LanguageSwitcher } from './language-switcher';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navItems = ['home', 'about', 'jobs', 'sav', 'contact', 'products', 'catalog', 'news', 'showroom'] as const;

export function Navbar(): React.JSX.Element {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const onLogout = async (): Promise<void> => {
    await logout();
    router.replace('/');
  };

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          'mx-auto mt-2 w-[min(1280px,calc(100%-1.25rem))] rounded-2xl px-3 py-2 transition',
          scrolled ? 'glass-nav' : 'bg-transparent'
        )}
      >
        <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.4rem]">
          <Link href="/" className="shrink-0" aria-label="Geant Electronics home">
            <BrandLogo compact className="sm:[&>img]:w-[150px]" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const href = item === 'home' ? '/' : `/${item}`;
              const active = isActive(href);
              return (
                <Link
                  key={item}
                  href={href}
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-[0.79rem] font-semibold uppercase tracking-[0.11em] transition',
                    active ? 'text-brand-900' : 'text-slateInk hover:text-brand-700'
                  )}
                >
                  <span className="relative z-[1]">{t(item)}</span>
                  {active ? (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 z-0 rounded-lg bg-brand-500/10"
                      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                    />
                  ) : null}
                  {active ? (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-brand-700"
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <Link href="/jobs" className="hidden lg:inline-flex">
              <Button size="sm">{tCommon('viewJobs')}</Button>
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className="hidden xl:inline-flex">
                  <Button size="sm" variant="secondary">
                    {t('dashboard')}
                  </Button>
                </Link>
                {['ADMIN', 'HR_MANAGER'].includes(user.role) ? (
                  <Link href="/admin" className="hidden xl:inline-flex">
                    <Button size="sm" variant="secondary">
                      {t('admin')}
                    </Button>
                  </Link>
                ) : null}
                <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => void onLogout()}>
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden xl:inline-flex">
                  <Button size="sm" variant="secondary">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:inline-flex">
                  <Button size="sm">{t('register')}</Button>
                </Link>
              </>
            )}

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slateInk shadow-xs transition hover:border-brand-500/35 hover:text-brand-700 lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={open ? t('closeMenu') : t('openMenu')}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[95] bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              className={cn(
                'absolute inset-y-0 w-[min(90vw,360px)] overflow-y-auto border-slate-200 bg-white p-4 shadow-2xl',
                isRtl ? 'left-0 border-r' : 'right-0 border-l'
              )}
              initial={reduceMotion ? false : { x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ duration: 0.26 }}
              onClick={(event: React.MouseEvent<HTMLElement>) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <BrandLogo compact />
                <button
                  type="button"
                  className="rounded-lg p-2 text-slateInk transition hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                  aria-label={t('closeMenu')}
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const href = item === 'home' ? '/' : `/${item}`;
                  const active = isActive(href);
                  return (
                    <Link
                      key={item}
                      href={href}
                      className={cn(
                        'block rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                        active ? 'bg-brand-500/10 text-brand-700' : 'text-ink hover:bg-slate-100'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {t(item)}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link
                      href="/register"
                      className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      {t('register')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      {t('dashboard')}
                    </Link>
                    {['ADMIN', 'HR_MANAGER'].includes(user.role) ? (
                      <Link
                        href="/admin"
                        className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-slate-100"
                        onClick={() => setOpen(false)}
                      >
                        {t('admin')}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink hover:bg-slate-100"
                      onClick={() => {
                        setOpen(false);
                        void onLogout();
                      }}
                    >
                      {t('logout')}
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
