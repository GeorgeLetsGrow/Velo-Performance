import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found — Velo Performance Labs',
};

export default function NotFound() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 28px',
        overflow: 'hidden',
        background:
          'repeating-linear-gradient(118deg,var(--stripe-a),var(--stripe-a) 16px,var(--stripe-b) 16px,var(--stripe-b) 32px)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-54%)',
          fontFamily: "'Anton'",
          fontSize: 'clamp(220px,42vw,560px)',
          lineHeight: 1,
          color: 'var(--accent)',
          opacity: 0.09,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        404
      </div>
      <div style={{ position: 'relative', maxWidth: 600, textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-block' }}>
          <img
            src="/assets/velo-logo-transparent.png"
            alt="Velo Performance Labs"
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
          Error 404 · Out of Play
        </div>
        <h1
          style={{
            fontFamily: "'Anton'",
            fontWeight: 400,
            fontSize: 'clamp(44px,8vw,76px)',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: 'var(--text)',
          }}
        >
          Foul ball.
        </h1>
        <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.6, color: 'var(--text-2)' }}>
          The page you&apos;re looking for isn&apos;t on the roster. Step back in
          the box and let&apos;s get you a better pitch.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            justifyContent: 'center',
            marginTop: 34,
          }}
        >
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
            }}
          >
            <span style={{ display: 'inline-block', transform: 'skewX(9deg)' }}>
              Back to Home →
            </span>
          </Link>
          <Link
            href="/#register"
            className="velo-btn velo-btn-ghost"
            style={{
              fontFamily: "'Barlow Condensed'",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              background: 'transparent',
              border: '1.5px solid var(--border-strong)',
              padding: '16px 30px',
              textDecoration: 'none',
              transform: 'skewX(-9deg)',
              display: 'inline-block',
            }}
          >
            <span style={{ display: 'inline-block', transform: 'skewX(9deg)' }}>
              Reserve a Spot
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
