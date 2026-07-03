// POST /.netlify/functions/stripe-webhook — configure this URL in the Stripe
// dashboard (Developers → Webhooks) with events:
//   checkout.session.completed  → mark the booking paid + text the owner
//   checkout.session.expired    → release the hold
//
// The signature is verified manually (HMAC-SHA256 over "<timestamp>.<raw
// body>", per Stripe's spec) so no SDK dependency is needed.
//
// Env vars: STRIPE_WEBHOOK_SECRET plus Supabase pair and (optionally) Twilio.

const crypto = require('crypto');
const { sb } = require('../../lib/db');
const { notifyOwner } = require('../../lib/sms');
const { fmtDay } = require('../../lib/services');

const TOLERANCE_SEC = 300;

function verifySignature(rawBody, header, secret) {
  let t = null;
  const v1s = [];
  for (const part of String(header || '').split(',')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === 't') t = v;
    else if (k === 'v1') v1s.push(v);
  }
  if (!t || v1s.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_SEC) return false;

  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`, 'utf8').digest('hex');
  const expectedBuf = Buffer.from(expected);
  return v1s.some((v) => {
    const buf = Buffer.from(v);
    return buf.length === expectedBuf.length && crypto.timingSafeEqual(buf, expectedBuf);
  });
}

exports.handler = async (event) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return { statusCode: 503, body: 'webhook not configured' };

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';
  const sig = (event.headers || {})['stripe-signature'] || (event.headers || {})['Stripe-Signature'];
  if (!verifySignature(raw, sig, secret)) return { statusCode: 400, body: 'bad signature' };

  const evt = JSON.parse(raw);
  const session = evt.data && evt.data.object;
  const bookingId = session && session.metadata && session.metadata.booking_id;

  try {
    if (evt.type === 'checkout.session.completed' && bookingId) {
      const res = await sb(`/bookings?id=eq.${bookingId}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        body: {
          status: 'paid',
          hold_expires_at: null,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent || null,
        },
      });
      const b = res.ok && res.data && res.data[0];
      if (b) {
        const daysRes = await sb(
          `/booking_days?booking_id=eq.${bookingId}&select=session_date&order=session_date.asc`
        );
        const days = (daysRes.ok && daysRes.data ? daysRes.data : [])
          .map((d) => fmtDay(d.session_date))
          .join(', ');
        await notifyOwner(
          `Velo pass BOOKED & PAID:\n` +
            `${b.athlete_name}${b.athlete_age ? ` (age ${b.athlete_age})` : ''}${b.sport ? ` — ${b.sport}` : ''}\n` +
            `${b.pass_name}: ${days || 'days pending'}\n` +
            `Contact: ${b.contact}`
        );
      } else {
        console.error('paid session but booking not found:', bookingId, res.status, res.text);
      }
    } else if (evt.type === 'checkout.session.expired' && bookingId) {
      // Only holds expire — never touch a row that already went to paid.
      await sb(`/bookings?id=eq.${bookingId}&status=eq.hold`, {
        method: 'PATCH',
        body: { status: 'expired' },
      });
    }
  } catch (err) {
    // Log but ack: Stripe retries on non-2xx, and a Supabase blip shouldn't
    // build a retry storm. Failures are visible in function logs.
    console.error(err);
  }

  return { statusCode: 200, body: 'ok' };
};
