// Single source of truth for bookable services and the training-day window.
// The booking page uses it for display; the Netlify Functions use it as the
// authority on prices and durations, so the client can never set its own price.
// CommonJS so both Next.js (via import) and Netlify Functions (via require) can load it.

// Names and descriptions mirror the development pillars on the homepage.
const SERVICES = [
  { id: 'hitting',    name: 'Hitting Instruction',        duration: 60, cents: 7000,  desc: 'Mechanics, bat path, and approach — built rep by rep with real feedback.' },
  { id: 'pitching',   name: 'Pitching Instruction',       duration: 60, cents: 7000,  desc: 'Arm care, command, and velocity development with mound-specific coaching.' },
  { id: 'defense',    name: 'Defensive Training',         duration: 45, cents: 5500,  desc: 'Footwork, glove work, and game-speed reads for every position.' },
  { id: 'speed',      name: 'Speed · Agility · Strength', duration: 45, cents: 5500,  desc: 'Athletic foundation work — explosiveness, mobility, and durability.' },
  { id: 'evaluation', name: 'Full Evaluation',            duration: 90, cents: 11000, desc: 'Complete assessment across hitting, pitching, and defense.' },
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
