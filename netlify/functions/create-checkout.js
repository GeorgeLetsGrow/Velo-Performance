// POST /.netlify/functions/create-checkout
// Accepts either one booking (legacy shape) or { bookings: [...] }.
const { PASSES, LESSONS, LESSON_START, LESSON_END, SLOT_STEP, isIsoDate, isSunday, isProgramDate, programPriceCents, mondayOf, fmtDay, fmtTime } = require('../../lib/services');
const { sb } = require('../../lib/db');
const HOLD_MINUTES = 35;
const MAX_BOOKINGS = 10;

function validate(raw, today) {
  const kind = raw.kind === 'lesson' ? 'lesson' : raw.kind === 'pass' ? 'pass' : null;
  const item = kind === 'lesson' ? LESSONS.find((x) => x.id === raw.itemId) : PASSES.find((x) => x.id === raw.itemId);
  const athlete = String(raw.athlete || '').trim();
  const contact = String(raw.contact || '').trim();
  if (!kind || !item) return { error: 'bad_item' };
  if (!athlete || !contact) return { error: 'missing_fields' };
  let dates;
  let startMin = null;
  if (kind === 'pass') {
    dates = Array.isArray(raw.dates) ? [...new Set(raw.dates.map(String))].sort() : [];
    if (!dates.length || dates.length > 5 || !dates.every((d) => isProgramDate(item, d))) return { error: 'bad_dates' };
    if (dates[0] < today) return { error: 'past_date' };
    if (new Set(dates.map(mondayOf)).size !== 1) return { error: 'not_same_week' };
  } else {
    const date = String(raw.date || '');
    startMin = Number(raw.startMin);
    if (!isIsoDate(date) || !isSunday(date)) return { error: 'bad_dates' };
    if (date < today) return { error: 'past_date' };
    if (!Number.isInteger(startMin) || startMin < LESSON_START || (startMin - LESSON_START) % SLOT_STEP !== 0 || startMin + item.duration > LESSON_END) return { error: 'bad_time' };
    dates = [date];
  }
  const totalCents = kind === 'pass' ? programPriceCents(item, dates) : item.cents;
  const whenLabel = kind === 'lesson' ? `${fmtDay(dates[0])} ${fmtTime(startMin)}` : dates.map(fmtDay).join(', ');
  return { raw, kind, item, athlete, contact, dates, startMin, totalCents, whenLabel };
}

async function removeHolds(ids) {
  if (ids.length) await sb(`/bookings?id=in.(${ids.join(',')})&status=eq.hold`, { method: 'DELETE' });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return json(503, { error: 'payments_not_configured' });
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'bad_json' }); }
  const rawBookings = Array.isArray(input.bookings) ? input.bookings : [input];
  if (!rawBookings.length || rawBookings.length > MAX_BOOKINGS) return json(400, { error: 'bad_booking_count' });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const bookings = rawBookings.map((raw) => validate(raw || {}, today));
  const invalid = bookings.find((b) => b.error);
  if (invalid) return json(400, { error: invalid.error });
  const held = [];
  try {
    await sb(`/bookings?status=eq.hold&hold_expires_at=lt.${new Date().toISOString()}`, { method: 'DELETE' });
    for (let index = 0; index < bookings.length; index += 1) {
      const booking = bookings[index];
      const body = { kind: booking.kind, item_id: booking.item.id, item_name: booking.item.name, price_cents: booking.totalCents, athlete_name: booking.athlete, athlete_age: String(booking.raw.age || '').trim() || null, sport: String(booking.raw.sport || '').trim() || null, parent_name: String(booking.raw.parent || '').trim() || null, contact: booking.contact, sms_opt_in: booking.raw.smsOptIn === true, status: 'hold', hold_expires_at: new Date(Date.now() + HOLD_MINUTES * 60000).toISOString() };
      if (booking.kind === 'lesson') Object.assign(body, { session_date: booking.dates[0], start_min: booking.startMin, duration_min: booking.item.duration });
      const hold = await sb('/bookings', { method: 'POST', prefer: 'return=representation', body });
      if (hold.status === 409) { await removeHolds(held.map((x) => x.id)); return json(409, { error: 'slot_taken', bookingIndex: index }); }
      if (!hold.ok || !hold.data || !hold.data[0]) throw new Error(`hold insert failed: ${hold.status} ${hold.text}`);
      const row = hold.data[0]; held.push(row);
      if (booking.kind === 'pass') {
        const days = await sb('/booking_days', { method: 'POST', body: booking.dates.map((session_date) => ({ booking_id: row.id, session_date })) });
        if (!days.ok) { await removeHolds(held.map((x) => x.id)); if (days.status === 409) return json(409, { error: 'day_full', bookingIndex: index }); throw new Error(`days insert failed: ${days.status} ${days.text}`); }
      }
    }
    const origin = process.env.URL || `https://${event.headers.host}`;
    const ids = held.map((b) => b.id);
    const params = new URLSearchParams({ mode: 'payment', allow_promotion_codes: 'true', expires_at: String(Math.floor(Date.now() / 1000) + 1800), success_url: `${origin}/book/?paid=1&sid={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/book/?cancelled=1&bids=${ids.join(',')}`, 'metadata[booking_id]': ids[0], 'metadata[booking_ids]': ids.join(','), 'payment_intent_data[description]': `Velo booking${bookings.length === 1 ? '' : 's'} — ${bookings.map((b) => b.athlete).join(', ')}` });
    bookings.forEach((b, i) => {
      const name = b.kind === 'lesson' ? `${b.item.name} — 1-on-1 · ${b.whenLabel}` : `${b.item.name} — ${b.dates.length} ${b.dates.length === 1 ? 'session' : 'sessions'}`;
      params.set(`line_items[${i}][quantity]`, '1'); params.set(`line_items[${i}][price_data][currency]`, 'usd'); params.set(`line_items[${i}][price_data][unit_amount]`, String(b.totalCents)); params.set(`line_items[${i}][price_data][product_data][name]`, name); params.set(`line_items[${i}][price_data][product_data][description]`, `Athlete: ${b.athlete} · ${b.whenLabel}`);
    });
    const email = bookings.map((b) => b.contact).find((c) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c));
    if (email) params.set('customer_email', email);
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
    const session = await response.json();
    if (!response.ok) { console.error('Stripe session failed:', JSON.stringify(session.error || session)); await removeHolds(ids); return json(502, { error: 'stripe' }); }
    const update = await sb(`/bookings?id=in.(${ids.join(',')})`, { method: 'PATCH', body: { stripe_session_id: session.id } });
    if (!update.ok) console.error('stripe session id update failed:', update.status, update.text);
    return json(200, { url: session.url });
  } catch (err) {
    console.error(err); await removeHolds(held.map((x) => x.id)).catch(() => {}); return json(502, { error: 'unavailable' });
  }
};
function json(statusCode, obj) { return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
