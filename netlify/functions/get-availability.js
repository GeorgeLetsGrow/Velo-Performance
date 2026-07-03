// GET /.netlify/functions/get-availability?from=YYYY-MM-DD&to=YYYY-MM-DD
// One call serves both booking modes:
//   taken — athletes signed up per program day (passes):   { "2026-07-06": 3 }
//   busy  — reserved 1-on-1 time ranges per day (lessons): { "2026-07-06": [[1020,1080]] }
// Both count paid bookings and holds that haven't expired.

const { sb } = require('../../lib/db');
const { CAPACITY, isIsoDate } = require('../../lib/services');

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const from = q.from || '';
  const to = q.to || '';
  if (!isIsoDate(from) || !isIsoDate(to) || to < from) return json(400, { error: 'bad_range' });
  if ((Date.parse(to) - Date.parse(from)) / 86400000 > 31) return json(400, { error: 'range_too_wide' });

  try {
    const [dayRes, lessonRes] = await Promise.all([
      sb(
        `/booking_days?select=session_date,booking:bookings!inner(status,hold_expires_at)` +
          `&session_date=gte.${from}&session_date=lte.${to}`
      ),
      sb(
        `/bookings?select=session_date,start_min,duration_min,status,hold_expires_at` +
          `&kind=eq.lesson&session_date=gte.${from}&session_date=lte.${to}&status=in.(paid,hold)`
      ),
    ]);
    if (!dayRes.ok || !lessonRes.ok) {
      const bad = !dayRes.ok ? dayRes : lessonRes;
      console.error('availability query failed:', bad.status, bad.text);
      return json(502, { error: 'db', upstream_status: bad.status });
    }

    const now = Date.now();
    const active = (b) =>
      b && (b.status === 'paid' ||
        (b.status === 'hold' && b.hold_expires_at && Date.parse(b.hold_expires_at) > now));

    const taken = {};
    for (const r of dayRes.data) {
      if (active(r.booking)) taken[r.session_date] = (taken[r.session_date] || 0) + 1;
    }
    const busy = {};
    for (const r of lessonRes.data) {
      if (active(r)) {
        (busy[r.session_date] = busy[r.session_date] || []).push([
          r.start_min,
          r.start_min + r.duration_min,
        ]);
      }
    }
    return json(200, { capacity: CAPACITY, taken, busy });
  } catch (err) {
    console.error(err);
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
