'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  const tCommon = useTranslations('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="panel mx-auto max-w-2xl p-8 text-center">
      <h1 className="section-title">{tCommon('error')}</h1>
      <p className="mt-3 text-slateInk">{String(error.message || '')}</p>
      <div className="mt-6 flex justify-center">
        <Button onClick={() => reset()}>{tCommon('retry')}</Button>
      </div>
    </div>
  );
}
