import Link from 'next/link';

export const metadata = {
  title: 'Request Received — Velo Performance Lab',
  robots: { index: false },
};

export default function ThankYou() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 28px',
        background:
          'repeating-linear-gradient(118deg,var(--stripe-a),var(--stripe-a) 16px,var(--stripe-b) 16px,var(--stripe-b) 32px)',
      }}
    >
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-block' }}>
          <img
            src="/assets/velo-logo-transparent.png"
            alt="Velo Performance Lab"
            style={{ height: 110, width: 'auto', display: 'block', margin: '0 auto 30px' }}
          />
        </Link>
        <div
          style={{
            fontFamily: "'JetBrains Mono'",
            fontSize: 12,
            letterSpacing: '.3em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          Request Received
        </div>
        <h1
          style={{
            fontFamily: "'Anton'",
            fontWeight: 400,
            fontSize: 'clamp(38px,7vw,64px)',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: 'var(--text)',
          }}
        >
          You&apos;re on the list.
        </h1>
        <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.6, color: 'var(--text-2)' }}>
          We&apos;ve got your info. A coach will reach out shortly to confirm your
          athlete&apos;s spot and answer any questions.
        </p>
        <Link
          href="/"
          className="velo-btn velo-btn-primary"
          style={{
            fontFamily: "'Barlow Condensed'",
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            background: 'var(--accent)',
            padding: '16px 32px',
            textDecoration: 'none',
            transform: 'skewX(-9deg)',
            display: 'inline-block',
            marginTop: 34,
          }}
        >
          <span style={{ display: 'inline-block', transform: 'skewX(9deg)' }}>
            ← Back to the site
          </span>
        </Link>
      </div>
    </section>
  );
}
