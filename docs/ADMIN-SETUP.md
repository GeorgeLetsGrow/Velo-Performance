# Admin Dashboard — Setup Guide

The `/admin` page is a login-gated dashboard for Neril: view bookings, issue
refunds, and see (and reply to) contact-form messages.

## How it works

There's no user table — Neril is the only admin, so it's a single shared
password (`ADMIN_PASSWORD`) checked by `admin-login.js`. On a correct
password it sets an HMAC-signed, expiring cookie (12 hours); every admin
function verifies that signature itself via `isAuthed()` in `lib/auth.js`
before returning or changing anything.

- **Bookings tab** — `list-bookings.js` reads the `bookings` table, filterable
  by status. "Refund" (shown on paid bookings) calls `refund-booking.js`,
  which refunds the Stripe payment intent and flips the row to `cancelled` —
  the slot frees itself automatically.
- **Messages tab** — `list-messages.js` pulls "reserve-a-spot" form
  submissions from Netlify's own Forms API (they're not stored in Supabase).
  Each message has a "Reply" link that opens `sms:` or `mailto:` with the
  contact info the parent gave — no in-app sending, Neril finishes the
  message on his phone/email.

## Netlify environment variables

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | Whatever password Neril will log in with |
| `ADMIN_SESSION_SECRET` | A long random string, e.g. output of `openssl rand -hex 32` |
| `NETLIFY_API_TOKEN` | A personal access token — User settings → Applications → New access token |
| `NETLIFY_SITE_ID` | Site settings → General → Site details → Site ID (the API ID, not the domain) |

Redeploy after saving. Locally with `netlify dev`, the session cookie skips
the `Secure` flag automatically (Netlify sets `CONTEXT=dev`), since local dev
usually serves over plain http.

## Test it

1. Visit `/admin` — you should see a login form (nothing on the site links
   to it yet, same as `/book` before it was linked in).
2. Wrong password → "Wrong password." error, no cookie set.
3. Correct password → the dashboard, defaulting to the Bookings tab.
   Refreshing the page keeps you logged in (cookie persists 12 hours).
4. **Bookings:** confirm the list matches the `bookings` table in Supabase;
   try the status filters; click "Refund" on a paid test booking (Stripe test
   mode) and confirm it shows as refunded in Stripe and `cancelled` in
   Supabase, and the slot opens back up on `/book`.
5. **Messages:** submit the "reserve-a-spot" form on the homepage, then
   confirm it shows up here within a minute or two, and that "Reply" opens
   your phone's messaging or mail app with the right contact prefilled.
6. "Log Out" clears the cookie and returns you to the login form.
