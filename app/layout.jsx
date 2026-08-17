import './globals.css';
import { createPageMetadata, defaultDescription, defaultTitle, siteName, siteUrl } from '../lib/seo';

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    'baseball training Apollo Beach',
    'softball training Apollo Beach',
    'after school sports training Apollo Beach',
    'youth baseball lessons Apollo Beach',
    'player development Florida',
  ],
  alternates: {
    canonical: '/',
  },
  category: 'sports',
  openGraph: createPageMetadata({ path: '/' }).openGraph,
  twitter: createPageMetadata({ path: '/' }).twitter,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
