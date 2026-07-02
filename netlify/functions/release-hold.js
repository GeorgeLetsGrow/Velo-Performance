// POST /.netlify/functions/release-hold  Body: { bid }
// Frees a hold immediately when a parent backs out of Stripe Checkout
// (cancel_url) instead of making the slot wait out the 30-minute expiry.
// Only rows still in 'hold' status can be deleted, so a paid booking is safe
// even if this is called with its id.

const { sb } = require('../../lib/db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '' };

  let bid = '';
  try {
    bid = String(JSON.parse(event.body || '{}').bid || '');
  } catch {
    /* fall through to validation */
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bid)) {
    return { statusCode: 400, body: '' };
  }

  try {
    await sb(`/bookings?id=eq.${bid}&status=eq.hold`, { method: 'DELETE' });
  } catch (err) {
    console.error(err);
  }
  return { statusCode: 200, body: 'ok' };
};
