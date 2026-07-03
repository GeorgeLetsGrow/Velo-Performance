// GET /.netlify/functions/get-availability?date=YYYY-MM-DD
// Returns the busy time ranges (minutes from midnight, half-open) for a day,
// counting paid bookings and holds that haven't expired. The booking page
// derives open slots from these ranges per service duration.

const { sb } = require('../../lib/db');

exports.handler = async (event) => {
  const date = (event.queryStringParameters || {}).date || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(400, { error: 'bad_date' });

  try {
    const res = await sb(
      `/bookings?select=start_min,duration_min,status,hold_expires_at` +
        `&session_date=eq.${date}&status=in.(paid,hold)`
    );
    if (!res.ok) {
      console.error('availability query failed:', res.status, res.text);
      // status is safe to expose and pinpoints the failure (401 = bad key, …)
      return json(502, { error: 'db', upstream_status: res.status });
    }
    const now = Date.now();
    const busy = res.data
      .filter((r) => r.status === 'paid' || (r.hold_expires_at && Date.parse(r.hold_expires_at) > now))
      .map((r) => [r.start_min, r.start_min + r.duration_min]);
    return json(200, { busy });
  } catch (err) {
    console.error(err);
    // The message of a failed fetch names the URL/network problem and never
    // contains credentials, so it's safe to surface for diagnosis.
    const detail = String((err && err.message) || err).slice(0, 140);
    return json(502, {
      error: 'unavailable',
      reason: err.code === 'missing_env' ? 'missing_env' : 'exception',
      detail,
    });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
