/**
 * Seed script to populate CMS packages from the Excel reference data.
 *
 * Usage: npx tsx scripts/seed-packages.ts
 *
 * Reads from the Excel file and populates:
 *   cms_packages → cms_package_sections → cms_package_items
 *
 * Admin can fully edit all data via the CMS dashboard.
 * No hardcoded package data in the UI.
 */

import { createClient } from "@supabase/supabase-js";

const SITE_ID = "00000000-0000-0000-0000-000000000001";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@sbbt.in";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

interface PackageItem {
  item: string;
  brand: string;
  specification: string;
  remarks: string;
}

interface PackageSection {
  title: string;
  display_order: number;
  items: PackageItem[];
}

interface PackageData {
  name: string;
  slug: string;
  price: number;
  description: string;
  display_order: number;
  sections: PackageSection[];
}

// ============================================================
// Package Data (from Excel: sbbt sbbt.xlsx → Package Comparison)
// ============================================================

const packagesData: PackageData[] = [
  {
    name: "Solid Structure",
    slug: "solid-structure",
    price: 1199,
    description:
      "A robust structural package covering the essential framework of your home. Ideal for budget-conscious homeowners who want a strong foundation with basic finishes.",
    display_order: 1,
    sections: [
      {
        title: "Pre Construction",
        display_order: 1,
        items: [
          {
            item: "Site Survey & Soil Testing",
            brand: "NA",
            specification: "Basic Level",
            remarks: "Included",
          },
          {
            item: "Structural Design",
            brand: "IS Standard",
            specification: "As per IS 456",
            remarks: "Included",
          },
          {
            item: "Building Plan Approval",
            brand: "NA",
            specification: "Basic Drawings",
            remarks: "Additional Scope",
          },
        ],
      },
      {
        title: "Structure",
        display_order: 2,
        items: [
          {
            item: "RCC Framed Structure",
            brand: "IS Standard",
            specification: "As per IS Codes",
            remarks: "Included",
          },
          {
            item: "Foundation",
            brand: "Structural Design",
            specification: "As per Soil Report",
            remarks: "Included",
          },
          {
            item: "Steel Reinforcement",
            brand: "Rathi Fe500",
            specification: "Fe500 Grade",
            remarks: "Included",
          },
          {
            item: "Cement",
            brand: "UltraTech / Birla",
            specification: "PPC Grade",
            remarks: "Included",
          },
          {
            item: "Concrete",
            brand: "UltraTech",
            specification: "M20 Grade",
            remarks: "Nominal Mix",
          },
          {
            item: "AAC Blocks / Red Brick",
            brand: "As Customer Choice",
            specification: "4\" / 6\"",
            remarks: "As per requirement",
          },
        ],
      },
      {
        title: "Masonry",
        display_order: 3,
        items: [
          {
            item: "AAC Blocks / Red Brick",
            brand: "As Customer Choice",
            specification: "4\" / 6\"",
            remarks: "As per requirement",
          },
          {
            item: "Cement Mortar",
            brand: "UltraTech / Birla",
            specification: "1:6 Ratio",
            remarks: "Included",
          },
          {
            item: "Damp Proof Course",
            brand: "Fosroc / Sika",
            specification: "2\" thick",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Roof",
        display_order: 4,
        items: [
          {
            item: "RCC Slab",
            brand: "UltraTech",
            specification: "5\" / 6\" thick M20",
            remarks: "Included",
          },
          {
            item: "Waterproofing - Toilet",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "Terrace Waterproofing",
            brand: "NA",
            specification: "Basic",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Flooring",
        display_order: 5,
        items: [
          {
            item: "Tiles",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Cement Flooring",
            brand: "UltraTech",
            specification: "Standard Finish",
            remarks: "Included",
          },
          {
            item: "Skirting",
            brand: "NA",
            specification: "Cement Finish",
            remarks: "Basic",
          },
        ],
      },
      {
        title: "Doors & Windows",
        display_order: 6,
        items: [
          {
            item: "Main Door",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Internal Doors",
            brand: "NA",
            specification: "Flush Door",
            remarks: "Not Included",
          },
          {
            item: "Windows",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Electrical",
        display_order: 7,
        items: [
          {
            item: "Electrical Wiring",
            brand: "Havells",
            specification: "Conduit Pipe Installation Only",
            remarks: "Basic",
          },
          {
            item: "Switches & Sockets",
            brand: "NA",
            specification: "Basic",
            remarks: "Not Included",
          },
          {
            item: "MCB / DB Box",
            brand: "NA",
            specification: "Basic",
            remarks: "Not Included",
          },
          {
            item: "Smart Lock",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Video Door Phone",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Plumbing",
        display_order: 8,
        items: [
          {
            item: "CPVC / UPVC Pipes",
            brand: "Astral / Supreme",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Water Tank Connection",
            brand: "Sintex",
            specification: "Basic",
            remarks: "Provision Only",
          },
          {
            item: "Sanitary Fixtures",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Painting",
        display_order: 9,
        items: [
          {
            item: "Wall Putty",
            brand: "Birla",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Interior Paint",
            brand: "Asian Paints",
            specification: "Tractor Shade",
            remarks: "Basic Finish",
          },
          {
            item: "Exterior Paint",
            brand: "Asian Paints",
            specification: "Apex",
            remarks: "Basic Finish",
          },
        ],
      },
      {
        title: "Bathroom",
        display_order: 10,
        items: [
          {
            item: "Bathroom Tiles",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Sanitary Ware",
            brand: "NA",
            specification: "Basic",
            remarks: "Not Included",
          },
          {
            item: "Waterproofing",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "NA",
            specification: "Basic ISI",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Kitchen",
        display_order: 11,
        items: [
          {
            item: "Kitchen Platform",
            brand: "NA",
            specification: "Granite Slab",
            remarks: "Not Included",
          },
          {
            item: "Wall Tile",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Counter Top",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Modular Kitchen",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Water Tank",
        display_order: 12,
        items: [
          {
            item: "Underground Water Tank",
            brand: "RCC",
            specification: "Standard Size",
            remarks: "Included",
          },
          {
            item: "Overhead Water Tank",
            brand: "Sintex",
            specification: "500L - 1000L",
            remarks: "Included",
          },
          {
            item: "Tank Connection Plumbing",
            brand: "Astral / Supreme",
            specification: "CPVC",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Waterproofing",
        display_order: 13,
        items: [
          {
            item: "Toilet Waterproofing",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "Terrace Waterproofing",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Basement Waterproofing",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Miscellaneous",
        display_order: 14,
        items: [
          {
            item: "Front Elevation",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "False Ceiling",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Railing",
            brand: "NA",
            specification: "MS",
            remarks: "Not Included",
          },
          {
            item: "Main Gate",
            brand: "NA",
            specification: "Basic",
            remarks: "Not Included",
          },
          {
            item: "Solar Provision",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Wardrobes",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Elevator / Lift",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Warranty",
            brand: "SBBT",
            specification: "10 Years Structure*",
            remarks: "Included",
          },
          {
            item: "AMC",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Exclusions",
        display_order: 15,
        items: [
          {
            item: "Modular Kitchen",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Wardrobes",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Elevator / Lift",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "False Ceiling",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Front Elevation Cladding",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Landscaping",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Furniture & Furnishings",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Electrical Appliances",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Air Conditioning",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
        ],
      },
    ],
  },
  {
    name: "Essential",
    slug: "essential",
    price: 1699,
    description:
      "Complete home construction package with quality finishes, branded fittings, and essential amenities. Perfect for families seeking a move-in ready home.",
    display_order: 2,
    sections: [
      {
        title: "Pre Construction",
        display_order: 1,
        items: [
          {
            item: "Site Survey & Soil Testing",
            brand: "NA",
            specification: "Standard Level",
            remarks: "Included",
          },
          {
            item: "Structural Design",
            brand: "IS Standard",
            specification: "As per IS 456",
            remarks: "Included",
          },
          {
            item: "Building Plan Approval",
            brand: "NA",
            specification: "Complete Drawings",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Structure",
        display_order: 2,
        items: [
          {
            item: "RCC Framed Structure",
            brand: "IS Standard",
            specification: "As per IS Codes",
            remarks: "Included",
          },
          {
            item: "Foundation",
            brand: "Structural Design",
            specification: "As per Soil Report",
            remarks: "Included",
          },
          {
            item: "Steel Reinforcement",
            brand: "Rathi Fe550D",
            specification: "Fe550D Grade",
            remarks: "Included",
          },
          {
            item: "Cement",
            brand: "UltraTech / Birla",
            specification: "PPC Grade",
            remarks: "Included",
          },
          {
            item: "Concrete",
            brand: "RMC",
            specification: "M20 Grade RMC",
            remarks: "Included",
          },
          {
            item: "AAC Blocks / Red Brick",
            brand: "As Customer Choice",
            specification: "4\" / 6\"",
            remarks: "As per requirement",
          },
        ],
      },
      {
        title: "Masonry",
        display_order: 3,
        items: [
          {
            item: "AAC Blocks / Red Brick",
            brand: "As Customer Choice",
            specification: "4\" / 6\"",
            remarks: "As per requirement",
          },
          {
            item: "Cement Mortar",
            brand: "UltraTech / Birla",
            specification: "1:6 Ratio",
            remarks: "Included",
          },
          {
            item: "Damp Proof Course",
            brand: "Fosroc / Sika",
            specification: "2\" thick",
            remarks: "Included",
          },
          {
            item: "Reinforced Cement Concrete",
            brand: "UltraTech",
            specification: "As per structural req.",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Roof",
        display_order: 4,
        items: [
          {
            item: "RCC Slab",
            brand: "UltraTech",
            specification: "5\" / 6\" thick M20 RMC",
            remarks: "Included",
          },
          {
            item: "Waterproofing - Toilet",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "Waterproofing - Terrace",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "Roof Insulation",
            brand: "NA",
            specification: "Basic",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Flooring",
        display_order: 5,
        items: [
          {
            item: "Tiles (Living/Dining/Bedrooms)",
            brand: "Kajaria",
            specification: "2x2 Premium",
            remarks: "Included",
          },
          {
            item: "Tiles (Kitchen)",
            brand: "Kajaria",
            specification: "2x2 Premium",
            remarks: "Included",
          },
          {
            item: "Tiles (Bathroom)",
            brand: "Kajaria",
            specification: "Anti-Skid",
            remarks: "Included",
          },
          {
            item: "Skirting",
            brand: "Kajaria",
            specification: "Matching Tiles",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Doors & Windows",
        display_order: 6,
        items: [
          {
            item: "Main Door",
            brand: "Flush Door",
            specification: "Basic Flush Door",
            remarks: "Included",
          },
          {
            item: "Internal Doors",
            brand: "Flush Door",
            specification: "Standard Flush Door",
            remarks: "Included",
          },
          {
            item: "Windows",
            brand: "uPVC",
            specification: "Standard uPVC",
            remarks: "Included",
          },
          {
            item: "Door Hardware",
            brand: "Havells / Everest",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Electrical",
        display_order: 7,
        items: [
          {
            item: "Electrical Wiring",
            brand: "Havells",
            specification: "Standard Copper",
            remarks: "Included",
          },
          {
            item: "Switches & Sockets",
            brand: "Havells",
            specification: "Standard Range",
            remarks: "Included",
          },
          {
            item: "MCB / DB Box",
            brand: "Havells",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Fan / Light Point",
            brand: "Havells",
            specification: "Provision Only",
            remarks: "Included",
          },
          {
            item: "Smart Lock",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Video Door Phone",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
        ],
      },
      {
        title: "Plumbing",
        display_order: 8,
        items: [
          {
            item: "CPVC / UPVC Pipes",
            brand: "Astral / Supreme",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "Basic ISI",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Sanitary Ware",
            brand: "Basic ISI",
            specification: "Standard White",
            remarks: "Included",
          },
          {
            item: "Water Tank Connection",
            brand: "Sintex",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Overhead Tank",
            brand: "Sintex",
            specification: "1000L",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Painting",
        display_order: 9,
        items: [
          {
            item: "Wall Putty",
            brand: "Birla",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Interior Paint",
            brand: "Asian Paints / Berger",
            specification: "Premium Emulsion",
            remarks: "Included",
          },
          {
            item: "Exterior Paint",
            brand: "Asian Paints Apex",
            specification: "Weatherproof",
            remarks: "Included",
          },
          {
            item: "Primer",
            brand: "Asian Paints",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Bathroom",
        display_order: 10,
        items: [
          {
            item: "Bathroom Tiles",
            brand: "Kajaria",
            specification: "2x2 Anti-Skid",
            remarks: "Included",
          },
          {
            item: "Sanitary Ware",
            brand: "Basic ISI",
            specification: "Standard White",
            remarks: "Included",
          },
          {
            item: "Waterproofing",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "Basic ISI",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Bathroom Accessories",
            brand: "Basic ISI",
            specification: "Standard Set",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Kitchen",
        display_order: 11,
        items: [
          {
            item: "Kitchen Platform",
            brand: "Granite",
            specification: "Standard Granite Slab",
            remarks: "Included",
          },
          {
            item: "Wall Tile (Upto 2 Feet)",
            brand: "Kajaria",
            specification: "2x2 Premium",
            remarks: "Included",
          },
          {
            item: "Counter Top",
            brand: "Granite",
            specification: "Standard Granite",
            remarks: "Included",
          },
          {
            item: "Kitchen Sink",
            brand: "SS",
            specification: "Standard Single Bowl",
            remarks: "Included",
          },
          {
            item: "Modular Kitchen",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
        ],
      },
      {
        title: "Water Tank",
        display_order: 12,
        items: [
          {
            item: "Underground Water Tank",
            brand: "RCC",
            specification: "Standard Size",
            remarks: "Included",
          },
          {
            item: "Overhead Water Tank",
            brand: "Sintex",
            specification: "1000L",
            remarks: "Included",
          },
          {
            item: "Tank Connection Plumbing",
            brand: "Astral / Supreme",
            specification: "CPVC",
            remarks: "Included",
          },
          {
            item: "Drainage System",
            brand: "Supreme",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Waterproofing",
        display_order: 13,
        items: [
          {
            item: "Toilet Waterproofing",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "Terrace Waterproofing",
            brand: "Fosroc",
            specification: "Standard Grade",
            remarks: "Included",
          },
          {
            item: "Basement Waterproofing",
            brand: "NA",
            specification: "NA",
            remarks: "Not Included",
          },
          {
            item: "Sunken Slab Waterproofing",
            brand: "Fosroc",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Miscellaneous",
        display_order: 14,
        items: [
          {
            item: "Front Elevation",
            brand: "Tile + ACP Sheet",
            specification: "Basic Design",
            remarks: "Included",
          },
          {
            item: "False Ceiling (Living + Dining)",
            brand: "POP / Gypsum",
            specification: "Designer",
            remarks: "Included",
          },
          {
            item: "Railing",
            brand: "MS",
            specification: "Mild Steel",
            remarks: "Included",
          },
          {
            item: "Main Gate",
            brand: "Designer MS",
            specification: "Designer MS Gate",
            remarks: "Included",
          },
          {
            item: "Solar Provision",
            brand: "NA",
            specification: "NA",
            remarks: "Optional",
          },
          {
            item: "Wardrobes",
            brand: "NA",
            specification: "NA",
            remarks: "Optional",
          },
          {
            item: "Elevator / Lift",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
          {
            item: "Warranty",
            brand: "SBBT",
            specification: "10 Years Structure*",
            remarks: "Included",
          },
          {
            item: "AMC",
            brand: "SBBT",
            specification: "2 Year Full",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Exclusions",
        display_order: 15,
        items: [
          {
            item: "Modular Kitchen",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
          {
            item: "Elevator / Lift",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
          {
            item: "Wardrobes",
            brand: "NA",
            specification: "NA",
            remarks: "Optional",
          },
          {
            item: "Landscaping",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Furniture & Furnishings",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Electrical Appliances",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Air Conditioning",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
        ],
      },
    ],
  },
  {
    name: "Premium",
    slug: "premium",
    price: 2099,
    description:
      "Luxury home construction package with premium finishes, branded fittings, and comprehensive amenities. Designed for discerning homeowners who value quality.",
    display_order: 3,
    sections: [
      {
        title: "Pre Construction",
        display_order: 1,
        items: [
          {
            item: "Site Survey & Soil Testing",
            brand: "NA",
            specification: "Comprehensive",
            remarks: "Included",
          },
          {
            item: "Structural Design",
            brand: "IS Standard",
            specification: "As per IS 456",
            remarks: "Included",
          },
          {
            item: "Building Plan Approval",
            brand: "NA",
            specification: "Detailed Drawings",
            remarks: "Included",
          },
          {
            item: "3D Elevation Design",
            brand: "NA",
            specification: "Basic",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Structure",
        display_order: 2,
        items: [
          {
            item: "RCC Framed Structure",
            brand: "IS Standard",
            specification: "Premium IS Standard",
            remarks: "Included",
          },
          {
            item: "Foundation",
            brand: "Structural Design",
            specification: "Engineer Verified",
            remarks: "Included",
          },
          {
            item: "Steel Reinforcement",
            brand: "TATA / Jindal",
            specification: "Fe550D Grade",
            remarks: "Included",
          },
          {
            item: "Cement",
            brand: "UltraTech OPC / PPC",
            specification: "OPC 53 Grade",
            remarks: "Included",
          },
          {
            item: "Concrete",
            brand: "RMC",
            specification: "M25 Grade RMC",
            remarks: "Included",
          },
          {
            item: "AAC Blocks",
            brand: "Magicrete / As Customer Choice",
            specification: "4\" / 6\"",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Masonry",
        display_order: 3,
        items: [
          {
            item: "AAC Blocks",
            brand: "Magicrete / As Customer Choice",
            specification: "4\" / 6\"",
            remarks: "Included",
          },
          {
            item: "Cement Mortar",
            brand: "UltraTech",
            specification: "1:4 / 1:6 Ratio",
            remarks: "Included",
          },
          {
            item: "Damp Proof Course",
            brand: "Fosroc / Sika",
            specification: "2\" thick",
            remarks: "Included",
          },
          {
            item: "Reinforced Cement Concrete",
            brand: "UltraTech",
            specification: "As per structural req.",
            remarks: "Included",
          },
          {
            item: "Expansion Joints",
            brand: "Fosroc",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Roof",
        display_order: 4,
        items: [
          {
            item: "RCC Slab",
            brand: "UltraTech RMC",
            specification: "5\" / 6\" thick M25",
            remarks: "Included",
          },
          {
            item: "Waterproofing - Toilet",
            brand: "Fosroc",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "Waterproofing - Terrace",
            brand: "Fosroc",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "Roof Insulation",
            brand: "NA",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Terrace Tiles",
            brand: "Kajaria",
            specification: "Anti-Skid",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Flooring",
        display_order: 5,
        items: [
          {
            item: "Tiles (Living/Dining)",
            brand: "Kajaria",
            specification: "2x4 Premium Vitrified",
            remarks: "Included",
          },
          {
            item: "Tiles (Bedrooms)",
            brand: "Kajaria",
            specification: "2x4 Premium Vitrified",
            remarks: "Included",
          },
          {
            item: "Tiles (Kitchen)",
            brand: "Kajaria",
            specification: "2x2 Premium",
            remarks: "Included",
          },
          {
            item: "Tiles (Bathroom)",
            brand: "Kajaria",
            specification: "Anti-Skid Premium",
            remarks: "Included",
          },
          {
            item: "Skirting",
            brand: "Kajaria",
            specification: "Matching Tiles",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Doors & Windows",
        display_order: 6,
        items: [
          {
            item: "Main Door",
            brand: "Chivas Kangaroo",
            specification: "Premium Flush Door",
            remarks: "Included",
          },
          {
            item: "Internal Doors",
            brand: "Flush Door",
            specification: "Premium Flush Door",
            remarks: "Included",
          },
          {
            item: "Windows",
            brand: "Premium uPVC",
            specification: "Premium uPVC",
            remarks: "Included",
          },
          {
            item: "Door Hardware",
            brand: "Havells / Everest",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Window Grills",
            brand: "MS",
            specification: "Designer",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Electrical",
        display_order: 7,
        items: [
          {
            item: "Electrical Wiring",
            brand: "Havells + Legrand",
            specification: "Premium Copper",
            remarks: "Included",
          },
          {
            item: "Switches & Sockets",
            brand: "Legrand",
            specification: "Premium Range",
            remarks: "Included",
          },
          {
            item: "MCB / DB Box",
            brand: "Havells / Legrand",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Fan / Light Point",
            brand: "Havells",
            specification: "Provision Only",
            remarks: "Included",
          },
          {
            item: "Smart Lock",
            brand: "NA",
            specification: "Yes",
            remarks: "Included",
          },
          {
            item: "Video Door Phone",
            brand: "NA",
            specification: "NA",
            remarks: "Optional",
          },
        ],
      },
      {
        title: "Plumbing",
        display_order: 8,
        items: [
          {
            item: "CPVC / UPVC Pipes",
            brand: "Astral / Supreme",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "Jaquar",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Sanitary Ware",
            brand: "Jaquar / Hindware",
            specification: "Premium White",
            remarks: "Included",
          },
          {
            item: "Water Tank Connection",
            brand: "Sintex",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Overhead Tank",
            brand: "Sintex",
            specification: "1500L",
            remarks: "Included",
          },
          {
            item: "Hot Water Plumbing",
            brand: "Astral",
            specification: "Provision",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Painting",
        display_order: 9,
        items: [
          {
            item: "Wall Putty",
            brand: "Birla",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Interior Paint",
            brand: "Asian Paints / Berger",
            specification: "Premium Emulsion",
            remarks: "Included",
          },
          {
            item: "Exterior Paint",
            brand: "Asian Paints Apex",
            specification: "Weatherproof",
            remarks: "Included",
          },
          {
            item: "Texture Paint (Feature Wall)",
            brand: "Asian Paints",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Primer",
            brand: "Asian Paints",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Bathroom",
        display_order: 10,
        items: [
          {
            item: "Bathroom Tiles",
            brand: "Kajaria",
            specification: "2x4 Premium",
            remarks: "Included",
          },
          {
            item: "Sanitary Ware",
            brand: "Jaquar / Hindware",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Waterproofing",
            brand: "Fosroc",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "Jaquar",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Bathroom Accessories",
            brand: "Jaquar",
            specification: "Premium Set",
            remarks: "Included",
          },
          {
            item: "Mirror & Glass Shelf",
            brand: "Jaquar",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Kitchen",
        display_order: 11,
        items: [
          {
            item: "Kitchen Platform",
            brand: "Quartz",
            specification: "Quartz Counter Top",
            remarks: "Included",
          },
          {
            item: "Wall Tile (Full)",
            brand: "Kajaria",
            specification: "2x4 Premium",
            remarks: "Included",
          },
          {
            item: "Counter Top",
            brand: "Black Granite",
            specification: "Premium Black Granite",
            remarks: "Included",
          },
          {
            item: "Kitchen Sink",
            brand: "SS Premium",
            specification: "Single Bowl",
            remarks: "Included",
          },
          {
            item: "Modular Kitchen",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
        ],
      },
      {
        title: "Water Tank",
        display_order: 12,
        items: [
          {
            item: "Underground Water Tank",
            brand: "RCC",
            specification: "Standard Size",
            remarks: "Included",
          },
          {
            item: "Overhead Water Tank",
            brand: "Sintex",
            specification: "1500L",
            remarks: "Included",
          },
          {
            item: "Tank Connection Plumbing",
            brand: "Astral",
            specification: "Premium CPVC",
            remarks: "Included",
          },
          {
            item: "Drainage System",
            brand: "Supreme",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Water Softener Provision",
            brand: "NA",
            specification: "Provision Only",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Waterproofing",
        display_order: 13,
        items: [
          {
            item: "Toilet Waterproofing",
            brand: "Fosroc",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "Terrace Waterproofing",
            brand: "Fosroc",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "Basement Waterproofing",
            brand: "Fosroc",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Sunken Slab Waterproofing",
            brand: "Fosroc",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Chemical Waterproofing",
            brand: "Fosroc / Sika",
            specification: "Premium",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Miscellaneous",
        display_order: 14,
        items: [
          {
            item: "Front Elevation",
            brand: "ACP Sheet",
            specification: "Premium Design",
            remarks: "Included",
          },
          {
            item: "False Ceiling (Major Areas)",
            brand: "POP / Gypsum",
            specification: "Designer",
            remarks: "Included",
          },
          {
            item: "Railing",
            brand: "SS + Glass",
            specification: "Stainless Steel + Glass",
            remarks: "Included",
          },
          {
            item: "Main Gate",
            brand: "SS",
            specification: "Stainless Steel",
            remarks: "Included",
          },
          {
            item: "Solar Provision",
            brand: "NA",
            specification: "Included",
            remarks: "Included",
          },
          {
            item: "Wardrobes (Master Bedroom)",
            brand: "Plywood / Laminate",
            specification: "Standard",
            remarks: "Included",
          },
          {
            item: "Elevator / Lift",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
          {
            item: "Warranty",
            brand: "SBBT",
            specification: "15 Years Structure*",
            remarks: "Included",
          },
          {
            item: "AMC",
            brand: "SBBT",
            specification: "2 Year Full",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Exclusions",
        display_order: 15,
        items: [
          {
            item: "Modular Kitchen",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
          {
            item: "Elevator / Lift",
            brand: "NA",
            specification: "NA",
            remarks: "Additional Scope",
          },
          {
            item: "Landscaping",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Furniture & Furnishings",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Electrical Appliances",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Air Conditioning",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
        ],
      },
    ],
  },
  {
    name: "Premium Luxury",
    slug: "premium-luxury",
    price: 2499,
    description:
      "Ultimate luxury home construction package with imported finishes, premium brands, and complete automation. For those who demand the very best.",
    display_order: 4,
    sections: [
      {
        title: "Pre Construction",
        display_order: 1,
        items: [
          {
            item: "Site Survey & Soil Testing",
            brand: "NA",
            specification: "Comprehensive + NABL Lab",
            remarks: "Included",
          },
          {
            item: "Structural Design",
            brand: "Structural Engineer Verified",
            specification: "Detailed Engineering",
            remarks: "Included",
          },
          {
            item: "Building Plan Approval",
            brand: "NA",
            specification: "Complete DPR",
            remarks: "Included",
          },
          {
            item: "3D Elevation Design",
            brand: "NA",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Vastu Consultation",
            brand: "NA",
            specification: "Basic",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Structure",
        display_order: 2,
        items: [
          {
            item: "RCC Framed Structure",
            brand: "Premium IS Standard",
            specification: "Premium IS Codes",
            remarks: "Included",
          },
          {
            item: "Foundation",
            brand: "Structural Engineer Verified",
            specification: "Custom Design",
            remarks: "Included",
          },
          {
            item: "Steel Reinforcement",
            brand: "TATA / Jindal / JSW",
            specification: "Fe550D Grade Premium",
            remarks: "Included",
          },
          {
            item: "Cement",
            brand: "UltraTech OPC",
            specification: "OPC 53 Grade",
            remarks: "Included",
          },
          {
            item: "Concrete",
            brand: "RMC + Pump",
            specification: "M25 Grade RMC + Pump",
            remarks: "Included",
          },
          {
            item: "AAC Blocks",
            brand: "Magicrete Premium",
            specification: "4\" / 6\" Premium",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Masonry",
        display_order: 3,
        items: [
          {
            item: "AAC Blocks",
            brand: "Magicrete Premium",
            specification: "4\" / 6\" Premium",
            remarks: "Included",
          },
          {
            item: "Cement Mortar",
            brand: "UltraTech OPC",
            specification: "1:4 Ratio",
            remarks: "Included",
          },
          {
            item: "Damp Proof Course",
            brand: "Fosroc / Sika",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Reinforced Cement Concrete",
            brand: "UltraTech OPC",
            specification: "As per structural req.",
            remarks: "Included",
          },
          {
            item: "Expansion Joints",
            brand: "Fosroc",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Waterproofing Additives",
            brand: "Fosroc",
            specification: "In Mortar",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Roof",
        display_order: 4,
        items: [
          {
            item: "RCC Slab",
            brand: "UltraTech RMC + Pump",
            specification: "6\" thick M25 RMC",
            remarks: "Included",
          },
          {
            item: "Waterproofing - Toilet",
            brand: "Fosroc / Sika",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "Waterproofing - Terrace",
            brand: "Fosroc / Sika",
            specification: "Premium Grade + Chemical",
            remarks: "Included",
          },
          {
            item: "Roof Insulation",
            brand: "NA",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Terrace Tiles",
            brand: "Kajaria Premium",
            specification: "Premium Anti-Skid",
            remarks: "Included",
          },
          {
            item: "Weatherproof Coating",
            brand: "Asian Paints",
            specification: "Apex Ultima",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Flooring",
        display_order: 5,
        items: [
          {
            item: "Tiles (Living/Dining)",
            brand: "Imported Premium",
            specification: "Imported Premium Vitrified",
            remarks: "Included",
          },
          {
            item: "Tiles (Bedrooms)",
            brand: "Imported Premium",
            specification: "Imported Premium Vitrified",
            remarks: "Included",
          },
          {
            item: "Tiles (Kitchen)",
            brand: "Kajaria Premium",
            specification: "2x4 Premium",
            remarks: "Included",
          },
          {
            item: "Tiles (Bathroom)",
            brand: "Imported Premium",
            specification: "Anti-Skid Premium",
            remarks: "Included",
          },
          {
            item: "Skirting",
            brand: "Matching",
            specification: "Full Height",
            remarks: "Included",
          },
          {
            item: "Marble / Granite Entrance",
            brand: "Imported",
            specification: "Premium",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Doors & Windows",
        display_order: 6,
        items: [
          {
            item: "Main Door",
            brand: "Sainik Door / Century",
            specification: "Premium Teak Finish",
            remarks: "Included",
          },
          {
            item: "Internal Doors",
            brand: "CenturyPly",
            specification: "Premium Flush Door",
            remarks: "Included",
          },
          {
            item: "Windows",
            brand: "Premium uPVC",
            specification: "Premium uPVC + Mesh",
            remarks: "Included",
          },
          {
            item: "Door Hardware",
            brand: "Havells / Legrand",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Window Grills",
            brand: "SS304",
            specification: "Designer SS304",
            remarks: "Included",
          },
          {
            item: "Architectural Glass",
            brand: "Saint Gobain",
            specification: "Premium",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Electrical",
        display_order: 7,
        items: [
          {
            item: "Electrical Wiring",
            brand: "Havells / Legrand",
            specification: "Premium Copper",
            remarks: "Included",
          },
          {
            item: "Switches & Sockets",
            brand: "Legrand Premium",
            specification: "Premium Range",
            remarks: "Included",
          },
          {
            item: "MCB / DB Box",
            brand: "Legrand / Schneider",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Fan / Light Point",
            brand: "Havells",
            specification: "Provision Only",
            remarks: "Included",
          },
          {
            item: "Smart Lock",
            brand: "Premium",
            specification: "Included",
            remarks: "Included",
          },
          {
            item: "Video Door Phone",
            brand: "Premium",
            specification: "Included",
            remarks: "Included",
          },
          {
            item: "Home Automation",
            brand: "Legrand",
            specification: "Basic",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Plumbing",
        display_order: 8,
        items: [
          {
            item: "CPVC / UPVC Pipes",
            brand: "Astral / Supreme",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "Jaquar / Kohler",
            specification: "Premium / Luxury",
            remarks: "Included",
          },
          {
            item: "Sanitary Ware",
            brand: "Jaquar / Kohler",
            specification: "Premium / Luxury",
            remarks: "Included",
          },
          {
            item: "Water Tank Connection",
            brand: "Sintex",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Overhead Tank",
            brand: "Sintex Premium",
            specification: "2000L",
            remarks: "Included",
          },
          {
            item: "Hot Water Plumbing",
            brand: "Astral",
            specification: "Full Setup",
            remarks: "Included",
          },
          {
            item: "Water Purifier Provision",
            brand: "NA",
            specification: "Provision",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Painting",
        display_order: 9,
        items: [
          {
            item: "Wall Putty",
            brand: "Birla",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Interior Paint",
            brand: "Asian Paints Royale",
            specification: "Luxury Emulsion",
            remarks: "Included",
          },
          {
            item: "Exterior Paint",
            brand: "Asian Paints Apex Ultima",
            specification: "Weatherproof Premium",
            remarks: "Included",
          },
          {
            item: "Texture Paint (Feature Wall)",
            brand: "Asian Paints",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Primer",
            brand: "Asian Paints",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Wood Polish",
            brand: "Asian Paints",
            specification: "Premium Melamine",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Bathroom",
        display_order: 10,
        items: [
          {
            item: "Bathroom Tiles",
            brand: "Imported Premium",
            specification: "Imported Anti-Skid",
            remarks: "Included",
          },
          {
            item: "Sanitary Ware",
            brand: "Jaquar / Kohler",
            specification: "Luxury",
            remarks: "Included",
          },
          {
            item: "Waterproofing",
            brand: "Fosroc / Sika",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "CP Fittings",
            brand: "Jaquar / Kohler",
            specification: "Luxury",
            remarks: "Included",
          },
          {
            item: "Bathroom Accessories",
            brand: "Jaquar",
            specification: "Premium Set",
            remarks: "Included",
          },
          {
            item: "Mirror & Glass Shelf",
            brand: "Jaquar",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Geyser Provision",
            brand: "NA",
            specification: "Provision",
            remarks: "Included",
          },
          {
            item: "Exhaust Fan",
            brand: "Havells",
            specification: "Premium",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Kitchen",
        display_order: 11,
        items: [
          {
            item: "Kitchen Platform",
            brand: "Quartz",
            specification: "Full Modular + Quartz Counter Top",
            remarks: "Included",
          },
          {
            item: "Wall Tile (Full)",
            brand: "Imported Premium",
            specification: "Full Height Premium",
            remarks: "Included",
          },
          {
            item: "Counter Top",
            brand: "Quartz",
            specification: "Premium Quartz",
            remarks: "Included",
          },
          {
            item: "Kitchen Sink",
            brand: "SS Premium",
            specification: "Premium Single Bowl",
            remarks: "Included",
          },
          {
            item: "Modular Kitchen",
            brand: "Premium",
            specification: "Yes Full Modular Kitchen",
            remarks: "Included",
          },
          {
            item: "Chimney Provision",
            brand: "NA",
            specification: "Provision",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Water Tank",
        display_order: 12,
        items: [
          {
            item: "Underground Water Tank",
            brand: "RCC",
            specification: "Large Size",
            remarks: "Included",
          },
          {
            item: "Overhead Water Tank",
            brand: "Sintex Premium",
            specification: "2000L Premium",
            remarks: "Included",
          },
          {
            item: "Tank Connection Plumbing",
            brand: "Astral",
            specification: "Premium CPVC",
            remarks: "Included",
          },
          {
            item: "Drainage System",
            brand: "Supreme",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Water Softener",
            brand: "Premium",
            specification: "Full Setup",
            remarks: "Included",
          },
          {
            item: "Rainwater Harvesting",
            brand: "RCC",
            specification: "Standard",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Waterproofing",
        display_order: 13,
        items: [
          {
            item: "Toilet Waterproofing",
            brand: "Fosroc / Sika",
            specification: "Premium Grade",
            remarks: "Included",
          },
          {
            item: "Terrace Waterproofing",
            brand: "Fosroc / Sika",
            specification: "Premium + Chemical",
            remarks: "Included",
          },
          {
            item: "Basement Waterproofing",
            brand: "Fosroc / Sika",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Sunken Slab Waterproofing",
            brand: "Fosroc / Sika",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "Chemical Waterproofing",
            brand: "Fosroc / Sika",
            specification: "Premium",
            remarks: "Included",
          },
          {
            item: "External Wall Waterproofing",
            brand: "Sika",
            specification: "Premium",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Miscellaneous",
        display_order: 14,
        items: [
          {
            item: "Front Elevation",
            brand: "Full HPL",
            specification: "Premium HPL Design",
            remarks: "Included",
          },
          {
            item: "False Ceiling (Entire House)",
            brand: "POP / Gypsum Premium",
            specification: "Designer Premium",
            remarks: "Included",
          },
          {
            item: "Railing",
            brand: "SS304 + Glass",
            specification: "SS304 Premium + Glass",
            remarks: "Included",
          },
          {
            item: "Main Gate",
            brand: "SS304 Designer",
            specification: "SS304 Designer",
            remarks: "Included",
          },
          {
            item: "Solar Provision",
            brand: "NA",
            specification: "Included",
            remarks: "Included",
          },
          {
            item: "Wardrobes (Every Bedroom)",
            brand: "CenturyPly / Premium",
            specification: "Premium Laminate",
            remarks: "Included",
          },
          {
            item: "Elevator / Lift",
            brand: "Hi-Bon MRL + ARD",
            specification: "MRL with ARD",
            remarks: "Included",
          },
          {
            item: "Warranty",
            brand: "SBBT",
            specification: "15 Years Structure*",
            remarks: "Included",
          },
          {
            item: "AMC",
            brand: "SBBT",
            specification: "2 Year Full",
            remarks: "Included",
          },
        ],
      },
      {
        title: "Exclusions",
        display_order: 15,
        items: [
          {
            item: "Landscaping",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Furniture & Furnishings",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Electrical Appliances",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Air Conditioning",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Swimming Pool",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
          {
            item: "Home Theatre",
            brand: "NA",
            specification: "NA",
            remarks: "Excluded",
          },
        ],
      },
    ],
  },
  {
    name: "Custom Build",
    slug: "custom-build",
    price: 0,
    description:
      "Fully customised home construction package tailored to your exact requirements. Choose your own materials, brands, specifications, and design elements.",
    display_order: 5,
    sections: [
      {
        title: "Pre Construction",
        display_order: 1,
        items: [
          {
            item: "Site Survey & Soil Testing",
            brand: "NA",
            specification: "Custom Requirement",
            remarks: "As per client",
          },
          {
            item: "Structural Design",
            brand: "Custom Design",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Building Plan Approval",
            brand: "NA",
            specification: "Custom Drawings",
            remarks: "As per client",
          },
          {
            item: "3D Elevation Design",
            brand: "NA",
            specification: "Custom",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Structure",
        display_order: 2,
        items: [
          {
            item: "RCC Framed Structure",
            brand: "Custom Design",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Foundation",
            brand: "Custom",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Steel Reinforcement",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Cement",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Concrete",
            brand: "Custom",
            specification: "Custom Grade",
            remarks: "As per client",
          },
          {
            item: "AAC Blocks / Red Brick",
            brand: "As Customer Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Masonry",
        display_order: 3,
        items: [
          {
            item: "AAC Blocks / Red Brick",
            brand: "As Customer Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Cement Mortar",
            brand: "Client Choice",
            specification: "Custom Ratio",
            remarks: "As per client",
          },
          {
            item: "Damp Proof Course",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Roof",
        display_order: 4,
        items: [
          {
            item: "RCC Slab",
            brand: "Custom",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Waterproofing",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Roof Insulation",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Flooring",
        display_order: 5,
        items: [
          {
            item: "Tiles",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Skirting",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Marble / Granite",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Doors & Windows",
        display_order: 6,
        items: [
          {
            item: "Main Door",
            brand: "Custom",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Internal Doors",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Windows",
            brand: "Custom",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Door Hardware",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Electrical",
        display_order: 7,
        items: [
          {
            item: "Electrical Wiring",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Switches & Sockets",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "MCB / DB Box",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Smart Lock",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Video Door Phone",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Plumbing",
        display_order: 8,
        items: [
          {
            item: "CPVC / UPVC Pipes",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "CP Fittings",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Sanitary Ware",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Water Tank Connection",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Painting",
        display_order: 9,
        items: [
          {
            item: "Wall Putty",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Interior Paint",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Exterior Paint",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Texture Paint",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Bathroom",
        display_order: 10,
        items: [
          {
            item: "Bathroom Tiles",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Sanitary Ware",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Waterproofing",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "CP Fittings",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Bathroom Accessories",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Kitchen",
        display_order: 11,
        items: [
          {
            item: "Kitchen Platform",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Wall Tile",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Counter Top",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Modular Kitchen",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Water Tank",
        display_order: 12,
        items: [
          {
            item: "Underground Water Tank",
            brand: "Custom",
            specification: "Custom Size",
            remarks: "As per client",
          },
          {
            item: "Overhead Water Tank",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Tank Connection Plumbing",
            brand: "Client Choice",
            specification: "Client Choice",
            remarks: "As per client",
          },
          {
            item: "Rainwater Harvesting",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Waterproofing",
        display_order: 13,
        items: [
          {
            item: "Toilet Waterproofing",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Terrace Waterproofing",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Basement Waterproofing",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Chemical Waterproofing",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
        ],
      },
      {
        title: "Miscellaneous",
        display_order: 14,
        items: [
          {
            item: "Front Elevation",
            brand: "Custom",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "False Ceiling",
            brand: "Custom",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Railing",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Main Gate",
            brand: "Custom",
            specification: "Custom Design",
            remarks: "As per client",
          },
          {
            item: "Solar Provision",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Wardrobes",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Elevator / Lift",
            brand: "Custom",
            specification: "Custom",
            remarks: "As per client",
          },
          {
            item: "Warranty",
            brand: "As Agreed",
            specification: "As Agreed",
            remarks: "As agreed between parties",
          },
          {
            item: "AMC",
            brand: "As Agreed",
            specification: "As Agreed",
            remarks: "As agreed between parties",
          },
        ],
      },
      {
        title: "Exclusions",
        display_order: 15,
        items: [
          {
            item: "All items are customizable",
            brand: "NA",
            specification: "Client Choice",
            remarks: "Custom build as per client",
          },
          {
            item: "Furniture & Furnishings",
            brand: "NA",
            specification: "NA",
            remarks: "As agreed between parties",
          },
          {
            item: "Electrical Appliances",
            brand: "NA",
            specification: "NA",
            remarks: "As agreed between parties",
          },
          {
            item: "Air Conditioning",
            brand: "NA",
            specification: "NA",
            remarks: "As agreed between parties",
          },
        ],
      },
    ],
  },
];

// ============================================================
// Main seed function
// ============================================================

async function seed() {
  console.log("🔨 Starting package seed...\n");

  const supabase = createClient(supabaseUrl!, supabaseKey!);

  // Sign in as admin if password is provided (to bypass RLS)
  if (adminPassword) {
    console.log("🔑 Signing in as admin...");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (signInError) {
      console.error("❌ Admin sign-in failed:", signInError.message);
      console.log("⚠️  Continuing with anon key (may fail due to RLS)...");
    } else {
      console.log("✅ Admin signed in successfully.");
    }
  }

  // Delete existing packages (cascades to sections and items)
  console.log("🗑️  Clearing existing package data...");
  const { error: deleteError } = await supabase
    .from("cms_packages")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.error("❌ Error clearing packages:", deleteError.message);
    process.exit(1);
  }
  console.log("✅ Existing packages cleared.\n");

  for (const pkg of packagesData) {
    console.log(`📦 Creating package: ${pkg.name} (${pkg.slug})`);

    // 1. Insert the package
    const { data: pkgData, error: pkgError } = await supabase
      .from("cms_packages")
      .insert({
        name: pkg.name,
        slug: pkg.slug,
        price: pkg.price,
        description: pkg.description,
        display_order: pkg.display_order,
        is_active: true,
        site_id: SITE_ID,
      })
      .select("id")
      .single();

    if (pkgError || !pkgData) {
      console.error(`❌ Error creating package ${pkg.name}:`, pkgError?.message);
      continue;
    }

    const packageId = pkgData.id;
    console.log(`   ✅ Package created (ID: ${packageId})`);

    // 2. Insert sections
    for (const section of pkg.sections) {
      const { data: secData, error: secError } = await supabase
        .from("cms_package_sections")
        .insert({
          package_id: packageId,
          title: section.title,
          display_order: section.display_order,
        })
        .select("id")
        .single();

      if (secError || !secData) {
        console.error(`   ❌ Error creating section ${section.title}:`, secError?.message);
        continue;
      }

      const sectionId = secData.id;
      console.log(`   📑 Section: ${section.title} (ID: ${sectionId})`);

      // 3. Insert items for this section
      if (section.items.length > 0) {
        const itemsToInsert = section.items.map((item, idx) => ({
          section_id: sectionId,
          item: item.item,
          brand: item.brand,
          specification: item.specification,
          remarks: item.remarks,
          display_order: idx + 1,
        }));

        const { error: itemsError } = await supabase
          .from("cms_package_items")
          .insert(itemsToInsert);

        if (itemsError) {
          console.error(`   ❌ Error inserting items for ${section.title}:`, itemsError.message);
        } else {
          console.log(`   ✅ ${itemsToInsert.length} items inserted`);
        }
      }
    }

    console.log(`   ✅ Package "${pkg.name}" seeded successfully.\n`);
  }

  console.log("🎉 All packages seeded successfully!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});