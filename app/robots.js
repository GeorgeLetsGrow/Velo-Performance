import { absoluteUrl } from '../lib/seo';

export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/thank-you/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
