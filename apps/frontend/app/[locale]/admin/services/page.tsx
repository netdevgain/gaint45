'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { FadeIn } from '@/components/motion/reveal';

interface ServiceItem {
  id: string;
  email?: string | null;
  phone?: string | null;
  translations: Array<{ locale: 'fr' | 'en' | 'ar'; name: string }>;
}

const emptyForm = {
  id: '',
  email: '',
  phone: '',
  nameFr: '',
  nameEn: '',
  nameAr: ''
};

export default function AdminServicesPage(): React.JSX.Element {
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    const payload = await apiFetch<{ items: ServiceItem[] }>('/admin/services', {
      method: 'GET'
    });
    setItems(payload.items ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const edit = (item: ServiceItem): void => {
    setForm({
      id: item.id,
      email: item.email ?? '',
      phone: item.phone ?? '',
      nameFr: item.translations.find((entry) => entry.locale === 'fr')?.name ?? '',
      nameEn: item.translations.find((entry) => entry.locale === 'en')?.name ?? '',
      nameAr: item.translations.find((entry) => entry.locale === 'ar')?.name ?? ''
    });
  };

  const reset = (): void => {
    setForm(emptyForm);
    setError(null);
    setMessage(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    try {
      await apiFetch('/admin/services' + (form.id ? `/${form.id}` : ''), {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({
          email: form.email || undefined,
          phone: form.phone || undefined,
          translations: [
            { locale: 'fr', name: form.nameFr },
            { locale: 'en', name: form.nameEn },
            { locale: 'ar', name: form.nameAr }
          ]
        })
      });

      setMessage(tCommon('success'));
      reset();
      await load();
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  };

  const remove = async (): Promise<void> => {
    if (!deleteServiceId) {
      return;
    }

    try {
      await apiFetch(`/admin/services/${deleteServiceId}`, {
        method: 'DELETE'
      });
      setDeleteServiceId(null);
      await load();
    } catch (removeError) {
      setError((removeError as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="section-title">{tAdmin('services')}</h1>
      </FadeIn>

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin('serviceForm')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submit(event)}>
            <Input value={form.nameFr} onChange={(event) => setForm((prev) => ({ ...prev, nameFr: event.target.value }))} placeholder="Nom FR" required />
            <Input value={form.nameEn} onChange={(event) => setForm((prev) => ({ ...prev, nameEn: event.target.value }))} placeholder="Name EN" required />
            <Input value={form.nameAr} onChange={(event) => setForm((prev) => ({ ...prev, nameAr: event.target.value }))} placeholder="الاسم AR" required />
            <Input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder={tAdmin('email')} />
            <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder={tAdmin('companyPhone')} />

            <div className="md:col-span-2 flex gap-2">
              <Button>{tCommon('save')}</Button>
              <Button type="button" variant="secondary" onClick={reset}>
                {tCommon('cancel')}
              </Button>
            </div>

            {message ? <p className="md:col-span-2 text-sm text-success">{message}</p> : null}
            {error ? <p className="md:col-span-2 text-sm text-accent">{error}</p> : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin('services')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-ink">{item.translations.find((entry) => entry.locale === 'fr')?.name}</p>
                  <p className="text-sm text-slateInk">{item.email ?? '-'}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => edit(item)}>
                    {tAdmin('edit')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteServiceId(item.id)}>
                    {tAdmin('delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(deleteServiceId)}
        onOpenChange={(open) => {
          if (!open) setDeleteServiceId(null);
        }}
        title={tAdmin('delete')}
        description={tAdmin('confirmDeleteService')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteServiceId(null)}>
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
