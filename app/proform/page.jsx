import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { createPageMetadata } from '../../lib/seo';

export const metadata = createPageMetadata({
  title: 'Velo Proform App',
  description: 'Training plans, progress, and the Velo development system—wherever you train.',
  path: '/proform',
});

const appUrl = process.env.NEXT_PUBLIC_VELO_PROFORM_URL || '/book';
const isExternal = appUrl.startsWith('http');

export default function ProformPage() {
  return <><SiteHeader /><main className="proform-page">
    <section className="proform-hero">
      <div className="proform-copy"><p className="detail-eyebrow">Velo training · In your pocket</p><h1>Meet <em>Velo Proform.</em></h1><p>Stay connected to the work. Velo Proform brings structured training, athlete progress, and next-step guidance into one focused experience.</p><div className="detail-actions"><a href={appUrl} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} className="detail-primary">Open Velo Proform →</a><a href="#subscribe" className="detail-secondary">See membership</a></div></div>
      <div className="app-preview" aria-label="Velo Proform app preview"><div className="app-preview-top"><img src="/assets/velo-logo-transparent.png" alt=""/><span>PROFORM</span></div><div className="app-score"><small>THIS WEEK</small><strong>4<span>/5</span></strong><p>sessions complete</p></div><div className="app-line"><b>Hitting</b><span>82%</span></div><div className="app-line"><b>Throwing</b><span>76%</span></div><div className="app-line"><b>Movement</b><span>91%</span></div></div>
    </section>
    <section className="proform-benefits"><article><span>01</span><h2>Know what to work on</h2><p>Clear priorities turn practice time into purposeful development.</p></article><article><span>02</span><h2>Track the work</h2><p>Keep sessions, goals, and progress together instead of guessing.</p></article><article><span>03</span><h2>Stay connected</h2><p>Carry the Velo development mindset beyond the facility.</p></article></section>
    <section id="subscribe" className="subscribe-panel"><div><p className="detail-eyebrow">Velo Proform membership</p><h2>Train with a plan.<br/>Grow with proof.</h2><p>Get access to the Velo Proform experience and make every training day count.</p></div><div className="subscribe-card"><p>PROFORM ACCESS</p><h3>Built for serious development.</h3><ul><li>Structured training guidance</li><li>Athlete progress tracking</li><li>Goals and next-step focus</li><li>Velo coaching methodology</li></ul><a href={appUrl} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>Subscribe / Open App →</a><small>Membership details and checkout are completed in Velo Proform.</small></div></section>
    <section className="proform-bottom"><h2>Already a member?</h2><p>Pick up where you left off.</p><a href={appUrl} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>Sign in to Velo Proform →</a><Link href="/programs">Explore in-person training</Link></section>
  </main><SiteFooter /></>;
}
