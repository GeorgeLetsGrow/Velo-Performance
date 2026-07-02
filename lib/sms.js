// Texts the owner via Twilio. No-op (with a log) when Twilio isn't
// configured, and never throws — a failed text must not fail the caller.
//
// Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER,
// SMS_NOTIFY_TO (E.164, comma-separated for multiple recipients).

async function notifyOwner(text) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const notifyTo = process.env.SMS_NOTIFY_TO;

  if (!sid || !token || !from || !notifyTo) {
    console.log('SMS notification skipped: Twilio env vars not configured.');
    return false;
  }

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
  return true;
}

module.exports = { notifyOwner };
