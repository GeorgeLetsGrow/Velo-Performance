# New Facility Runbook

How to stand up this booking system for a **new training facility** — a clone
of the Velo site, re-skinned and re-pointed at a new business. Follow this
top to bottom; budget **~2–4 hours** the first time, less after that.

> Do this work on a **separate clone / new repo**, never on the live Velo repo.
> The steps below only describe *which values change* — the booking engine
> itself (Functions, database schema, reservation logic) is generic and you
> don't touch it.

---

## The map: what changes vs. what doesn't

**Never touch — the engine (already generic):**
- `netlify/functions/*` — checkout, availability, holds, webhook, refunds, admin
  auth, SMS (logic only; two facility values are called out below)
- `supabase/migrations/*` — the database schema + capacity/no-overlap rules
- `lib/db.js`, `lib/auth.js`, `lib/sms.js` — plumbing
- `app/admin/*`, `app/book/*` reservation flow — the booking UX

**Change per client — code:**
| What | File |
|---|---|
| Catalog (passes, lessons, prices), daily capacity, lesson hours | `lib/services.js` |
| Facility timezone | `netlify/functions/create-checkout.js` |
| Checkout product label | `netlify/functions/create-checkout.js` |
| SEO title/description, business schema, coaches, email, city, theme key | `app/layout.jsx` |
| The landing page (design + copy) — **the big one** | `app/markup.js` |
| Legal copy (business name, email, location) | `app/privacy/page.jsx`, `app/terms/page.jsx` |
| Booking-page footer copy (location line) | `app/book/page.jsx` |
| Logo / icons / OG image | `public/` (`icon.png`, `apple-touch-icon.png`, `/assets/…`) |

**Change per client — infrastructure (not code):**
- A new **Supabase** project
- A new **Netlify** site
- The client's **Stripe** account (or your platform + their connected account)
- Optional **Twilio** number for SMS
- The client's **domain**

---

## Step 1 — Clone the repo

```
git clone <this-repo> <new-facility> && cd <new-facility>
git remote remove origin           # then add the new client's repo as origin
npm install
```

---

## Step 2 — Catalog, capacity & hours  (`lib/services.js`)

This is the single source of truth for **prices** — the client can never set
its own price; the Functions read it from here.

- `PASSES` — day-attendance program options (id, name, `cents`, unit, days, desc)
- `LESSONS` — 1-on-1 options (id, name, `duration`, `cents`, desc)
- `CAPACITY` — max athletes per program day
- `LESSON_START` / `LESSON_END` / `SLOT_STEP` — the 1-on-1 window (minutes from
  midnight) and slot spacing

> `cents` is the price in cents: `6000` = $60.00.

---

## Step 3 — Timezone  (`netlify/functions/create-checkout.js`)

Find the "Facility-local today" line and set the IANA zone:

```js
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
//                                                          ^^^ change to e.g. 'America/Chicago'
```

## Step 4 — Checkout product label  (same file)

Find the pass product name and replace the Velo wording:

```js
: `${item.name} — Velo After-School Training`;   // ← rename for the new facility
```

---

## Step 5 — Business identity & SEO  (`app/layout.jsx`)

Replace every Velo value here — this drives the page title, meta description,
social cards, and the Google business schema:

- `SITE_URL` — the client's domain
- `metadata.title` / `description` and the `openGraph` block
- `BUSINESS_SCHEMA`: `name`, `description`, `email`, address (`city`/`region`/
  `country`), `areaServed`, opening days, `employee` (coaches), and the
  `hasOfferCatalog` offers/prices
- Logo paths (`logo`, `image`, `openGraph.images`)
- The **theme storage key** — search for `'velo-theme'` in the inline script and
  rename to `'<slug>-theme'` (prevents theme collisions if a visitor uses two
  sites)

---

## Step 6 — The landing page  (`app/markup.js`)  ⚠️ the real work

This is the bespoke marketing homepage (~71KB of hand-built HTML). It is **not**
config-driven — every facility gets its own design and copy. Plan to redesign:
hero, headlines, program descriptions, coach bios, photos, testimonials,
colors, and all "Velo" references. Styling lives in `app/globals.css`.

> This is the one step that can't be reduced to editing a variable. Budget the
> most time here, or offer it as a paid design add-on per client.

---

## Step 7 — Legal & footer copy

- `app/privacy/page.jsx` and `app/terms/page.jsx` — business name, contact email,
  location, and program description
- `app/book/page.jsx` — the footer location line ("… in Apollo Beach, FL.")

---

## Step 8 — Assets  (`public/`)

Swap `icon.png`, `apple-touch-icon.png`, `favicon.ico`, and any images under
`/public/assets/` referenced by the landing page and schema (e.g. the logo).

---

## Step 9 — Provision infrastructure

**Supabase**
1. Create a new project.
2. Apply the schema: run every file in `supabase/migrations/` in order (Supabase
   SQL editor, or `supabase db push` if you use the CLI).
3. Grab the project URL and the `service_role` secret key for the env vars.

**Netlify**
1. New site → connect the client's repo.
2. Build settings come from `netlify.toml` (build `npm run build`, publish `out`,
   functions in `netlify/functions`) — no changes needed.

**Stripe** — see Step 10 for how the money is structured.

**Twilio (optional)** — buy a number if the client wants booking-alert texts.

---

## Step 10 — Environment variables

Set these in **Netlify → Site configuration → Environment variables** (see
`.env.example` for the annotated list). Netlify auto-provides `URL`.

| Var | Purpose |
|---|---|
| `SUPABASE_URL` | New project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | New project `service_role` key |
| `STRIPE_SECRET_KEY` | `sk_live_…` (see below re: whose account) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from the webhook endpoint pointed at `/.netlify/functions/stripe-webhook` |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | Optional SMS |
| `SMS_NOTIFY_TO` | Who gets booking-alert texts |

**Taking your platform fee (optional):** to skim a per-booking fee, run checkout
on **your own Stripe platform account** with the client connected via Stripe
Connect, then set:

| Var | Purpose |
|---|---|
| `STRIPE_CONNECTED_ACCOUNT_ID` | The client's connected account (`acct_…`) |
| `PLATFORM_FEE_CENTS` | Your cut in cents (e.g. `834` = $8.34) |

Leave both blank to run as a plain single-account checkout (100% to the client).
The client must **authorize** the Connect link once — you can't attach a fee to
their account without it.

---

## Step 11 — Admin & Stripe webhook

- Follow `docs/ADMIN-SETUP.md` to set the admin login for the owner dashboard.
- Follow `docs/BOOKING-SETUP.md` for the Stripe webhook wiring (events:
  `checkout.session.completed`, `checkout.session.expired`).

---

## Step 12 — Point the domain

Add the client's custom domain in Netlify and update DNS. Make sure `SITE_URL`
in `app/layout.jsx` and the deployed domain match.

---

## Step 13 — Test before handoff

- [ ] Landing page renders with the new brand, no "Velo" left anywhere
- [ ] `/book` shows the correct passes, lessons, and prices
- [ ] A test booking creates a Stripe Checkout session (use a Stripe **test** key first)
- [ ] Paying a test booking flips it to `paid` and fires the owner SMS (if Twilio set)
- [ ] Daily capacity blocks a full day; overlapping lesson times are rejected
- [ ] If using Connect: the platform fee lands in *your* account and the rest in the client's
- [ ] Legal pages, emails, and the footer show the new business

---

## Optional but recommended: consolidate config into one file

Right now the per-client values are spread across `lib/services.js`,
`app/layout.jsx`, and two lines in `create-checkout.js`. On the clone, consider
extracting all of them into a single `lib/facility.js` and having those files
import from it. That turns Steps 2–5 into "edit one file," which is worth doing
once you're standing up your **third** facility and the copy-hunting gets old.
```
