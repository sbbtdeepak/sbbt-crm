-- Backfill slug values for existing packages
-- Run this script in Supabase SQL editor

UPDATE packages 
SET slug = 'solid-structure' 
WHERE name = 'Solid Structure';

UPDATE packages 
SET slug = 'essential' 
WHERE name = 'Essential';

UPDATE packages 
SET slug = 'premium' 
WHERE name = 'Premium';

UPDATE packages 
SET slug = 'custom' 
WHERE name = 'Custom';

-- Verify all packages have slugs
SELECT id, name, slug FROM packages WHERE slug IS NOT NULL;