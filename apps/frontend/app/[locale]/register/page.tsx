'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { apiFetch } from '@/lib/api';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
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

export default function RegisterPage(): React.JSX.Element {
  const locale = useLocale();
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

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

    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    if (currentPassword !== confirmPassword) {
      setError(tAuth('passwordMismatch'));
      return;
    }

    const body = {
      firstName: String(formData.get('firstName') || '').trim(),
      lastName: String(formData.get('lastName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      password: currentPassword,
      phone: String(formData.get('phone') || '').trim(),
      preferredLocale: String(formData.get('preferredLocale') || locale),
      website: String(formData.get('website') || '')
    };

    setLoading(true);

    try {
      await apiFetch<{ user: { id: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      await refreshUser();
      router.push('/dashboard');
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn>
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-brand-700">{tAuth('registerTitle')}</CardTitle>
          <p className="text-sm text-slateInk">{tAuth('registerSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
            <Input name="firstName" placeholder={tAuth('firstName')} required />
            <Input name="lastName" placeholder={tAuth('lastName')} required />
            <Input type="email" name="email" placeholder={tAuth('email')} className="md:col-span-2" required />

            <Input
              type="password"
              name="password"
              placeholder={tAuth('password')}
              className="md:col-span-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder={tAuth('confirmPassword')}
              className="md:col-span-2"
              required
            />

            <div className="md:col-span-2 text-xs text-slateInk">
              {tAuth('passwordHint')} · <span className="font-semibold text-brand-700">{strengthLabel}</span>
            </div>

            <Input name="phone" placeholder={tAuth('phone')} className="md:col-span-2" />
            <Select name="preferredLocale" defaultValue={locale} className="md:col-span-2">
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </Select>
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

            {error ? <p className="md:col-span-2 text-sm text-accent">{error}</p> : null}

            <Button type="submit" className="md:col-span-2" disabled={loading}>
              {loading ? tCommon('loading') : tAuth('registerTitle')}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slateInk">
            {tAuth('haveAccount')}{' '}
            <Link href="/login" className="font-semibold text-brand-700">
              {tAuth('loginTitle')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
