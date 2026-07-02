-- Velo Performance Labs — booking system schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Upgrading from the earlier private-lesson schema (start_min/duration_min)?
-- Drop it first — the /book page was never linked, so only test rows exist:
--   drop table if exists public.bookings;

create table public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),

  -- The training days this purchase covers (always within one Mon–Fri week)
  session_dates         date[] not null
                        check (array_length(session_dates, 1) between 1 and 5),

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

create index bookings_dates_idx on public.bookings using gin (session_dates);

-- Small-group cap: at most 12 athletes per afternoon (keep in sync with
-- CAPACITY in lib/services.js). The per-date advisory locks serialize
-- concurrent inserts touching the same day, so two parents racing for the
-- last spot can never both win — the second insert fails with 'day_full'.
create or replace function public.enforce_daily_capacity()
returns trigger
language plpgsql
as $$
declare
  d date;
  taken int;
begin
  if new.status not in ('hold', 'paid') then
    return new;
  end if;
  for d in select distinct x from unnest(new.session_dates) as x order by 1 loop
    perform pg_advisory_xact_lock(hashtext('velo-day-' || d::text));
    select count(*) into taken
      from public.bookings b
      where d = any(b.session_dates)
        and b.status in ('hold', 'paid')
        and b.id <> new.id;
    if taken >= 12 then
      raise exception 'day_full: % has no open spots', d;
    end if;
  end loop;
  return new;
end;
$$;

create trigger bookings_capacity
  before insert on public.bookings
  for each row execute function public.enforce_daily_capacity();

-- Lock the table down. With RLS on and no policies, the anon/public API keys
-- can't read or write anything — only the service-role key used by the
-- Netlify Functions (and the dashboard) can.
alter table public.bookings enable row level security;
