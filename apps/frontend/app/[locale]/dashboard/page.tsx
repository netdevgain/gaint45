'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { RequireAuth } from '@/components/require-auth';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { apiFetch, apiPath } from '@/lib/api';
import { Link } from '@/lib/i18n/navigation';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';
import { AlgeriaLocationSelects } from '@/components/algeria-location-selects';

interface CandidateApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  submittedAt: string;
  status: string;
  statusLabel: string;
}

interface CvMeta {
  cvOriginalName?: string | null;
  cvSize?: number | null;
}

type StatusKey =
  | 'RECEIVED'
  | 'IN_REVIEW'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'INTERVIEW_SCHEDULED'
  | 'HIRED';

type Tab = 'profile' | 'cv' | 'applications';

const allowedTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const maxSize = 5 * 1024 * 1024;

export default function DashboardPage(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('status');
  const tAuth = useTranslations('auth');
  const { user, refreshUser } = useAuth();

  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [cvMeta, setCvMeta] = useState<CvMeta | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async (): Promise<void> => {
    const payload = await apiFetch<{ items: CandidateApplication[] }>('/applications/me', {
      method: 'GET',
      query: {
        locale
      }
    });
    setApplications(payload.items ?? []);
  }, [locale]);

  const loadCv = useCallback(async (): Promise<void> => {
    const payload = await apiFetch<{ item: CvMeta }>('/users/me/cv', {
      method: 'GET'
    });
    setCvMeta(payload.item ?? null);
  }, []);

  useEffect(() => {
    void loadApplications();
    void loadCv();
  }, [loadApplications, loadCv]);

  const updateProfile = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const body = {
      firstName: String(formData.get('firstName') || '').trim(),
      lastName: String(formData.get('lastName') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      birthDate: String(formData.get('birthDate') || ''),
      address: String(formData.get('address') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      wilaya: String(formData.get('wilaya') || '').trim(),
      preferredLocale: String(formData.get('preferredLocale') || locale)
    };

    setLoading(true);

    try {
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body)
      });

      await refreshUser();
      setMessage(t('profileSaved'));
    } catch (updateError) {
      setError((updateError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const uploadCv = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get('cv');

    if (!(file instanceof File)) {
      setError(tAuth('requiredCv'));
      return;
    }

    if (!allowedTypes.has(file.type)) {
      setError(tAuth('invalidCv'));
      return;
    }

    if (file.size > maxSize) {
      setError(tAuth('maxCvSize'));
      return;
    }

    setLoading(true);

    try {
      await apiFetch('/users/me/cv', {
        method: 'POST',
        body: formData
      });

      await loadCv();
      setMessage(t('cvSaved'));
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth locale={locale}>
      <div className="space-y-6">
        <FadeIn className="space-y-2">
          <h1 className="section-title">{t('title')}</h1>
          <p className="section-subtitle">{t('subtitle')}</p>
        </FadeIn>

        <FadeIn className="panel-soft flex flex-wrap gap-2 p-2">
          <Button variant={tab === 'profile' ? 'primary' : 'secondary'} onClick={() => setTab('profile')}>
            {t('profile')}
          </Button>
          <Button variant={tab === 'cv' ? 'primary' : 'secondary'} onClick={() => setTab('cv')}>
            {t('myCv')}
          </Button>
          <Button variant={tab === 'applications' ? 'primary' : 'secondary'} onClick={() => setTab('applications')}>
            {t('applications')}
          </Button>
        </FadeIn>

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-accent">{error}</p> : null}

        {tab === 'profile' ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('updateProfile')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void updateProfile(event)}>
                <Input name="firstName" defaultValue={user?.firstName ?? ''} placeholder={tAuth('firstName')} required />
                <Input name="lastName" defaultValue={user?.lastName ?? ''} placeholder={tAuth('lastName')} required />
                <Input name="phone" defaultValue={user?.phone ?? ''} placeholder={tAuth('phone')} required />
                <Input
                  name="birthDate"
                  type="date"
                  defaultValue={user?.birthDate ? user.birthDate.slice(0, 10) : ''}
                  required
                />
                <Input name="address" defaultValue={user?.address ?? ''} placeholder={tAuth('address')} />
                <AlgeriaLocationSelects
                  locale={locale}
                  defaultWilaya={user?.wilaya ?? ''}
                  defaultCity={user?.city ?? ''}
                  wilayaPlaceholder={tAuth('wilaya')}
                  cityPlaceholder={tAuth('city')}
                  required
                  className="grid gap-3 md:col-span-2"
                />
                <Select name="preferredLocale" defaultValue={user?.preferredLocale ?? locale}>
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                  <option value="ar">AR</option>
                </Select>
                <Button className="md:col-span-2" disabled={loading}>
                  {loading ? tCommon('loading') : t('updateProfile')}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {tab === 'cv' ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('myCv')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-3" onSubmit={(event) => void uploadCv(event)}>
                <Input type="file" name="cv" accept=".pdf,.doc,.docx" required />
                <Button disabled={loading}>{t('replaceCv')}</Button>
              </form>

              {cvMeta?.cvOriginalName ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-ink">{t('currentCv')}</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-slateInk">
                    <FileText size={14} />
                    {cvMeta.cvOriginalName}
                  </p>
                  <a
                    href={apiPath('/users/me/cv/download')}
                    className="mt-3 inline-flex text-sm font-semibold text-brand-700"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('downloadCv')}
                  </a>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {tab === 'applications' ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('applications')}</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-slateInk">{t('noApplications')}</p>
              ) : (
                <Stagger className="space-y-3" delayChildren={0.04} staggerChildren={0.06}>
                  {applications.map((application) => (
                    <StaggerItem key={application.id}>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-ink">{application.jobTitle}</p>
                            <p className="text-sm text-slateInk">
                              {t('applicationDate')}: {new Date(application.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700">
                            {tStatus(application.status as StatusKey)}
                          </p>
                        </div>

                        <Link href={`/applications/${application.id}`} className="mt-3 inline-flex text-sm font-semibold text-brand-700">
                          {t('applicationDetails')}
                        </Link>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </CardContent>
          </Card>
        ) : null}

      </div>
    </RequireAuth>
  );
}
