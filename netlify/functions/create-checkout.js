// POST /.netlify/functions/create-checkout
// Body: { passId, dates: ["YYYY-MM-DD", ...], athlete, age, sport, parent, contact }
//
// 1. Validates the pass and its days against the server-side pass table.
// 2. Inserts a 35-minute hold (booking + its days) — the day-capacity trigger
//    makes this the atomic reservation; a 409 means a day just filled up.
// 3. Creates a Stripe Checkout Session (expires in 30 min, priced server-side).
// 4. Returns { url } for the browser to redirect to.
//
// Env vars: STRIPE_SECRET_KEY plus the Supabase pair used by lib/db.js.

const { PASSES, isIsoDate, isWeekday, mondayOf, fmtDay } = require('../../lib/services');
const { sb } = require('../../lib/db');

const HOLD_MINUTES = 35; // outlives the 30-min Stripe session slightly

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return json(503, { error: 'payments_not_configured' });

  let input;
  try {
    input = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'bad_json' });
  }

  const pass = PASSES.find((p) => p.id === input.passId);
  const athlete = String(input.athlete || '').trim();
  const contact = String(input.contact || '').trim();
  const dates = Array.isArray(input.dates) ? [...new Set(input.dates.map(String))].sort() : [];

  if (!pass) return json(400, { error: 'bad_pass' });
  if (!athlete || !contact) return json(400, { error: 'missing_fields' });
  if (!dates.length || !dates.every((d) => isIsoDate(d) && isWeekday(d))) {
    return json(400, { error: 'bad_dates' });
  }
  // Facility-local "today" (en-CA gives YYYY-MM-DD, comparable as a string)
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  if (dates[0] < today) return json(400, { error: 'past_date' });

  // Day-count rules per pass; weekly passes must stay within one Mon–Fri week.
  if (pass.id === 'dropin' && dates.length !== 1) return json(400, { error: 'bad_dates' });
  if (pass.id === 'flex3' && dates.length !== 3) return json(400, { error: 'bad_dates' });
  if (pass.id === 'unlimited' && (dates.length < 1 || dates.length > 5)) return json(400, { error: 'bad_dates' });
  if (pass.id !== 'dropin' && new Set(dates.map(mondayOf)).size !== 1) {
    return json(400, { error: 'not_same_week' });
  }

  try {
    // Free spots from abandoned checkouts before trying to reserve
    // (cascade removes their booking_days).
    await sb(`/bookings?status=eq.hold&hold_expires_at=lt.${new Date().toISOString()}`, {
      method: 'DELETE',
    });

    const hold = await sb('/bookings', {
      method: 'POST',
      prefer: 'return=representation',
      body: {
        pass_id: pass.id,
        pass_name: pass.name,
        price_cents: pass.cents,
        athlete_name: athlete,
        athlete_age: String(input.age || '').trim() || null,
        sport: String(input.sport || '').trim() || null,
        parent_name: String(input.parent || '').trim() || null,
        contact,
        status: 'hold',
        hold_expires_at: new Date(Date.now() + HOLD_MINUTES * 60000).toISOString(),
      },
    });
    if (!hold.ok || !hold.data || !hold.data[0]) {
      console.error('hold insert failed:', hold.status, hold.text);
      return json(502, { error: 'db' });
    }
    const booking = hold.data[0];

    // Atomic reservation: the capacity trigger rejects the whole insert if
    // any requested day is already full.
    const daysRes = await sb('/booking_days', {
      method: 'POST',
      body: dates.map((d) => ({ booking_id: booking.id, session_date: d })),
    });
    if (!daysRes.ok) {
      await sb(`/bookings?id=eq.${booking.id}&status=eq.hold`, { method: 'DELETE' });
      if (daysRes.status === 409) return json(409, { error: 'day_full' });
      console.error('days insert failed:', daysRes.status, daysRes.text);
      return json(502, { error: 'db' });
    }

    const origin = process.env.URL || `https://${event.headers.host}`;
    const daysLabel = dates.map(fmtDay).join(', ');
    const params = new URLSearchParams({
      mode: 'payment',
      expires_at: String(Math.floor(Date.now() / 1000) + 30 * 60),
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(pass.cents),
      'line_items[0][price_data][product_data][name]': `${pass.name} — Velo After-School Training`,
      'line_items[0][price_data][product_data][description]': `Athlete: ${athlete} · ${daysLabel}`,
      success_url: `${origin}/book/?paid=1&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/?cancelled=1&bid=${booking.id}`,
      'metadata[booking_id]': booking.id,
      'payment_intent_data[description]': `${pass.name} (${daysLabel}) — ${athlete}`,
    });
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) params.set('customer_email', contact);

    const sres = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    const session = await sres.json();
    if (!sres.ok) {
      console.error('Stripe session failed:', JSON.stringify(session.error || session));
      // Give the spots back — nobody is going to pay for this hold.
      await sb(`/bookings?id=eq.${booking.id}&status=eq.hold`, { method: 'DELETE' });
      return json(502, { error: 'stripe' });
    }

    await sb(`/bookings?id=eq.${booking.id}`, {
      method: 'PATCH',
      body: { stripe_session_id: session.id },
    });

    return json(200, { url: session.url });
  } catch (err) {
    console.error(err);
    return json(502, { error: 'unavailable' });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
