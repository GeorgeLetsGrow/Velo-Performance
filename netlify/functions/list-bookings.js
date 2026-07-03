// GET /.netlify/functions/list-bookings
// Admin-only: returns bookings newest-first for the dashboard table. Optional
// ?status=paid|hold|cancelled|expired to filter; otherwise returns all
// statuses (most recent 300 rows — a season's worth is nowhere near that).

const { sb } = require('../../lib/db');
const { isAuthed } = require('../../lib/auth');

const STATUSES = ['hold', 'paid', 'cancelled', 'expired'];

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'method_not_allowed' });
  if (!isAuthed(event)) return json(401, { error: 'unauthorized' });

  const status = (event.queryStringParameters || {}).status || '';
  const filter = STATUSES.includes(status) ? `&status=eq.${status}` : '';

  try {
    const res = await sb(
      `/bookings?select=id,kind,session_date,start_min,duration_min,item_name,price_cents,` +
        `athlete_name,athlete_age,sport,parent_name,contact,status,stripe_payment_intent,created_at,` +
        `booking_days(session_date)` +
        `${filter}&order=created_at.desc&limit=300`
    );
    if (!res.ok) {
      console.error('list-bookings query failed:', res.status, res.text);
      return json(502, { error: 'db' });
    }
    return json(200, { bookings: res.data });
  } catch (err) {
    console.error(err);
    return json(502, { error: 'unavailable' });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
