-- Track SMS consent per booking, captured from the checkbox on /book.
-- Needed before texting parents directly (e.g. session reminders) —
-- today's owner-notification texts don't require it, but the paper trail
-- should start now rather than be retrofitted later.
alter table public.bookings
  add column sms_opt_in boolean not null default false;
