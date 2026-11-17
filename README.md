# Aidit & Athirah Digital Card

Wedding invitation (Vite + React) with RSVP, wishes, gift, memory journey, and guest photo sharing.

## Guest photo sharing

The invitation website remains hosted on Vercel. RSVP, wishes, and gifts remain on Supabase. Guest photo uploads use Cloudflare Pages Functions with a private R2 bucket (`PHOTOS`) and D1 database (`DB`).

### Cloudflare setup

1. Create an R2 bucket named `guest-photos` and a D1 database named `wedding-photos`.
2. In the D1 console, create the `guest_photos` table using:

   ```sql
   CREATE TABLE IF NOT EXISTS guest_photos (
     id TEXT PRIMARY KEY,
     guest_name TEXT,
     message TEXT,
     image_key TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   );
   CREATE INDEX IF NOT EXISTS guest_photos_created_at_idx
     ON guest_photos (created_at DESC);
   ```

3. The Cloudflare Pages project is connected to this GitHub repository. Add bindings in **Workers & Pages → aidit-athirah-digital-card → Settings → Bindings**:
   - R2 bucket binding: variable name `PHOTOS`, bucket `guest-photos`.
   - D1 database binding: variable name `DB`, database `wedding-photos`.
4. Redeploy the Pages project after adding bindings. Functions in `functions/api` provide the photo API. The bucket stays private; the Function streams gallery images from R2.
5. In the Vercel project settings, add `VITE_PHOTO_API_URL=https://aidit-athirah-digital-card.pages.dev` for Production (and Preview if needed), then redeploy Vercel.

The **Photos** QR opens `/photos` on the current site origin, so printed QR codes continue to point at Vercel. The photo page sends gallery and upload requests to the Cloudflare Pages Function API. Do not put Cloudflare API credentials in Vite environment variables.

Photo records are immediately visible in the gallery. To remove a photo, delete its D1 row and the matching R2 object.

## Gift registry

1. Run [`supabase/gift_registry.sql`](supabase/gift_registry.sql) in the Supabase SQL Editor.
   This is safe to run with the existing `gift_items` table, creates `gift_reservations`, exposes the `get_gift_registry()` RPC, and seeds 7 starter gifts.
2. Add or edit gifts in **Table Editor → `gift_items`**:
   - `title`, `description`, `category`
   - `icon` — `coffee`, `plate`, `blender`, `bed`, `luggage`, `camera`, `sparkles`, or `gift`
   - `target_amount`, `gift_mode` (`group`, `reserve`, or `cash`)
   - `quantity`, `sort_order`, `is_active`
3. Guests reserve gifts from the **Gift** card. New reservations are saved as `confirmed` in `gift_reservations` and count immediately toward registry totals.

> The registry uses category icons as product visuals. If you want real product photos, add an `image_url` column and update the gift card in `src/components/wedding/GiftRegistry.tsx`.

### Existing Supabase project reports `PGRST205` for `gift_reservations`

Run `supabase/gift_registry.sql` in the SQL Editor for the same Supabase project configured by `VITE_SUPABASE_URL`. The app's current gift form writes to `gift_reservations`; `donation_confirmations` is a separate legacy table and does not replace it. The script creates the missing table and asks PostgREST to reload its schema cache. If the API still reports the table missing after the SQL succeeds, wait briefly and retry the request or reload the schema cache from Supabase dashboard settings.

## Guest wishes

1. Run [`supabase/wishes.sql`](supabase/wishes.sql) in the Supabase SQL Editor.
2. Wishes are submitted through the RSVP form and appear in the **From Our Guests** postcard section.
3. To hide a wish without deleting it:

```sql
update public.wishes set is_visible = false where id = '<wish-id>';
```

