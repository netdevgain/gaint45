import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ShowroomPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('placeholders');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('showroomTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="text-slateInk">{t('showroomText')}</CardContent>
    </Card>
  );
}
