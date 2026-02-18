'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { FadeIn } from '@/components/motion/reveal';
import {
  getLocalizedCommuneOptions,
  getLocalizedWilayaOptions,
  resolveCommuneForWilaya,
  resolveWilaya
} from '@/lib/algeria-locations';

interface ServiceItem {
  id: string;
  email?: string | null;
  phone?: string | null;
  translations: Array<{ locale: 'fr' | 'en' | 'ar'; name: string }>;
}

interface JobItem {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  contractType: 'CDI' | 'CDD' | 'STAGE';
  wilaya: string;
  city: string;
  experienceYears: number;
  service: { id: string; name: string };
  translations: Array<{ locale: 'fr' | 'en' | 'ar'; title: string; description: string }>;
}

interface FormState {
  id: string;
  serviceId: string;
  contractType: 'CDI' | 'CDD' | 'STAGE';
  wilaya: string;
  city: string;
  experienceYears: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  publishedAt: string;
  closingAt: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionAr: string;
}

const emptyForm: FormState = {
  id: '',
  serviceId: '',
  contractType: 'CDI',
  wilaya: '',
  city: '',
  experienceYears: 0,
  status: 'DRAFT',
  publishedAt: '',
  closingAt: '',
  titleFr: '',
  titleEn: '',
  titleAr: '',
  descriptionFr: '',
  descriptionEn: '',
  descriptionAr: ''
};

function serviceLabel(service: ServiceItem, locale: string): string {
  return (
    service.translations.find((item) => item.locale === locale)?.name ??
    service.translations.find((item) => item.locale === 'fr')?.name ??
    service.translations[0]?.name ??
    ''
  );
}

export default function AdminJobsPage(): React.JSX.Element {
  const locale = useLocale();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tJobs = useTranslations('jobs');

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteJob, setDeleteJob] = useState<JobItem | null>(null);

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);
  const wilayaOptions = useMemo(() => getLocalizedWilayaOptions(locale), [locale]);
  const cityOptions = useMemo(() => getLocalizedCommuneOptions(form.wilaya, locale), [form.wilaya, locale]);

  const load = useCallback(async (): Promise<void> => {
    const [jobsPayload, servicesPayload] = await Promise.all([
      apiFetch<{ data: { items: JobItem[] } }>('/admin/jobs', {
        method: 'GET',
        query: {
          locale
        }
      }),
      apiFetch<{ items: ServiceItem[] }>('/admin/services', {
        method: 'GET'
      })
    ]);

    setJobs(jobsPayload.data?.items ?? []);
    setServices(servicesPayload.items ?? []);
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!form.city) {
      return;
    }

    const commune = resolveCommuneForWilaya(form.wilaya, form.city);
    if (!commune) {
      setForm((prev) => ({ ...prev, city: '' }));
    }
  }, [form.wilaya, form.city]);

  const reset = (): void => {
    setForm(emptyForm);
    setError(null);
    setMessage(null);
  };

  const edit = (job: JobItem): void => {
    const fr = job.translations.find((item) => item.locale === 'fr');
    const en = job.translations.find((item) => item.locale === 'en');
    const ar = job.translations.find((item) => item.locale === 'ar');

    const normalizedWilaya = resolveWilaya(job.wilaya)?.name ?? job.wilaya;
    const normalizedCity = resolveCommuneForWilaya(normalizedWilaya, job.city)?.name ?? job.city;

    setForm({
      id: job.id,
      serviceId: job.service.id,
      contractType: job.contractType,
      wilaya: normalizedWilaya,
      city: normalizedCity,
      experienceYears: job.experienceYears,
      status: job.status,
      publishedAt: '',
      closingAt: '',
      titleFr: fr?.title ?? '',
      titleEn: en?.title ?? '',
      titleAr: ar?.title ?? '',
      descriptionFr: fr?.description ?? '',
      descriptionEn: en?.description ?? '',
      descriptionAr: ar?.description ?? ''
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await apiFetch('/admin/jobs' + (form.id ? `/${form.id}` : ''), {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({
          serviceId: form.serviceId,
          contractType: form.contractType,
          wilaya: form.wilaya,
          city: form.city,
          experienceYears: Number(form.experienceYears),
          status: form.status,
          publishedAt: form.publishedAt || undefined,
          closingAt: form.closingAt || undefined,
          translations: [
            { locale: 'fr', title: form.titleFr, description: form.descriptionFr },
            { locale: 'en', title: form.titleEn, description: form.descriptionEn },
            { locale: 'ar', title: form.titleAr, description: form.descriptionAr }
          ]
        })
      });

      setMessage(tCommon('success'));
      reset();
      await load();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (): Promise<void> => {
    if (!deleteJob) {
      return;
    }

    try {
      await apiFetch(`/admin/jobs/${deleteJob.id}`, {
        method: 'DELETE'
      });
      setDeleteJob(null);
      await load();
    } catch (removeError) {
      setError((removeError as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="section-title">{tAdmin('jobs')}</h1>
      </FadeIn>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? `${tAdmin('edit')} ${tAdmin('jobs')}` : tAdmin('newJob')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
            <Select
              value={form.serviceId}
              onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))}
              required
            >
              <option value="">{tJobs('department')}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {serviceLabel(service, locale)}
                </option>
              ))}
            </Select>

            <Select
              value={form.contractType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  contractType: event.target.value as FormState['contractType']
                }))
              }
            >
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="STAGE">Stage</option>
            </Select>

            <Select
              value={form.wilaya}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  wilaya: event.target.value,
                  city: ''
                }))
              }
              className="md:col-span-2"
              required
            >
              <option value="">{tJobs('wilaya')}</option>
              {wilayaOptions.map((wilaya) => (
                <option key={wilaya.id} value={wilaya.value}>
                  {wilaya.label}
                </option>
              ))}
            </Select>
            <Select
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              className="md:col-span-2"
              disabled={!form.wilaya}
              required
            >
              <option value="">{tJobs('city')}</option>
              {cityOptions.map((city) => (
                <option key={city.id} value={city.value}>
                  {city.label}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(event) => setForm((prev) => ({ ...prev, experienceYears: Number(event.target.value) }))}
              placeholder={tJobs('experience')}
              required
            />
            <Select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as FormState['status'] }))
              }
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CLOSED">CLOSED</option>
            </Select>
            <Input
              type="date"
              value={form.publishedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
            />
            <Input
              type="date"
              value={form.closingAt}
              onChange={(event) => setForm((prev) => ({ ...prev, closingAt: event.target.value }))}
            />

            <Input
              value={form.titleFr}
              onChange={(event) => setForm((prev) => ({ ...prev, titleFr: event.target.value }))}
              placeholder="Titre FR"
              className="md:col-span-2"
              required
            />
            <Textarea
              value={form.descriptionFr}
              onChange={(event) => setForm((prev) => ({ ...prev, descriptionFr: event.target.value }))}
              placeholder="Description FR (Markdown)"
              className="md:col-span-2"
              required
            />
            <Input
              value={form.titleEn}
              onChange={(event) => setForm((prev) => ({ ...prev, titleEn: event.target.value }))}
              placeholder="Title EN"
              className="md:col-span-2"
              required
            />
            <Textarea
              value={form.descriptionEn}
              onChange={(event) => setForm((prev) => ({ ...prev, descriptionEn: event.target.value }))}
              placeholder="Description EN (Markdown)"
              className="md:col-span-2"
              required
            />
            <Input
              value={form.titleAr}
              onChange={(event) => setForm((prev) => ({ ...prev, titleAr: event.target.value }))}
              placeholder="العنوان AR"
              className="md:col-span-2"
              required
            />
            <Textarea
              value={form.descriptionAr}
              onChange={(event) => setForm((prev) => ({ ...prev, descriptionAr: event.target.value }))}
              placeholder="الوصف AR (Markdown)"
              className="md:col-span-2"
              required
            />

            {message ? <p className="md:col-span-2 text-sm text-success">{message}</p> : null}
            {error ? <p className="md:col-span-2 text-sm text-accent">{error}</p> : null}

            <div className="md:col-span-2 flex gap-2">
              <Button disabled={loading}>{loading ? tCommon('loading') : tAdmin('saveJob')}</Button>
              <Button type="button" variant="secondary" onClick={reset}>
                {tCommon('cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin('jobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-slateInk">
                  <th className="py-2">{tAdmin('job')}</th>
                  <th className="py-2">{tAdmin('services')}</th>
                  <th className="py-2">{tAdmin('location')}</th>
                  <th className="py-2">{tAdmin('status')}</th>
                  <th className="py-2">{tCommon('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-slate-200">
                    <td className="py-2">{job.title}</td>
                    <td className="py-2">{job.service.name}</td>
                    <td className="py-2">
                      {job.wilaya} - {job.city}
                    </td>
                    <td className="py-2">{job.status}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => edit(job)}>
                          {tAdmin('edit')}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteJob(job)}>
                          {tAdmin('delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(deleteJob)}
        onOpenChange={(open) => {
          if (!open) setDeleteJob(null);
        }}
        title={tAdmin('delete')}
        description={tAdmin('confirmDeleteJob')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteJob(null)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="danger" onClick={() => void remove()}>
              {tAdmin('delete')}
            </Button>
          </>
        }
      />
    </div>
  );
}
