'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { FadeIn } from '@/components/motion/reveal';

interface SettingsData {
  companyName: string;
  companyAddress: string;
  companyWebsite: string;
  companyPhone: string;
  companyEmail: string;
  savPhone: string;
  savEmail: string;
  notifyCandidateOnStatusChange: boolean;
}

interface TemplateData {
  type: 'APPLICATION_CONFIRMATION' | 'NEW_APPLICATION' | 'STATUS_UPDATE';
  locale: 'fr' | 'en' | 'ar';
  subject: string;
  body: string;
}

export default function AdminSettingsPage(): React.JSX.Element {
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateData>({
    type: 'STATUS_UPDATE',
    locale: 'fr',
    subject: '',
    body: ''
  });

  const load = async (): Promise<void> => {
    try {
      const payload = await apiFetch<{
        data?: { settings?: SettingsData; templates?: TemplateData[] };
      }>('/admin/settings', {
        method: 'GET'
      });

      setSettings(payload.data?.settings ?? null);
      setTemplates(payload.data?.templates ?? []);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submitSettings = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!settings) return;

    setError(null);

    try {
      await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      });

      setMessage(tCommon('success'));
      await load();
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  };

  const submitTemplate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    try {
      await apiFetch('/admin/settings/templates', {
        method: 'POST',
        body: JSON.stringify(templateForm)
      });

      setMessage(tCommon('success'));
      await load();
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  };

  if (!settings) {
    return <div className="panel p-8 text-sm text-slateInk">{tCommon('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="section-title">{tAdmin('settings')}</h1>
      </FadeIn>

      {error ? <p className="text-sm text-accent">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin('companySettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitSettings(event)}>
            <Input
              value={settings.companyName}
              onChange={(event) =>
                setSettings((prev) => (prev ? { ...prev, companyName: event.target.value } : prev))
              }
              placeholder={tAdmin('companyName')}
            />
            <Input
              value={settings.companyWebsite}
              onChange={(event) =>
                setSettings((prev) => (prev ? { ...prev, companyWebsite: event.target.value } : prev))
              }
              placeholder={tAdmin('companyWebsite')}
            />
            <Input
              value={settings.companyPhone}
              onChange={(event) =>
                setSettings((prev) => (prev ? { ...prev, companyPhone: event.target.value } : prev))
              }
              placeholder={tAdmin('companyPhone')}
            />
            <Input
              value={settings.companyEmail}
              onChange={(event) =>
                setSettings((prev) => (prev ? { ...prev, companyEmail: event.target.value } : prev))
              }
              placeholder={tAdmin('companyEmail')}
            />
            <Input
              value={settings.savPhone}
              onChange={(event) =>
                setSettings((prev) => (prev ? { ...prev, savPhone: event.target.value } : prev))
              }
              placeholder={tAdmin('savPhone')}
            />
            <Input
              value={settings.savEmail}
              onChange={(event) =>
                setSettings((prev) => (prev ? { ...prev, savEmail: event.target.value } : prev))
              }
              placeholder={tAdmin('savEmail')}
            />
            <Input
              className="md:col-span-2"
              value={settings.companyAddress}
              onChange={(event) =>
                setSettings((prev) => (prev ? { ...prev, companyAddress: event.target.value } : prev))
              }
              placeholder={tAdmin('companyAddress')}
            />
            <label className="md:col-span-2 flex items-center gap-2 text-sm text-slateInk">
              <input
                type="checkbox"
                checked={settings.notifyCandidateOnStatusChange}
                onChange={(event) =>
                  setSettings((prev) =>
                    prev ? { ...prev, notifyCandidateOnStatusChange: event.target.checked } : prev
                  )
                }
              />
              {tAdmin('notifyCandidate')}
            </label>
            <Button className="md:col-span-2">{tCommon('save')}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin('emailTemplates')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitTemplate(event)}>
            <Select
              value={templateForm.type}
              onChange={(event) =>
                setTemplateForm((prev) => ({ ...prev, type: event.target.value as TemplateData['type'] }))
              }
              aria-label={tAdmin('templateType')}
            >
              <option value="APPLICATION_CONFIRMATION">APPLICATION_CONFIRMATION</option>
              <option value="NEW_APPLICATION">NEW_APPLICATION</option>
              <option value="STATUS_UPDATE">STATUS_UPDATE</option>
            </Select>
            <Select
              value={templateForm.locale}
              onChange={(event) =>
                setTemplateForm((prev) => ({ ...prev, locale: event.target.value as TemplateData['locale'] }))
              }
              aria-label={tAdmin('templateLocale')}
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </Select>
            <Input
              className="md:col-span-2"
              value={templateForm.subject}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder={tAdmin('subject')}
              required
            />
            <Textarea
              className="md:col-span-2"
              value={templateForm.body}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, body: event.target.value }))}
              placeholder={tAdmin('body')}
              required
            />
            <Button className="md:col-span-2">{tCommon('save')}</Button>
          </form>

          <div className="space-y-2">
            {templates.map((template) => (
              <div key={`${template.type}-${template.locale}`} className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-ink">
                  {template.type} ({template.locale})
                </p>
                <p className="text-slateInk">{template.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
