'use client';

import { useEffect } from 'react';

export function HtmlLocaleSync({ locale, dir }: { locale: string; dir: 'ltr' | 'rtl' }): null {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
