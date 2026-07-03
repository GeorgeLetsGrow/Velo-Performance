-- Rework the booking model: the site sells after-school passes (Drop-In,
-- 3-Day Flex, Unlimited Week) — day attendance with a 12-athlete daily cap —
-- instead of exclusive one-hour time slots.
-- Apply with `supabase db push` (or paste into the dashboard SQL Editor).

-- The old slot-based table only ever held test data.
drop table if exists public.bookings cascade;

-- One row per purchase (a pass covering 1–5 training days).
create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),

  -- What was bought (denormalized from lib/services.js at booking time,
  -- so price changes never rewrite history)
  pass_id               text not null,
  pass_name             text not null,
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

-- One row per training day the pass covers.
create table public.booking_days (
  id           bigint generated always as identity primary key,
  booking_id   uuid not null references public.bookings (id) on delete cascade,
  session_date date not null,
  unique (booking_id, session_date)
);

create index booking_days_date_idx on public.booking_days (session_date);

-- Capacity: at most 12 athletes per training day, counting paid bookings and
-- unexpired holds. The advisory lock serializes concurrent inserts for the
-- same date, so two checkouts racing for the last spot can't both win.
-- ERRCODE 23P01 makes PostgREST answer 409, which create-checkout maps to
-- a friendly "day full" message.
create or replace function public.enforce_day_capacity()
returns trigger
language plpgsql
as $$
declare
  taken int;
begin
  perform pg_advisory_xact_lock(hashtext(new.session_date::text));
  select count(*) into taken
    from public.booking_days d
    join public.bookings b on b.id = d.booking_id
   where d.session_date = new.session_date
     and (b.status = 'paid'
          or (b.status = 'hold' and b.hold_expires_at > now()));
  if taken >= 12 then
    raise exception 'day_full' using errcode = '23P01';
  end if;
  return new;
end;
$$;

create trigger booking_days_capacity
  before insert on public.booking_days
  for each row execute function public.enforce_day_capacity();

-- Locked down: only the service-role key used by the Netlify Functions
-- (and the dashboard) can touch these.
alter table public.bookings enable row level security;
alter table public.booking_days enable row level security;
