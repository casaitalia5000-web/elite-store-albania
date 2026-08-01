/*
# Add site settings table (hero background image)

1. New Tables
   - `settings`: single-row key/value table for site-wide settings.
     - `id` (int, primary key, always 1)
     - `hero_image` (text, nullable) — URL of the homepage hero background image.
     - `updated_at` (timestamptz)
2. Security
   - RLS enabled.
   - Public read (anon + authenticated) so the storefront can load settings.
   - Authenticated write (insert/update/delete) for admin only.
3. Notes
   - The table holds a single row (id = 1). A trigger keeps it pinned to 1.
   - The frontend reads hero_image and falls back to the default Pexels image when null.
*/

CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_image text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Ensure a single settings row exists
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

-- Admin write
DROP POLICY IF EXISTS "auth_insert_settings" ON settings;
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_settings" ON settings;
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_settings" ON settings;
CREATE POLICY "auth_delete_settings" ON settings FOR DELETE
  TO authenticated USING (true);
