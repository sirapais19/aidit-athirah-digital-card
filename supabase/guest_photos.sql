-- ============================================================================
-- Guest photo sharing for Aidit & Athirah
-- Run this once in Supabase Dashboard > SQL Editor.
-- ============================================================================

-- 1. Public storage bucket for guest photos (max 15MB, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guest-photos',
  'guest-photos',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Table that stores the photo metadata shown in the guest gallery
create table if not exists public.guest_photos (
  id uuid primary key default gen_random_uuid(),
  guest_name text,
  message text,
  image_path text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists guest_photos_created_at_idx
  on public.guest_photos (created_at desc);

alter table public.guest_photos enable row level security;

-- 3. Guest gallery is public, and guests can add new photos
drop policy if exists "Guest photos are viewable by everyone" on public.guest_photos;
create policy "Guest photos are viewable by everyone"
  on public.guest_photos
  for select
  using (true);

drop policy if exists "Guests can add photo records" on public.guest_photos;
create policy "Guests can add photo records"
  on public.guest_photos
  for insert
  with check (true);

-- 4. Storage policies for the guest-photos bucket
drop policy if exists "Guest photos are publicly readable" on storage.objects;
create policy "Guest photos are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'guest-photos');

drop policy if exists "Guests can upload photos" on storage.objects;
create policy "Guests can upload photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'guest-photos');

-- Optional: if the couple wants to hide a photo without deleting it:
-- update public.guest_photos set is_visible = false where id = '<photo-id>';
