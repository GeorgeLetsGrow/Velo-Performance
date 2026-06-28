// ============ MOBILE MENU ============
function toggleMobileMenu() {
  const m = document.getElementById('mobileMenu');
  const open = m.style.display === 'flex';
  m.style.display = open ? 'none' : 'flex';
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').style.display = 'none';
}

// ============ RESERVATION STATE ============
const S = {
  weekOffset: 0,
  selectedDate: null,
  selectedPass: 'flex',
  step: 'select',
  athlete: '',
  age: '',
  sport: 'Baseball',
  parent: '',
  contact: ''
};

const CAP = 9;
const ACCENT = '#ff5e1a';
const GOLD = '#f4b223';

const PASSES = [
  { id: 'dropin',    name: 'Drop-In',         price: '$60',  sub: 'per day'  },
  { id: 'flex',      name: '3-Day Flex Pass', price: '$150', sub: 'per week' },
  { id: 'unlimited', name: 'Unlimited Week',  price: '$175', sub: 'per week' },
];

function seatsTaken(iso) {
  let h = 7;
  for (let i = 0; i < iso.length; i++) h = (h * 31 + iso.charCodeAt(i)) % 1009;
  return h % 10;
}

function buildWeek(offset) {
  const base = new Date(); base.setHours(0,0,0,0);
  const dow = base.getDay();
  const toMon = dow === 0 ? 1 : 1 - dow;
  const monday = new Date(base);
  monday.setDate(base.getDate() + toMon + offset * 7);
  const dowNames = ['MON','TUE','WED','THU','FRI'];
  const monNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const out = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0,10);
    const left = Math.max(0, CAP - seatsTaken(iso));
    out.push({ iso, dow: dowNames[i], day: d.getDate(), mon: monNames[d.getMonth()], left, full: left === 0 });
  }
  return out;
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  return dn + ' · ' + mn + ' ' + d.getDate();
}

function setState(patch) {
  Object.assign(S, patch);
  renderReservation();
}

// ============ RENDER ============
function renderReservation() {
  renderStepIndicator();
  const el = document.getElementById('reservationContent');
  if (S.step === 'select')    el.innerHTML = buildSelectHTML();
  if (S.step === 'details')   el.innerHTML = buildDetailsHTML();
  if (S.step === 'confirmed') el.innerHTML = buildConfirmedHTML();
  attachInputListeners();
}

function stepCircle(n, label, active, done) {
  const bg   = active || done ? ACCENT : '#1e1f22';
  const col  = active || done ? '#0c0c0d' : '#9a9b9f';
  const tcol = active ? '#c7c8cc' : done ? '#c7c8cc' : '#82838a';
  return `<div style="display:flex;align-items:center;gap:8px">
    <span style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed';font-weight:800;font-size:13px;color:${col};background:${bg}">${done ? '✓' : n}</span>
    <span style="font-family:'Barlow Condensed';font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:${tcol}">${label}</span>
  </div>`;
}

function renderStepIndicator() {
  const sel = S.step === 'select';
  const det = S.step === 'details';
  const con = S.step === 'confirmed';
  document.getElementById('stepIndicator').innerHTML =
    stepCircle(1, 'Choose',    sel, det || con) +
    `<span style="width:24px;height:1px;background:#2c2d31"></span>` +
    stepCircle(2, 'Details',   det, con) +
    `<span style="width:24px;height:1px;background:#2c2d31"></span>` +
    stepCircle(3, 'Confirmed', con, false);
}

function buildSelectHTML() {
  const week = buildWeek(S.weekOffset);
  const range = week.length ? week[0].mon + ' ' + week[0].day + ' – ' + week[4].day : '';
  const tabBase = "flex:1;padding:11px;font-family:'Barlow Condensed';font-weight:700;font-size:14px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:1px solid #26272b;";
  const tabThis = tabBase + (S.weekOffset === 0 ? `color:#0c0c0d;background:${ACCENT};border-color:${ACCENT};` : 'color:#c7c8cc;background:#0c0c0d;');
  const tabNext = tabBase + (S.weekOffset === 1 ? `color:#0c0c0d;background:${ACCENT};border-color:${ACCENT};` : 'color:#c7c8cc;background:#0c0c0d;');

  const calCells = week.map(d => {
    const sel = d.iso === S.selectedDate;
    let style = "display:flex;flex-direction:column;align-items:center;gap:6px;padding:22px 8px;cursor:pointer;border:1.5px solid;background:#0c0c0d;font-family:inherit;";
    if (d.full)       style += "border-color:#1a1b1e;background:#0a0a0b;cursor:not-allowed;opacity:.45;";
    else if (sel)     style += `border-color:${ACCENT};background:#16110c;`;
    else              style += "border-color:#26272b;";
    const numCol  = d.full ? '#54555a' : sel ? ACCENT : '#f6f5f3';
    const leftCol = d.full ? '#6f7076' : d.left <= 3 ? ACCENT : '#8b8c92';
    const leftTxt = d.full ? 'FULL' : d.left + ' of 9 left';
    const click   = d.full ? '' : `onclick="setState({selectedDate:'${d.iso}'})"`;
    return `<button ${click} style="${style}">
      <span style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.12em;color:#8b8c92">${d.dow}</span>
      <span style="font-family:'Anton';font-size:30px;line-height:1;color:${numCol}">${d.day}</span>
      <span style="font-family:'Barlow';font-size:11px;color:#82838a">${d.mon}</span>
      <span style="font-family:'Barlow Condensed';font-weight:700;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:${leftCol};margin-top:4px">${leftTxt}</span>
    </button>`;
  }).join('');

  const passRows = PASSES.map(p => {
    const sel = p.id === S.selectedPass;
    const rowStyle = `display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 18px;cursor:pointer;border:1.5px solid;width:100%;text-align:left;font-family:inherit;background:${sel ? '#16110c' : '#0c0c0d'};border-color:${sel ? ACCENT : '#26272b'};`;
    const dotBorder = sel ? ACCENT : '#3a3b40';
    const dot = sel ? `<span style="width:8px;height:8px;border-radius:50%;background:${ACCENT}"></span>` : '';
    const priceCol = sel ? ACCENT : '#f6f5f3';
    return `<button onclick="setState({selectedPass:'${p.id}'})" style="${rowStyle}">
      <span style="display:flex;align-items:center;gap:14px">
        <span style="width:18px;height:18px;border-radius:50%;flex-shrink:0;border:2px solid ${dotBorder};display:flex;align-items:center;justify-content:center;">${dot}</span>
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:17px;letter-spacing:.03em;text-transform:uppercase;color:#f6f5f3">${p.name}</span>
      </span>
      <span style="display:flex;align-items:baseline;gap:5px">
        <span style="font-family:'Anton';font-size:22px;color:${priceCol}">${p.price}</span>
        <span style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.08em;color:#8b8c92;text-transform:uppercase">${p.sub}</span>
      </span>
    </button>`;
  }).join('');

  const canContinue = !!S.selectedDate;
  const btnStyle = `width:100%;margin-top:8px;padding:16px;font-family:'Barlow Condensed';font-weight:800;font-size:17px;letter-spacing:.06em;text-transform:uppercase;border:none;cursor:${canContinue ? 'pointer' : 'not-allowed'};color:#0c0c0d;background:${canContinue ? ACCENT : '#3a3b40'};`;

  return `<div>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:16px">
      <div style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;letter-spacing:.06em;text-transform:uppercase;color:#f6f5f3">Select a Day</div>
      <div style="font-family:'JetBrains Mono';font-size:12px;color:#8b8c92;letter-spacing:.08em">${range}</div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;max-width:340px">
      <button onclick="setState({weekOffset:0})" style="${tabThis}">This Week</button>
      <button onclick="setState({weekOffset:1})" style="${tabNext}">Next Week</button>
    </div>
    <div class="velo-cal-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">${calCells}</div>
    <div style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;letter-spacing:.06em;text-transform:uppercase;color:#f6f5f3;margin:30px 0 14px">Choose a Pass</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:26px">${passRows}</div>
    <button onclick="goDetails()" style="${btnStyle}">Continue →</button>
  </div>`;
}

function buildDetailsHTML() {
  const selPass = PASSES.find(p => p.id === S.selectedPass) || PASSES[1];
  const selLabel = S.selectedDate ? fmtDate(S.selectedDate) : '';
  const sportBaseStyle = sportBtnStyle(S.sport === 'Baseball');
  const sportSoftStyle = sportBtnStyle(S.sport === 'Softball');
  const canSubmit = S.athlete.trim() && String(S.age).trim() && S.contact.trim();
  const submitStyle = `flex:2;padding:16px;font-family:'Barlow Condensed';font-weight:800;font-size:17px;letter-spacing:.06em;text-transform:uppercase;border:none;cursor:${canSubmit ? 'pointer' : 'not-allowed'};color:#0c0c0d;background:${canSubmit ? ACCENT : '#3a3b40'};`;

  return `<div>
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#0c0c0d;border:1px solid #1e1f22;padding:14px 18px;margin-bottom:26px">
      <span style="font-family:'JetBrains Mono';font-size:11px;letter-spacing:.12em;color:#8b8c92;text-transform:uppercase">Booking</span>
      <span style="font-family:'Barlow Condensed';font-weight:700;font-size:16px;letter-spacing:.03em;text-transform:uppercase;color:${ACCENT}">${selLabel}</span>
      <span style="color:#36373c">·</span>
      <span style="font-family:'Barlow Condensed';font-weight:700;font-size:16px;letter-spacing:.03em;text-transform:uppercase;color:#f6f5f3">${selPass.name} — ${selPass.price}</span>
    </div>
    <div class="velo-form-row" style="display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:14px">
      <label style="display:block">
        <span style="display:block;font-family:'Barlow Condensed';font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9a9b9f;margin-bottom:7px">Athlete Name</span>
        <input id="fldAthlete" value="${esc(S.athlete)}" placeholder="Jordan Smith" style="width:100%;box-sizing:border-box;background:#0c0c0d;border:1.5px solid #26272b;color:#f6f5f3;font-family:'Barlow';font-size:16px;padding:13px 15px;outline:none">
      </label>
      <label style="display:block">
        <span style="display:block;font-family:'Barlow Condensed';font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9a9b9f;margin-bottom:7px">Age</span>
        <input id="fldAge" value="${esc(S.age)}" placeholder="12" style="width:100%;box-sizing:border-box;background:#0c0c0d;border:1.5px solid #26272b;color:#f6f5f3;font-family:'Barlow';font-size:16px;padding:13px 15px;outline:none">
      </label>
    </div>
    <div style="margin-bottom:14px">
      <span style="display:block;font-family:'Barlow Condensed';font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9a9b9f;margin-bottom:7px">Sport</span>
      <div style="display:flex;gap:8px">
        <button onclick="setState({sport:'Baseball'})" style="${sportBaseStyle}">⚾ Baseball</button>
        <button onclick="setState({sport:'Softball'})" style="${sportSoftStyle}">🥎 Softball</button>
      </div>
    </div>
    <div class="velo-form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px">
      <label style="display:block">
        <span style="display:block;font-family:'Barlow Condensed';font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9a9b9f;margin-bottom:7px">Parent / Guardian</span>
        <input id="fldParent" value="${esc(S.parent)}" placeholder="Optional" style="width:100%;box-sizing:border-box;background:#0c0c0d;border:1.5px solid #26272b;color:#f6f5f3;font-family:'Barlow';font-size:16px;padding:13px 15px;outline:none">
      </label>
      <label style="display:block">
        <span style="display:block;font-family:'Barlow Condensed';font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9a9b9f;margin-bottom:7px">Email or Phone</span>
        <input id="fldContact" value="${esc(S.contact)}" placeholder="you@email.com" style="width:100%;box-sizing:border-box;background:#0c0c0d;border:1.5px solid #26272b;color:#f6f5f3;font-family:'Barlow';font-size:16px;padding:13px 15px;outline:none">
      </label>
    </div>
    <div style="display:flex;gap:12px">
      <button onclick="setState({step:'select'})" style="flex:1;padding:16px;font-family:'Barlow Condensed';font-weight:700;font-size:16px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;color:#c7c8cc;background:transparent;border:1.5px solid #36373c">← Back</button>
      <button onclick="submitReservation()" style="${submitStyle}">Confirm Reservation</button>
    </div>
    <p style="margin-top:14px;font-family:'JetBrains Mono';font-size:11px;letter-spacing:.06em;color:#6f7076;text-align:center">No payment now — we'll confirm your spot and details by email or phone.</p>
  </div>`;
}

function buildConfirmedHTML() {
  const selPass = PASSES.find(p => p.id === S.selectedPass) || PASSES[1];
  const selLabel = S.selectedDate ? fmtDate(S.selectedDate) : '';
  return `<div style="text-align:center;padding:14px 0">
    <div style="width:72px;height:72px;border-radius:50%;background:${ACCENT};display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:38px;color:#0c0c0d">✓</div>
    <h3 style="font-family:'Anton';font-size:clamp(30px,4vw,46px);line-height:.95;text-transform:uppercase;color:#f6f5f3">Spot Reserved</h3>
    <p style="margin-top:14px;color:#b9babf;font-size:17px;max-width:440px;margin-left:auto;margin-right:auto">Nice — ${esc(S.athlete) || 'Your athlete'} is on the list. We'll reach out to confirm the details before the first session.</p>
    <div style="display:inline-flex;flex-wrap:wrap;gap:0;margin-top:30px;border:1px solid #26272b;background:#0c0c0d;text-align:left">
      <div style="padding:18px 24px;border-right:1px solid #26272b">
        <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.16em;color:#8b8c92;text-transform:uppercase;margin-bottom:6px">Day</div>
        <div style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;text-transform:uppercase;color:${ACCENT}">${selLabel}</div>
      </div>
      <div style="padding:18px 24px;border-right:1px solid #26272b">
        <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.16em;color:#8b8c92;text-transform:uppercase;margin-bottom:6px">Pass</div>
        <div style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;text-transform:uppercase;color:#f6f5f3">${selPass.name} · ${selPass.price}</div>
      </div>
      <div style="padding:18px 24px">
        <div style="font-family:'JetBrains Mono';font-size:10px;letter-spacing:.16em;color:#8b8c92;text-transform:uppercase;margin-bottom:6px">Sport</div>
        <div style="font-family:'Barlow Condensed';font-weight:800;font-size:18px;text-transform:uppercase;color:#f6f5f3">${S.sport}</div>
      </div>
    </div>
    <div>
      <button onclick="resetReservation()" style="margin-top:30px;padding:14px 30px;font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;color:#c7c8cc;background:transparent;border:1.5px solid #36373c">Reserve Another Day</button>
    </div>
  </div>`;
}

function sportBtnStyle(on) {
  return `flex:1;padding:13px;cursor:pointer;font-family:'Barlow Condensed';font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase;border:1.5px solid ${on ? ACCENT : '#26272b'};background:${on ? '#16110c' : '#0c0c0d'};color:${on ? ACCENT : '#c7c8cc'};`;
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function attachInputListeners() {
  const fields = {fldAthlete:'athlete',fldAge:'age',fldParent:'parent',fldContact:'contact'};
  for (const [id, key] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', e => { S[key] = e.target.value; refreshSubmitBtn(); });
  }
}

function refreshSubmitBtn() {
  const btn = document.querySelector('#reservationContent button[onclick="submitReservation()"]');
  if (!btn) return;
  const ok = S.athlete.trim() && String(S.age).trim() && S.contact.trim();
  btn.style.background = ok ? ACCENT : '#3a3b40';
  btn.style.cursor = ok ? 'pointer' : 'not-allowed';
}

function goDetails() {
  if (!S.selectedDate) return;
  setState({ step: 'details' });
}

function submitReservation() {
  if (!S.athlete.trim() || !String(S.age).trim() || !S.contact.trim()) return;
  setState({ step: 'confirmed' });
}

function resetReservation() {
  setState({ step:'select', selectedDate:null, athlete:'', age:'', parent:'', contact:'', sport:'Baseball' });
}

// ============ BOOT ============
// The inline widget was replaced by the /book page; only boot if it's present.
if (document.getElementById('reservationContent')) renderReservation();
