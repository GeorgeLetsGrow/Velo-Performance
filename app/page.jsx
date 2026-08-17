import Script from 'next/script';
import { MARKUP } from './markup';
import { buildHomeSchemas, createPageMetadata, defaultTitle } from '../lib/seo';

export const metadata = createPageMetadata({
  title: defaultTitle,
  description:
    'After-school baseball and softball player development in Apollo Beach, FL with small-group coaching, individual instruction, and weekly progress tracking.',
  path: '/',
});

export default function Home() {
  const schemas = buildHomeSchemas();

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`home-schema-${index}`}
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div dangerouslySetInnerHTML={{ __html: MARKUP }} />
      {/* Interactive reservation widget + mobile menu (original vanilla JS). */}
      <Script src="/reservation.js" strategy="afterInteractive" />
    </>
  );
}
