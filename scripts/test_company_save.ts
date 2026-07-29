import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(url, key);

// The exact updateData payload from actions.ts saveCompany()
const updateData = {
  site_id: "00000000-0000-0000-0000-000000000001",
  brand_name: "SBBT Construction Test",
  legal_name: "Shree Badree Build Tech Pvt. Ltd.",
  tagline: "Building Dreams Since 2010",
  logo_url: "",
  favicon_url: "",
  primary_color: "#4f46e5",
  secondary_color: "#06b6d4",
  phone: "+91 98765 43210",
  alternate_mobile: "",
  whatsapp: "",
  email: "info@sbbt.in",
  grievance_email: "grievance@sbbt.in",
  support_email: "support@sbbt.in",
  sales_email: "sales@sbbt.in",
  website: "https://www.sbbt.in",
  address: "Test Address",
  google_maps_url: "",
  google_rating: 4.5,
  years_experience: 15,
  homes_delivered: 500,
  projects_completed: 1000,
  gst: "27AAEPM1234C1Z5",
  pan: "AAEPM1234C",
  currency: "INR",
  timezone: "Asia/Kolkata",
  language: "en",
  business_hours: "Mon-Sat: 9:00 AM - 6:00 PM",
  updated_at: new Date().toISOString(),
};

async function main() {
  console.log("=== Step 1: Check if row exists ===");
  const { data: existing, error: selectError } = await supabase
    .from("cms_company")
    .select("id")
    .eq("site_id", "00000000-0000-0000-0000-000000000001")
    .maybeSingle();

  if (selectError) {
    console.log("SELECT error:", JSON.stringify(selectError, null, 2));
    return;
  }

  console.log("Existing row ID:", existing?.id || null);

  if (existing?.id) {
    console.log("\n=== Step 2: UPDATE existing row ===");
    const { error: updateError } = await supabase
      .from("cms_company")
      .update(updateData)
      .eq("id", existing.id);

    if (updateError) {
      console.log("UPDATE error:", JSON.stringify(updateError, null, 2));
    } else {
      console.log("UPDATE ✅ SUCCESS");
    }
  } else {
    console.log("\n=== Step 2: INSERT new row ===");
    const insertPayload = { ...updateData };
    delete (insertPayload as any).updated_at;

    const { error: insertError } = await supabase
      .from("cms_company")
      .insert(insertPayload);

    if (insertError) {
      console.log("INSERT error:", JSON.stringify(insertError, null, 2));
    } else {
      console.log("INSERT ✅ SUCCESS");
    }
  }

  console.log("\n=== Step 3: Read back full row ===");
  const { data: row, error: readError } = await supabase
    .from("cms_company")
    .select("*")
    .eq("site_id", "00000000-0000-0000-0000-000000000001")
    .maybeSingle();

  if (readError) {
    console.log("READ error:", JSON.stringify(readError, null, 2));
  } else if (row) {
    console.log("Full row:", JSON.stringify(row, null, 2));
    // Verify all 6 previously-missing columns have values
    const checks = [
      "grievance_email",
      "google_rating",
      "years_experience",
      "homes_delivered",
      "projects_completed",
      "deleted_at",
    ];
    console.log("\n=== Verification of formerly-missing columns ===");
    for (const col of checks) {
      const val = (row as any)[col];
      const status = col === "deleted_at"
        ? (val === null ? "✅ NULL (expected)" : `⚠️ ${val}`)
        : (val !== undefined && val !== "" && val !== null ? `✅ ${val}` : `❌ ${val}`);
      console.log(`  ${col}: ${status}`);
    }
  }
}

main().catch(console.error);