-- D1 schema for guest photo sharing (used by Cloudflare Pages Functions).
CREATE TABLE IF NOT EXISTS guest_photos (
  id TEXT PRIMARY KEY,
  guest_name TEXT,
  message TEXT,
  image_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS guest_photos_created_at_idx
  ON guest_photos (created_at DESC);
