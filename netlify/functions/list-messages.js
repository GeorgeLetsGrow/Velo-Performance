// GET /.netlify/functions/list-messages
// Admin-only: pulls the site's "reserve-a-spot" form submissions from
// Netlify's own Forms API (submissions aren't stored in Supabase — Netlify
// already has an inbox for them). Returns a reply-ready contact link per
// message: sms: if a phone was given, else mailto:.
//
// Env vars: NETLIFY_API_TOKEN (a personal access token) and NETLIFY_SITE_ID
// (Site settings → General → Site details → Site ID).

const { isAuthed } = require('../../lib/auth');

const FORM_NAME = 'reserve-a-spot';

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'method_not_allowed' });
  if (!isAuthed(event)) return json(401, { error: 'unauthorized' });

  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;
  if (!token || !siteId) return json(503, { error: 'not_configured' });

  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/submissions?per_page=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error('Netlify submissions fetch failed:', res.status, await res.text());
      return json(502, { error: 'netlify_api' });
    }
    const submissions = await res.json();

    const messages = submissions
      .filter((s) => s.form_name === FORM_NAME)
      .map((s) => {
        const data = s.data || {};
        const phone = (data.phone || '').trim();
        const email = (data.email || '').trim();
        const replyHref = phone ? `sms:${phone}` : email ? `mailto:${email}` : null;
        return {
          id: s.id,
          createdAt: s.created_at,
          parentName: data['parent-name'] || 'Someone',
          contact: phone || email || 'no contact given',
          interest: data.interest || null,
          note: data.message || null,
          replyHref,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return json(200, { messages });
  } catch (err) {
    console.error(err);
    return json(502, { error: 'unavailable' });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
