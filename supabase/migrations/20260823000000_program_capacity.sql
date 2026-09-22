-- Keep every existing booking, but count capacity independently for each
-- group program. Historical pass IDs remain part of the after-school pool.

create or replace function public.enforce_day_capacity()
returns trigger
language plpgsql
as $$
declare
  new_program text;
  taken int;
begin
  select case
    when item_id in ('dropin', 'flex3', 'unlimited', 'afterschool') then 'afterschool'
    else item_id
  end into new_program
  from public.bookings
  where id = new.booking_id;

  perform pg_advisory_xact_lock(hashtext(new.session_date::text || ':' || new_program));

  select count(*) into taken
    from public.booking_days d
    join public.bookings b on b.id = d.booking_id
   where d.session_date = new.session_date
     and case
       when b.item_id in ('dropin', 'flex3', 'unlimited', 'afterschool') then 'afterschool'
       else b.item_id
     end = new_program
     and (b.status = 'paid'
          or (b.status = 'hold' and b.hold_expires_at > now()));

  if taken >= 12 then
    raise exception 'day_full' using errcode = '23P01';
  end if;
  return new;
end;
$$;
