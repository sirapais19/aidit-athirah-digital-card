-- ============================================================================
-- Gift registry for Aidit & Athirah
-- Safe to run on the existing gift_items table shown in the project schema.
-- Run in Supabase Dashboard > SQL Editor.
-- ============================================================================

-- Ensure the base table exists on new projects; on existing projects this is a no-op.
create table if not exists public.gift_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_amount numeric(10, 2) not null check (target_amount > 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 1. Add the fields needed by the gift registry UI
alter table public.gift_items add column if not exists description text;
alter table public.gift_items add column if not exists category text not null default 'Home';
alter table public.gift_items add column if not exists icon text not null default 'gift';
alter table public.gift_items add column if not exists gift_mode text not null default 'group';
alter table public.gift_items add column if not exists quantity integer not null default 1;
alter table public.gift_items add column if not exists is_claimed boolean not null default false;
alter table public.gift_items add column if not exists image_url text;
alter table public.gift_items add column if not exists product_url text;

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
  gift_method text not null default 'cash'
    check (gift_method in ('cash', 'self')),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

grant insert on public.gift_reservations to anon, authenticated;
grant select, insert, update, delete on public.gift_items to anon, authenticated;

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

alter table public.gift_items enable row level security;
drop policy if exists "Anyone can view active gift items" on public.gift_items;
create policy "Anyone can view active gift items"
  on public.gift_items
  for select
  to anon, authenticated
  using (is_active = true);

-- Public submissions start as "pending". The couple checks the proof
-- (WhatsApp payment/purchase receipt), then confirms the row in Table Editor.
-- No public read or update policies are created, so guest details stay private.

create index if not exists gift_reservations_item_idx
  on public.gift_reservations (gift_item_id, status);
create index if not exists gift_reservations_created_idx
  on public.gift_reservations (created_at desc);

alter table public.gift_reservations enable row level security;

-- Guests can submit pending reservations. They cannot read or modify rows.
drop policy if exists "Guests can create confirmed gift reservations" on public.gift_reservations;
drop policy if exists "Guests can create pending gift reservations" on public.gift_reservations;
create policy "Guests can create pending gift reservations"
  on public.gift_reservations
  for insert
  to anon, authenticated
  with check (status = 'pending');

grant insert on public.gift_reservations to anon, authenticated;

-- 3. Public registry view: totals + reserved counts, without exposing guest data
drop function if exists public.get_gift_registry();

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
  confirmed_count bigint,
  pending_count bigint,
  gift_mode text,
  sort_order integer,
  is_claimed boolean,
  image_url text,
  product_url text
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
    count(case when r.status = 'confirmed' then 1 end)::bigint as confirmed_count,
    count(case when r.status = 'pending' then 1 end)::bigint as pending_count,
    g.gift_mode,
    g.sort_order,
    g.is_claimed,
    g.image_url,
    g.product_url
  from public.gift_items as g
  left join public.gift_reservations as r on r.gift_item_id = g.id
  where g.is_active = true
  group by
    g.id, g.title, g.description, g.category, g.icon,
    g.target_amount, g.quantity, g.gift_mode, g.sort_order,
    g.is_claimed, g.image_url, g.product_url, g.created_at
  order by g.sort_order asc, g.created_at asc;
$$;

revoke all on function public.get_gift_registry() from public;
grant execute on function public.get_gift_registry() to anon, authenticated;

-- Make the new table/function visible to PostgREST without waiting for its cache TTL.
notify pgrst, 'reload schema';

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
