'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from './auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { AlgeriaLocationSelects } from './algeria-location-selects';

interface ApplyJobFormProps {
  locale: string;
  jobId: string;
}

const allowedTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const maxSize = 5 * 1024 * 1024;

export function ApplyJobForm({ locale, jobId }: ApplyJobFormProps): React.JSX.Element {
  const tAuth = useTranslations('auth');
  const tApply = useTranslations('apply');
  const tCommon = useTranslations('common');
  const { user, loading } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      const next = `/${locale}/jobs/${jobId}/apply`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, user, locale, jobId, router]);

  const validateCv = (file: File | null): string | null => {
    if (!file) {
      return tAuth('requiredCv');
    }

    if (!allowedTypes.has(file.type)) {
      return tAuth('invalidCv');
    }

    if (file.size > maxSize) {
      return tAuth('maxCvSize');
    }

    return null;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('jobId', jobId);

    const cv = formData.get('cv');
    const cvError = validateCv(cv instanceof File ? cv : null);
    if (cvError) {
      setError(cvError);
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch<{ item: { id: string } }>('/applications', {
        method: 'POST',
        body: formData
      });

      setSuccess(true);
      form.reset();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <div className="panel p-8 text-sm text-slateInk">{tCommon('loading')}</div>;
  }

  if (success) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl text-brand-700">{tApply('successTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slateInk">{tApply('successDescription')}</p>
          <Button onClick={() => router.push('/dashboard')}>{tApply('goDashboard')}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl text-brand-700">{tApply('title')}</CardTitle>
        <p className="text-sm text-slateInk">{tApply('subtitle')}</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
          <Input name="firstName" defaultValue={user.firstName} placeholder={tAuth('firstName')} required />
          <Input name="lastName" defaultValue={user.lastName} placeholder={tAuth('lastName')} required />
          <Input name="email" type="email" defaultValue={user.email} placeholder={tAuth('email')} required />
          <Input name="phone" defaultValue={user.phone ?? ''} placeholder={tAuth('phone')} required />
          <Input
            name="birthDate"
            type="date"
            defaultValue={user.birthDate ? user.birthDate.slice(0, 10) : ''}
            required
          />
          <Input name="address" defaultValue={user.address ?? ''} placeholder={tAuth('address')} />
          <AlgeriaLocationSelects
            locale={locale}
            defaultWilaya={user.wilaya ?? ''}
            defaultCity={user.city ?? ''}
            wilayaPlaceholder={tAuth('wilaya')}
            cityPlaceholder={tAuth('city')}
            required
            className="grid gap-3 md:col-span-2"
          />

          <Select name="preferredLocale" defaultValue={user.preferredLocale}>
            <option value="fr">FR</option>
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </Select>

          <Input name="cv" type="file" accept=".pdf,.doc,.docx" required />
          <div className="md:col-span-2">
            <Textarea name="coverLetter" placeholder={tAuth('coverLetter')} />
          </div>

          {error ? <p className="md:col-span-2 text-sm text-accent">{error}</p> : null}

          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? tCommon('loading') : tCommon('submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
