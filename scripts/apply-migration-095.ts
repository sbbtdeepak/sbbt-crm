/**
 * Apply migration 095 to Supabase.
 * Adds INSERT policy for authenticated role on crm_leads.
 *
 * Usage: npx tsx -r dotenv/config scripts/apply-migration-095.ts dotenv_config_path=.env.local
 */

import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function main() {
  console.log("🚀 Applying migration 095 - CRM Leads Authenticated INSERT Policy\n");

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const sqlPath = path.join(process.cwd(), "supabase_v2", "095_crm_leads_authenticated_insert.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("📋 Attempting to apply migration via Supabase REST API...\n");

  // Try via /rest/v1/ endpoint
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`,
        "Prefer": "params=single-object",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (response.ok) {
      console.log("✅ Migration 095 applied successfully!");
      process.exit(0);
    }

    console.log(`⚠️  REST API returned status ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 200)}\n`);
  } catch (err) {
    console.log(`⚠️  REST API error: ${err}\n`);
  }

  // Try pg endpoint
  try {
    console.log("🔄 Trying pg/query endpoint...");
    const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (pgResponse.ok) {
      console.log("✅ Migration 095 applied via pg endpoint!");
      process.exit(0);
    }

    console.log(`⚠️  pg endpoint returned status ${pgResponse.status}`);
    const text = await pgResponse.text();
    console.log(`   Response: ${text.substring(0, 200)}\n`);
  } catch (err) {
    console.log(`⚠️  pg endpoint error: ${err}\n`);
  }

  // Fallback: Manual instructions
  console.log("\n❌ Could not apply migration automatically.");
  console.log("\n📋 Please apply the migration manually in Supabase SQL Editor:");
  console.log("   1. Go to https://supabase.com/dashboard/project/" + SUPABASE_URL.replace("https://", "").split(".")[0]);
  console.log("   2. Navigate to: SQL Editor");
  console.log("   3. Paste and run the following SQL:\n");
  console.log("   " + "─".repeat(60));
  console.log(sql);
  console.log("   " + "─".repeat(60));
  console.log("\n   Or run this file directly in SQL Editor:");
  console.log(`   ${sqlPath}\n`);
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});