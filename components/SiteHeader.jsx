'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [
  ['Programs', '/programs'],
  ['Schedule', '/schedule'],
  ['Coaches', '/coaches'],
  ['Pricing', '/pricing'],
  ['Results', '/results'],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Velo Performance Lab home">
          <img src="/assets/velo-logo-transparent.png" alt="Velo Performance Lab" />
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/proform" className="site-nav-app">Velo Proform</Link>
          <button onClick={() => window.toggleTheme?.()} className="site-theme" aria-label="Toggle light and dark theme">◐</button>
          <Link href="/book" className="site-nav-cta">Book Now</Link>
        </nav>
        <div className="site-mobile-actions">
          <button onClick={() => window.toggleTheme?.()} className="site-theme" aria-label="Toggle light and dark theme">◐</button>
          <button className="site-menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-mobile-menu">{open ? '×' : '☰'}</button>
        </div>
      </div>
      {open && <nav id="site-mobile-menu" className="site-mobile-menu" aria-label="Mobile navigation">
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/proform" onClick={() => setOpen(false)}>Velo Proform</Link>
        <Link href="/book" className="site-nav-cta" onClick={() => setOpen(false)}>Book Now</Link>
      </nav>}
    </header>
  );
}
