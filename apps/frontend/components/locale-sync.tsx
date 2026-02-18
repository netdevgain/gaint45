'use client';

import { useEffect } from 'react';

export function LocaleSync({ locale }: { locale: string }): null {
  useEffect(() => {
    localStorage.setItem('preferredLocale', locale);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, [locale]);

  return null;
}
