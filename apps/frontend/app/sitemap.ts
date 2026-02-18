import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const locales = ['fr', 'en', 'ar'];
  const pages = ['', '/about', '/jobs', '/sav', '/contact', '/login', '/register'];

  return locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${siteUrl}/${locale}${page}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          fr: `${siteUrl}/fr${page}`,
          en: `${siteUrl}/en${page}`,
          ar: `${siteUrl}/ar${page}`
        }
      }
    }))
  );
}
