'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SERVICES as SERVICE_DEFS,
  DAY_START,
  DAY_END,
  SLOT_STEP,
  overlaps,
} from '../../lib/services';

/* ---------------- Data ---------------- */
// Prices/durations live in lib/services.js (shared with the payment backend);
// this just adds a display-ready price string.
const SERVICES = SERVICE_DEFS.map((s) => ({ ...s, price: `$${s.cents / 100}` }));

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

function fmtTime(mins) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  const dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  return `${dn} · ${MON[d.getMonth()]} ${d.getDate()}`;
}

// Open slots for a service/day given the busy ranges from get-availability.
function slotsFor(service, iso, busy) {
  if (!service || !iso || !Array.isArray(busy)) return [];
  const out = [];
  for (let t = DAY_START; t + service.duration <= DAY_END; t += SLOT_STEP) {
    const taken = busy.some(([s, e]) => overlaps(t, t + service.duration, s, e));
    out.push({ mins: t, taken });
  }
  return out;
}

/* ---------------- Page ---------------- */
export default function BookPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ athlete: '', age: '', sport: 'Baseball', parent: '', contact: '' });
  // Availability for the selected date: null = loading, 'error', or busy ranges
  const [busy, setBusy] = useState(null);
  const [availReload, setAvailReload] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { kind: 'error'|'info', text }

  // Handle returning from Stripe Checkout (success or cancel).
  useEffect(() => {
    setMounted(true);
    const q = new URLSearchParams(window.location.search);
    if (q.get('paid') === '1') {
      setStep(4);
    } else if (q.get('cancelled') === '1') {
      const bid = q.get('bid');
      if (bid) {
        // Free the held slot right away instead of waiting out the 30-min hold.
        fetch('/.netlify/functions/release-hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bid }),
        }).catch(() => {});
      }
      setNotice({ kind: 'info', text: 'Checkout cancelled — your slot was released. Pick a time whenever you’re ready.' });
    }
    if (q.get('paid') || q.get('cancelled')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Load real availability whenever a day is selected.
  useEffect(() => {
    if (!date) return;
    let stale = false;
    setBusy(null);
    fetch(`/.netlify/functions/get-availability?date=${date}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => { if (!stale) setBusy(d.busy); })
      .catch(() => { if (!stale) setBusy('error'); });
    return () => { stale = true; };
  }, [date, availReload]);

  const service = SERVICES.find((s) => s.id === serviceId) || null;
  const week = buildWeek(weekOffset);
  const slots = slotsFor(service, date, busy);
  const canSubmit = form.athlete.trim() && String(form.age).trim() && form.contact.trim() && !submitting;

  async function goToPayment() {
    if (!canSubmit || !service || !date || time == null) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          startMin: time,
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
        setNotice({ kind: 'error', text: 'That time was just taken by someone else — please pick another slot.' });
        setTime(null);
        setStep(2);
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

  function pickService(id) {
    setServiceId(id);
    setTime(null);
    setStep(2);
  }
  function pickDate(iso) {
    setDate(iso);
    setTime(null);
  }
  function reset() {
    setStep(1);
    setServiceId(null);
    setDate(null);
    setTime(null);
    setForm({ athlete: '', age: '', sport: 'Baseball', parent: '', contact: '' });
    setNotice(null);
    setSubmitting(false);
  }

  /* ----- step indicator ----- */
  const steps = ['Service', 'Date & Time', 'Details', 'Done'];
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

  /* ----- step 1: service ----- */
  const serviceStep = (
    <div>
      <div style={{ ...label, marginBottom: 14 }}>Choose a Service</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
        {SERVICES.map((s) => {
          const sel = s.id === serviceId;
          return (
            <button key={s.id} onClick={() => pickService(s.id)} style={{
              textAlign: 'left', cursor: 'pointer', padding: '20px 22px', font: 'inherit',
              background: sel ? '#16110c' : 'var(--bg-1)', border: `1.5px solid ${sel ? A : 'var(--border-2)'}`,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 20, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--text)' }}>{s.name}</span>
                <span style={{ fontFamily: "'Anton'", fontSize: 22, color: sel ? A : 'var(--text)' }}>{s.price}</span>
              </div>
              <div style={{ color: 'var(--text-3)', fontSize: 14.5, lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ ...mono, color: sel ? A : 'var(--text-4)' }}>{s.duration} MIN SESSION</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ----- step 2: date & time ----- */
  const tab = (on) => ({
    flex: 1, padding: 12, cursor: 'pointer', font: 'inherit',
    fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase',
    border: `1px solid ${on ? A : 'var(--border-2)'}`,
    color: on ? 'var(--ink)' : 'var(--text-2)', background: on ? A : 'var(--bg-1)',
  });

  const dateTimeStep = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={label}>Pick a Day</div>
        {service && <div style={mono}>{service.name} · {service.duration} min</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '10px 0 16px', maxWidth: 340 }}>
        <button onClick={() => { setWeekOffset(0); setDate(null); setTime(null); }} style={tab(weekOffset === 0)}>This Week</button>
        <button onClick={() => { setWeekOffset(1); setDate(null); setTime(null); }} style={tab(weekOffset === 1)}>Next Week</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
        {week.map((d) => {
          const sel = d.iso === date;
          const disabled = d.past;
          return (
            <button key={d.iso} disabled={disabled} onClick={() => pickDate(d.iso)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '16px 4px', font: 'inherit',
              cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
              border: `1.5px solid ${sel ? A : 'var(--border-2)'}`, background: sel ? '#16110c' : 'var(--bg-1)',
            }}>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: '.1em', color: 'var(--text-4)' }}>{d.dow}</span>
              <span style={{ fontFamily: "'Anton'", fontSize: 26, lineHeight: 1, color: sel ? A : 'var(--text)' }}>{d.day}</span>
              <span style={{ fontFamily: "'Barlow'", fontSize: 11, color: 'var(--text-4)' }}>{d.mon}</span>
            </button>
          );
        })}
      </div>

      <div style={{ ...label, margin: '28px 0 14px' }}>
        {date ? `Available Times — ${fmtDate(date)}` : 'Select a day to see times'}
      </div>
      {date && busy === null && (
        <div style={{ ...mono, padding: '18px 0' }}>Checking open times…</div>
      )}
      {date && busy === 'error' && (
        <div style={{ padding: '14px 16px', border: '1px solid var(--border-2)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-2)', fontSize: 15 }}>Couldn&apos;t load availability.</span>
          <button onClick={() => setAvailReload((n) => n + 1)} style={{ ...ghostBtn, flex: 'none', padding: '9px 18px', fontSize: 13 }}>Retry</button>
        </div>
      )}
      {date && Array.isArray(busy) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(104px,1fr))', gap: 8 }}>
          {slots.map((slot) => {
            const sel = slot.mins === time;
            return (
              <button key={slot.mins} disabled={slot.taken} onClick={() => setTime(slot.mins)} style={{
                padding: '13px 8px', font: 'inherit', cursor: slot.taken ? 'not-allowed' : 'pointer',
                fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, letterSpacing: '.03em',
                border: `1.5px solid ${sel ? A : 'var(--border-2)'}`,
                background: sel ? A : slot.taken ? 'var(--bg-2)' : 'var(--bg-1)',
                color: sel ? 'var(--ink)' : slot.taken ? 'var(--text-5)' : 'var(--text)',
                textDecoration: slot.taken ? 'line-through' : 'none',
              }}>{fmtTime(slot.mins)}</button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <button onClick={() => setStep(1)} style={ghostBtn}>← Back</button>
        <button disabled={!time} onClick={() => setStep(3)} style={primaryBtn(!!time)}>Continue →</button>
      </div>
    </div>
  );

  /* ----- step 3: details ----- */
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
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', color: A }}>{service?.name}</span>
        <span style={{ color: 'var(--border-strong)' }}>·</span>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', color: 'var(--text)' }}>{fmtDate(date)} · {fmtTime(time)}</span>
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
        <button onClick={() => setStep(2)} style={ghostBtn}>← Back</button>
        <button disabled={!canSubmit} onClick={goToPayment} style={primaryBtn(!!canSubmit)}>
          {submitting ? 'Opening Secure Checkout…' : `Continue to Payment — ${service?.price}`}
        </button>
      </div>
      <p style={{ marginTop: 14, ...mono, fontSize: 11, letterSpacing: '.06em', color: 'var(--text-5)', textAlign: 'center' }}>
        Secure payment by Stripe. Your slot is held for 30 minutes while you check out.
      </p>
    </div>
  );

  /* ----- step 4: paid & confirmed (arrived via Stripe's success redirect,
         so local selection state is gone — keep it generic) ----- */
  const confirmedStep = (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontSize: 38, color: 'var(--ink)' }}>✓</div>
      <h2 style={{ fontFamily: "'Anton'", fontSize: 'clamp(30px,5vw,46px)', lineHeight: 1.05, textTransform: 'uppercase', color: 'var(--text)' }}>Session Booked</h2>
      <p style={{ marginTop: 14, color: 'var(--text-2)', fontSize: 17, maxWidth: 460, margin: '14px auto 0' }}>
        Payment received — your athlete is locked in. A Stripe receipt is on its
        way to your email, and Coach has been notified. See you at the field!
      </p>
      <div><button onClick={reset} style={{ ...ghostBtn, marginTop: 28, flex: 'none', padding: '14px 30px' }}>Book Another Session</button></div>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--header-bg)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 22px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      <div style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(28px,5vw,56px) 22px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ ...mono, color: A, letterSpacing: '.3em', marginBottom: 14 }}>BOOK A SESSION</div>
          <h1 style={{ fontFamily: "'Anton'", fontSize: 'clamp(36px,7vw,68px)', lineHeight: 1.02, textTransform: 'uppercase', color: 'var(--text)' }}>Reserve Your Time</h1>
          <p style={{ marginTop: 14, color: 'var(--text-3)', fontSize: 16, maxWidth: 520, margin: '14px auto 0' }}>
            Pick a service, choose a day, and grab an open time slot. Sessions run Monday–Friday, 3:00–7:00 PM in Apollo Beach, FL.
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
          ) : step === 1 ? serviceStep
            : step === 2 ? dateTimeStep
            : step === 3 ? detailsStep
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
