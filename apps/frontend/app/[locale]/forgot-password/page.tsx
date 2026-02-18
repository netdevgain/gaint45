'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';
import { apiFetch } from '@/lib/api';
import { FadeIn } from '@/components/motion/reveal';

export default function ForgotPasswordPage(): React.JSX.Element {
  const locale = useLocale();
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    setLoading(true);

    try {
      await apiFetch('/auth/forgot', {
        method: 'POST',
        body: JSON.stringify({
          email: String(formData.get('email') || '').trim(),
          locale
        })
      });
      setSuccess(true);
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
          <CardTitle className="text-2xl text-brand-700">{tAuth('forgotTitle')}</CardTitle>
          <p className="text-sm text-slateInk">{tAuth('forgotSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(event) => void submit(event)}>
            <Input type="email" name="email" placeholder={tAuth('email')} required />
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            {success ? <p className="text-sm text-success">{tAuth('requestSent')}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tCommon('loading') : tAuth('sendReset')}
            </Button>
          </form>

          <p className="mt-4 text-sm">
            <Link href="/login" className="font-semibold text-brand-700">
              {tAuth('backToLogin')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
