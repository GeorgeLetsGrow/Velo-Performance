'use client';

import Link from 'next/link';

// Shared chrome for /privacy and /terms — same header as /book, but body
// copy needs to read like a document, not marketing display type.
export default function LegalLayout({ eyebrow, title, updated, children }) {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--header-bg)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 22px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/assets/velo-logo-transparent.png" alt="Velo Performance Labs" style={{ height: 52, width: 'auto', display: 'block' }} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-2)', textDecoration: 'none' }}>← Home</Link>
            <button onClick={() => window.toggleTheme && window.toggleTheme()} className="velo-theme-toggle" aria-label="Toggle light and dark theme" title="Toggle light / dark">
              <span className="theme-icon-moon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg></span>
              <span className="theme-icon-sun" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg></span>
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(40px,6vw,72px) 24px 100px' }}>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, letterSpacing: '.3em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>
          {eyebrow}
        </div>
        <h1 style={{ fontFamily: "'Anton'", fontWeight: 400, fontSize: 'clamp(32px,5vw,50px)', lineHeight: 1.05, textTransform: 'uppercase', color: 'var(--text)' }}>
          {title}
        </h1>
        <p style={{ marginTop: 14, fontFamily: "'JetBrains Mono'", fontSize: 12, letterSpacing: '.06em', color: 'var(--text-4)' }}>
          Last updated {updated}
        </p>
        <div className="legal-body" style={{ marginTop: 40, color: 'var(--text-2)', fontSize: 16, lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </main>
  );
}
