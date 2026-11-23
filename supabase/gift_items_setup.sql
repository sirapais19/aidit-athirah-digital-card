-- ============================================================================
-- Gift catalog for Aidit & Athirah
-- Run in Supabase Dashboard > SQL Editor. Safe to re-run.
--
-- - Adds image_url + product_url support (photo & Shopee link on each gift)
-- - Marks gifts the couple already owns as "Sudah ditempah" (is_claimed)
-- - Adds the remaining gifts the couple would like to receive
-- ============================================================================

-- 1. Columns used by the gift card UI
alter table public.gift_items add column if not exists is_claimed boolean not null default false;
alter table public.gift_items add column if not exists image_url text;
alter table public.gift_items add column if not exists product_url text;

-- 2. Public registry view (totals + reserved counts, without guest data)
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

notify pgrst, 'reload schema';

-- 3. Gifts the couple already owns — shown in the list, but not reservable.
insert into public.gift_items
  (title, category, icon, target_amount, gift_mode, quantity, sort_order, is_claimed)
select v.title, v.category, v.icon, v.target_amount,
       v.gift_mode, v.quantity, v.sort_order, true
from (
  values
    ('Peti Ais',    'Kitchen', 'gift',    2200, 'group', 1, 80),
    ('Mesin Basuh', 'Home',    'gift',    1700, 'group', 1, 81),
    ('Set Pisau',   'Kitchen', 'gift',     350, 'group', 1, 82),
    ('Blender',     'Kitchen', 'blender',  250, 'group', 1, 83),
    ('Tilam',       'Home',    'bed',     1200, 'group', 1, 84)
) as v(title, category, icon, target_amount, gift_mode, quantity, sort_order)
where not exists (
  select 1 from public.gift_items as g where lower(g.title) = lower(v.title)
);

update public.gift_items
set is_claimed = true
where lower(title) in ('peti ais', 'mesin basuh', 'set pisau', 'blender', 'tilam', 'air fryer');

-- Claimed gifts show only their name + “Sudah ditempah” badge.
update public.gift_items
set description = null
where is_claimed = true;

-- 4. Gifts the couple would like to receive.
insert into public.gift_items
  (title, description, category, icon, target_amount, gift_mode, quantity, sort_order, product_url)
select v.title, v.description, v.category, v.icon, v.target_amount,
       v.gift_mode, v.quantity, v.sort_order, v.product_url
from (
  values
    ('Dessini Clipease 10 PCS Cookware Set',
     'Detachable handle cookware set for our new kitchen.',
     'Kitchen', 'plate', 110.41, 'group', 1, 10,
     'https://shopee.com.my/DESSINI-ITALY-CLIPEASE-10-PCS-Detachable-Handle-Induction-Casserole-Pot-Non-Stick-Frying-Pan-Wok-Bowl-Cookware-PERIUK-i.370480745.52303010917'),
    ('Vacuum 3-in-1',
     'For easy cleaning around our little home.',
     'Home', 'sparkles', 899, 'group', 1, 40,
     null)
) as v(title, description, category, icon, target_amount, gift_mode, quantity, sort_order, product_url)
where not exists (
  select 1 from public.gift_items as g where lower(g.title) = lower(v.title)
);

-- Queen-size bedding.
update public.gift_items
set description = 'Soft linen bedding set for our queen bed.',
    target_amount = 620
where lower(title) = 'linen bedding set';

-- 5. Optional: add a product photo / link to any gift.
-- update public.gift_items
-- set image_url = 'https://your-image-url.jpg',
--     product_url = 'https://shopee.com.my/...'
-- where title = 'Vacuum 3-in-1';
