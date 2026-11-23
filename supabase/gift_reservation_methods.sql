-- ============================================================================
-- Gift reservation method: "Sumbangan Ikhlas" vs "Kirim Hadiah Sendiri"
-- Run in Supabase Dashboard > SQL Editor. Safe to re-run.
-- ============================================================================

alter table public.gift_reservations
  add column if not exists gift_method text not null default 'cash';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'gift_reservations_gift_method_check'
  ) then
    alter table public.gift_reservations
      add constraint gift_reservations_gift_method_check
      check (gift_method in ('cash', 'self'));
  end if;
end $$;

-- Existing reservations were money contributions.
update public.gift_reservations
set gift_method = 'cash'
where gift_method is null;

notify pgrst, 'reload schema';
