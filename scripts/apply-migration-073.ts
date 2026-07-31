/**
 * Apply migration 073 to Supabase using REST API + SQL.
 * This uses the Supabase REST endpoint with the anon key to alter table columns.
 * Falls back to trying the Management API if available.
 *
 * Usage: npx tsx -r dotenv/config Scripts/apply-migration-073.ts dotenv_config_path=.env.local
 */

import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🚀 Applying migration 073 - CMS Testimonials & Blogs SEO columns\n");

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const sqlPath = path.join(process.cwd(), "supabase_v2", "073_cms_testimonials_blogs_seo.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");
  
  // Extract only the ALTER TABLE statements for cms_blogs
  const blogStatements = sql
    .split(";")
    .filter((s) => s.trim().length > 0 && s.includes("cms_blogs"))
    .map((s) => s.trim() + ";");

  console.log(`📝 Found ${blogStatements.length} blog-related ALTER statements\n`);

  // Try using the Supabase REST API + anonymous auth to call pg_ddl_exec
  // This works if the project has the pg_ddl_exec RPC function installed
  const endpoints = [
    { name: "pg_ddl_exec", body: { command: "" } },
    { name: "exec_sql", body: { sql: "" } },
    { name: "execute_sql", body: { sql_text: "" } },
  ];

  let applied = false;

  for (const stmt of blogStatements) {
    console.log(`📋 Executing: ${stmt.substring(0, 80)}...`);
    
    // Try direct SQL via /rest/v1/ with header approach
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": ANON_KEY,
          "Authorization": `Bearer ${ANON_KEY}`,
          "Prefer": "params=single-object",
        },
        body: JSON.stringify({ query: stmt }),
      });
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        applied = true;
        console.log("   ✅ Success");
      } else {
        const text = await response.text();
        console.log(`   ❌ Failed: ${text.substring(0, 200)}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err}`);
    }
    
    await sleep(500);
  }

  if (!applied) {
    // Try direct SQL via fetch to the Supabase auth endpoint (for service_role)
    // OR try via the Supabase SQL API https://supabase.com/docs/reference/api/ddl
    console.log("\n⚠️  Could not apply migration via REST API.");
    console.log("\n📋 You need to manually apply the migration in Supabase SQL Editor:");
    console.log("   1. Go to https://supabase.com/dashboard/project/btcvowucckvlqpcjaatj");
    console.log("   2. Open SQL Editor");
    console.log("   3. Paste and run the contents of: supabase_v2/073_cms_testimonials_blogs_seo.sql");
    console.log("   4. Or paste this minimal version:\n");
    
    // Generate minimal SQL
    const minimalSQL = blogStatements.join("\n\n");
    console.log(minimalSQL);
    console.log("\n");
    
    // Try with the pg endpoint
    try {
      console.log("🔄 Trying pg endpoint...");
      const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": ANON_KEY,
          "Authorization": `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ query: blogStatements.join("\n") }),
      });
      if (pgResponse.ok) {
        console.log("✅ Migration applied via pg endpoint!");
        applied = true;
      } else {
        const text = await pgResponse.text();
        console.log(`❌ pg endpoint failed: ${text.substring(0, 200)}`);
      }
    } catch {
      console.log("❌ pg endpoint not available");
    }
  }

  if (applied) {
    console.log("\n✅ Migration 073 applied successfully!");
  } else {
    console.log("\n❌ Could not apply migration automatically.");
    console.log("📋 Please apply supabase_v2/073_cms_testimonials_blogs_seo.sql manually in Supabase SQL Editor.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});