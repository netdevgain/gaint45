'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

export interface AppUser {
  id: string;
  role: 'CANDIDATE' | 'ADMIN' | 'HR_MANAGER';
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
  wilaya?: string | null;
  preferredLocale: 'fr' | 'en' | 'ar';
  isActive: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (): Promise<void> => {
    try {
      const payload = await apiFetch<{ user: AppUser }>('/auth/me', {
        method: 'GET'
      });
      setUser(payload.user);
    } catch {
      try {
        await apiFetch('/auth/refresh', { method: 'POST' });
        const payload = await apiFetch<{ user: AppUser }>('/auth/me', {
          method: 'GET'
        });
        setUser(payload.user);
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await apiFetch('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
