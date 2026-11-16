# Aidit & Athirah Digital Card

Wedding invitation (Vite + React) with RSVP, wishes, gift, memory journey, and guest photo sharing.

## Guest photo sharing

Guests scan a QR code on the invitation to open `/photos`, take a photo with a retro camera (or choose one from their gallery), and upload it to the guest gallery.

### 1. Supabase setup

1. Open your Supabase project → **SQL Editor**.
2. Run the file [`supabase/guest_photos.sql`](supabase/guest_photos.sql).
   This creates the public `guest-photos` storage bucket, the `guest_photos` table, and the RLS policies.

### 2. Environment variables

Add these to `.env` (or your hosting provider's environment settings):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The same Supabase project is used by RSVP, guest wishes, and gifts.

### 3. QR code

- The **Photos** card on the invitation opens a QR popup.
- The QR points to `<your-domain>/photos`.
- Use **Simpan QR** to download a 512px PNG for printing.

> The guest photo route needs SPA fallback support. `public/_redirects` covers Netlify/Cloudflare Pages and `vercel.json` covers Vercel.

### Note

Uploaded photos are public to anyone with the gallery link, and they appear immediately (no moderation). To hide one, update the row:

```sql
update public.guest_photos set is_visible = false where id = '<photo-id>';
```

## Gift registry

1. Run [`supabase/gift_registry.sql`](supabase/gift_registry.sql) in the Supabase SQL Editor.
   This adds gift details, creates `gift_reservations`, exposes the `get_gift_registry()` RPC, and seeds 7 starter gifts.
2. Add or edit gifts in **Table Editor → `gift_items`**:
   - `title`, `description`, `category`
   - `icon` — `coffee`, `plate`, `blender`, `bed`, `luggage`, `camera`, `sparkles`, or `gift`
   - `target_amount`, `gift_mode` (`group`, `reserve`, or `cash`)
   - `quantity`, `sort_order`, `is_active`
3. Guests reserve gifts from the **Gift** card. New reservations are saved as `pending`.
4. Approve reservations in **Table Editor → `gift_reservations`** by setting `status` to `confirmed`.
   Confirmed amounts count toward the progress bar; pending reservations count toward the reserved/guest count.

> The registry uses category icons as product visuals. If you want real product photos, add an `image_url` column and update the gift card in `src/components/wedding/GiftRegistry.tsx`.

## Guest wishes

1. Run [`supabase/wishes.sql`](supabase/wishes.sql) in the Supabase SQL Editor.
2. Wishes are submitted through the RSVP form and appear in the **From Our Guests** postcard section.
3. To hide a wish without deleting it:

```sql
update public.wishes set is_visible = false where id = '<wish-id>';
```

