-- Velo Performance Lab — booking system schema
-- Apply with the Supabase CLI: `supabase link --project-ref <ref>` then
-- `supabase db push`. (Or paste into the dashboard SQL Editor and run once.)

-- Needed for the "no two bookings can overlap" constraint below.
create extension if not exists btree_gist;

create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),

  -- The slot
  session_date          date not null,
  start_min             int  not null,  -- minutes from midnight (900 = 3:00 PM)
  duration_min          int  not null,

  -- What was bought (denormalized from lib/services.js at booking time,
  -- so price changes never rewrite history)
  service_id            text not null,
  service_name          text not null,
  price_cents           int  not null,

  -- Who
  athlete_name          text not null,
  athlete_age           text,
  sport                 text,
  parent_name           text,
  contact               text not null,

  -- Lifecycle: hold (awaiting payment) → paid, or hold → expired/cancelled
  status                text not null default 'hold'
                        check (status in ('hold', 'paid', 'cancelled', 'expired')),
  hold_expires_at       timestamptz,

  -- Stripe references
  stripe_session_id     text unique,
  stripe_payment_intent text
);

-- One coach lane: no two active bookings (holds or paid) may overlap in time
-- on the same day. Postgres enforces this atomically, so two parents racing
-- for the same slot can never both win — the second insert simply fails.
alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    session_date with =,
    int4range(start_min, start_min + duration_min) with &&
  ) where (status in ('hold', 'paid'));

create index bookings_date_idx on public.bookings (session_date);

-- Lock the table down. With RLS on and no policies, the anon/public API keys
-- can't read or write anything — only the service-role key used by the
-- Netlify Functions (and the dashboard) can.
alter table public.bookings enable row level security;
