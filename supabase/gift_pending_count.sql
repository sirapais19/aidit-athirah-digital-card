-- ============================================================================
-- Expose pending/confirmed reservation counts to the gift registry
-- Run in Supabase Dashboard > SQL Editor. Safe to re-run.
--
-- The app uses pending_count to lock a gift while someone is still waiting
-- for the couple's confirmation ("Dalam proses"). Confirmed_count is used for
-- quantity-based (reserve) gifts.
-- ============================================================================

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
