-- Multiple reservations can now be purchased in one Stripe Checkout Session.
-- Keep the lookup fast, but allow every booking in an order to share the ID.
alter table public.bookings
  drop constraint if exists bookings_stripe_session_id_key;

create index if not exists bookings_stripe_session_id_idx
  on public.bookings (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists bookings_stripe_payment_intent_idx
  on public.bookings (stripe_payment_intent)
  where stripe_payment_intent is not null;
