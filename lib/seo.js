const DEFAULT_SITE_URL = 'https://veloperformancelab.com';

function normalizeSiteUrl(value) {
  const input = (value || '').trim();
  if (!input) return DEFAULT_SITE_URL;

  const withProtocol = input.startsWith('http') ? input : `https://${input}`;
  return withProtocol.replace(/\/+$/, '');
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.URL);
export const siteName = 'Velo Performance Lab';
export const siteTitle = 'After-School Player Development | Apollo Beach, FL';
export const defaultTitle = `${siteName} — ${siteTitle}`;
export const defaultDescription =
  'After-school player development for baseball and softball athletes in Apollo Beach, FL. Real coaching, small groups, big results.';
export const socialImage = '/assets/team-card.png';

export function absoluteUrl(path = '/') {
  const target = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${target}`;
}

export function createPageMetadata({
  title,
  description = defaultDescription,
  path = '/',
  robots,
}) {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      url: absoluteUrl(path),
      siteName,
      title: title || defaultTitle,
      description,
      images: [
        {
          url: socialImage,
          alt: `${siteName} training athletes in Apollo Beach, Florida`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || defaultTitle,
      description,
      images: [socialImage],
    },
    ...(robots ? { robots } : {}),
  };
}

export function buildHomeSchemas() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SportsActivityLocation',
      name: siteName,
      url: siteUrl,
      image: absoluteUrl(socialImage),
      description: defaultDescription,
      email: 'team@veloperformancelab.com',
      sport: ['Baseball', 'Softball'],
      areaServed: 'Apollo Beach, Florida',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Apollo Beach',
        addressRegion: 'FL',
        addressCountry: 'US',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '15:00',
          closes: '19:00',
        },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Training Options',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Drop-In Day Pass',
              description: 'Single after-school small-group player development session.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '3-Day Flex Pass',
              description: 'Three after-school training days in one week.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Unlimited Week',
              description: 'Unlimited after-school player development for the week.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Individual Training Sessions',
              description: 'One-on-one baseball or softball training with a coach.',
            },
          },
        ],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What sports does Velo Performance Lab train?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Velo Performance Lab offers after-school player development for baseball and softball athletes in Apollo Beach, Florida.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does the training program include?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Athletes train in hitting, pitching, defensive work, speed and agility, game IQ, and weekly progress tracking with coach-led instruction.',
          },
        },
        {
          '@type': 'Question',
          name: 'When can athletes train?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The after-school program runs Monday through Friday, and individual lessons are also available on weekdays.',
          },
        },
      ],
    },
  ];
}
