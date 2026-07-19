  -- Migration: Create package_features table with Excel data
  -- Run this file in Supabase SQL Editor

  -- Step 1: Create package_features table (NO package_id - features are universal across all packages)
  CREATE TABLE IF NOT EXISTS public.package_features (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section text NOT NULL,
    feature text NOT NULL,
    solid_structure text,
    essential text,
    premium text,
    custom text,
    sort_order integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  -- Step 2: Create indexes for performance
  CREATE INDEX IF NOT EXISTS package_features_section_idx ON public.package_features(section);
  CREATE INDEX IF NOT EXISTS package_features_sort_order_idx ON public.package_features(sort_order);

  -- Step 3: Enable Row Level Security
  ALTER TABLE public.package_features ENABLE ROW LEVEL SECURITY;

  -- Step 4: Create RLS policies
  CREATE POLICY "Authenticated users can read package_features"
    ON public.package_features
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Authenticated users can insert package_features"
    ON public.package_features
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can update package_features"
    ON public.package_features
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can delete package_features"
    ON public.package_features
    FOR DELETE
    TO authenticated
    USING (true);

  -- Step 5: Insert all Excel features (44 rows from SBBT_Master_Matrix.xlsx)
  INSERT INTO public.package_features (section, feature, solid_structure, essential, premium, custom, sort_order) VALUES
  ('STRUCTURE', 'Soil Testing', 'Included', 'Included', 'Included', 'As selected', 0),
  ('STRUCTURE', 'Structural Design', 'Included', 'Included', 'Included', 'As selected', 1),
  ('STRUCTURE', 'Architectural Drawings', 'Basic', '2D + Elevation', '2D + 3D + Elevation', 'As selected', 2),
  ('STRUCTURE', 'MEP Drawings', 'NA', 'Included', 'Included', 'As selected', 3),
  ('STRUCTURE', 'Foundation Type', 'As per drawing', 'As per drawing', 'As per drawing', 'As selected', 4),
  ('STRUCTURE', 'RCC Grade', 'Included', 'Included', 'Included', 'As selected', 5),
  ('STRUCTURE', 'Cement Brand', 'Ambuja', 'Ambuja', 'Ultratech', 'As selected', 6),
  ('STRUCTURE', 'Steel Brand', 'Rathi', 'Rathi', 'Jindal/Tata', 'As selected', 7),
  ('STRUCTURE', 'Brick Type', 'Red Brick', 'Red Brick', 'Red Brick', 'As selected', 8),
  ('STRUCTURE', 'Water Curing', '3 Times/day', '3 Times/day', '3 Times/day', 'As selected', 9),
  ('STRUCTURE', 'Waterproofing', 'Included', 'Included', 'Premium', 'As selected', 10),
  ('STRUCTURE', 'Toilet Waterproofing', 'Included', 'Included', 'Included', 'As selected', 11),
  ('STRUCTURE', 'Balcony Waterproofing', 'Included', 'Included', 'Included', 'As selected', 12),
  ('STRUCTURE', 'Overhead Water Tank', 'NA', '500L Sintex', '1000L Sintex', 'As selected', 13),
  ('STRUCTURE', 'Sewer Connection', 'NA', 'Included', 'Included', 'As selected', 14),
  ('ELECTRICAL', 'Points per room', 'NA', '5', '12', 'As selected', 15),
  ('ELECTRICAL', 'Wire Brand', 'NA', 'Polycab', 'Havells', 'As selected', 16),
  ('ELECTRICAL', 'Switch Brand', 'NA', 'Cona/Anchor', 'Legrand/Anchor Premium', 'As selected', 17),
  ('ELECTRICAL', 'Earthing', 'NA', 'Included', 'Included', 'As selected', 18),
  ('ELECTRICAL', 'TV Point', 'NA', 'Included', 'Included', 'As selected', 19),
  ('ELECTRICAL', 'LAN Point', 'NA', 'Included', 'Included', 'As selected', 20),
  ('ELECTRICAL', 'AC Copper Piping', 'NA', 'NA', 'Included', 'As selected', 21),
  ('ELECTRICAL', 'Electronic Door', 'NA', 'Electronic Lock', 'Door Phone', 'As selected', 22),
  ('ELECTRICAL', 'EV Charging', 'NA', 'NA', 'Power Point', 'As selected', 23),
  ('DOORS & WINDOWS', 'Internal Door', 'NA', 'Flush Door Chivas', 'Premium Engraved Door', 'As selected', 24),
  ('DOORS & WINDOWS', 'Door Frame', 'NA', 'Marandi/GI', 'Sagwan/Saal', 'As selected', 25),
  ('DOORS & WINDOWS', 'Lock Brand', 'NA', 'Plaza', 'Godrej', 'As selected', 26),
  ('DOORS & WINDOWS', 'Glass Thickness', 'NA', '5mm', '8-10mm Toughened', 'As selected', 27),
  ('DOORS & WINDOWS', 'Mesh Provision', 'NA', 'NA', 'Included', 'As selected', 28),
  ('KITCHEN', 'Countertop', 'NA', 'Black Granite', 'Quartz', 'As selected', 29),
  ('KITCHEN', 'Sink', 'NA', 'Basic Soundproof', 'Fossa/Jindal', 'As selected', 30),
  ('KITCHEN', 'Wall Dado', 'NA', '2ft', 'As requested', 'As selected', 31),
  ('KITCHEN', 'Modular Kitchen', 'NA', 'NA', 'Included', 'As selected', 32),
  ('KITCHEN', 'Chimney Provision', 'NA', 'NA', 'Included', 'As selected', 33),
  ('KITCHEN', 'Hob Provision', 'NA', 'NA', 'Included', 'As selected', 34),
  ('BATHROOM', 'WC', 'NA', 'Basic English', 'Jaquar Wall Hung', 'As selected', 35),
  ('BATHROOM', 'Basin', 'NA', 'Basic', 'Jaquar Counter Top', 'As selected', 36),
  ('BATHROOM', 'Mirror', 'NA', 'NA', 'LED Mirror', 'As selected', 37),
  ('BATHROOM', 'Exhaust Fan', 'NA', 'NA', 'Included', 'As selected', 38),
  ('FLOORING', 'Room Flooring', 'NA', 'Somany 2x2', 'Kajaria/Nitco HGVT', 'As selected', 39),
  ('FLOORING', 'Stair Flooring', 'NA', 'Granite Single Nose', 'Granite Double Nose', 'As selected', 40),
  ('FLOORING', 'Parking Flooring', 'NA', 'Granite', 'Granite', 'As selected', 41),
  ('FLOORING', 'Balcony Flooring', 'NA', 'Non Slippery', 'Premium Non Slippery', 'As selected', 42),
  ('CEILING', 'False Ceiling', 'NA', 'Drawing Room + POP', 'All Rooms', 'As selected', 43),
  ('EXTERIOR', 'Balcony Railing', 'NA', 'MS', 'Glass + SS Top', 'As selected', 44),
  ('EXTERIOR', 'Main Gate', 'NA', 'MS', 'SS304', 'As selected', 45),
  ('EXTERIOR', 'HPL', 'NA', 'NA', 'Included', 'As selected', 46),
  ('EXTERIOR', 'ACP Work', 'NA', 'Included', 'Included', 'As selected', 47),
  ('EXTERIOR', 'Glass Work', 'NA', 'NA', 'Included', 'As selected', 48),
  ('SITE MANAGEMENT', 'Engineer', 'Included', 'Included', 'Included', 'As selected', 49),
  ('SITE MANAGEMENT', 'Supervisor', 'Included', 'Included', 'Included', 'As selected', 50),
  ('SITE MANAGEMENT', 'Live CCTV', 'Included', 'Included', 'Included', 'As selected', 51),
  ('SITE MANAGEMENT', 'Daily Reports', 'Included', 'Included', 'Included', 'As selected', 52),
  ('COMMERCIAL', 'Warranty', '15 Years', '15 Years', '15 Years', 'As selected', 53),
  ('COMMERCIAL', 'AMC', 'NA', '2 Years', '2 Years', 'As selected', 54);

  -- Step 6: Verify table exists and data inserted
  SELECT COUNT(*) as feature_count FROM public.package_features;
  SELECT section, COUNT(*) as count FROM public.package_features GROUP BY section ORDER BY MIN(sort_order);