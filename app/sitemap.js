import { absoluteUrl } from '../lib/seo';

export const dynamic = 'force-static';

export default function sitemap() {
  const now = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/book/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...['programs', 'schedule', 'coaches', 'pricing', 'results', 'proform'].map((page) => ({
      url: absoluteUrl(`/${page}/`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: page === 'proform' ? 0.9 : 0.7,
    })),
    {
      url: absoluteUrl('/privacy/'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/terms/'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
