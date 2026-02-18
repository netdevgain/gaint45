import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/components/auth-provider';
import { LocaleSync } from '@/components/locale-sync';
import { HtmlLocaleSync } from '@/components/html-locale-sync';
import { MotionProvider } from '@/components/motion/motion-provider';
import { RouteTransition } from '@/components/motion/route-transition';
import { ToastProvider } from '@/components/ui/toast';
import { BackgroundShell } from '@/components/background/background-shell';

const latinFont = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap'
});

const arabicFont = Cairo({
  subsets: ['arabic'],
  variable: '--font-ar',
  display: 'swap',
  preload: false
});

const metadataByLocale: Record<string, { title: string; description: string }> = {
  fr: {
    title: 'Carrières Géant Electronics',
    description: 'Plateforme officielle de recrutement de SARL LOTFI ELECTRONICS (Géant Electronics).'
  },
  en: {
    title: 'Geant Electronics Careers',
    description: 'Official recruitment platform of SARL LOTFI ELECTRONICS (Geant Electronics).'
  },
  ar: {
    title: 'وظائف جيانت إلكترونيكس',
    description: 'منصة التوظيف الرسمية لشركة SARL LOTFI ELECTRONICS (Géant Electronics).'
  }
};

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = metadataByLocale[locale] ?? metadataByLocale.fr;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        fr: `${siteUrl}/fr`,
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`
      }
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <MotionProvider>
        <ToastProvider>
          <AuthProvider>
            <HtmlLocaleSync locale={locale} dir={dir} />
            <LocaleSync locale={locale} />
            <div dir={dir} className={locale === 'ar' ? arabicFont.className : latinFont.className}>
              <BackgroundShell>
                <Navbar />
                <main className="shell-container min-h-[72vh] py-8 md:py-10">
                  <RouteTransition>{children}</RouteTransition>
                </main>
                <Footer />
              </BackgroundShell>
            </div>
          </AuthProvider>
        </ToastProvider>
      </MotionProvider>
    </NextIntlClientProvider>
  );
}
