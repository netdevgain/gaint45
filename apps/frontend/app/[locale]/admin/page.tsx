'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';

interface AnalyticsResponse {
  cards: {
    totalJobs: number;
    publishedJobs: number;
    totalApplications: number;
    applicationsThisMonth: number;
  };
  monthly: Array<{ month: string; total: number }>;
}

export default function AdminOverviewPage(): React.JSX.Element {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        const payload = await apiFetch<{ data: AnalyticsResponse }>('/admin/analytics', {
          method: 'GET'
        });
        setData(payload.data ?? null);
      } catch (requestError) {
        setError((requestError as Error).message);
      }
    };

    void run();
  }, []);

  const cards = data?.cards ?? {
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
    applicationsThisMonth: 0
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="section-title">{t('overview')}</h1>
      </FadeIn>

      {error ? <p className="text-sm text-accent">{error}</p> : null}

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slateInk">{t('totalJobs')}</p>
              <p className="mt-2 text-3xl font-bold text-ink">{cards.totalJobs}</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slateInk">{t('publishedJobs')}</p>
              <p className="mt-2 text-3xl font-bold text-ink">{cards.publishedJobs}</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slateInk">{t('totalApplications')}</p>
              <p className="mt-2 text-3xl font-bold text-ink">{cards.totalApplications}</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-slateInk">{t('applicationsMonth')}</p>
              <p className="mt-2 text-3xl font-bold text-ink">{cards.applicationsThisMonth}</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>

      <Card>
        <CardHeader>
          <CardTitle>{t('trendTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {!data ? (
            <p className="text-sm text-slateInk">{tCommon('loading')}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#1B56D6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
