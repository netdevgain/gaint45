'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch, apiPath } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MobileFilterDrawer } from '@/components/mobile-filter-drawer';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';

interface ApplicationItem {
  id: string;
  status: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    city?: string | null;
    wilaya?: string | null;
  };
  job: {
    id: string;
    translations: Array<{ locale: string; title: string }>;
    service: { translations: Array<{ locale: string; name: string }> };
  };
}

interface ApplicationDetail {
  id: string;
  status: string;
  coverLetter?: string | null;
  cvOriginalName: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    birthDate?: string | null;
    city?: string | null;
    wilaya?: string | null;
    address?: string | null;
  };
  job: {
    translations: Array<{ locale: string; title: string }>;
    contractType: string;
    city: string;
    wilaya: string;
  };
  statusHistory: Array<{
    id: string;
    fromStatus?: string | null;
    toStatus: string;
    note?: string | null;
    createdAt: string;
    changedBy?: { firstName: string; lastName: string } | null;
  }>;
}

type StatusKey =
  | 'RECEIVED'
  | 'IN_REVIEW'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'INTERVIEW_SCHEDULED'
  | 'HIRED';

const statusOptions: StatusKey[] = [
  'RECEIVED',
  'IN_REVIEW',
  'SHORTLISTED',
  'REJECTED',
  'INTERVIEW_SCHEDULED',
  'HIRED'
];

function resolveTranslatedTitle(item: ApplicationItem | ApplicationDetail, locale: string): string {
  return (
    item.job.translations.find((translation) => translation.locale === locale)?.title ??
    item.job.translations.find((translation) => translation.locale === 'fr')?.title ??
    item.job.translations[0]?.title ??
    ''
  );
}

export default function AdminApplicationsPage(): React.JSX.Element {
  const locale = useLocale();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('status');

  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [status, setStatus] = useState<StatusKey>('IN_REVIEW');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const load = useCallback(async (): Promise<void> => {
    try {
      const payload = await apiFetch<{ data?: { items?: ApplicationItem[] } }>('/admin/applications', {
        method: 'GET',
        query: {
          search: filters.search || undefined,
          status: filters.status || undefined,
          page: 1,
          pageSize: 50
        }
      });
      setItems(payload.data?.items ?? []);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }, [filters.search, filters.status]);

  const loadDetail = async (id: string): Promise<void> => {
    try {
      setSelectedId(id);
      const payload = await apiFetch<{ item?: ApplicationDetail }>(`/admin/applications/${id}`, {
        method: 'GET'
      });
      const current = payload.item ?? null;
      setDetail(current);
      if (current) {
        setStatus(current.status as StatusKey);
      }
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedId) return;

    setError(null);

    try {
      await apiFetch(`/admin/applications/${selectedId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          toStatus: status,
          note: note || undefined
        })
      });

      setMessage(tCommon('success'));
      setNote('');
      await load();
      await loadDetail(selectedId);
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  };

  const addNote = async (): Promise<void> => {
    if (!selectedId || !note.trim()) return;

    setError(null);

    try {
      await apiFetch(`/admin/applications/${selectedId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });

      setNote('');
      await loadDetail(selectedId);
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  };

  const exportUrl = useMemo(
    () =>
      apiPath('/admin/applications/export', {
        search: filters.search || undefined,
        status: filters.status || undefined
      }),
    [filters.search, filters.status]
  );

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="section-title">{tAdmin('applications')}</h1>
      </FadeIn>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-accent">{error}</p> : null}

      <div className="lg:hidden">
        <MobileFilterDrawer>
          <Input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder={tAdmin('searchPlaceholder')}
          />
          <Select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">{tAdmin('allStatuses')}</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {tStatus(option)}
              </option>
            ))}
          </Select>
          <a href={exportUrl} target="_blank" rel="noreferrer" className="block">
            <Button variant="secondary" className="w-full">
              {tAdmin('exportCsv')}
            </Button>
          </a>
        </MobileFilterDrawer>
      </div>

      <Card className="hidden lg:block">
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <Input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder={tAdmin('searchPlaceholder')}
            className="max-w-xs"
          />
          <Select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="max-w-xs"
          >
            <option value="">{tAdmin('allStatuses')}</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {tStatus(option)}
              </option>
            ))}
          </Select>
          <a href={exportUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">{tAdmin('exportCsv')}</Button>
          </a>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('applications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Stagger className="space-y-2" delayChildren={0.03} staggerChildren={0.05}>
              {items.map((item) => (
                <StaggerItem key={item.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(item.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedId === item.id
                        ? 'border-brand-700 bg-brand-500/5 shadow-xs'
                        : 'border-slate-200 hover:border-brand-500/30 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-semibold text-ink">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-sm text-slateInk">{item.user.email}</p>
                    <p className="text-sm text-slateInk">{resolveTranslatedTitle(item, locale)}</p>
                    <p className="text-xs font-semibold text-brand-700">{tStatus(item.status as StatusKey)}</p>
                  </button>
                </StaggerItem>
              ))}
            </Stagger>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('openDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!detail ? (
              <p className="text-slateInk">{tAdmin('noSelection')}</p>
            ) : (
              <>
                <div className="space-y-1 text-sm text-slateInk">
                  <p>
                    <strong>{tAdmin('candidate')}:</strong> {detail.user.firstName} {detail.user.lastName}
                  </p>
                  <p>
                    <strong>{tAdmin('email')}:</strong> {detail.user.email}
                  </p>
                  <p>
                    <strong>{tAdmin('location')}:</strong> {detail.user.wilaya ?? detail.job.wilaya} -{' '}
                    {detail.user.city ?? detail.job.city}
                  </p>
                  <p>
                    <strong>{tAdmin('job')}:</strong> {resolveTranslatedTitle(detail, locale)}
                  </p>
                  <p>
                    <strong>{tAdmin('status')}:</strong> {tStatus(detail.status as StatusKey)}
                  </p>
                </div>

                <a
                  href={apiPath(`/admin/applications/${detail.id}/cv`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm font-semibold text-brand-700"
                >
                  {tAdmin('downloadCv')}
                </a>

                {detail.coverLetter ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slateInk">
                    {detail.coverLetter}
                  </div>
                ) : null}

                <form className="space-y-2" onSubmit={(event) => void changeStatus(event)}>
                  <Select value={status} onChange={(event) => setStatus(event.target.value as StatusKey)}>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {tStatus(option)}
                      </option>
                    ))}
                  </Select>
                  <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={tAdmin('internalNote')} />
                  <div className="flex gap-2">
                    <Button>{tAdmin('changeStatus')}</Button>
                    <Button type="button" variant="secondary" onClick={() => void addNote()}>
                      {tAdmin('addNote')}
                    </Button>
                  </div>
                </form>

                <div className="space-y-2">
                  {detail.statusHistory.map((history) => (
                    <div key={history.id} className="rounded-xl border border-slate-200 p-2 text-xs text-slateInk">
                      <p>
                        {(history.fromStatus ? tStatus(history.fromStatus as StatusKey) : '-') + ' -> ' +
                          tStatus(history.toStatus as StatusKey)}
                      </p>
                      {history.note ? <p>{history.note}</p> : null}
                      <p>{new Date(history.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
