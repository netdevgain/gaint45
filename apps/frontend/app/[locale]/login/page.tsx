'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { FadeIn } from '@/components/motion/reveal';

function LoginInner(): React.JSX.Element {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useSearchParams();
  const requestedNext = params.get('next');
  const next = requestedNext && requestedNext.startsWith('/') ? requestedNext : '/dashboard';
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const body = {
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || ''),
      website: String(formData.get('website') || '')
    };

    setLoading(true);

    try {
      await apiFetch<{ user: { id: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      await refreshUser();
      router.push(next);
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-brand-700">{tAuth('loginTitle')}</CardTitle>
          <p className="text-sm text-slateInk">{tAuth('loginSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(event) => void submit(event)}>
            <Input type="email" name="email" placeholder={tAuth('email')} required />
            <Input type="password" name="password" placeholder={tAuth('password')} required />
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

            {error ? <p className="text-sm text-accent">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tCommon('loading') : tAuth('loginTitle')}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slateInk">
            <Link href="/forgot-password" className="font-semibold text-brand-700">
              {tAuth('forgotLink')}
            </Link>
            <span>
              {tAuth('noAccount')}{' '}
              <Link href="/register" className="font-semibold text-brand-700">
                {tAuth('registerTitle')}
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="panel p-8" />}>
      <LoginInner />
    </Suspense>
  );
}
