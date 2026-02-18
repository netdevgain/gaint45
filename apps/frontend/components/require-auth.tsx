'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from './auth-provider';
import { usePathname, useRouter } from '@/lib/i18n/navigation';

interface RequireAuthProps {
  locale: string;
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function RequireAuth({ locale, children, requireAdmin = false }: RequireAuthProps): React.JSX.Element {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations('common');
  const nextPath = pathname || `/${locale}`;

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (!loading && user && requireAdmin && !['ADMIN', 'HR_MANAGER'].includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [loading, user, requireAdmin, nextPath, router]);

  if (loading) {
    return <div className="panel-soft shimmer p-8 text-sm text-slateInk">{tCommon('loading')}</div>;
  }

  if (!user) {
    return <div className="panel-soft shimmer p-8 text-sm text-slateInk">{tCommon('loading')}</div>;
  }

  if (requireAdmin && !['ADMIN', 'HR_MANAGER'].includes(user.role)) {
    return <div className="panel p-8 text-sm text-slateInk">{tCommon('error')}</div>;
  }

  return <>{children}</>;
}
