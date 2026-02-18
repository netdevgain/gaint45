import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function NewsPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('placeholders');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('newsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="text-slateInk">{t('newsText')}</CardContent>
    </Card>
  );
}
