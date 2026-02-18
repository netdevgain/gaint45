'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { FadeIn } from '@/components/motion/reveal';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CANDIDATE' | 'ADMIN' | 'HR_MANAGER';
  isActive: boolean;
}

export default function AdminUsersPage(): React.JSX.Element {
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [items, setItems] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    try {
      const payload = await apiFetch<{ data: { items: UserItem[] } }>('/admin/users', {
        method: 'GET'
      });
      setItems(payload.data?.items ?? []);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateRole = async (id: string, role: UserItem['role']): Promise<void> => {
    try {
      await apiFetch(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
      await load();
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  const toggleActive = async (id: string, isActive: boolean): Promise<void> => {
    try {
      await apiFetch(`/admin/users/${id}/disable`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      });
      await load();
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="section-title">{tAdmin('users')}</h1>
      </FadeIn>

      {error ? <p className="text-sm text-accent">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>{tAdmin('users')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-slateInk">
                  <th className="py-2">{tAdmin('name')}</th>
                  <th className="py-2">{tAdmin('email')}</th>
                  <th className="py-2">{tAdmin('role')}</th>
                  <th className="py-2">{tCommon('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="py-2">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="py-2">{item.email}</td>
                    <td className="py-2">{item.role}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Select
                          value={item.role}
                          onChange={(event) => void updateRole(item.id, event.target.value as UserItem['role'])}
                        >
                          <option value="CANDIDATE">CANDIDATE</option>
                          <option value="HR_MANAGER">HR_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </Select>

                        <Button
                          size="sm"
                          variant={item.isActive ? 'danger' : 'secondary'}
                          onClick={() => void toggleActive(item.id, !item.isActive)}
                        >
                          {item.isActive ? tAdmin('disable') : tAdmin('enable')}
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
    </div>
  );
}
