/*
# Add product video support and product-media storage bucket

1. Schema changes
   - products: add `video_url` (text, nullable) to store an optional product video URL.
2. Storage
   - Create a public bucket `product-media` for uploading product photos and videos.
3. Security
   - Storage policies:
     - Public read (anon + authenticated) for the `product-media` bucket.
     - Authenticated upload/update/delete for the `product-media` bucket.
   - No RLS changes to the products table (existing policies already cover the new column).
4. Notes
   - The video_url column is nullable so existing products are unaffected.
   - Files are stored publicly so they can be displayed in the storefront.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for product media
DROP POLICY IF EXISTS "Public read product media" ON storage.objects;
CREATE POLICY "Public read product media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-media');

-- Authenticated can upload product media
DROP POLICY IF EXISTS "Authenticated upload product media" ON storage.objects;
CREATE POLICY "Authenticated upload product media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-media');

-- Authenticated can update product media
DROP POLICY IF EXISTS "Authenticated update product media" ON storage.objects;
CREATE POLICY "Authenticated update product media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-media') WITH CHECK (bucket_id = 'product-media');

-- Authenticated can delete product media
DROP POLICY IF EXISTS "Authenticated delete product media" ON storage.objects;
CREATE POLICY "Authenticated delete product media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-media');
