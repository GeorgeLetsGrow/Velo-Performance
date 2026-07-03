// POST /.netlify/functions/create-checkout
// Pass:   { kind: 'pass',   itemId, dates: ["YYYY-MM-DD", ...], athlete, age, sport, parent, contact }
// Lesson: { kind: 'lesson', itemId, date: "YYYY-MM-DD", startMin, athlete, age, sport, parent, contact }
//
// 1. Validates the purchase against the server-side tables in lib/services.js.
// 2. Inserts a 35-minute hold — the DB makes this the atomic reservation
//    (day-capacity trigger for passes, no-overlap constraint for lessons);
//    a 409 means someone else just got there first.
// 3. Creates a Stripe Checkout Session (expires in 30 min, priced server-side).
// 4. Returns { url } for the browser to redirect to.
//
// Env vars: STRIPE_SECRET_KEY plus the Supabase pair used by lib/db.js.

const {
  PASSES, LESSONS, LESSON_START, LESSON_END, SLOT_STEP,
  isIsoDate, isWeekday, mondayOf, fmtDay, fmtTime,
} = require('../../lib/services');
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

  const kind = input.kind === 'lesson' ? 'lesson' : input.kind === 'pass' ? 'pass' : null;
  const item = kind === 'lesson'
    ? LESSONS.find((l) => l.id === input.itemId)
    : PASSES.find((p) => p.id === input.itemId);
  const athlete = String(input.athlete || '').trim();
  const contact = String(input.contact || '').trim();

  if (!kind || !item) return json(400, { error: 'bad_item' });
  if (!athlete || !contact) return json(400, { error: 'missing_fields' });

  // Facility-local "today" (en-CA gives YYYY-MM-DD, comparable as a string)
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());

  let dates = [];
  let startMin = null;
  if (kind === 'pass') {
    dates = Array.isArray(input.dates) ? [...new Set(input.dates.map(String))].sort() : [];
    if (!dates.length || !dates.every((d) => isIsoDate(d) && isWeekday(d))) return json(400, { error: 'bad_dates' });
    if (dates[0] < today) return json(400, { error: 'past_date' });
    // Day-count rules per pass; weekly passes must stay within one Mon–Fri week.
    if (item.id === 'dropin' && dates.length !== 1) return json(400, { error: 'bad_dates' });
    if (item.id === 'flex3' && dates.length !== 3) return json(400, { error: 'bad_dates' });
    if (item.id === 'unlimited' && (dates.length < 1 || dates.length > 5)) return json(400, { error: 'bad_dates' });
    if (item.id !== 'dropin' && new Set(dates.map(mondayOf)).size !== 1) return json(400, { error: 'not_same_week' });
  } else {
    const date = String(input.date || '');
    startMin = Number(input.startMin);
    if (!isIsoDate(date) || !isWeekday(date)) return json(400, { error: 'bad_dates' });
    if (date < today) return json(400, { error: 'past_date' });
    if (
      !Number.isInteger(startMin) ||
      startMin < LESSON_START ||
      (startMin - LESSON_START) % SLOT_STEP !== 0 ||
      startMin + item.duration > LESSON_END
    ) {
      return json(400, { error: 'bad_time' });
    }
    dates = [date];
  }

  try {
    // Free spots from abandoned checkouts before trying to reserve
    // (cascade removes any booking_days).
    await sb(`/bookings?status=eq.hold&hold_expires_at=lt.${new Date().toISOString()}`, {
      method: 'DELETE',
    });

    const holdBody = {
      kind,
      item_id: item.id,
      item_name: item.name,
      price_cents: item.cents,
      athlete_name: athlete,
      athlete_age: String(input.age || '').trim() || null,
      sport: String(input.sport || '').trim() || null,
      parent_name: String(input.parent || '').trim() || null,
      contact,
      sms_opt_in: input.smsOptIn === true,
      status: 'hold',
      hold_expires_at: new Date(Date.now() + HOLD_MINUTES * 60000).toISOString(),
    };
    if (kind === 'lesson') {
      holdBody.session_date = dates[0];
      holdBody.start_min = startMin;
      holdBody.duration_min = item.duration;
    }

    const hold = await sb('/bookings', {
      method: 'POST',
      prefer: 'return=representation',
      body: holdBody,
    });
    // Lessons hit the no-overlap constraint right here.
    if (hold.status === 409) return json(409, { error: 'slot_taken' });
    if (!hold.ok || !hold.data || !hold.data[0]) {
      console.error('hold insert failed:', hold.status, hold.text);
      return json(502, { error: 'db' });
    }
    const booking = hold.data[0];

    if (kind === 'pass') {
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
    }

    const origin = process.env.URL || `https://${event.headers.host}`;
    const whenLabel = kind === 'lesson'
      ? `${fmtDay(dates[0])} ${fmtTime(startMin)}`
      : dates.map(fmtDay).join(', ');
    const productName = kind === 'lesson'
      ? `${item.name} — 1-on-1 · ${whenLabel}`
      : `${item.name} — Velo After-School Training`;

    const params = new URLSearchParams({
      mode: 'payment',
      expires_at: String(Math.floor(Date.now() / 1000) + 30 * 60),
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(item.cents),
      'line_items[0][price_data][product_data][name]': productName,
      'line_items[0][price_data][product_data][description]': `Athlete: ${athlete} · ${whenLabel}`,
      success_url: `${origin}/book/?paid=1&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/?cancelled=1&bid=${booking.id}`,
      'metadata[booking_id]': booking.id,
      'payment_intent_data[description]': `${item.name} (${whenLabel}) — ${athlete}`,
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
      // Give the reservation back — nobody is going to pay for this hold.
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
