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

### Local photo API (wrangler)

Guest photos need the Pages Function API. You can run it locally with wrangler; D1 and R2 are emulated locally, so no Cloudflare account is needed:

1. `npm run photos:db:init` — creates the `guest_photos` table in the local D1 database.
2. `npm run photos:dev` — starts the API on `http://127.0.0.1:8788` with the local `PHOTOS` (R2) and `DB` (D1) bindings.
3. In `.env`, set `VITE_PHOTO_API_URL=http://127.0.0.1:8788`, then restart `npm run dev` (the app runs on port 8080).
4. If `dist/` does not exist yet, run `npm run build` once before `npm run photos:dev`.

Local data lives in `.wrangler/state` (gitignored). Delete that folder and re-run step 1 to reset the gallery. The bindings are declared in `wrangler.toml`; production bindings are still managed in the Cloudflare dashboard.

## Gift registry

1. Run [`supabase/gift_registry.sql`](supabase/gift_registry.sql) in the Supabase SQL Editor.
   This is safe to run with the existing `gift_items` table, creates `gift_reservations`, exposes the `get_gift_registry()` RPC, and seeds 7 starter gifts.
2. Add or edit gifts in **Table Editor → `gift_items`**:
   - `title`, `description`, `category`
   - `icon` — `coffee`, `plate`, `blender`, `bed`, `luggage`, `camera`, `sparkles`, or `gift`
   - `target_amount`, `gift_mode` (`group`, `reserve`, or `cash`)
   - `image_url` — optional product photo (any public image URL)
   - `product_url` — optional link, e.g. the Shopee listing (shown as “Lihat produk”)
   - `quantity`, `sort_order`, `is_active`
3. Guests reserve gifts from the **Gift** card. They choose **Sumbangan Ikhlas** (money via TnG/QR) or **Kirim Hadiah Sendiri** (buy the item and ask for the address over WhatsApp). New reservations are saved as `pending` in `gift_reservations` with `gift_method` (`cash` or `self`).
   - Run [`supabase/gift_reservation_methods.sql`](supabase/gift_reservation_methods.sql) once on existing projects to add the `gift_method` column.
   - Run [`supabase/gift_confirmation_flow.sql`](supabase/gift_confirmation_flow.sql) so guests can only submit `pending` rows.
   - Run [`supabase/gift_pending_count.sql`](supabase/gift_pending_count.sql) so the registry exposes `pending_count`. While a gift has a pending reservation it is locked (**Dalam proses**) and other guests cannot book it.
4. After the bride/groom receive the WhatsApp proof, confirm the reservation in **Table Editor → `gift_reservations`** (set `status` to `confirmed`) or run:
   ```sql
   update public.gift_reservations set status = 'confirmed' where id = '<reservation-id>';
   ```
   Only confirmed rows count toward `collected`. Once a gift is fully funded it shows **Fully funded** and moves into the **Sudah ditempah** filter automatically. If a reservation is rejected, set `status` to `cancelled` (or delete the row) so the gift becomes available again.
5. Gifts the couple already owns (no need for guests to buy): run [`supabase/gift_items_setup.sql`](supabase/gift_items_setup.sql) once, then tick `is_claimed` for those rows in **Table Editor → `gift_items`**. They stay in the list with a “Sudah ditempah” badge and guests can no longer reserve them. No fake reservation row is needed.

> The registry uses category icons as product visuals when `image_url` is empty. Add an image URL to a gift to show the real product photo.

### Existing Supabase project reports `PGRST205` for `gift_reservations`

Run `supabase/gift_registry.sql` in the SQL Editor for the same Supabase project configured by `VITE_SUPABASE_URL`. The app's current gift form writes to `gift_reservations`; `donation_confirmations` is a separate legacy table and does not replace it. The script creates the missing table and asks PostgREST to reload its schema cache. If the API still reports the table missing after the SQL succeeds, wait briefly and retry the request or reload the schema cache from Supabase dashboard settings.

## Guest wishes

1. Run [`supabase/wishes.sql`](supabase/wishes.sql) in the Supabase SQL Editor.
2. Wishes are submitted through the RSVP form and appear in the **From Our Guests** postcard section.
3. To hide a wish without deleting it:

```sql
update public.wishes set is_visible = false where id = '<wish-id>';
```

