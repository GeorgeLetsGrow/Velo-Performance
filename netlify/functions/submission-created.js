// Netlify automatically invokes a function named `submission-created` for
// every verified form submission on the site. This one texts the owner via
// Twilio (see lib/sms.js for the required env vars) so reservation requests
// don't sit unseen in an inbox. Missing config or Twilio errors never fail
// the submission itself — Netlify stores it either way.

const { notifyOwner } = require('../../lib/sms');

exports.handler = async (event) => {
  const { payload } = JSON.parse(event.body);
  const data = payload.data || {};

  const parent = data['parent-name'] || 'Someone';
  const contact = data.phone || data.email || 'no contact given';
  const interest = data.interest || 'no pass selected';
  const note = (data.message || '').trim();

  let text =
    `New Velo reservation request:\n` +
    `${parent} — ${contact}\n` +
    `Interested in: ${interest}`;
  if (note) text += `\nNote: ${note.slice(0, 200)}`;

  await notifyOwner(text);

  return { statusCode: 200 };
};
