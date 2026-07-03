// POST /.netlify/functions/admin-logout — clears the admin session cookie.

const { clearSessionCookie } = require('../../lib/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie() },
    body: JSON.stringify({ ok: true }),
  };
};
