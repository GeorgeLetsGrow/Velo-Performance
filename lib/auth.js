// Signs and verifies the admin session cookie. Neril is the only admin, so
// there's no user table — just a shared password (ADMIN_PASSWORD) checked in
// admin-login.js, backed by an HMAC-signed, expiring cookie. Verification
// never trusts the cookie's claims, only the signature, so a forged cookie
// can't grant access without ADMIN_SESSION_SECRET.

const crypto = require('crypto');

const COOKIE_NAME = 'velo_admin_session';
const SESSION_HOURS = 12;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET not configured');
  return s;
}

function sign(expiresAt) {
  return crypto.createHmac('sha256', secret()).update(String(expiresAt)).digest('hex');
}

function serializeCookie(value, maxAgeSeconds) {
  // Netlify sets CONTEXT=dev for `netlify dev`, which usually serves over
  // plain http — Secure would silently drop the cookie there.
  const secureFlag = process.env.CONTEXT !== 'dev' ? '; Secure' : '';
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

function createSessionCookie() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const token = `${expiresAt}.${sign(expiresAt)}`;
  return serializeCookie(token, SESSION_HOURS * 60 * 60);
}

function clearSessionCookie() {
  return serializeCookie('', 0);
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

// Call this at the top of every admin Netlify Function that returns or
// mutates real data — admin-session.js only tells the page whether to show
// the login form, it doesn't gate anything by itself.
function isAuthed(event) {
  const header = event.headers && (event.headers.cookie || event.headers.Cookie);
  const token = parseCookies(header)[COOKIE_NAME];
  if (!token) return false;

  const [expiresAtStr, sig] = token.split('.');
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || !sig || Date.now() > expiresAt) return false;

  const expected = sign(expiresAt);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { createSessionCookie, clearSessionCookie, isAuthed, COOKIE_NAME };
