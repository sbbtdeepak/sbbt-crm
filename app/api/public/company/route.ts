import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "@/app/dashboard/cms/types";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cms_company")
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .maybeSingle();

  if (error) {
    console.error("Error fetching public company data:", error);
    return NextResponse.json(
      { error: "Failed to fetch company data" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    // Brand Identity
    brand_name: data?.brand_name || "SBBT",
    legal_name: data?.legal_name || "Shree Badree Build Tech Pvt Ltd",
    tagline: data?.tagline || "",
    logo_url: data?.logo_url || "",
    favicon_url: data?.favicon_url || "",

    // Contact Information
    phone: data?.phone || "",
    alternate_mobile: data?.alternate_mobile || "",
    whatsapp: data?.whatsapp || "",
    email: data?.email || "",
    grievance_email: data?.grievance_email || "",
    support_email: data?.support_email || "",
    sales_email: data?.sales_email || "",
    website: data?.website || "",

    // Location
    address: data?.address || "",
    google_maps_url: data?.google_maps_url || "",

    // Business Metrics
    google_rating: data?.google_rating || 0,
    years_experience: data?.years_experience || 0,
    homes_delivered: data?.homes_delivered || 0,
    projects_completed: data?.projects_completed || 0,

    // Business Details
    gst: data?.gst || "",
    pan: data?.pan || "",
    business_hours: data?.business_hours || "",

    // Brand Colors
    primary_color: data?.primary_color || "#4f46e5",
    secondary_color: data?.secondary_color || "#06b6d4",
  });
}