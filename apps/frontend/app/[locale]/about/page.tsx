import { Globe2, Rocket, Target } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/reveal';

export default async function AboutPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('about');

  return (
    <div className="space-y-6">
      <FadeIn className="space-y-2">
        <h1 className="section-title">{t('title')}</h1>
        <p className="section-subtitle">{t('subtitle')}</p>
      </FadeIn>

      <FadeIn>
        <Card>
          <CardContent className="p-8">
            <p className="text-base leading-8 text-slateInk">{t('content')}</p>
          </CardContent>
        </Card>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-3">
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target size={18} className="text-brand-700" />
                {t('missionTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slateInk">{t('missionBody')}</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Rocket size={18} className="text-brand-700" />
                {t('visionTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slateInk">{t('visionBody')}</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe2 size={18} className="text-brand-700" />
                {t('footprintTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slateInk">{t('footprintBody')}</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
