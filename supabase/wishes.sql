-- ============================================================================
-- Guest wishes for Aidit & Athirah
-- Run this once in Supabase Dashboard > SQL Editor.
-- ============================================================================

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text,
  message text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.wishes add column if not exists is_visible boolean not null default true;

create index if not exists wishes_created_at_idx
  on public.wishes (created_at desc);

alter table public.wishes enable row level security;

drop policy if exists "Wishes are viewable by everyone" on public.wishes;
create policy "Wishes are viewable by everyone"
  on public.wishes
  for select
  to anon, authenticated
  using (is_visible = true);

drop policy if exists "Guests can leave a wish" on public.wishes;
create policy "Guests can leave a wish"
  on public.wishes
  for insert
  to anon, authenticated
  with check (true);

grant select, insert on public.wishes to anon, authenticated;

-- To hide a wish without deleting it:
-- update public.wishes set is_visible = false where id = '<wish-id>';
