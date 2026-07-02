// GET /.netlify/functions/get-availability?date=YYYY-MM-DD
// Returns the busy time ranges (minutes from midnight, half-open) for a day,
// counting paid bookings and holds that haven't expired. The booking page
// derives open slots from these ranges per service duration.

const { sb } = require('../../lib/db');

exports.handler = async (event) => {
  const date = (event.queryStringParameters || {}).date || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(400, { error: 'bad_date' });

  try {
    const nowIso = new Date().toISOString();
    const res = await sb(
      `/bookings?select=start_min,duration_min&session_date=eq.${date}` +
        `&or=(status.eq.paid,and(status.eq.hold,hold_expires_at.gt.${nowIso}))`
    );
    if (!res.ok) {
      console.error('availability query failed:', res.status, res.text);
      return json(502, { error: 'db' });
    }
    const busy = res.data.map((r) => [r.start_min, r.start_min + r.duration_min]);
    return json(200, { busy });
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
