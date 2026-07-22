import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "@/app/dashboard/cms/types";

export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("cms_company")
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .maybeSingle();

  return Response.json({
    brand_name: data?.brand_name || "SBBT",
    legal_name: data?.legal_name || "Shree Badree Build Tech Pvt Ltd",
    tagline: data?.tagline || "",
    logo_url: data?.logo_url || "",
    favicon_url: data?.favicon_url || "",
    phone: data?.phone || "+91 XXXXX XXXXX",
    email: data?.email || "info@sbbt.in",
    address: data?.address || "Delhi NCR",
    whatsapp: data?.whatsapp || "",
    business_hours: data?.business_hours || "",
    primary_color: data?.primary_color || "#4f46e5",
    secondary_color: data?.secondary_color || "#06b6d4",
  });
}