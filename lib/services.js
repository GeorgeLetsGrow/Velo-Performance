// Single source of truth for the bookable passes and the training week.
// The booking page uses it for display; the Netlify Functions use it as the
// authority on prices, so the client can never set its own price.
// CommonJS so both Next.js (via import) and Netlify Functions (via require) can load it.

// The passes mirror the site's pricing section (app/markup.js) exactly.
// `days` is how many training days the pass buys within one Mon–Fri week;
// Unlimited covers every remaining weekday of the chosen week.
const SERVICES = [
  { id: 'dropin',    name: 'Drop-In',         days: 1, cents: 6000,  unit: 'per day',  desc: 'One afternoon of training — perfect for busy schedules, extra reps, or experiencing the Velo difference.' },
  { id: 'flex3',     name: '3-Day Flex Pass', days: 3, cents: 15000, unit: 'per week', desc: 'Train any 3 afternoons, Monday–Friday — the flexibility multi-sport athletes and busy families need.' },
  { id: 'unlimited', name: 'Unlimited Week',  days: 5, cents: 17500, unit: 'per week', desc: 'Train Monday through Friday — the fastest path to consistent improvement.' },
];

// Small-group cap: at most this many athletes per afternoon ("12:1 max
// athletes per session" on the site). Also enforced atomically by the DB
// trigger in supabase/schema.sql — keep the two numbers in sync.
const CAPACITY = 12;

const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// All date math is done in UTC on the ISO string, so it can't drift with the
// server's timezone. "Today" for past-date checks is facility-local.
function isWeekday(iso) {
  const dow = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return dow >= 1 && dow <= 5;
}

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Monday of the Mon–Fri week containing the given weekday date.
function mondayOf(iso) {
  const dow = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return addDays(iso, 1 - dow);
}

// Facility-local "today" (en-CA gives YYYY-MM-DD, comparable as a string).
function todayLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

// "Mon Jul 6" / "Mon Jul 6, Wed Jul 8, Fri Jul 10" — for Stripe line items
// and the owner SMS.
function fmtDates(dates) {
  return dates
    .map((iso) => {
      const d = new Date(`${iso}T00:00:00Z`);
      return `${DOW_NAMES[d.getUTCDay()]} ${MON_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`;
    })
    .join(', ');
}

module.exports = { SERVICES, CAPACITY, isIsoDate, isWeekday, addDays, mondayOf, todayLocal, fmtDates };
