// Single source of truth for everything bookable, shared by the booking page
// (display) and the Netlify Functions (authority on prices — the client can
// never set its own price).
//
// Two kinds of booking:
//   - PASSES  — the after-school program (same three options as the homepage
//               pricing section). Day attendance, capped at CAPACITY/day.
//   - LESSONS — individual 1-on-1 training sessions. Exclusive time slots in
//               the LESSON_START–LESSON_END window, after the program ends.
//
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

const LESSONS = [
  { id: 'hitting',    name: 'Hitting Instruction',        duration: 60, cents: 7000,  desc: 'Mechanics, bat path, and approach — 1-on-1 with a coach.' },
  { id: 'pitching',   name: 'Pitching Instruction',       duration: 60, cents: 7000,  desc: 'Arm care, command, and velocity development on the mound.' },
  { id: 'defense',    name: 'Defensive Training',         duration: 45, cents: 5500,  desc: 'Footwork, glove work, and game-speed reads.' },
  { id: 'speed',      name: 'Speed · Agility · Strength', duration: 45, cents: 5500,  desc: 'Explosiveness, mobility, and athletic foundation work.' },
  { id: 'evaluation', name: 'Full Evaluation',            duration: 90, cents: 11000, desc: 'Complete assessment across hitting, pitching, and defense.' },
];

// Max athletes per program day (the homepage promises 12:1).
const CAPACITY = 12;

// 1-on-1 window: after the program lets out at 5:00 PM.
const LESSON_START = 17 * 60; // 5:00 PM
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
  fmtTime, overlaps, isIsoDate, isWeekday, mondayOf, fmtDay,
};
