/*
# Add product gallery (up to 4 photos)

1. Schema changes
   - products: add `gallery` (jsonb, nullable, defaults to '[]') to store up to 4 additional image URLs.
2. Security
   - No RLS changes needed; existing product policies already cover the new column.
3. Notes
   - The gallery is stored as a JSON array of public URLs.
   - The existing image_url column remains the primary/cover photo.
   - The frontend enforces a maximum of 4 gallery images.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb;
