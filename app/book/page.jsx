'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PASSES as PASS_DEFS, CAPACITY } from '../../lib/services';

/* ---------------- Data ---------------- */
// Prices live in lib/services.js (shared with the payment backend);
// this just adds a display-ready price string.
const PASSES = PASS_DEFS.map((p) => ({ ...p, price: `$${p.cents / 100}` }));

const DOW = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ---------------- Helpers ---------------- */
function buildWeek(offset) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const dow = base.getDay();
  const toMon = dow === 0 ? 1 : 1 - dow;
  const monday = new Date(base);
  monday.setDate(base.getDate() + toMon + offset * 7);
  const out = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const past = d < base;
    out.push({ iso, dow: DOW[i], day: d.getDate(), mon: MON[d.getMonth()], past });
  }
  return out;
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  const dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  return `${dn} · ${MON[d.getMonth()]} ${d.getDate()}`;
}

/* ---------------- Page ---------------- */
export default function BookPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [passId, setPassId] = useState(PASSES[0].id);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDates, setSelectedDates] = useState([]);
  const [form, setForm] = useState({ athlete: '', age: '', sport: 'Baseball', parent: '', contact: '' });
  // Spots taken per day across both visible weeks: null = loading, 'error', or { capacity, taken }
  const [avail, setAvail] = useState(null);
  const [availReload, setAvailReload] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { kind: 'error'|'info', text }

  // Handle returning from Stripe Checkout (success or cancel).
  useEffect(() => {
    setMounted(true);
    const q = new URLSearchParams(window.location.search);
    if (q.get('paid') === '1') {
      setStep(3);
    } else if (q.get('cancelled') === '1') {
      const bid = q.get('bid');
      if (bid) {
        // Free the held spots right away instead of waiting out the 30-min hold.
        fetch('/.netlify/functions/release-hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bid }),
        }).catch(() => {});
      }
      setNotice({ kind: 'info', text: 'Checkout cancelled — your spots were released. Pick your days whenever you’re ready.' });
    }
    if (q.get('paid') || q.get('cancelled')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Load spot counts for this week + next week in one call.
  useEffect(() => {
    const from = buildWeek(0)[0].iso;
    const to = buildWeek(1)[4].iso;
    let stale = false;
    setAvail(null);
    fetch(`/.netlify/functions/get-availability?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => { if (!stale) setAvail(d); })
      .catch(() => { if (!stale) setAvail('error'); });
    return () => { stale = true; };
  }, [availReload]);

  const pass = PASSES.find((p) => p.id === passId) || PASSES[0];
  const week = buildWeek(weekOffset);
  const capacity = (avail && avail.capacity) || CAPACITY;

  function spotsLeft(iso) {
    if (!avail || avail === 'error') return null; // unknown while loading
    return Math.max(0, capacity - ((avail.taken && avail.taken[iso]) || 0));
  }
  function selectable(d) {
    if (d.past) return false;
    const left = spotsLeft(d.iso);
    return left === null || left > 0; // optimistic while loading; server re-validates
  }

  // Unlimited covers every remaining open day of the visible week.
  useEffect(() => {
    if (passId !== 'unlimited') return;
    setSelectedDates(buildWeek(weekOffset).filter(selectable).map((d) => d.iso));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passId, weekOffset, avail]);

  function pickPass(id) {
    setPassId(id);
    setSelectedDates([]); // the unlimited effect repopulates when relevant
  }
  function switchWeek(n) {
    setWeekOffset(n);
    setSelectedDates([]);
  }
  function pickDay(d) {
    if (!selectable(d) || passId === 'unlimited') return;
    const iso = d.iso;
    if (passId === 'dropin') {
      setSelectedDates([iso]);
      return;
    }
    // flex3: toggle; when a 4th day is picked, drop the oldest selection
    setSelectedDates((cur) => {
      if (cur.includes(iso)) return cur.filter((x) => x !== iso);
      const next = [...cur, iso];
      return next.length > 3 ? next.slice(1) : next;
    });
  }
  function reset() {
    setStep(1);
    setPassId(PASSES[0].id);
    setWeekOffset(0);
    setSelectedDates([]);
    setForm({ athlete: '', age: '', sport: 'Baseball', parent: '', contact: '' });
    setNotice(null);
    setSubmitting(false);
    setAvailReload((n) => n + 1);
  }

  const needDays = pass.id === 'dropin' ? 1 : pass.id === 'flex3' ? 3 : Math.max(1, selectedDates.length);
  const daysReady =
    pass.id === 'unlimited' ? selectedDates.length >= 1 : selectedDates.length === needDays;
  const canSubmit = form.athlete.trim() && String(form.age).trim() && form.contact.trim() && !submitting;
  const sortedDates = [...selectedDates].sort();

  async function goToPayment() {
    if (!canSubmit || !daysReady) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passId: pass.id,
          dates: sortedDates,
          athlete: form.athlete,
          age: form.age,
          sport: form.sport,
          parent: form.parent,
          contact: form.contact,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.assign(data.url); // off to Stripe Checkout
        return;
      }
      if (res.status === 409) {
        setNotice({ kind: 'error', text: 'One of those days just filled up — please pick again.' });
        setSelectedDates([]);
        setStep(1);
        setAvailReload((n) => n + 1);
      } else {
        setNotice({ kind: 'error', text: 'Something went wrong starting checkout. Please try again in a moment.' });
      }
    } catch {
      setNotice({ kind: 'error', text: 'Something went wrong starting checkout. Please try again in a moment.' });
    }
    setSubmitting(false);
  }

  const A = 'var(--accent)';
  const card = { background: 'var(--bg-1)', border: '1px solid var(--border)' };
  const label = {
    fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 18, letterSpacing: '.06em',
    textTransform: 'uppercase', color: 'var(--text)',
  };
  const mono = { fontFamily: "'JetBrains Mono'", fontSize: 12, letterSpacing: '.1em', color: 'var(--text-4)' };

  /* ----- step indicator ----- */
  const steps = ['Session', 'Details', 'Done'];
  const indicator = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', margin: '0 0 28px' }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 13,
              color: active || done ? 'var(--ink)' : 'var(--text-3)',
              background: active || done ? A : 'var(--bg-3)',
            }}>{done ? '✓' : n}</span>
            <span style={{
              fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: '.08em',
              textTransform: 'uppercase', color: active || done ? 'var(--text-2)' : 'var(--text-4)',
            }}>{s}</span>
            {n < steps.length && <span style={{ width: 18, height: 1, background: 'var(--border-2)', margin: '0 2px' }} />}
          </div>
        );
      })}
    </div>
  );

  /* ----- step 1: pass + days, all in one place ----- */
  const tab = (on) => ({
    flex: 1, padding: 12, cursor: 'pointer', font: 'inherit',
    fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase',
    border: `1px solid ${on ? A : 'var(--border-2)'}`,
    color: on ? 'var(--ink)' : 'var(--text-2)', background: on ? A : 'var(--bg-1)',
  });

  const dayHint =
    pass.id === 'dropin'
      ? 'Pick your day'
      : pass.id === 'flex3'
        ? `Pick any 3 afternoons — ${selectedDates.length} of 3 selected`
        : 'Covers every remaining day of this week';

  const sessionStep = (
    <div>
      <div className="velo-book-grid" style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 'clamp(24px,4vw,40px)', alignItems: 'start' }}>
        {/* --- pass (radio select) --- */}
        <div>
          <div style={{ ...label, marginBottom: 14 }}>1 · Pick Your Pass</div>
          <div role="radiogroup" aria-label="Pass" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PASSES.map((p) => {
              const sel = p.id === passId;
              return (
                <button key={p.id} role="radio" aria-checked={sel} onClick={() => pickPass(p.id)} style={{
                  textAlign: 'left', cursor: 'pointer', padding: '14px 16px', font: 'inherit', position: 'relative',
                  background: sel ? '#16110c' : 'var(--bg-1)', border: `1.5px solid ${sel ? A : 'var(--border-2)'}`,
                  display: 'flex', alignItems: 'center', gap: 13,
                }}>
                  {p.popular && (
                    <span style={{
                      position: 'absolute', top: 0, right: 0, background: A, color: 'var(--ink)',
                      fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 10, letterSpacing: '.12em',
                      textTransform: 'uppercase', padding: '4px 9px',
                    }}>Most Popular</span>
                  )}
                  <span aria-hidden="true" style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${sel ? A : 'var(--border-strong)'}`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && <span style={{ width: 8, height: 8, borderRadius: '50%', background: A }} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 17.5, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1.15 }}>{p.name}</span>
                    <span style={{ display: 'block', color: 'var(--text-3)', fontSize: 13, lineHeight: 1.45, marginTop: 3 }}>{p.desc}</span>
                  </span>
                  <span style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'block', fontFamily: "'Anton'", fontSize: 19, color: sel ? A : 'var(--text)', lineHeight: 1 }}>{p.price}</span>
                    <span style={{ display: 'block', ...mono, fontSize: 10, marginTop: 4, color: sel ? A : 'var(--text-4)' }}>{p.unit.toUpperCase()}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <span style={{ fontFamily: "'Anton'", fontSize: 16, color: A }}>☀</span>
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 14, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
              After-school program · Monday–Friday until 5:00 PM
            </span>
          </div>
        </div>

        {/* --- days (updates live with the pass above) --- */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={label}>2 · Pick Your Days</div>
            <div style={{ ...mono, fontSize: 11 }}>{dayHint.toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, margin: '0 0 14px', maxWidth: 340 }}>
            <button onClick={() => switchWeek(0)} style={tab(weekOffset === 0)}>This Week</button>
            <button onClick={() => switchWeek(1)} style={tab(weekOffset === 1)}>Next Week</button>
          </div>
          {avail === 'error' && (
            <div style={{ padding: '14px 16px', marginBottom: 12, border: '1px solid var(--border-2)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-2)', fontSize: 15 }}>Couldn&apos;t check open spots.</span>
              <button onClick={() => setAvailReload((n) => n + 1)} style={{ ...ghostBtn, flex: 'none', padding: '9px 18px', fontSize: 13 }}>Retry</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {week.map((d) => {
              const sel = selectedDates.includes(d.iso);
              const left = spotsLeft(d.iso);
              const full = left === 0;
              const disabled = d.past || full || passId === 'unlimited';
              return (
                <button key={d.iso} disabled={disabled && !sel} onClick={() => pickDay(d)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 4px 10px', font: 'inherit',
                  cursor: d.past || full ? 'not-allowed' : passId === 'unlimited' ? 'default' : 'pointer',
                  opacity: d.past || full ? 0.4 : 1,
                  border: `1.5px solid ${sel ? A : 'var(--border-2)'}`, background: sel ? '#16110c' : 'var(--bg-1)',
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: '.1em', color: 'var(--text-4)' }}>{d.dow}</span>
                  <span style={{ fontFamily: "'Anton'", fontSize: 24, lineHeight: 1, color: sel ? A : 'var(--text)' }}>{d.day}</span>
                  <span style={{ fontFamily: "'Barlow'", fontSize: 11, color: 'var(--text-4)' }}>{d.mon}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: '.08em', minHeight: 12, color: full ? 'var(--text-5)' : 'var(--gold)' }}>
                    {d.past ? '' : full ? 'FULL' : left !== null && left <= 4 ? `${left} LEFT` : ''}
                  </span>
                  {sel && <span style={{ width: 20, height: 3, background: A }} />}
                </button>
              );
            })}
          </div>
          {avail === null && <div style={{ ...mono, marginTop: 10 }}>Checking open spots…</div>}

          {sortedDates.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {sortedDates.map((iso) => (
                <span key={iso} style={{
                  fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13.5, letterSpacing: '.05em', textTransform: 'uppercase',
                  color: 'var(--text)', background: 'var(--bg)', border: `1px solid ${A}`, padding: '6px 12px',
                }}>{fmtDate(iso)}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <button disabled={!daysReady} onClick={() => setStep(2)} style={{ ...primaryBtn(daysReady), width: '100%', flex: 'none' }}>
          {daysReady
            ? `Continue — ${pass.name} · ${sortedDates.length} day${sortedDates.length > 1 ? 's' : ''} · ${pass.price} →`
            : pass.id === 'flex3'
              ? `Pick ${3 - selectedDates.length} more day${3 - selectedDates.length > 1 ? 's' : ''} to continue`
              : 'Pick a day to continue'}
        </button>
      </div>
    </div>
  );

  /* ----- step 2: details ----- */
  const field = {
    width: '100%', boxSizing: 'border-box', background: 'var(--bg)', border: '1.5px solid var(--border-2)',
    color: 'var(--text)', fontFamily: "'Barlow'", fontSize: 16, padding: '13px 15px', outline: 'none',
  };
  const fieldLabel = { display: 'block', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 7 };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const detailsStep = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: 'var(--bg)', border: '1px solid var(--border)', padding: '14px 18px', marginBottom: 24 }}>
        <span style={mono}>BOOKING</span>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', color: A }}>{pass.name}</span>
        <span style={{ color: 'var(--border-strong)' }}>·</span>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', color: 'var(--text)' }}>
          {sortedDates.map(fmtDate).join('  ·  ')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <label><span style={fieldLabel}>Athlete Name</span><input value={form.athlete} onChange={set('athlete')} placeholder="Jordan Smith" style={field} /></label>
        <label><span style={fieldLabel}>Age</span><input value={form.age} onChange={set('age')} placeholder="12" style={field} inputMode="numeric" /></label>
      </div>
      <div style={{ marginBottom: 14 }}>
        <span style={fieldLabel}>Sport</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Baseball', 'Softball'].map((sp) => {
            const on = form.sport === sp;
            return (
              <button key={sp} onClick={() => setForm((f) => ({ ...f, sport: sp }))} style={{
                flex: 1, padding: 13, cursor: 'pointer', font: 'inherit',
                fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: '.06em', textTransform: 'uppercase',
                border: `1.5px solid ${on ? A : 'var(--border-2)'}`, background: on ? '#16110c' : 'var(--bg)', color: on ? A : 'var(--text-2)',
              }}>{sp === 'Baseball' ? '⚾' : '🥎'} {sp}</button>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 26 }}>
        <label><span style={fieldLabel}>Parent / Guardian</span><input value={form.parent} onChange={set('parent')} placeholder="Optional" style={field} /></label>
        <label><span style={fieldLabel}>Email or Phone</span><input value={form.contact} onChange={set('contact')} placeholder="you@email.com" style={field} /></label>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
        <button disabled={!canSubmit} onClick={goToPayment} style={primaryBtn(!!canSubmit)}>
          {submitting ? 'Opening Secure Checkout…' : `Continue to Payment — ${pass.price}`}
        </button>
      </div>
      <p style={{ marginTop: 14, ...mono, fontSize: 11, letterSpacing: '.06em', color: 'var(--text-5)', textAlign: 'center' }}>
        Secure payment by Stripe. Your spots are held for 30 minutes while you check out.
      </p>
    </div>
  );

  /* ----- step 3: paid & confirmed (arrived via Stripe's success redirect,
         so local selection state is gone — keep it generic) ----- */
  const confirmedStep = (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontSize: 38, color: 'var(--ink)' }}>✓</div>
      <h2 style={{ fontFamily: "'Anton'", fontSize: 'clamp(30px,5vw,46px)', lineHeight: 1.05, textTransform: 'uppercase', color: 'var(--text)' }}>You're Locked In</h2>
      <p style={{ marginTop: 14, color: 'var(--text-2)', fontSize: 17, maxWidth: 460, margin: '14px auto 0' }}>
        Payment received — your athlete&apos;s spots are reserved. A Stripe receipt
        is on its way to your email, and Coach has been notified. See you at the field!
      </p>
      <div><button onClick={reset} style={{ ...ghostBtn, marginTop: 28, flex: 'none', padding: '14px 30px' }}>Book Another Pass</button></div>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--header-bg)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 22px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      <div style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(28px,5vw,56px) 22px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ ...mono, color: A, letterSpacing: '.3em', marginBottom: 14 }}>RESERVE YOUR SPOT</div>
          <h1 style={{ fontFamily: "'Anton'", fontSize: 'clamp(36px,7vw,68px)', lineHeight: 1.02, textTransform: 'uppercase', color: 'var(--text)' }}>Train Your Way</h1>
          <p style={{ marginTop: 14, color: 'var(--text-3)', fontSize: 16, maxWidth: 540, margin: '14px auto 0' }}>
            Pick your pass, choose your days, and lock in your athlete&apos;s spot.
            The after-school program runs Monday–Friday until 5:00 PM in Apollo Beach, FL.
          </p>
        </div>

        {indicator}

        {notice && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', marginBottom: 16,
            border: `1.5px solid ${notice.kind === 'error' ? A : 'var(--border-strong)'}`,
            background: 'var(--bg-1)', color: 'var(--text-2)', fontSize: 15, lineHeight: 1.5,
          }}>
            <span style={{ color: notice.kind === 'error' ? A : 'var(--text-3)', fontSize: 18, flexShrink: 0 }}>
              {notice.kind === 'error' ? '⚠' : 'ℹ'}
            </span>
            <span>{notice.text}</span>
          </div>
        )}

        <div style={{ ...card, padding: 'clamp(22px,4vw,40px)' }}>
          {!mounted ? (
            <div style={{ ...mono, textAlign: 'center', padding: '40px 0' }}>Loading booking…</div>
          ) : step === 1 ? sessionStep
            : step === 2 ? detailsStep
            : confirmedStep}
        </div>
      </div>
    </main>
  );
}

/* shared button styles (declared after component use via hoisting) */
function primaryBtn(enabled) {
  return {
    flex: 2, padding: 16, font: 'inherit', border: 'none', cursor: enabled ? 'pointer' : 'not-allowed',
    fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 17, letterSpacing: '.06em', textTransform: 'uppercase',
    color: 'var(--ink)', background: enabled ? 'var(--accent)' : 'var(--border-strong)',
  };
}
const ghostBtn = {
  flex: 1, padding: 16, font: 'inherit', cursor: 'pointer',
  fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, letterSpacing: '.06em', textTransform: 'uppercase',
  color: 'var(--text-2)', background: 'transparent', border: '1.5px solid var(--border-strong)',
};
