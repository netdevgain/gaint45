import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';

export default async function NotFoundPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('common');

  return (
    <div className="panel mx-auto max-w-2xl p-10 text-center">
      <h1 className="text-4xl font-bold text-brand-700">404</h1>
      <p className="mt-3 text-slateInk">{t('notFound')}</p>
      <div className="mt-5">
        <Link href="/">
          <Button>{t('viewJobs')}</Button>
        </Link>
      </div>
    </div>
  );
}
