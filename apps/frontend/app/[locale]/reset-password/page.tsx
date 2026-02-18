'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';
import { apiFetch } from '@/lib/api';
import { FadeIn } from '@/components/motion/reveal';

function passwordStrength(value: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;

  if (score >= 3) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
}

function ResetPasswordInner(): React.JSX.Element {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const strengthLabel =
    strength === 'strong'
      ? tAuth('passwordStrengthStrong')
      : strength === 'medium'
        ? tAuth('passwordStrengthMedium')
        : tAuth('passwordStrengthWeak');

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(tAuth('passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      await apiFetch('/auth/reset', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword: password
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
          <CardTitle className="text-2xl text-brand-700">{tAuth('resetTitle')}</CardTitle>
          <p className="text-sm text-slateInk">{tAuth('resetSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(event) => void submit(event)}>
            <Input
              type="password"
              name="password"
              placeholder={tAuth('password')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder={tAuth('confirmPassword')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <p className="text-xs text-slateInk">
              {tAuth('passwordHint')} · <span className="font-semibold text-brand-700">{strengthLabel}</span>
            </p>

            {error ? <p className="text-sm text-accent">{error}</p> : null}
            {success ? <p className="text-sm text-success">{tAuth('resetSuccess')}</p> : null}

            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? tCommon('loading') : tCommon('submit')}
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

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="panel p-8" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
