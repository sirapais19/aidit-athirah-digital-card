-- Run this in the Supabase SQL Editor for the project used by this app.
create table if not exists public.gift_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_amount numeric(10, 2) not null check (target_amount > 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gift_items enable row level security;

drop policy if exists "Anyone can view active gift items" on public.gift_items;
create policy "Anyone can view active gift items"
  on public.gift_items
  for select
  to anon, authenticated
  using (is_active = true);

insert into public.gift_items (title, target_amount, sort_order)
select 'Microwave TJean', 500, 0
where not exists (
  select 1 from public.gift_items where title = 'Microwave TJean'
);

alter table public.donation_confirmations
  add column if not exists gift_item_id uuid
  references public.gift_items (id) on delete set null;

create or replace function public.get_approved_gift_totals()
returns table (gift_item_id uuid, total_amount numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select d.gift_item_id,
         sum(d.amount::numeric) as total_amount
  from public.donation_confirmations as d
  where d.is_approved = true
    and d.gift_item_id is not null
    and d.amount ~ '^[0-9]+([.][0-9]+)?$'
  group by d.gift_item_id;
$$;

revoke all on function public.get_approved_gift_totals() from public;
grant execute on function public.get_approved_gift_totals() to anon, authenticated;

-- The public app submits unapproved contribution confirmations. Keep or add an
-- INSERT policy on donation_confirmations that matches your existing setup.
-- Approve confirmations in the dashboard before they count toward gift totals.
