// Single source of truth for everything bookable, shared by the booking page
// (display) and the Netlify Functions (authority on prices — the client can
// never set its own price).
//
// Two kinds of booking:
//   - PASSES  — group programs booked by date. The historical name remains so
//               existing bookings and database records stay compatible.
//   - LESSONS — individual 1-on-1 training sessions. Exclusive Sunday slots
//               in the LESSON_START–LESSON_END window.
//
// CommonJS so both Next.js (via import) and Netlify Functions (via require) can load it.

const PASSES = [
  {
    id: 'afterschool', name: 'After-School Training', cents: 3000,
    unit: '$30 Per Day', allowedDays: [1, 2, 3, 4, 5],
    desc: 'Coach-led player development after school until 5:00 PM. Select one or more weekdays.',
  },
  {
    id: 'diamond-skills', name: 'Evening Skills Training', cents: 2500,
    unit: 'Per Player · Per Session', allowedDays: [1, 3, 4], popular: true,
    desc: 'Fielding, throwing, hitting, base running, and game IQ. Monday, Wednesday, and Thursday from 5:30–7:00 PM.',
  },
];

const LESSONS = [
  { id: 'hitting',    name: 'Hitting Instruction',        duration: 60, cents: 7000,  desc: 'Mechanics, bat path, and approach — 1-on-1 with a coach.' },
  { id: 'pitching',   name: 'Pitching Instruction',       duration: 60, cents: 7000,  desc: 'Arm care, command, and velocity development on the mound.' },
  { id: 'defense',    name: 'Defensive Training',         duration: 45, cents: 5500,  desc: 'Footwork, glove work, and game-speed reads.' },
  { id: 'speed',      name: 'Speed · Agility · Strength', duration: 45, cents: 5500,  desc: 'Explosiveness, mobility, and athletic foundation work.' },
  { id: 'evaluation', name: 'Full Evaluation',            duration: 90, cents: 11000, desc: 'Complete assessment across hitting, pitching, and defense.' },
];

// Max athletes per program day (the homepage promises 12:1).
const CAPACITY = 12;

// 1-on-1 window: Sundays from noon through 7:00 PM.
const LESSON_START = 12 * 60; // 12:00 PM
const LESSON_END = 19 * 60;   // 7:00 PM
const SLOT_STEP = 30;         // start times every 30 min

function fmtTime(mins) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

// Half-open interval overlap: [aStart,aEnd) vs [bStart,bEnd)
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/* ---- ISO date helpers (pure UTC string math — no timezone surprises) ---- */
function isIsoDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function isWeekday(iso) {
  const d = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return d >= 1 && d <= 5;
}
function isSunday(iso) {
  return new Date(`${iso}T00:00:00Z`).getUTCDay() === 0;
}
function dayOfWeek(iso) {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}
function isProgramDate(program, iso) {
  return isIsoDate(iso) && program.allowedDays.includes(dayOfWeek(iso));
}
function programPriceCents(program, dates) {
  return program.cents * dates.length;
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

module.exports = {
  PASSES, LESSONS, CAPACITY,
  LESSON_START, LESSON_END, SLOT_STEP,
  fmtTime, overlaps, isIsoDate, isWeekday, isSunday, dayOfWeek, isProgramDate,
  programPriceCents, mondayOf, fmtDay,
};
