"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CMSFormState, DEFAULT_SITE_ID, CMSStorageFolder } from "./types";

// ============================================================
// Helper Functions
// ============================================================

/**
 * Gets the current authenticated user's ID
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Creates a standardized error state
 */
function createErrorState(message: string): CMSFormState {
  return { success: false, message };
}

/**
 * Creates a standardized success state
 */
function createSuccessState(message: string): CMSFormState {
  return { success: true, message };
}

// ============================================================
// Image Upload/Delete Server Actions
// ============================================================

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

/**
 * Validates an image file
 */
function validateImage(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid file type: "${file.type}". Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  return { valid: true };
}

/**
 * Generates unique filename
 */
function generateUniqueFilename(originalFilename: string): string {
  const parts = originalFilename.split(".");
  const extension = parts.length > 1 ? parts.at(-1) : "jpg";
  const timestamp = Date.now();
  const randomSuffix = (crypto?.randomUUID?.() || "xxxxxxx").split("-")[0];
  return `${timestamp}_${randomSuffix}.${extension}`;
}

/**
 * Server action for uploading images
 * Returns JSON with success status and URL or error
 */
export async function uploadImageAction(
  prev: { success: boolean; url?: string; error?: string },
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as CMSStorageFolder | null;

  if (!file || !folder) {
    return { success: false, error: "File and folder are required" };
  }

  // Validate the file
  const validation = validateImage(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const filename = generateUniqueFilename(file.name);
  const storagePath = `${folder}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("cms")
    .upload(storagePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from("cms").getPublicUrl(storagePath);

  if (!data.publicUrl) {
    await supabase.storage.from("cms").remove([storagePath]);
    return { success: false, error: "Failed to generate public URL" };
  }

  return { success: true, url: data.publicUrl };
}

/**
 * Server action for deleting images
 */
export async function deleteImageAction(
  prev: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const storagePath = formData.get("path") as string | null;

  if (!storagePath || storagePath.trim() === "") {
    return { success: false, error: "Storage path is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from("cms").remove([storagePath]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// Legacy Hero Banner Action (for backward compatibility)
// ============================================================

export async function saveHeroBanner(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    title: formData.get("title")?.toString() || "",
    subtitle: formData.get("subtitle")?.toString() || "",
    button_text: formData.get("button_text")?.toString() || "",
    button_link: formData.get("button_link")?.toString() || "",
    image_url: formData.get("image_url")?.toString() || "",
  };

  const id = formData.get("id")?.toString();

  let error;

  if (id) {
    ({ error } = await supabase
      .from("hero_banner")
      .update(payload)
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("hero_banner").insert(payload));
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/dashboard/cms");
}

// ============================================================
// Public Company Data (for Footer, Header, Contact)
// ============================================================

export interface CompanyPublicData {
  brand_name: string;
  legal_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  business_hours: string;
  primary_color: string;
  secondary_color: string;
}

/**
 * Server action to fetch public company data for display components.
 * Uses the server Supabase client (authenticated via proxy/cookies).
 */
export async function getCompanyPublicData(): Promise<CompanyPublicData> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cms_company")
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .maybeSingle();

  return {
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
  };
}

// ============================================================
// Company Actions
// ============================================================

export async function saveCompany(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const payload: Record<string, unknown> = {
    brand_name: formData.get("brand_name")?.toString() || "",
    legal_name: formData.get("legal_name")?.toString() || "",
    tagline: formData.get("tagline")?.toString() || "",
    logo_url: formData.get("logo_url")?.toString() || "",
    favicon_url: formData.get("favicon_url")?.toString() || "",
    primary_color: formData.get("primary_color")?.toString() || "#4f46e5",
    secondary_color: formData.get("secondary_color")?.toString() || "#06b6d4",
    currency: formData.get("currency")?.toString() || "INR",
    timezone: formData.get("timezone")?.toString() || "Asia/Kolkata",
    language: formData.get("language")?.toString() || "en",
    gst: formData.get("gst")?.toString() || "",
    pan: formData.get("pan")?.toString() || "",
    address: formData.get("address")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    whatsapp: formData.get("whatsapp")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    support_email: formData.get("support_email")?.toString() || "",
    sales_email: formData.get("sales_email")?.toString() || "",
    website: formData.get("website")?.toString() || "",
    google_maps_url: formData.get("google_maps_url")?.toString() || "",
    business_hours: formData.get("business_hours")?.toString() || "",
  };

  const { data: existing } = await supabase
    .from("cms_company")
    .select("id")
    .eq("site_id", DEFAULT_SITE_ID)
    .single();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("cms_company")
      .update({ ...payload, updated_by: userId })
      .eq("site_id", DEFAULT_SITE_ID));
  } else {
    ({ error } = await supabase
      .from("cms_company")
      .insert({ ...payload, site_id: DEFAULT_SITE_ID, created_by: userId }));
  }

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  return createSuccessState("Company information saved successfully");
}

// ============================================================
// Homepage Actions
// ============================================================

export async function saveHomepage(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const statsJson = formData.get("stats")?.toString() || "[]";
  let stats: Array<{ label: string; value: string }>;
  try {
    stats = JSON.parse(statsJson);
  } catch {
    return createErrorState("Invalid stats format");
  }

  const payload: Record<string, unknown> = {
    hero_heading: formData.get("hero_heading")?.toString() || "",
    hero_subheading: formData.get("hero_subheading")?.toString() || "",
    hero_cta_text: formData.get("hero_cta_text")?.toString() || "",
    hero_cta_link: formData.get("hero_cta_link")?.toString() || "",
    hero_background_url: formData.get("hero_background_url")?.toString() || "",
    stats_heading: formData.get("stats_heading")?.toString() || "",
    stats: stats,
  };

  const { data: existing } = await supabase
    .from("cms_homepage")
    .select("id")
    .eq("site_id", DEFAULT_SITE_ID)
    .single();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("cms_homepage")
      .update({ ...payload, updated_by: userId })
      .eq("site_id", DEFAULT_SITE_ID));
  } else {
    ({ error } = await supabase
      .from("cms_homepage")
      .insert({ ...payload, site_id: DEFAULT_SITE_ID, created_by: userId }));
  }

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/");
  return createSuccessState("Homepage saved successfully");
}

// ============================================================
// SEO Actions
// ============================================================

export async function saveSEO(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const schemaJson = formData.get("schema_json")?.toString() || "{}";
  let schemaData: Record<string, unknown>;
  try {
    schemaData = JSON.parse(schemaJson);
  } catch {
    return createErrorState("Invalid schema format");
  }

  const payload: Record<string, unknown> = {
    meta_title: formData.get("meta_title")?.toString() || "",
    meta_description: formData.get("meta_description")?.toString() || "",
    meta_keywords: formData.get("meta_keywords")?.toString() || "",
    og_image_url: formData.get("og_image_url")?.toString() || "",
    canonical_url: formData.get("canonical_url")?.toString() || "",
    robots: formData.get("robots")?.toString() || "index, follow",
    schema_json: schemaData,
    twitter_card: formData.get("twitter_card")?.toString() || "summary_large_image",
    facebook_app_id: formData.get("facebook_app_id")?.toString() || "",
    google_verification: formData.get("google_verification")?.toString() || "",
    bing_verification: formData.get("bing_verification")?.toString() || "",
  };

  const { data: existing } = await supabase
    .from("cms_seo")
    .select("id")
    .eq("site_id", DEFAULT_SITE_ID)
    .single();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("cms_seo")
      .update({ ...payload, updated_by: userId })
      .eq("site_id", DEFAULT_SITE_ID));
  } else {
    ({ error } = await supabase
      .from("cms_seo")
      .insert({ ...payload, site_id: DEFAULT_SITE_ID, created_by: userId }));
  }

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  return createSuccessState("SEO settings saved successfully");
}

// ============================================================
// Social Actions
// ============================================================

export async function saveSocial(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const payload: Record<string, unknown> = {
    facebook_url: formData.get("facebook_url")?.toString() || "",
    instagram_url: formData.get("instagram_url")?.toString() || "",
    linkedin_url: formData.get("linkedin_url")?.toString() || "",
    youtube_url: formData.get("youtube_url")?.toString() || "",
    twitter_url: formData.get("twitter_url")?.toString() || "",
  };

  const { data: existing } = await supabase
    .from("cms_social")
    .select("id")
    .eq("site_id", DEFAULT_SITE_ID)
    .single();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("cms_social")
      .update({ ...payload, updated_by: userId })
      .eq("site_id", DEFAULT_SITE_ID));
  } else {
    ({ error } = await supabase
      .from("cms_social")
      .insert({ ...payload, site_id: DEFAULT_SITE_ID, created_by: userId }));
  }

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  return createSuccessState("Social links saved successfully");
}

// ============================================================
// Settings Actions
// ============================================================

export async function saveSettings(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const payload: Record<string, unknown> = {
    footer_text: formData.get("footer_text")?.toString() || "",
    copyright_text: formData.get("copyright_text")?.toString() || "",
    maintenance_mode: formData.get("maintenance_mode") === "on",
    maintenance_message:
      formData.get("maintenance_message")?.toString() ||
      "We are currently under maintenance. Please check back soon.",
    enable_blog: formData.get("enable_blog") === "on",
    enable_quote: formData.get("enable_quote") === "on",
    enable_whatsapp: formData.get("enable_whatsapp") === "on",
    enable_chatbot: formData.get("enable_chatbot") === "on",
    enable_call_button: formData.get("enable_call_button") === "on",
  };

  const { data: existing } = await supabase
    .from("cms_settings")
    .select("id")
    .eq("site_id", DEFAULT_SITE_ID)
    .single();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("cms_settings")
      .update({ ...payload, updated_by: userId })
      .eq("site_id", DEFAULT_SITE_ID));
  } else {
    ({ error } = await supabase
      .from("cms_settings")
      .insert({ ...payload, site_id: DEFAULT_SITE_ID, created_by: userId }));
  }

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  return createSuccessState("Settings saved successfully");
}