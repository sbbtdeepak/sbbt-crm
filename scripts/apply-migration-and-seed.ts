/**
 * Apply migration 073 to Supabase database via HTTP API.
 * Then seed testimonials and blogs.
 *
 * Usage: npx tsx -r dotenv/config scripts/apply-migration-and-seed.ts dotenv_config_path=.env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SITE_ID = "00000000-0000-0000-0000-000000000001";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@sbbt.com";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials.");
  process.exit(1);
}

async function applyMigration() {
  console.log("📋 Applying migration 073...\n");

  const sqlPath = path.join(process.cwd(), "supabase_v2", "073_cms_testimonials_blogs_seo.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  // Try applying via Supabase SQL HTTP endpoint
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey!,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.log("⚠️  Direct SQL endpoint not available. Trying alternative method...");
    }
  } catch {
    console.log("⚠️  Direct SQL endpoint not available.");
  }

  // Alternative: Try applying each ALTER TABLE statement via the database endpoint
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--") && !s.startsWith("SELECT"));

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  // Try using the Supabase pg endpoint
  let migrationApplied = false;
  try {
    const pgResponse = await fetch(`${supabaseUrl}/pg/query`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey!,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (pgResponse.ok) {
      console.log("✅ Migration applied via pg endpoint!");
      migrationApplied = true;
    }
  } catch {
    // Endpoint not available
  }

  if (!migrationApplied) {
    console.log("⚠️  Could not apply migration automatically via HTTP API.");
    console.log("   The Supabase SQL endpoint requires the service role key or database password.");
    console.log("   Proceeding with seed using fallback method (existing columns only)...\n");
  }

  return migrationApplied;
}

async function seedTestimonials() {
  console.log("\n🔨 Seeding testimonials...\n");

  const supabase = createClient(supabaseUrl!, supabaseKey!);

  // Sign in as admin
  if (adminPassword) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (signInError) {
      console.error("❌ Admin sign-in failed:", signInError.message);
      return;
    }
    console.log("✅ Admin signed in.");
  }

  // Clear existing
  console.log("🗑️  Clearing existing testimonials...");
  await supabase.from("cms_testimonials").delete().neq("id", 0);

  // Check if new columns exist by trying a select
  const { error: checkError } = await supabase
    .from("cms_testimonials")
    .select("canonical")
    .limit(1);

  const hasSeoColumns = !checkError;

  if (hasSeoColumns) {
    console.log("✅ SEO columns exist. Seeding with full data...");
  } else {
    console.log("⚠️  SEO columns don't exist. Seeding with basic data only...");
    console.log("   Run supabase_v2/073_cms_testimonials_blogs_seo.sql in Supabase SQL Editor to add SEO fields.");
  }

  // Import testimonials data
  const { testimonials } = await import("./seed-testimonials-data");

  let successCount = 0;
  let errorCount = 0;

  for (const t of testimonials) {
    const baseData: Record<string, unknown> = {
      site_id: SITE_ID,
      client_name: t.client_name,
      designation: t.designation,
      project_name: t.project_name,
      location: t.location,
      rating: t.rating,
      testimonial: t.testimonial,
      image_url: "",
      is_featured: t.is_featured,
      display_order: t.display_order,
    };

    if (hasSeoColumns) {
      baseData.initials = t.initials;
      baseData.project_type = t.project_type;
      baseData.completion_year = t.completion_year;
      baseData.seo_title = t.seo_title;
      baseData.seo_description = t.seo_description;
      baseData.seo_keywords = t.seo_keywords;
      baseData.canonical = t.canonical;
      baseData.og_title = t.og_title;
      baseData.og_description = t.og_description;
      baseData.twitter_title = t.seo_title;
      baseData.twitter_description = t.seo_description;
      baseData.robots = "index, follow";
      baseData.schema_description = t.seo_description;
    }

    const { error } = await supabase.from("cms_testimonials").insert(baseData);

    if (error) {
      console.error(`❌ ${t.client_name}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ ${t.client_name} (${t.location}) - ${t.rating}★`);
      successCount++;
    }
  }

  console.log(`\n📊 Testimonials: ${successCount} inserted, ${errorCount} errors`);
  return successCount;
}

async function main() {
  console.log("🚀 Starting migration + seed workflow...\n");

  // Step 1: Apply migration
  await applyMigration();

  // Step 2: Seed testimonials
  const testimonialCount = await seedTestimonials();

  // Step 3: Seed blogs (placeholder - blogs seed will be separate)
  console.log("\n📝 Blogs seed will be run separately.");

  console.log("\n🎉 Workflow complete!");
  console.log(`\n📊 Final Report:`);
  console.log(`   Testimonials: ${testimonialCount || 0}`);
  console.log(`   Blogs: Pending (run seed-blogs.ts separately)`);
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});