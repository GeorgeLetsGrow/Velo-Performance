import Link from 'next/link';

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer-grid">
      <div><img src="/assets/velo-logo-transparent.png" alt="Velo Performance Lab" /><p>After-school player development for baseball and softball athletes. Train different. Train smarter. Be elite.</p></div>
      <div><h3>Explore</h3><Link href="/programs">Programs</Link><Link href="/schedule">Schedule</Link><Link href="/coaches">Coaches</Link><Link href="/pricing">Pricing</Link><Link href="/results">Results</Link></div>
      <div><h3>Get Started</h3><Link href="/proform">Velo Proform App</Link><Link href="/book">Book Training</Link><a href="mailto:team@veloperformancelab.com">Email the team</a></div>
    </div>
    <div className="site-footer-bottom"><span>© 2026 VELO PERFORMANCE LAB · APOLLO BEACH, FL</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div>
  </footer>;
}
