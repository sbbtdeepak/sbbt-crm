import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(url, key);

async function main() {
  // Use PostgREST to get column info by selecting with a known-good column
  // and a known-bad column to trigger the schema error
  const testColumns = [
    'id', 'site_id', 'brand_name', 'legal_name', 'tagline', 'logo_url', 'favicon_url',
    'primary_color', 'secondary_color', 'currency', 'timezone', 'language',
    'gst', 'pan', 'business_hours', 'address', 'phone', 'alternate_mobile',
    'whatsapp', 'email', 'grievance_email', 'support_email', 'sales_email',
    'website', 'google_maps_url', 'google_rating', 'years_experience',
    'homes_delivered', 'projects_completed', 'created_at', 'updated_at',
    'created_by', 'updated_by', 'deleted_at'
  ];

  // Test each column individually
  console.log("Testing each column for existence in cms_company:");
  for (const col of testColumns) {
    const { error } = await supabase
      .from('cms_company')
      .select(col)
      .limit(1);
    
    if (error) {
      console.log(`  ❌ MISSING: ${col} — ${error.message}`);
    } else {
      console.log(`  ✅ EXISTS: ${col}`);
    }
  }
}

main().catch(console.error);