// GET /.netlify/functions/admin-session
// Lets the /admin page ask "is the current cookie still valid?" so it knows
// whether to show the login form or the dashboard. This endpoint returns no
// real data — every function that does (bookings, refunds, messages) must
// call isAuthed(event) itself too, not rely on this check having happened.

const { isAuthed } = require('../../lib/auth');

exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: isAuthed(event) }),
  };
};
