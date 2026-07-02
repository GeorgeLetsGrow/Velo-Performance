# Booking System — Setup Guide

The `/book` page sells private lessons: pick a service → pick a real open
slot → pay with Stripe Checkout → the slot is locked and the owner gets a
text. This guide wires up the two external services it depends on.

**Current state:** the page is live at `/book` but nothing on the site links
to it yet, so it's safe to test in Stripe test mode on the deployed site.

## How it works

```
Parent picks slot → create-checkout fn:
                      1. validates slot (prices come from lib/services.js, never the client)
                      2. inserts a 35-min "hold" row — Postgres' no-overlap
                         constraint makes double-booking impossible
                      3. creates a 30-min Stripe Checkout Session
                    → parent pays on Stripe's hosted page
                    → stripe-webhook fn: hold → paid, owner gets SMS
                    → parent lands back on /book (confirmation screen)

Abandoned checkout → hold expires (or release-hold fires on cancel) → slot frees itself
```

## 1. Supabase (~5 minutes)

1. Create a project (any name, e.g. `velo-bookings`) at supabase.com.
2. Apply the schema in `supabase/migrations/` — it creates the `bookings`
   table with the no-double-booking constraint and locks it behind row
   level security. Either way works:
   - **CLI** (repo is already `supabase init`-ed):
     ```sh
     npx supabase login
     npx supabase link --project-ref <your-project-ref>
     npx supabase db push
     ```
   - **Dashboard**: SQL Editor → New query → paste the migration file → Run.
3. Grab two values from **Project Settings → API**:
   - Project URL → env var `SUPABASE_URL`
   - `service_role` secret key → env var `SUPABASE_SERVICE_ROLE_KEY`
     (server-only key — never put it in client code)

## 2. Stripe (~10 minutes, start in test mode)

1. Create the account at stripe.com; you can do everything below in **test
   mode** (toggle in the dashboard) before activating the account.
2. **Developers → API keys** → copy the *Secret key* (`sk_test_…`) → env var
   `STRIPE_SECRET_KEY`.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://<your-site>.netlify.app/.netlify/functions/stripe-webhook`
   - Events: `checkout.session.completed` and `checkout.session.expired`
   - After creating, copy the *Signing secret* (`whsec_…`) → env var
     `STRIPE_WEBHOOK_SECRET`.

## 3. Netlify environment variables

Site configuration → Environment variables:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key |
| `STRIPE_SECRET_KEY` | `sk_test_…` (later `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `TWILIO_ACCOUNT_SID` etc. | (already set up for form SMS; the paid-booking text reuses them) |

Redeploy after saving.

## 4. Test the whole loop

1. Visit `https://<your-site>/book` directly.
2. Book a slot; pay with Stripe's test card `4242 4242 4242 4242`, any
   future expiry, any CVC/ZIP.
3. Confirm: you land back on `/book` with the confirmation screen; the row
   in Supabase (**Table Editor → bookings**) has `status = paid`; the owner
   SMS arrived (if Twilio is configured); re-selecting that day shows the
   slot struck through.
4. Also test backing out: start a checkout, click the back arrow on the
   Stripe page — the slot should free up immediately.

## Going live

- Activate the Stripe account (business verification), switch
  `STRIPE_SECRET_KEY` to the live key, and create a **live-mode** webhook
  endpoint (same URL/events) — its `whsec_…` replaces the test one.
- Link the page into the site (e.g. a "Book a Lesson" nav item) when ready.
- Prices/durations/services are edited in one place: `lib/services.js`.

## Not built yet (phase two)

- Organizer tools: daily roster digest, block-out days, cancel/refund flow.
  Refunds work today via the Stripe dashboard, but they don't free the slot
  automatically — delete/cancel the row in Supabase too.
- Weekly-pass purchases (the after-school program) still go through the
  contact form by design.
