import Script from 'next/script';
import { MARKUP } from './markup';

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: MARKUP }} />
      {/* Interactive reservation widget + mobile menu (original vanilla JS). */}
      <Script src="/reservation.js" strategy="afterInteractive" />
    </>
  );
}
