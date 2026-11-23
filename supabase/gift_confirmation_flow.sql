-- ============================================================================
-- Gift reservations wait for the couple's confirmation
-- Run in Supabase Dashboard > SQL Editor. Safe to re-run.
--
-- Guests submit reservations as "pending". The bride/groom check the WhatsApp
-- proof (payment or purchase receipt), then confirm the row. Only confirmed
-- rows count toward "collected", so the gift turns "Fully funded" and moves
-- into the "Sudah ditempah" list after confirmation.
-- ============================================================================

alter table public.gift_reservations
  alter column status set default 'pending';

drop policy if exists "Guests can create confirmed gift reservations" on public.gift_reservations;
drop policy if exists "Guests can create pending gift reservations" on public.gift_reservations;
create policy "Guests can create pending gift reservations"
  on public.gift_reservations
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- Confirm a reservation after proof is received:
-- update public.gift_reservations
-- set status = 'confirmed'
-- where id = '<reservation-id>';

notify pgrst, 'reload schema';
