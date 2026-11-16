-- ============================================================================
-- Gift registry upgrade for Aidit & Athirah
-- Run this once in Supabase Dashboard > SQL Editor.
-- ============================================================================

-- 1. Add the fields needed by the gift registry UI
alter table public.gift_items add column if not exists description text;
alter table public.gift_items add column if not exists category text not null default 'Home';
alter table public.gift_items add column if not exists icon text not null default 'gift';
alter table public.gift_items add column if not exists gift_mode text not null default 'group';
alter table public.gift_items add column if not exists quantity integer not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'gift_items_gift_mode_check'
  ) then
    alter table public.gift_items
      add constraint gift_items_gift_mode_check
      check (gift_mode in ('group', 'reserve', 'cash'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'gift_items_quantity_check'
  ) then
    alter table public.gift_items
      add constraint gift_items_quantity_check
      check (quantity > 0);
  end if;
end $$;

-- 2. Reservations made by guests
create table if not exists public.gift_reservations (
  id uuid primary key default gen_random_uuid(),
  gift_item_id uuid not null references public.gift_items (id) on delete cascade,
  guest_name text not null default 'Tetamu',
  amount numeric(10, 2) not null check (amount > 0),
  message text,
  payment_method text not null default 'TnG',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists gift_reservations_item_idx
  on public.gift_reservations (gift_item_id, status);
create index if not exists gift_reservations_created_idx
  on public.gift_reservations (created_at desc);

alter table public.gift_reservations enable row level security;

-- Guests can submit a pending reservation. Only the couple (dashboard) should
-- change the status to confirmed/cancelled.
drop policy if exists "Guests can create pending gift reservations" on public.gift_reservations;
create policy "Guests can create pending gift reservations"
  on public.gift_reservations
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- 3. Public registry view: totals + reserved counts, without exposing guest data
create or replace function public.get_gift_registry()
returns table (
  id uuid,
  title text,
  description text,
  category text,
  icon text,
  target_amount numeric,
  collected_amount numeric,
  quantity integer,
  reserved_count bigint,
  gift_mode text,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    g.id,
    g.title,
    g.description,
    g.category,
    g.icon,
    g.target_amount,
    coalesce(sum(case when r.status = 'confirmed' then r.amount else 0 end), 0)::numeric as collected_amount,
    g.quantity,
    count(case when r.status in ('pending', 'confirmed') then 1 end)::bigint as reserved_count,
    g.gift_mode,
    g.sort_order
  from public.gift_items as g
  left join public.gift_reservations as r on r.gift_item_id = g.id
  where g.is_active = true
  group by
    g.id, g.title, g.description, g.category, g.icon,
    g.target_amount, g.quantity, g.gift_mode, g.sort_order, g.created_at
  order by g.sort_order asc, g.created_at asc;
$$;

revoke all on function public.get_gift_registry() from public;
grant execute on function public.get_gift_registry() to anon, authenticated;

-- 4. Starter gift list (edit / add more in Table Editor)
insert into public.gift_items
  (title, description, category, icon, target_amount, gift_mode, quantity, sort_order)
select
  v.title, v.description, v.category, v.icon, v.target_amount, v.gift_mode, v.quantity, v.sort_order
from (
  values
    ('Espresso Coffee Machine', 'For our slow Sunday mornings at home.', 'Home', 'coffee', 1299, 'group', 1, 10),
    ('Stoneware Dinner Set', 'A table set for family and friends.', 'Kitchen', 'plate', 480, 'group', 1, 20),
    ('Air Fryer', 'Quick dinners for our busy weeknights.', 'Kitchen', 'sparkles', 599, 'group', 1, 30),
    ('Honeymoon Luggage Set', 'For the trips we have been dreaming of.', 'Travel', 'luggage', 850, 'group', 1, 40),
    ('Linen Bedding Set', 'Soft linen for our little home.', 'Home', 'bed', 620, 'group', 1, 50),
    ('Instant Camera', 'To capture all the little moments.', 'Memories', 'camera', 750, 'group', 1, 60),
    ('Salam Kaut / Cash Gift', 'Any amount, from the heart.', 'Cash', 'gift', 3000, 'cash', 1, 70)
) as v(title, description, category, icon, target_amount, gift_mode, quantity, sort_order)
where not exists (
  select 1 from public.gift_items as g where g.title = v.title
);

-- The couple can approve reservations in Table Editor:
-- update public.gift_reservations set status = 'confirmed' where id = '<reservation-id>';
