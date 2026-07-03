// POST /.netlify/functions/admin-login  { password }
// Neril's only credential is a shared password (env var ADMIN_PASSWORD) —
// there's no per-user account system. On match, sets a signed, expiring
// cookie that isAuthed() (lib/auth.js) verifies on every other admin request.

const crypto = require('crypto');
const { createSessionCookie } = require('../../lib/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  // trim: a stray newline/space from pasting into the Netlify UI breaks
  // the exact-match check (same class of bug as SUPABASE_URL/KEY in lib/db.js)
  const expected = (process.env.ADMIN_PASSWORD || '').trim();
  if (!expected) return json(500, { error: 'not_configured' });

  let password = '';
  try {
    password = String(JSON.parse(event.body || '{}').password || '').trim();
  } catch {
    return json(400, { error: 'bad_request' });
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!match) return json(401, { error: 'invalid_password' });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': createSessionCookie() },
    body: JSON.stringify({ ok: true }),
  };
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
