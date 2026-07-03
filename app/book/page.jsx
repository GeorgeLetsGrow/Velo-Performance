'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PASSES as PASS_DEFS,
  LESSONS as LESSON_DEFS,
  CAPACITY,
  LESSON_START,
  LESSON_END,
  SLOT_STEP,
  fmtTime,
  overlaps,
} from '../../lib/services';

/* ---------------- Data ---------------- */
// Prices live in lib/services.js (shared with the payment backend);
// this just adds a display-ready price string.
const PASSES = PASS_DEFS.map((p) => ({ ...p, price: `$${p.cents / 100}` }));
const LESSONS = LESSON_DEFS.map((l) => ({ ...l, price: `$${l.cents / 100}` }));

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

// Open lesson start times for a day, given that day's busy ranges.
function slotsFor(lesson, busyRanges) {
  const ranges = busyRanges || [];
  const out = [];
  for (let t = LESSON_START; t + lesson.duration <= LESSON_END; t += SLOT_STEP) {
    const taken = ranges.some(([s, e]) => overlaps(t, t + lesson.duration, s, e));
    out.push({ mins: t, taken });
  }
  return out;
}

/* ---------------- Page ---------------- */
export default function BookPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('pass'); // 'pass' | 'lesson'
  const [passId, setPassId] = useState(PASSES[0].id);
  const [lessonId, setLessonId] = useState(LESSONS[0].id);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDates, setSelectedDates] = useState([]); // pass mode
  const [lessonDate, setLessonDate] = useState(null);     // lesson mode
  const [lessonTime, setLessonTime] = useState(null);
  const [form, setForm] = useState({ athlete: '', age: '', sport: 'Baseball', parent: '', contact: '' });
  // Availability for both weeks: null = loading, 'error', or { capacity, taken, busy }
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
        // Free the held reservation right away instead of waiting out the 30-min hold.
        fetch('/.netlify/functions/release-hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bid }),
        }).catch(() => {});
      }
      setNotice({ kind: 'info', text: 'Checkout cancelled — your reservation was released. Pick again whenever you’re ready.' });
    }
    if (q.get('paid') || q.get('cancelled')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Load spot counts + lesson busy ranges for this week + next week in one call.
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
  const lesson = LESSONS.find((l) => l.id === lessonId) || LESSONS[0];
  const week = buildWeek(weekOffset);
  const capacity = (avail && avail.capacity) || CAPACITY;
  const loaded = avail && avail !== 'error';

  function spotsLeft(iso) {
    if (!loaded) return null; // unknown while loading
    return Math.max(0, capacity - ((avail.taken && avail.taken[iso]) || 0));
  }
  function selectable(d) {
    if (d.past) return false;
    const left = spotsLeft(d.iso);
    return left === null || left > 0; // optimistic while loading; server re-validates
  }
  const lessonSlots = lessonDate
    ? slotsFor(lesson, loaded && avail.busy ? avail.busy[lessonDate] : [])
    : [];

  // How many bookable days the visible week still has — drives the guards
  // below that stop late-week purchases that can't work (Flex) or aren't
  // worth it (Unlimited).
  const openDaysInWeek = (mode === 'lesson' ? week.filter((d) => !d.past) : week.filter(selectable)).length;
  const pass_ = PASSES.find((p) => p.id === passId) || PASSES[0];
  const weekGuard = (() => {
    if (openDaysInWeek === 0) {
      return {
        title: 'This training week is done',
        text: weekOffset === 0
          ? 'Switch to next week to keep training.'
          : 'No open days this week.',
      };
    }
    if (mode !== 'pass') return null;
    if (pass_.id === 'flex3' && openDaysInWeek < 3) {
      return {
        title: 'Not enough days left this week for a Flex Pass',
        text: `Only ${openDaysInWeek} bookable ${openDaysInWeek === 1 ? 'day remains' : 'days remain'} this week. ` +
          (weekOffset === 0
            ? 'Pick any 3 days next week, or book a Drop-In for the remaining time.'
            : 'Book a Drop-In for the open days instead.'),
      };
    }
    if (pass_.id === 'unlimited' && openDaysInWeek <= 2) {
      return {
        title: 'Unlimited isn’t worth it this late in the week',
        text: `Only ${openDaysInWeek} training ${openDaysInWeek === 1 ? 'day is' : 'days are'} left this week — a $60 Drop-In per day is the better value.` +
          (weekOffset === 0 ? ' Or go Unlimited next week.' : ''),
      };
    }
    return null;
  })();

  // Unlimited covers every remaining open day of the visible week — unless
  // the week is too far gone (≤2 days), where the guard steers elsewhere.
  useEffect(() => {
    if (mode !== 'pass' || passId !== 'unlimited') return;
    const open = buildWeek(weekOffset).filter(selectable);
    setSelectedDates(open.length <= 2 ? [] : open.map((d) => d.iso));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, passId, weekOffset, avail]);

  function switchMode(m) {
    setMode(m);
    setSelectedDates([]);
    setLessonDate(null);
    setLessonTime(null);
  }
  function pickPass(id) {
    setPassId(id);
    setSelectedDates([]); // the unlimited effect repopulates when relevant
  }
  // Changing the lesson keeps the chosen day but clears the time — durations
  // differ, so which start times fit changes with the lesson.
  function pickLesson(id) {
    setLessonId(id);
    setLessonTime(null);
  }
  function switchWeek(n) {
    setWeekOffset(n);
    setSelectedDates([]);
    setLessonDate(null);
    setLessonTime(null);
  }
  function pickDay(d) {
    if (mode === 'lesson') {
      if (d.past) return;
      setLessonDate(d.iso);
      setLessonTime(null);
      return;
    }
    if (!selectable(d) || passId === 'unlimited') return;
    // A guarded week (e.g. Flex with <3 days left) can't lead anywhere —
    // don't collect selections that can never complete.
    if (passId === 'flex3' && openDaysInWeek < 3) return;
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
    setMode('pass');
    setPassId(PASSES[0].id);
    setLessonId(LESSONS[0].id);
    setWeekOffset(0);
    setSelectedDates([]);
    setLessonDate(null);
    setLessonTime(null);
    setForm({ athlete: '', age: '', sport: 'Baseball', parent: '', contact: '' });
    setNotice(null);
    setSubmitting(false);
    setAvailReload((n) => n + 1);
  }

  const sortedDates = [...selectedDates].sort();
  const daysReady =
    mode === 'lesson'
      ? Boolean(lessonDate && lessonTime != null)
      : pass.id === 'unlimited'
        ? selectedDates.length >= 1
        : selectedDates.length === (pass.id === 'dropin' ? 1 : 3);
  const item = mode === 'lesson' ? lesson : pass;
  const canSubmit = form.athlete.trim() && String(form.age).trim() && form.contact.trim() && !submitting;

  async function goToPayment() {
    if (!canSubmit || !daysReady) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const body = {
        kind: mode,
        itemId: item.id,
        athlete: form.athlete,
        age: form.age,
        sport: form.sport,
        parent: form.parent,
        contact: form.contact,
      };
      if (mode === 'lesson') {
        body.date = lessonDate;
        body.startMin = lessonTime;
      } else {
        body.dates = sortedDates;
      }
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.assign(data.url); // off to Stripe Checkout
        return;
      }
      if (res.status === 409) {
        setNotice({
          kind: 'error',
          text: mode === 'lesson'
            ? 'That time was just taken — please pick another slot.'
            : 'One of those days just filled up — please pick again.',
        });
        setSelectedDates([]);
        setLessonTime(null);
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

  /* ----- mode toggle ----- */
  const modeTab = (on) => ({
    flex: 1, padding: '14px 12px', cursor: 'pointer', font: 'inherit', textAlign: 'center',
    border: `1.5px solid ${on ? A : 'var(--border-2)'}`,
    background: on ? '#16110c' : 'var(--bg-1)',
  });
  const modeToggle = (
    <div style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
      {[
        ['pass', 'Day Passes', 'After-school program · until 5:00 PM'],
        ['lesson', 'Individual Training', '1-on-1 sessions · 5:00–7:00 PM'],
      ].map(([m, title, sub]) => {
        const on = mode === m;
        return (
          <button key={m} onClick={() => switchMode(m)} style={modeTab(on)} aria-pressed={on}>
            <span style={{ display: 'block', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 18, letterSpacing: '.04em', textTransform: 'uppercase', color: on ? A : 'var(--text)' }}>{title}</span>
            <span style={{ display: 'block', ...mono, fontSize: 10, marginTop: 4 }}>{sub.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );

  /* ----- option radio list (passes or lessons) ----- */
  const optionRadio = (options, currentId, onPick) => (
    <div role="radiogroup" aria-label={mode === 'pass' ? 'Pass' : 'Training session'} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((o) => {
        const sel = o.id === currentId;
        return (
          <button key={o.id} role="radio" aria-checked={sel} onClick={() => onPick(o.id)} style={{
            textAlign: 'left', cursor: 'pointer', padding: '14px 16px', font: 'inherit', position: 'relative',
            background: sel ? '#16110c' : 'var(--bg-1)', border: `1.5px solid ${sel ? A : 'var(--border-2)'}`,
            display: 'flex', alignItems: 'center', gap: 13,
          }}>
            {o.popular && (
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
              <span style={{ display: 'block', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 17.5, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1.15 }}>{o.name}</span>
              <span style={{ display: 'block', color: 'var(--text-3)', fontSize: 13, lineHeight: 1.45, marginTop: 3 }}>{o.desc}</span>
            </span>
            <span style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ display: 'block', fontFamily: "'Anton'", fontSize: 19, color: sel ? A : 'var(--text)', lineHeight: 1 }}>{o.price}</span>
              <span style={{ display: 'block', ...mono, fontSize: 10, marginTop: 4, color: sel ? A : 'var(--text-4)' }}>
                {(o.unit || `${o.duration} min`).toUpperCase()}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  /* ----- step 1: everything on one screen ----- */
  const tab = (on) => ({
    flex: 1, padding: 12, cursor: 'pointer', font: 'inherit',
    fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase',
    border: `1px solid ${on ? A : 'var(--border-2)'}`,
    color: on ? 'var(--ink)' : 'var(--text-2)', background: on ? A : 'var(--bg-1)',
  });

  const dayHint = mode === 'lesson'
    ? (lessonDate ? 'Now pick a time below' : 'Pick a day to see open times')
    : pass.id === 'dropin'
      ? 'Pick your day'
      : pass.id === 'flex3'
        ? `Pick any 3 afternoons — ${selectedDates.length} of 3 selected`
        : 'Covers every remaining day of this week';

  const continueLabel = !daysReady
    ? mode === 'lesson'
      ? 'Pick a day & time to continue'
      : pass.id === 'flex3'
        ? `Pick ${3 - selectedDates.length} more day${3 - selectedDates.length > 1 ? 's' : ''} to continue`
        : 'Pick a day to continue'
    : mode === 'lesson'
      ? `Continue — ${lesson.name} · ${fmtDate(lessonDate)} · ${fmtTime(lessonTime)} →`
      : `Continue — ${pass.name} · ${sortedDates.length} day${sortedDates.length > 1 ? 's' : ''} · ${pass.price} →`;

  const sessionStep = (
    <div>
      {modeToggle}
      <div className="velo-book-grid" style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 'clamp(24px,4vw,40px)', alignItems: 'start' }}>
        {/* --- option (radio select) --- */}
        <div>
          <div style={{ ...label, marginBottom: 14 }}>
            1 · {mode === 'pass' ? 'Pick Your Pass' : 'Pick Your Session'}
          </div>
          {mode === 'pass'
            ? optionRadio(PASSES, passId, pickPass)
            : optionRadio(LESSONS, lessonId, pickLesson)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <span style={{ fontFamily: "'Anton'", fontSize: 16, color: A }}>{mode === 'pass' ? '☀' : '★'}</span>
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 14, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
              {mode === 'pass'
                ? 'After-school program · Monday–Friday until 5:00 PM'
                : '1-on-1 with a coach · Monday–Friday 5:00–7:00 PM'}
            </span>
          </div>
        </div>

        {/* --- days (and times for lessons) --- */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={label}>2 · {mode === 'pass' ? 'Pick Your Days' : 'Pick a Day & Time'}</div>
            <div style={{ ...mono, fontSize: 11 }}>{dayHint.toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, margin: '0 0 14px', maxWidth: 340 }}>
            <button onClick={() => switchWeek(0)} style={tab(weekOffset === 0)}>This Week</button>
            <button onClick={() => switchWeek(1)} style={tab(weekOffset === 1)}>Next Week</button>
          </div>
          {avail === 'error' && (
            <div style={{ padding: '14px 16px', marginBottom: 12, border: '1px solid var(--border-2)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-2)', fontSize: 15 }}>Couldn&apos;t check availability.</span>
              <button onClick={() => setAvailReload((n) => n + 1)} style={{ ...ghostBtn, flex: 'none', padding: '9px 18px', fontSize: 13 }}>Retry</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {week.map((d) => {
              const sel = mode === 'lesson' ? d.iso === lessonDate : selectedDates.includes(d.iso);
              const left = mode === 'pass' ? spotsLeft(d.iso) : null;
              const full = left === 0;
              const disabled = d.past || (mode === 'pass' && (full || passId === 'unlimited'));
              return (
                <button key={d.iso} disabled={disabled && !sel} onClick={() => pickDay(d)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 4px 10px', font: 'inherit',
                  cursor: d.past || full ? 'not-allowed' : mode === 'pass' && passId === 'unlimited' ? 'default' : 'pointer',
                  opacity: d.past || full ? 0.4 : 1,
                  border: `1.5px solid ${sel ? A : 'var(--border-2)'}`, background: sel ? '#16110c' : 'var(--bg-1)',
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: '.1em', color: 'var(--text-4)' }}>{d.dow}</span>
                  <span style={{ fontFamily: "'Anton'", fontSize: 24, lineHeight: 1, color: sel ? A : 'var(--text)' }}>{d.day}</span>
                  <span style={{ fontFamily: "'Barlow'", fontSize: 11, color: 'var(--text-4)' }}>{d.mon}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: '.08em', minHeight: 12, color: full ? 'var(--text-5)' : 'var(--gold)' }}>
                    {mode === 'pass' && !d.past ? (full ? 'FULL' : left !== null && left <= 4 ? `${left} LEFT` : '') : ''}
                  </span>
                  {sel && <span style={{ width: 20, height: 3, background: A }} />}
                </button>
              );
            })}
          </div>
          {avail === null && <div style={{ ...mono, marginTop: 10 }}>Checking availability…</div>}

          {weekGuard && (
            <div style={{ marginTop: 14, padding: '14px 16px', border: '1.5px solid var(--gold)', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 15, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--gold)' }}>{weekGuard.title}</span>
              <span style={{ color: 'var(--text-2)', fontSize: 14.5, lineHeight: 1.5 }}>{weekGuard.text}</span>
              {weekOffset === 0 && (
                <button onClick={() => switchWeek(1)} style={{
                  marginTop: 4, padding: '9px 16px', cursor: 'pointer', font: 'inherit',
                  fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 13, letterSpacing: '.07em', textTransform: 'uppercase',
                  color: 'var(--ink)', background: 'var(--gold)', border: 'none',
                }}>Go to Next Week →</button>
              )}
            </div>
          )}

          {/* pass mode: chips of picked days */}
          {mode === 'pass' && sortedDates.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {sortedDates.map((iso) => (
                <span key={iso} style={{
                  fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13.5, letterSpacing: '.05em', textTransform: 'uppercase',
                  color: 'var(--text)', background: 'var(--bg)', border: `1px solid ${A}`, padding: '6px 12px',
                }}>{fmtDate(iso)}</span>
              ))}
            </div>
          )}

          {/* lesson mode: time grid for the picked day */}
          {mode === 'lesson' && lessonDate && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{ ...label, fontSize: 15 }}>Open Times — {fmtDate(lessonDate)}</div>
                <div style={{ ...mono, fontSize: 10 }}>{lesson.name.toUpperCase()} · {lesson.duration} MIN</div>
              </div>
              {!loaded ? (
                <div style={{ ...mono }}>Checking open times…</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 8 }}>
                  {lessonSlots.map((slot) => {
                    const sel = slot.mins === lessonTime;
                    return (
                      <button key={slot.mins} disabled={slot.taken} onClick={() => setLessonTime(slot.mins)} style={{
                        padding: '12px 6px', font: 'inherit', cursor: slot.taken ? 'not-allowed' : 'pointer',
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
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <button disabled={!daysReady || Boolean(weekGuard)} onClick={() => setStep(2)} style={{ ...primaryBtn(daysReady && !weekGuard), width: '100%', flex: 'none' }}>
          {weekGuard ? weekGuard.title : continueLabel}
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
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', color: A }}>{item.name}</span>
        <span style={{ color: 'var(--border-strong)' }}>·</span>
        <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, textTransform: 'uppercase', color: 'var(--text)' }}>
          {mode === 'lesson'
            ? `${fmtDate(lessonDate)} · ${fmtTime(lessonTime)}`
            : sortedDates.map(fmtDate).join('  ·  ')}
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
          {submitting ? 'Opening Secure Checkout…' : `Continue to Payment — ${item.price}`}
        </button>
      </div>
      <p style={{ marginTop: 14, ...mono, fontSize: 11, letterSpacing: '.06em', color: 'var(--text-5)', textAlign: 'center' }}>
        Secure payment by Stripe. Your reservation is held for 30 minutes while you check out.
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
        Payment received — your athlete&apos;s spot is reserved. A Stripe receipt
        is on its way to your email, and Coach has been notified. See you at the field!
      </p>
      <div><button onClick={reset} style={{ ...ghostBtn, marginTop: 28, flex: 'none', padding: '14px 30px' }}>Book Another Session</button></div>
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
          <p style={{ marginTop: 14, color: 'var(--text-3)', fontSize: 16, maxWidth: 560, margin: '14px auto 0' }}>
            Join the after-school program with a day pass, or book a 1-on-1
            training session. Monday–Friday in Apollo Beach, FL.
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
