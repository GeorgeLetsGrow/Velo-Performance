'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fmtTime } from '../../lib/services';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  const dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  return `${dn} · ${mon} ${d.getDate()}`;
}
function fmtPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
function fmtWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const STATUS_COLOR = {
  paid: 'var(--accent)',
  hold: 'var(--text-3)',
  cancelled: 'var(--text-5)',
  expired: 'var(--text-5)',
};

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('bookings');

  useEffect(() => {
    setMounted(true);
    fetch('/.netlify/functions/admin-session')
      .then((r) => (r.ok ? r.json() : { ok: false }))
      .then((d) => setAuthed(!!d.ok))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  async function login(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/.netlify/functions/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
        setPassword('');
      } else if (res.status === 401) {
        setError('Wrong password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  }

  async function logout() {
    await fetch('/.netlify/functions/admin-logout', { method: 'POST' }).catch(() => {});
    setAuthed(false);
  }

  const A = 'var(--accent)';
  const card = { background: 'var(--bg-1)', border: '1px solid var(--border)' };
  const label = {
    fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 18, letterSpacing: '.06em',
    textTransform: 'uppercase', color: 'var(--text)',
  };
  const mono = { fontFamily: "'JetBrains Mono'", fontSize: 12, letterSpacing: '.1em', color: 'var(--text-4)' };
  const field = {
    width: '100%', boxSizing: 'border-box', background: 'var(--bg)', border: '1.5px solid var(--border-2)',
    color: 'var(--text)', fontFamily: "'Barlow'", fontSize: 16, padding: '13px 15px', outline: 'none',
  };
  const tabBtn = (on) => ({
    padding: '10px 20px', cursor: 'pointer', font: 'inherit',
    fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase',
    border: `1px solid ${on ? A : 'var(--border-2)'}`,
    color: on ? 'var(--ink)' : 'var(--text-2)', background: on ? A : 'var(--bg-1)',
  });

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-wash), var(--bg)', color: 'var(--text)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--header-bg)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 22px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/assets/velo-logo-transparent.png" alt="Velo Performance Lab" style={{ height: 52, width: 'auto', display: 'block' }} />
          </Link>
          {authed && (
            <button onClick={logout} style={{
              fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, letterSpacing: '.07em', textTransform: 'uppercase',
              color: 'var(--text-2)', background: 'transparent', border: '1.5px solid var(--border-strong)', padding: '8px 16px', cursor: 'pointer',
            }}>Log Out</button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px,5vw,56px) 22px 80px' }}>
        {!mounted || checking ? (
          <div style={{ ...mono, textAlign: 'center', padding: '60px 0' }}>Loading…</div>
        ) : !authed ? (
          <div style={{ maxWidth: 380, margin: '60px auto 0', ...card, padding: 'clamp(24px,4vw,36px)' }}>
            <div style={{ ...label, marginBottom: 18, textAlign: 'center' }}>Admin Login</div>
            <form onSubmit={login}>
              <label>
                <span style={{ display: 'block', fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 7 }}>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={field}
                  autoFocus
                />
              </label>
              {error && <div style={{ color: A, fontSize: 14, marginTop: 10 }}>{error}</div>}
              <button type="submit" disabled={!password || submitting} style={{
                width: '100%', marginTop: 18, padding: 16, font: 'inherit', border: 'none',
                cursor: !password || submitting ? 'not-allowed' : 'pointer',
                fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 17, letterSpacing: '.06em', textTransform: 'uppercase',
                color: 'var(--ink)', background: !password || submitting ? 'var(--border-strong)' : A,
              }}>{submitting ? 'Checking…' : 'Log In'}</button>
            </form>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <button style={tabBtn(tab === 'bookings')} onClick={() => setTab('bookings')}>Bookings</button>
              <button style={tabBtn(tab === 'messages')} onClick={() => setTab('messages')}>Messages</button>
            </div>
            {tab === 'bookings' ? <BookingsPanel styles={{ A, card, label, mono }} /> : <MessagesPanel styles={{ A, card, label, mono }} />}
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- Bookings ---------------- */
function BookingsPanel({ styles }) {
  const { A, card, label, mono } = styles;
  const [bookings, setBookings] = useState(null); // null = loading, 'error', or array
  const [statusFilter, setStatusFilter] = useState('');
  const [refunding, setRefunding] = useState(null); // booking id in flight
  const [notice, setNotice] = useState(null);

  const load = useCallback(() => {
    setBookings(null);
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/.netlify/functions/list-bookings${qs}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setBookings(d.bookings))
      .catch(() => setBookings('error'));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function refund(b) {
    if (!window.confirm(`Refund ${fmtPrice(b.price_cents)} to ${b.athlete_name}'s contact and cancel this booking? This can't be undone.`)) return;
    setRefunding(b.id);
    setNotice(null);
    try {
      const res = await fetch('/.netlify/functions/refund-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotice({ kind: 'info', text: `Refunded and cancelled ${b.athlete_name}'s ${b.item_name}.` });
        load();
      } else if (res.status === 207) {
        setNotice({ kind: 'error', text: `Refund went through on Stripe, but the booking row didn't update — cancel it manually in Supabase.` });
      } else {
        setNotice({ kind: 'error', text: 'Refund failed. Nothing was charged back — try again or check Stripe.' });
      }
    } catch {
      setNotice({ kind: 'error', text: 'Refund failed. Nothing was charged back — try again or check Stripe.' });
    }
    setRefunding(null);
  }

  const statusTab = (v, text) => (
    <button key={v} onClick={() => setStatusFilter(v)} style={{
      padding: '7px 14px', cursor: 'pointer', font: 'inherit',
      fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: '.06em', textTransform: 'uppercase',
      border: `1px solid ${statusFilter === v ? A : 'var(--border-2)'}`,
      color: statusFilter === v ? 'var(--ink)' : 'var(--text-2)', background: statusFilter === v ? A : 'transparent',
    }}>{text}</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {statusTab('', 'All')}
        {statusTab('paid', 'Paid')}
        {statusTab('hold', 'Hold')}
        {statusTab('cancelled', 'Cancelled')}
        {statusTab('expired', 'Expired')}
      </div>

      {notice && (
        <div style={{
          padding: '12px 16px', marginBottom: 14, border: `1.5px solid ${notice.kind === 'error' ? A : 'var(--border-strong)'}`,
          background: 'var(--bg-1)', color: 'var(--text-2)', fontSize: 14.5,
        }}>{notice.text}</div>
      )}

      <div style={{ ...card, overflowX: 'auto' }}>
        {bookings === null ? (
          <div style={{ ...mono, textAlign: 'center', padding: '40px 0' }}>Loading bookings…</div>
        ) : bookings === 'error' ? (
          <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-2)' }}>Couldn&apos;t load bookings.</span>
            <button onClick={load} style={{ padding: '8px 16px', cursor: 'pointer', border: '1.5px solid var(--border-strong)', background: 'transparent', color: 'var(--text-2)', font: 'inherit' }}>Retry</button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ ...mono, textAlign: 'center', padding: '40px 0' }}>No bookings yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ ...mono, textAlign: 'left' }}>
                {['When', 'Athlete', 'Item', 'Price', 'Contact', 'Status', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--text-2)', fontSize: 14 }}>
                    {b.kind === 'pass' ? (
                      (b.booking_days || []).map((d) => d.session_date).sort().map((d) => fmtDate(d)).join(', ') || '—'
                    ) : (
                      <>{fmtDate(b.session_date)}<br /><span style={{ color: 'var(--text-4)' }}>{fmtTime(b.start_min)}</span></>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text)', fontSize: 14 }}>
                    {b.athlete_name}{b.athlete_age ? ` (${b.athlete_age})` : ''}{b.sport ? <><br /><span style={{ color: 'var(--text-4)', fontSize: 12.5 }}>{b.sport}</span></> : null}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)', fontSize: 14 }}>
                    {b.item_name}
                    {b.kind === 'pass' && <><br /><span style={{ color: 'var(--text-4)', fontSize: 12.5 }}>Day Pass</span></>}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)', fontSize: 14, whiteSpace: 'nowrap' }}>{fmtPrice(b.price_cents)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)', fontSize: 14 }}>{b.contact}</td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ ...mono, color: STATUS_COLOR[b.status] || 'var(--text-3)', textTransform: 'uppercase' }}>{b.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    {b.status === 'paid' && (
                      <button onClick={() => refund(b)} disabled={refunding === b.id} style={{
                        padding: '7px 14px', cursor: refunding === b.id ? 'not-allowed' : 'pointer', font: 'inherit',
                        fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: '.06em', textTransform: 'uppercase',
                        border: '1.5px solid var(--border-strong)', color: 'var(--text-2)', background: 'transparent',
                      }}>{refunding === b.id ? 'Refunding…' : 'Refund'}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------------- Messages ---------------- */
function MessagesPanel({ styles }) {
  const { A, card, mono } = styles;
  const [messages, setMessages] = useState(null); // null = loading, 'error', or array

  const load = useCallback(() => {
    setMessages(null);
    fetch('/.netlify/functions/list-messages')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setMessages(d.messages))
      .catch(() => setMessages('error'));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (messages === null) {
    return <div style={{ ...card, ...mono, textAlign: 'center', padding: '40px 0' }}>Loading messages…</div>;
  }
  if (messages === 'error') {
    return (
      <div style={{ ...card, padding: '30px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-2)' }}>Couldn&apos;t load messages.</span>
        <button onClick={load} style={{ padding: '8px 16px', cursor: 'pointer', border: '1.5px solid var(--border-strong)', background: 'transparent', color: 'var(--text-2)', font: 'inherit' }}>Retry</button>
      </div>
    );
  }
  if (messages.length === 0) {
    return <div style={{ ...card, ...mono, textAlign: 'center', padding: '40px 0' }}>No messages yet.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {messages.map((m) => (
        <div key={m.id} style={{ ...card, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 16, textTransform: 'uppercase', color: 'var(--text)' }}>{m.parentName}</span>
              <span style={{ ...mono, marginLeft: 10 }}>{m.contact}</span>
            </div>
            <span style={{ ...mono }}>{fmtWhen(m.createdAt)}</span>
          </div>
          {m.interest && <div style={{ marginTop: 6, color: A, fontSize: 13.5 }}>Interested in: {m.interest}</div>}
          {m.note && <div style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 14.5, lineHeight: 1.5 }}>{m.note}</div>}
          {m.replyHref && (
            <a href={m.replyHref} style={{
              display: 'inline-block', marginTop: 12, padding: '8px 16px', textDecoration: 'none',
              fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 12.5, letterSpacing: '.06em', textTransform: 'uppercase',
              border: '1.5px solid var(--border-strong)', color: 'var(--text-2)',
            }}>Reply</a>
          )}
        </div>
      ))}
    </div>
  );
}
