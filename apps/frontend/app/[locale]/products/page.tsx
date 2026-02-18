import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProductsPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('placeholders');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('productsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="text-slateInk">{t('productsText')}</CardContent>
    </Card>
  );
}
