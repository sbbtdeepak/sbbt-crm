// Seed script for package_features from Excel MASTER SOURCE
// Run with: npx tsx scripts/seed-package-features.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Excel data - imported directly from SBBT_Master_Matrix.xlsx
const PACKAGE_FEATURES = [
  // STRUCTURE
  { section: "STRUCTURE", feature: "Soil Testing", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "STRUCTURE", feature: "Structural Design", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "STRUCTURE", feature: "Architectural Drawings", solid_structure: "Basic", essential: "2D + Elevation", premium: "2D + 3D + Elevation", custom: "As selected" },
  { section: "STRUCTURE", feature: "MEP Drawings", solid_structure: "NA", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "STRUCTURE", feature: "Foundation Type", solid_structure: "As per drawing", essential: "As per drawing", premium: "As per drawing", custom: "As selected" },
  { section: "STRUCTURE", feature: "RCC Grade", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "STRUCTURE", feature: "Cement Brand", solid_structure: "Ambuja", essential: "Ambuja", premium: "Ultratech", custom: "As selected" },
  { section: "STRUCTURE", feature: "Steel Brand", solid_structure: "Rathi", essential: "Rathi", premium: "Jindal/Tata", custom: "As selected" },
  { section: "STRUCTURE", feature: "Brick Type", solid_structure: "Red Brick", essential: "Red Brick", premium: "Red Brick", custom: "As selected" },
  { section: "STRUCTURE", feature: "Water Curing", solid_structure: "3 Times/day", essential: "3 Times/day", premium: "3 Times/day", custom: "As selected" },
  { section: "STRUCTURE", feature: "Waterproofing", solid_structure: "Included", essential: "Included", premium: "Premium", custom: "As selected" },
  { section: "STRUCTURE", feature: "Toilet Waterproofing", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "STRUCTURE", feature: "Balcony Waterproofing", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "STRUCTURE", feature: "Overhead Water Tank", solid_structure: "NA", essential: "500L Sintex", premium: "1000L Sintex", custom: "As selected" },
  { section: "STRUCTURE", feature: "Sewer Connection", solid_structure: "NA", essential: "Included", premium: "Included", custom: "As selected" },

  // ELECTRICAL
  { section: "ELECTRICAL", feature: "Points per room", solid_structure: "NA", essential: "5", premium: "12", custom: "As selected" },
  { section: "ELECTRICAL", feature: "Wire Brand", solid_structure: "NA", essential: "Polycab", premium: "Havells", custom: "As selected" },
  { section: "ELECTRICAL", feature: "Switch Brand", solid_structure: "NA", essential: "Cona/Anchor", premium: "Legrand/Anchor Premium", custom: "As selected" },
  { section: "ELECTRICAL", feature: "Earthing", solid_structure: "NA", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "ELECTRICAL", feature: "TV Point", solid_structure: "NA", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "ELECTRICAL", feature: "LAN Point", solid_structure: "NA", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "ELECTRICAL", feature: "AC Copper Piping", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },
  { section: "ELECTRICAL", feature: "Electronic Door", solid_structure: "NA", essential: "Electronic Lock", premium: "Door Phone", custom: "As selected" },
  { section: "ELECTRICAL", feature: "EV Charging", solid_structure: "NA", essential: "NA", premium: "Power Point", custom: "As selected" },

  // DOORS & WINDOWS
  { section: "DOORS & WINDOWS", feature: "Internal Door", solid_structure: "NA", essential: "Flush Door Chivas", premium: "Premium Engraved Door", custom: "As selected" },
  { section: "DOORS & WINDOWS", feature: "Door Frame", solid_structure: "NA", essential: "Marandi/GI", premium: "Sagwan/Saal", custom: "As selected" },
  { section: "DOORS & WINDOWS", feature: "Lock Brand", solid_structure: "NA", essential: "Plaza", premium: "Godrej", custom: "As selected" },
  { section: "DOORS & WINDOWS", feature: "Glass Thickness", solid_structure: "NA", essential: "5mm", premium: "8-10mm Toughened", custom: "As selected" },
  { section: "DOORS & WINDOWS", feature: "Mesh Provision", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },

  // KITCHEN
  { section: "KITCHEN", feature: "Countertop", solid_structure: "NA", essential: "Black Granite", premium: "Quartz", custom: "As selected" },
  { section: "KITCHEN", feature: "Sink", solid_structure: "NA", essential: "Basic Soundproof", premium: "Fossa/Jindal", custom: "As selected" },
  { section: "KITCHEN", feature: "Wall Dado", solid_structure: "NA", essential: "2ft", premium: "As requested", custom: "As selected" },
  { section: "KITCHEN", feature: "Modular Kitchen", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },
  { section: "KITCHEN", feature: "Chimney Provision", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },
  { section: "KITCHEN", feature: "Hob Provision", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },

  // BATHROOM
  { section: "BATHROOM", feature: "WC", solid_structure: "NA", essential: "Basic English", premium: "Jaquar Wall Hung", custom: "As selected" },
  { section: "BATHROOM", feature: "Basin", solid_structure: "NA", essential: "Basic", premium: "Jaquar Counter Top", custom: "As selected" },
  { section: "BATHROOM", feature: "Mirror", solid_structure: "NA", essential: "NA", premium: "LED Mirror", custom: "As selected" },
  { section: "BATHROOM", feature: "Exhaust Fan", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },

  // FLOORING
  { section: "FLOORING", feature: "Room Flooring", solid_structure: "NA", essential: "Somany 2x2", premium: "Kajaria/Nitco HGVT", custom: "As selected" },
  { section: "FLOORING", feature: "Stair Flooring", solid_structure: "NA", essential: "Granite Single Nose", premium: "Granite Double Nose", custom: "As selected" },
  { section: "FLOORING", feature: "Parking Flooring", solid_structure: "NA", essential: "Granite", premium: "Granite", custom: "As selected" },
  { section: "FLOORING", feature: "Balcony Flooring", solid_structure: "NA", essential: "Non Slippery", premium: "Premium Non Slippery", custom: "As selected" },

  // CEILING
  { section: "CEILING", feature: "False Ceiling", solid_structure: "NA", essential: "Drawing Room + POP", premium: "All Rooms", custom: "As selected" },

  // EXTERIOR
  { section: "EXTERIOR", feature: "Balcony Railing", solid_structure: "NA", essential: "MS", premium: "Glass + SS Top", custom: "As selected" },
  { section: "EXTERIOR", feature: "Main Gate", solid_structure: "NA", essential: "MS", premium: "SS304", custom: "As selected" },
  { section: "EXTERIOR", feature: "HPL", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },
  { section: "EXTERIOR", feature: "ACP Work", solid_structure: "NA", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "EXTERIOR", feature: "Glass Work", solid_structure: "NA", essential: "NA", premium: "Included", custom: "As selected" },

  // SITE MANAGEMENT
  { section: "SITE MANAGEMENT", feature: "Engineer", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "SITE MANAGEMENT", feature: "Supervisor", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "SITE MANAGEMENT", feature: "Live CCTV", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },
  { section: "SITE MANAGEMENT", feature: "Daily Reports", solid_structure: "Included", essential: "Included", premium: "Included", custom: "As selected" },

  // COMMERCIAL
  { section: "COMMERCIAL", feature: "Warranty", solid_structure: "15 Years", essential: "15 Years", premium: "15 Years", custom: "As selected" },
  { section: "COMMERCIAL", feature: "AMC", solid_structure: "NA", essential: "2 Years", premium: "2 Years", custom: "As selected" },
];

async function seedPackageFeatures() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("Seeding package_features...");
  
  // First clear existing data
  const { error: deleteError } = await supabase.from("package_features").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) console.error("Delete error:", deleteError.message);

  // Insert features with sort order based on Excel
  for (let i = 0; i < PACKAGE_FEATURES.length; i++) {
    const feature = PACKAGE_FEATURES[i];
    const { error } = await supabase
      .from("package_features")
      .insert({
        section: feature.section,
        feature: feature.feature,
        solid_structure: feature.solid_structure,
        essential: feature.essential,
        premium: feature.premium,
        custom: feature.custom,
        sort_order: i,
      });

    if (error) {
      console.error(`Error inserting feature ${feature.feature}:`, error.message);
    } else {
      console.log(`Created feature: ${feature.feature} (${feature.section})`);
    }
  }

  console.log("Seeding complete!");
}

seedPackageFeatures().catch(console.error);