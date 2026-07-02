// GET /.netlify/functions/get-availability?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns how many athletes are already in for each day of the range,
// counting paid bookings and holds that haven't expired:
//   { capacity: 12, counts: { '2026-07-06': 3, ... } }
// The booking page derives spots left per day from these counts.

const { CAPACITY, isIsoDate, addDays } = require('../../lib/services');
const { sb } = require('../../lib/db');

const MAX_RANGE_DAYS = 31;

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const from = q.from || '';
  const to = q.to || '';
  if (!isIsoDate(from) || !isIsoDate(to) || to < from) return json(400, { error: 'bad_date' });

  const days = [];
  for (let d = from; d <= to && days.length < MAX_RANGE_DAYS; d = addDays(d, 1)) days.push(d);
  if (days[days.length - 1] !== to) return json(400, { error: 'range_too_large' });

  try {
    const nowIso = new Date().toISOString();
    const res = await sb(
      `/bookings?select=session_dates&session_dates=ov.{${days.join(',')}}` +
        `&or=(status.eq.paid,and(status.eq.hold,hold_expires_at.gt.${nowIso}))`
    );
    if (!res.ok) {
      console.error('availability query failed:', res.status, res.text);
      return json(502, { error: 'db' });
    }
    const counts = Object.fromEntries(days.map((d) => [d, 0]));
    for (const row of res.data) {
      for (const d of row.session_dates || []) {
        if (d in counts) counts[d] += 1;
      }
    }
    return json(200, { capacity: CAPACITY, counts });
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
