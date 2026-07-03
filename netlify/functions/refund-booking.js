// POST /.netlify/functions/refund-booking  Body: { id }
// Admin-only: refunds a paid booking via Stripe, then cancels the row so the
// slot frees up automatically (the no-overlap constraint only blocks on
// 'hold'/'paid'). One click replaces the old manual "refund in Stripe, then
// remember to delete the Supabase row" workflow.

const { sb } = require('../../lib/db');
const { isAuthed } = require('../../lib/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!isAuthed(event)) return json(401, { error: 'unauthorized' });
  if (!process.env.STRIPE_SECRET_KEY) return json(503, { error: 'payments_not_configured' });

  let id = '';
  try {
    id = String(JSON.parse(event.body || '{}').id || '');
  } catch {
    return json(400, { error: 'bad_request' });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return json(400, { error: 'bad_id' });
  }

  try {
    const lookup = await sb(`/bookings?id=eq.${id}&select=id,status,stripe_payment_intent`);
    const booking = lookup.ok && lookup.data && lookup.data[0];
    if (!booking) return json(404, { error: 'not_found' });
    if (booking.status !== 'paid') return json(409, { error: 'not_paid' });
    if (!booking.stripe_payment_intent) return json(409, { error: 'no_payment_intent' });

    const rres = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ payment_intent: booking.stripe_payment_intent }),
    });
    const refund = await rres.json();
    if (!rres.ok) {
      console.error('Stripe refund failed:', JSON.stringify(refund.error || refund));
      return json(502, { error: 'stripe' });
    }

    const update = await sb(`/bookings?id=eq.${id}`, {
      method: 'PATCH',
      prefer: 'return=representation',
      body: { status: 'cancelled' },
    });
    if (!update.ok) {
      console.error('post-refund cancel failed:', update.status, update.text);
      // Refund already went through on Stripe's side — surface a distinct
      // error so the dashboard can tell Neril to cancel the row by hand.
      return json(207, { error: 'refunded_but_not_cancelled' });
    }

    return json(200, { ok: true, refund: { id: refund.id, status: refund.status } });
  } catch (err) {
    console.error(err);
    return json(502, { error: 'unavailable' });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
