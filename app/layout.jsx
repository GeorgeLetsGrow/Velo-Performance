import './globals.css';

const SITE_URL = 'https://veloperformancelab.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Velo Performance Lab — After-School Player Development | Apollo Beach, FL',
  description:
    'After-school player development for baseball and softball athletes in Apollo Beach, FL. Real coaching, small groups, big results. Train different. Train smarter. Be elite.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Velo Performance Lab — After-School Player Development | Apollo Beach, FL',
    description:
      'After-school player development for baseball and softball athletes in Apollo Beach, FL. Real coaching, small groups, big results.',
    url: SITE_URL,
    siteName: 'Velo Performance Lab',
    images: ['/assets/velo-logo-transparent.png'],
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: 'Velo Performance Lab',
  description:
    'After-school player development for baseball and softball athletes in Apollo Beach, FL. Real coaching, small groups, big results.',
  url: SITE_URL,
  logo: `${SITE_URL}/assets/velo-logo-transparent.png`,
  image: `${SITE_URL}/assets/velo-logo-transparent.png`,
  email: 'team@veloperformancelab.com',
  priceRange: '$60-$175',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Apollo Beach',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  areaServed: {
    '@type': 'City',
    name: 'Apollo Beach, FL',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    closes: '17:00',
  },
  employee: [
    {
      '@type': 'Person',
      name: 'Neril Griffith',
      jobTitle: 'Hitting & Defense Coach',
    },
    {
      '@type': 'Person',
      name: 'Nevin Griffith',
      jobTitle: 'Pitching Coach',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Training Options',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Drop-In',
        price: '60',
        priceCurrency: 'USD',
        description: 'Single-day player development session.',
      },
      {
        '@type': 'Offer',
        name: '3-Day Flex Pass',
        price: '150',
        priceCurrency: 'USD',
        description: 'Any 3 afternoons per week, Monday–Friday.',
      },
      {
        '@type': 'Offer',
        name: 'Unlimited Week',
        price: '175',
        priceCurrency: 'USD',
        description: 'Unlimited training, Monday–Friday.',
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_SCHEMA) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('velo-theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();" +
              "window.toggleTheme=function(){try{var el=document.documentElement;var n=el.getAttribute('data-theme')==='light'?'dark':'light';el.setAttribute('data-theme',n);try{localStorage.setItem('velo-theme',n);}catch(e){}}catch(e){}};",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
