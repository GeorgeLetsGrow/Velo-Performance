// Single source of truth for bookable services and the training-day window.
// The booking page uses it for display; the Netlify Functions use it as the
// authority on prices and durations, so the client can never set its own price.
// CommonJS so both Next.js (via import) and Netlify Functions (via require) can load it.

const SERVICES = [
  { id: 'hitting',    name: 'Hitting Lesson',    duration: 60, cents: 7000,  desc: 'Mechanics, bat path & approach — 1-on-1 with a coach.' },
  { id: 'pitching',   name: 'Pitching Lesson',   duration: 60, cents: 7000,  desc: 'Arm care, command & velocity development on the mound.' },
  { id: 'defense',    name: 'Defensive Session', duration: 45, cents: 5500,  desc: 'Footwork, glove work & game-speed reads.' },
  { id: 'speed',      name: 'Speed & Agility',   duration: 45, cents: 5500,  desc: 'Explosiveness, mobility & athletic foundation work.' },
  { id: 'evaluation', name: 'Full Evaluation',   duration: 90, cents: 11000, desc: 'Complete assessment across hitting, pitching & defense.' },
];

const DAY_START = 15 * 60; // 3:00 PM
const DAY_END = 19 * 60;   // 7:00 PM
const SLOT_STEP = 30;      // start times every 30 min

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

module.exports = { SERVICES, DAY_START, DAY_END, SLOT_STEP, fmtTime, overlaps };
