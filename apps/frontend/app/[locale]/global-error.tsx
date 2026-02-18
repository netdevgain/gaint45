'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const copy = {
  fr: {
    title: 'Une erreur critique est survenue',
    text: 'La page a rencontré une erreur inattendue.',
    action: 'Réessayer'
  },
  en: {
    title: 'A critical error occurred',
    text: 'The page encountered an unexpected error.',
    action: 'Try again'
  },
  ar: {
    title: 'حدث خطأ حرج',
    text: 'تعذر عرض الصفحة بسبب خطأ غير متوقع.',
    action: 'إعادة المحاولة'
  }
} as const;

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  const pathname = usePathname();
  const locale = (pathname?.split('/')[1] || 'fr') as 'fr' | 'en' | 'ar';
  const text = copy[locale] ?? copy.fr;

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <main className="shell-container py-16">
          <div className="panel mx-auto max-w-2xl p-8 text-center">
            <h1 className="section-title">{text.title}</h1>
            <p className="mt-3 text-slateInk">{text.text}</p>
            <p className="mt-2 text-xs text-slate-500">{String(error.message || '')}</p>
            <div className="mt-6">
              <Button onClick={() => reset()}>{text.action}</Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
