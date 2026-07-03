// Minimal Supabase PostgREST client for Netlify Functions. Uses the
// service-role key (server-side only — never expose it to the browser),
// which bypasses row level security.

async function sb(pathAndQuery, { method = 'GET', body, prefer } = {}) {
  // trim: a stray newline/space from pasting into the Netlify UI breaks fetch
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) {
    const err = new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured');
    err.code = 'missing_env';
    throw err;
  }

  // Forgive the two easiest paste mistakes: missing scheme, trailing slash.
  const base = (url.startsWith('http') ? url : `https://${url}`).replace(/\/$/, '');
  const res = await fetch(`${base}/rest/v1${pathAndQuery}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON error body */ }
  return { ok: res.ok, status: res.status, data, text };
}

module.exports = { sb };
