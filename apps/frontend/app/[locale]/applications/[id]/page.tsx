'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { RequireAuth } from '@/components/require-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

interface ApplicationDetail {
  id: string;
  status: string;
  statusLabel: string;
  coverLetter?: string | null;
  submittedAt: string;
  job: {
    id: string;
    title: string;
    wilaya: string;
    city: string;
    contractType: string;
  };
  history: Array<{
    id: string;
    fromStatus?: string | null;
    toStatus: string;
    note?: string | null;
    createdAt: string;
    changedBy?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null;
  }>;
}

type StatusKey =
  | 'RECEIVED'
  | 'IN_REVIEW'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'INTERVIEW_SCHEDULED'
  | 'HIRED';

export default function CandidateApplicationDetailPage(): React.JSX.Element {
  const locale = useLocale();
  const tDashboard = useTranslations('dashboard');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const params = useParams<{ id: string }>();

  const [item, setItem] = useState<ApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        const payload = await apiFetch<{ item: ApplicationDetail }>(`/applications/${params.id}`, {
          method: 'GET',
          query: {
            locale
          }
        });
        setItem(payload.item ?? null);
      } catch (requestError) {
        setError((requestError as Error).message);
      }
    };

    void run();
  }, [params.id, locale]);

  return (
    <RequireAuth locale={locale}>
      <Card>
        <CardHeader>
          <CardTitle>{item?.job.title ?? tDashboard('applicationDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-accent">{error}</p> : null}

          {!item ? (
            <p className="text-slateInk">{tCommon('loading')}</p>
          ) : (
            <>
              <p className="text-sm text-slateInk">
                {item.job.wilaya} - {item.job.city} | {item.job.contractType}
              </p>
              <p className="text-sm font-semibold text-brand-700">
                {tDashboard('status')}: {tStatus(item.status as StatusKey)}
              </p>

              {item.coverLetter ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slateInk">
                  {item.coverLetter}
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink">{tDashboard('timeline')}</p>
                {item.history.map((history) => (
                  <div key={history.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                    <p className="font-semibold text-ink">{tStatus(history.toStatus as StatusKey)}</p>
                    {history.note ? <p className="text-slateInk">{history.note}</p> : null}
                    <p className="text-xs text-slate-500">{new Date(history.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </RequireAuth>
  );
}
