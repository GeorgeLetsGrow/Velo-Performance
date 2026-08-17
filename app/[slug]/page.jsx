import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { createPageMetadata } from '../../lib/seo';

const pages = {
  programs: {
    eyebrow: 'Player development', title: 'Build the complete athlete.',
    intro: 'Intentional baseball and softball development in a small-group environment where every rep gets coached.',
    items: [
      ['Hitting instruction', 'Mechanics, bat path, approach, and live feedback that build a repeatable swing.'],
      ['Pitching instruction', 'Arm care, command, velocity development, and mound-specific coaching.'],
      ['Defense & catching', 'Footwork, glove work, receiving, blocking, throwing, and position-specific reps.'],
      ['Performance training', 'Speed, agility, strength, coordination, and durable movement patterns.'],
      ['Game IQ', 'Situations, reads, decisions, and competitive reps that transfer to the field.'],
      ['Progress tracking', 'Weekly notes make growth visible and give each athlete a clear next target.'],
    ],
  },
  schedule: {
    eyebrow: 'Monday–Friday · After school', title: 'A better use of every afternoon.',
    intro: 'Athletes move through a purposeful training block that balances skill development, athleticism, competition, and fun.',
    items: [
      ['01 · Dynamic warm-up', 'Movement preparation and athletic development to get ready to perform.'],
      ['02 · Skill development', 'Hitting, pitching, fielding, catching, and position-specific instruction.'],
      ['03 · Competitive training', 'Games, challenges, and live situations that teach athletes how to compete.'],
      ['04 · Performance work', 'Speed, agility, coordination, throwing mechanics, and baseball movement.'],
      ['05 · Game play', 'Apply the day’s lessons in a competitive, coach-led environment.'],
      ['06 · Progress check', 'Coaches record development and set the focus for the next session.'],
    ],
  },
  coaches: {
    eyebrow: 'The Velo staff', title: "Coached by players who’ve been there.",
    intro: 'Former college and professional talent bringing real experience, clear teaching, and hands-on attention to every session.',
    people: [
      { name: 'Coach Neril Griffith', detail: 'Hitting · Defense · Development', stat: '30+ years', image: '/assets/coach-neril.png' },
      { name: 'Coach Nevin Griffith', detail: 'Pitching · Velocity · Mental Game', stat: '100+ MPH', image: '/assets/coach-nevin.png' },
    ],
  },
  pricing: {
    eyebrow: 'Flexible options', title: 'Train your way.',
    intro: 'Choose the rhythm that fits your family. Every option includes the same coach-led, small-group development.',
    items: [
      ['Drop-In · $50/day', 'A high-energy session with individual feedback—perfect for extra reps or trying Velo.'],
      ['3-Day Flex Pass · $100/week', 'Choose any three afternoons Monday–Friday. Our most flexible, popular option.'],
      ['Unlimited · $150/week', 'Train every weekday for maximum coaching, consistency, and development.'],
    ],
  },
  results: {
    eyebrow: 'The Velo difference', title: 'Progress you can see.',
    intro: 'The combination of small groups, consistent coaching, and weekly tracking turns intentional work into confidence and game-ready skill.',
    items: [
      ['12:1 maximum', 'Intentionally limited sessions give athletes more coaching, more reps, and less standing around.'],
      ['100% coach-led', 'Every drill has a purpose and every athlete gets actionable feedback.'],
      ['Weekly tracking', 'Development is measured, discussed, and used to shape what comes next.'],
      ['Five flexible days', 'Consistency becomes easier when families can choose the afternoons that work.'],
    ],
  },
};

export function generateStaticParams() { return Object.keys(pages).map(slug => ({ slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params; const page = pages[slug];
  return page ? createPageMetadata({ title: page.title, description: page.intro, path: `/${slug}` }) : {};
}

export default async function DetailPage({ params }) {
  const { slug } = await params; const page = pages[slug]; if (!page) notFound();
  return <><SiteHeader /><main className="detail-page">
    <section className="detail-hero"><div><p className="detail-eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="detail-intro">{page.intro}</p><div className="detail-actions"><Link href="/book" className="detail-primary">Book training →</Link><Link href="/proform" className="detail-secondary">Explore Velo Proform</Link></div></div></section>
    {page.people ? <section className="coach-list">{page.people.map(person => <article key={person.name}><img src={person.image} alt={person.name}/><div><h2>{person.name}</h2><p>{person.detail}</p><strong>{person.stat}</strong></div></article>)}</section> : <section className="detail-grid">{page.items.map(([title, copy]) => <article key={title}><span>▸</span><h2>{title}</h2><p>{copy}</p></article>)}</section>}
    <section className="detail-cta"><p>Ready to train different?</p><h2>Give your athlete a better next rep.</h2><Link href="/book">Reserve a spot →</Link></section>
  </main><SiteFooter /></>;
}
