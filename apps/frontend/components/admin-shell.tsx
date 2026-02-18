'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { LayoutDashboard, BriefcaseBusiness, FileStack, Building2, Users2, Settings } from 'lucide-react';
import { RequireAuth } from './require-auth';
import { cn } from '@/lib/utils';

const menuIcons = {
  overview: LayoutDashboard,
  jobs: BriefcaseBusiness,
  applications: FileStack,
  services: Building2,
  users: Users2,
  settings: Settings
} as const;

export function AdminShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('admin');
  const nav = useTranslations('nav');
  const pathname = usePathname();

  const items = [
    { key: 'overview', href: '/admin' },
    { key: 'jobs', href: '/admin/jobs' },
    { key: 'applications', href: '/admin/applications' },
    { key: 'services', href: '/admin/services' },
    { key: 'users', href: '/admin/users' },
    { key: 'settings', href: '/admin/settings' }
  ] as const;

  return (
    <RequireAuth locale={locale} requireAdmin>
      <div className="space-y-4 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="panel-soft h-fit p-4 lg:sticky lg:top-24">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.15em] text-slateInk">{nav('admin')}</p>
          <nav className="hidden space-y-1 lg:block">
            {items.map((item) => {
              const Icon = menuIcons[item.key];
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    active
                      ? 'brand-gradient text-white shadow-soft'
                      : 'text-ink hover:bg-brand-500/10 hover:text-brand-700'
                  )}
                >
                  <Icon size={16} />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {items.map((item) => {
              const Icon = menuIcons[item.key];
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition',
                    active
                      ? 'brand-gradient text-white shadow-soft'
                      : 'border border-slate-200 bg-white text-ink'
                  )}
                >
                  <Icon size={14} />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="space-y-5">{children}</section>
      </div>
    </RequireAuth>
  );
}
