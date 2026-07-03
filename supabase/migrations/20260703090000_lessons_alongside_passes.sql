-- Two booking modes in one model:
--   pass   — after-school day passes (12 athletes/day capacity)
--   lesson — individual 1-on-1 sessions (exclusive time slots, 5–7 PM)
-- Apply with `supabase db push` (or paste into the dashboard SQL Editor).

create extension if not exists btree_gist;

-- Replaces the pass-only tables (still test data at this point).
drop table if exists public.booking_days;
drop table if exists public.bookings cascade;

-- One row per purchase: a pass (covering 1–5 program days via booking_days)
-- or a lesson (one exclusive time slot, stored inline).
create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),

  kind                  text not null check (kind in ('pass', 'lesson')),

  -- What was bought (denormalized from lib/services.js at booking time,
  -- so price changes never rewrite history)
  item_id               text not null,
  item_name             text not null,
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
  stripe_payment_intent text,

  -- Lesson slot (lessons only; passes keep these null and use booking_days)
  session_date          date,
  start_min             int,
  duration_min          int,
  constraint booking_shape check (
    (kind = 'lesson' and session_date is not null and start_min is not null and duration_min is not null)
    or
    (kind = 'pass' and session_date is null and start_min is null and duration_min is null)
  )
);

-- 1-on-1 means one athlete at a time: active lessons can never overlap.
-- Postgres enforces this atomically — the second of two racing checkouts
-- simply fails with a conflict.
alter table public.bookings
  add constraint lessons_no_overlap
  exclude using gist (
    session_date with =,
    int4range(start_min, start_min + duration_min) with &&
  ) where (kind = 'lesson' and status in ('hold', 'paid'));

create index bookings_lesson_date_idx on public.bookings (session_date) where kind = 'lesson';

-- One row per program day a pass covers.
create table public.booking_days (
  id           bigint generated always as identity primary key,
  booking_id   uuid not null references public.bookings (id) on delete cascade,
  session_date date not null,
  unique (booking_id, session_date)
);

create index booking_days_date_idx on public.booking_days (session_date);

-- Program capacity: at most 12 athletes per day, counting paid bookings and
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
