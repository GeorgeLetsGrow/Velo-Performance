// POST /.netlify/functions/create-checkout
// Body: { serviceId, date, startMin, athlete, age, sport, parent, contact }
//
// 1. Validates the requested slot against the server-side service table.
// 2. Inserts a 35-minute hold — the DB's no-overlap constraint makes this the
//    atomic reservation; a 409 here means someone else got the slot first.
// 3. Creates a Stripe Checkout Session (expires in 30 min, priced server-side).
// 4. Returns { url } for the browser to redirect to.
//
// Env vars: STRIPE_SECRET_KEY plus the Supabase pair used by lib/db.js.

const { SERVICES, DAY_START, DAY_END, SLOT_STEP, fmtTime } = require('../../lib/services');
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

  const service = SERVICES.find((s) => s.id === input.serviceId);
  const date = String(input.date || '');
  const startMin = Number(input.startMin);
  const athlete = String(input.athlete || '').trim();
  const contact = String(input.contact || '').trim();

  if (!service) return json(400, { error: 'bad_service' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(400, { error: 'bad_date' });
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
  if (dow === 0 || dow === 6) return json(400, { error: 'weekend' });
  // Facility-local "today" (en-CA gives YYYY-MM-DD, comparable as a string)
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  if (date < today) return json(400, { error: 'past_date' });
  if (
    !Number.isInteger(startMin) ||
    startMin < DAY_START ||
    (startMin - DAY_START) % SLOT_STEP !== 0 ||
    startMin + service.duration > DAY_END
  ) {
    return json(400, { error: 'bad_time' });
  }
  if (!athlete || !contact) return json(400, { error: 'missing_fields' });

  try {
    // Free up slots from abandoned checkouts before trying to reserve.
    await sb(`/bookings?status=eq.hold&hold_expires_at=lt.${new Date().toISOString()}`, {
      method: 'DELETE',
    });

    const hold = await sb('/bookings', {
      method: 'POST',
      prefer: 'return=representation',
      body: {
        session_date: date,
        start_min: startMin,
        duration_min: service.duration,
        service_id: service.id,
        service_name: service.name,
        price_cents: service.cents,
        athlete_name: athlete,
        athlete_age: String(input.age || '').trim() || null,
        sport: String(input.sport || '').trim() || null,
        parent_name: String(input.parent || '').trim() || null,
        contact,
        status: 'hold',
        hold_expires_at: new Date(Date.now() + HOLD_MINUTES * 60000).toISOString(),
      },
    });
    if (hold.status === 409) return json(409, { error: 'slot_taken' });
    if (!hold.ok || !hold.data || !hold.data[0]) {
      console.error('hold insert failed:', hold.status, hold.text);
      return json(502, { error: 'db' });
    }
    const booking = hold.data[0];

    const origin = process.env.URL || `https://${event.headers.host}`;
    const when = `${date} at ${fmtTime(startMin)}`;
    const params = new URLSearchParams({
      mode: 'payment',
      expires_at: String(Math.floor(Date.now() / 1000) + 30 * 60),
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(service.cents),
      'line_items[0][price_data][product_data][name]': `${service.name} — ${when}`,
      'line_items[0][price_data][product_data][description]': `Athlete: ${athlete}`,
      success_url: `${origin}/book/?paid=1&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/?cancelled=1&bid=${booking.id}`,
      'metadata[booking_id]': booking.id,
      'payment_intent_data[description]': `${service.name} ${when} — ${athlete}`,
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
      // Give the slot back — nobody is going to pay for this hold.
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
