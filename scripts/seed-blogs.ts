/**
 * Seed script to populate CMS blogs with 30 construction blogs.
 * 20 English + 10 Hinglish (Hindi-English mix).
 *
 * Usage: npx tsx -r dotenv/config scripts/seed-blogs.ts dotenv_config_path=.env.local
 */

import { createClient } from "@supabase/supabase-js";
import { blogs, BlogSeedData } from "./seed-blogs-data";

const SITE_ID = "00000000-0000-0000-0000-000000000001";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@sbbt.com";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials.");
  process.exit(1);
}

async function seed() {
  console.log("🔨 Starting blogs seed.\n");

  const supabase = createClient(supabaseUrl!, supabaseKey!);

  if (adminPassword) {
    console.log("🔑 Signing in as admin.");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (signInError) {
      console.error("❌ Admin sign-in failed:", signInError.message);
      process.exit(1);
    }
    console.log("✅ Admin signed in successfully.\n");
  }

  console.log("🗑️ Clearing existing blogs.");
  const { error: deleteError } = await supabase
    .from("cms_blogs")
    .delete()
    .neq("id", 0);

  if (deleteError) {
    console.error("❌ Error clearing blogs:", deleteError.message);
    process.exit(1);
  }
  console.log("✅ Existing blogs cleared.\n");

  // Check if SEO columns exist
  const { error: checkError } = await supabase
    .from("cms_blogs")
    .select("canonical")
    .limit(1);

  const hasSeoColumns = !checkError;

  if (hasSeoColumns) {
    console.log("✅ SEO columns exist. Seeding with full data.\n");
  } else {
    console.log("⚠️ SEO columns don't exist yet. Run migration 073 first.\n");
  }

  let successCount = 0;
  let errorCount = 0;

  for (const blog of blogs) {
    const insertData: Record<string, unknown> = {
      site_id: SITE_ID,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      featured_image_url: blog.featured_image_url || "",
      featured_image_alt: blog.featured_image_alt || "",
      author: blog.author,
      tags: blog.tags,
      category: blog.category || "",
      published_date: blog.published_date || null,
      reading_time: blog.reading_time || 5,
      featured: blog.featured || false,
      is_published: blog.is_published !== false,
      display_order: blog.display_order || 0,
    };

    if (hasSeoColumns) {
      insertData.meta_title = blog.meta_title || blog.title;
      insertData.meta_description = blog.meta_description || blog.excerpt;
      insertData.seo_title = blog.seo_title || blog.meta_title;
      insertData.seo_description = blog.seo_description || blog.meta_description;
      insertData.seo_keywords = blog.seo_keywords || "";
      insertData.canonical = blog.canonical || `/blogs/${blog.slug}`;
      insertData.og_title = blog.og_title || blog.title;
      insertData.og_description = blog.og_description || blog.excerpt;
      insertData.twitter_title = blog.og_title || blog.title;
      insertData.twitter_description = blog.og_description || blog.excerpt;
      insertData.robots = blog.robots || "index, follow";
      insertData.schema_description = blog.seo_description || blog.excerpt;
    }

    const { error } = await supabase
      .from("cms_blogs")
      .insert(insertData);

    if (error) {
      console.error(`❌ Error inserting blog "${blog.title}":`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Inserted: ${blog.title}`);
      successCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} blogs inserted, ${errorCount} errors`);

  if (errorCount > 0) {
    console.log("\n⚠️ Some blogs failed to insert. Check errors above.");
  }

  console.log("\n🎉 Blogs seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});