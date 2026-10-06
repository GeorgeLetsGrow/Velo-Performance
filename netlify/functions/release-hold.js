// POST /.netlify/functions/release-hold  Body: { bid } or { bids: [...] }
// Frees a hold immediately when a parent backs out of Stripe Checkout
// (cancel_url) instead of making the slot wait out the 30-minute expiry.
// Only rows still in 'hold' status can be deleted, so a paid booking is safe
// even if this is called with its id.

const { sb } = require('../../lib/db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '' };

  let bids = [];
  try {
    const input = JSON.parse(event.body || '{}');
    bids = Array.isArray(input.bids) ? input.bids.map(String) : [String(input.bid || '')];
  } catch {
    /* fall through to validation */
  }
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!bids.length || bids.length > 10 || !bids.every((bid) => uuid.test(bid))) {
    return { statusCode: 400, body: '' };
  }

  try {
    await sb(`/bookings?id=in.(${bids.join(',')})&status=eq.hold`, { method: 'DELETE' });
  } catch (err) {
    console.error(err);
  }
  return { statusCode: 200, body: 'ok' };
};
