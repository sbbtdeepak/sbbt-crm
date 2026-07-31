/**
 * Verification script to confirm package data was seeded correctly.
 * Usage: npx tsx -r dotenv/config scripts/verify-packages.ts dotenv_config_path=.env.local
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function verify() {
  console.log("🔍 Verifying seeded package data...\n");

  // Count packages
  const { data: packages, error: pkgError } = await supabase
    .from("cms_packages")
    .select("id, name, slug, price, display_order, is_active")
    .order("display_order", { ascending: true });

  if (pkgError) {
    console.error("❌ Error fetching packages:", pkgError.message);
    process.exit(1);
  }

  console.log(`📦 Packages: ${packages?.length || 0}`);
  for (const pkg of packages || []) {
    console.log(`   - ${pkg.name} (${pkg.slug}) - ₹${pkg.price}/sqft - Active: ${pkg.is_active}`);
  }

  // Count sections
  const { data: sections, error: secError } = await supabase
    .from("cms_package_sections")
    .select("id, package_id, title, display_order")
    .order("display_order", { ascending: true });

  if (secError) {
    console.error("❌ Error fetching sections:", secError.message);
    process.exit(1);
  }

  console.log(`\n📑 Sections: ${sections?.length || 0}`);

  // Count items
  const { data: items, error: itemError } = await supabase
    .from("cms_package_items")
    .select("id, section_id, item, brand, specification, remarks")
    .order("display_order", { ascending: true });

  if (itemError) {
    console.error("❌ Error fetching items:", itemError.message);
    process.exit(1);
  }

  console.log(`📋 Items: ${items?.length || 0}`);

  // Summary per package
  console.log("\n📊 Summary per package:");
  for (const pkg of packages || []) {
    const pkgSections = (sections || []).filter((s) => s.package_id === pkg.id);
    const sectionIds = pkgSections.map((s) => s.id);
    const pkgItems = (items || []).filter((i) => sectionIds.includes(i.section_id));
    console.log(`   ${pkg.name}: ${pkgSections.length} sections, ${pkgItems.length} items`);
  }

  console.log("\n✅ Verification complete!");
}

verify().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});