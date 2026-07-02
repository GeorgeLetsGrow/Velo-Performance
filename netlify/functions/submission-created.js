// Netlify automatically invokes a function named `submission-created` for
// every verified form submission on the site. This one texts the owner via
// Twilio so reservation requests don't sit unseen in an inbox.
//
// Required environment variables (Site configuration → Environment variables):
//   TWILIO_ACCOUNT_SID   — from the Twilio console dashboard
//   TWILIO_AUTH_TOKEN    — from the Twilio console dashboard
//   TWILIO_FROM_NUMBER   — your Twilio phone number, E.164 (+18135551234)
//   SMS_NOTIFY_TO        — number(s) to text, E.164, comma-separated for several
//
// If any are missing the function logs and exits without error, so the form
// itself keeps working (submissions are stored by Netlify either way).

exports.handler = async (event) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const notifyTo = process.env.SMS_NOTIFY_TO;

  if (!sid || !token || !from || !notifyTo) {
    console.log('SMS notification skipped: Twilio env vars not configured.');
    return { statusCode: 200 };
  }

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

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');

  const recipients = notifyTo.split(',').map((n) => n.trim()).filter(Boolean);
  const results = await Promise.allSettled(
    recipients.map(async (to) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: text }),
      });
      if (!res.ok) {
        throw new Error(`Twilio ${res.status} for ${to}: ${await res.text()}`);
      }
      console.log(`SMS notification sent to ${to}`);
    })
  );

  for (const r of results) {
    if (r.status === 'rejected') console.error(r.reason);
  }

  // Always 200: a failed text should never surface as a form error.
  return { statusCode: 200 };
};
