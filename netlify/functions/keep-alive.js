// Scheduled "keep-alive" — pings Supabase so the free-tier project never pauses
// from inactivity (Supabase suspends a free project after ~7 days idle, which
// would take the booking site down). One trivial read a day keeps it awake.
//
// Once the site has steady booking traffic this is redundant — real requests
// keep the project active on their own — but it's cheap insurance until then.
//
// Scheduled via netlify.toml: [functions."keep-alive"] schedule = "0 6 * * *".
// Reuses the same SUPABASE_* env vars as the rest of the Functions.

const { sb } = require('../../lib/db');

exports.handler = async () => {
  try {
    // Cheapest possible query that still hits PostgREST and registers activity.
    const res = await sb('/bookings?select=id&limit=1');
    if (!res.ok) {
      console.error('keep-alive: Supabase returned', res.status, res.text);
      return { statusCode: 502, body: 'supabase error' };
    }
    console.log('keep-alive: ok', new Date().toISOString());
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('keep-alive failed:', err.message);
    return { statusCode: 500, body: 'error' };
  }
};
