// Single source of truth for the after-school passes — the same three options
// as the homepage pricing section. The booking page uses it for display; the
// Netlify Functions use it as the authority on prices, so the client can
// never set its own price.
// CommonJS so both Next.js (via import) and Netlify Functions (via require) can load it.

const PASSES = [
  {
    id: 'dropin', name: 'Drop-In', cents: 6000, unit: 'Per Day', days: 1,
    desc: 'Perfect for busy schedules, extra reps, or experiencing the Velo difference.',
  },
  {
    id: 'flex3', name: '3-Day Flex Pass', cents: 15000, unit: 'Per Week', days: 3, popular: true,
    desc: 'Perfect for multi-sport athletes and busy families — train any 3 days, Monday–Friday.',
  },
  {
    id: 'unlimited', name: 'Unlimited Week', cents: 17500, unit: 'Per Week', days: 5,
    desc: 'The fastest path to consistent improvement — train Monday through Friday.',
  },
];

// Max athletes per training day (the homepage promises 12:1).
const CAPACITY = 12;

/* ---- ISO date helpers (pure UTC string math — no timezone surprises) ---- */
function isIsoDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function isWeekday(iso) {
  const d = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return d >= 1 && d <= 5;
}
// Monday of the week the date falls in, as YYYY-MM-DD.
function mondayOf(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
function fmtDay(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${dow} ${mon} ${d.getUTCDate()}`;
}

module.exports = { PASSES, CAPACITY, isIsoDate, isWeekday, mondayOf, fmtDay };
