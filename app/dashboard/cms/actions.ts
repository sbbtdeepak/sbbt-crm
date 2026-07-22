"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CMSFormState, DEFAULT_SITE_ID, CMSStorageFolder, CMSPackageFormState, CMSPackageFeature, CMSPackageSpecification, CMSPackageGalleryItem, CMSPackageFull, CMSPackageRow, CMSProjectFormState, CMSProjectGalleryItem, CMSProjectBeforeAfterItem, CMSProjectFull, CMSProjectRow } from "./types";

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

// ============================================================
// Package Actions
// ============================================================

/**
 * Slug generation helper: lowercase, hyphens, remove special chars
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/**
 * Server action to save (create or update) a package with its relations.
 * Handles features, specifications, and gallery as JSON arrays.
 */
export async function savePackage(
  prev: CMSPackageFormState,
  formData: FormData
): Promise<CMSPackageFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return { ...createErrorState("Authentication required"), errors: {} };
  }

  const packageId = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString() || "";
  const slug = formData.get("slug")?.toString() || generateSlug(name);

  // Validate required fields
  const errors: Record<string, string[]> = {};
  if (!name.trim()) errors.name = ["Package name is required"];
  if (!slug.trim()) errors.slug = ["Slug is required"];
  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix validation errors", errors, slug };
  }

  const price = parseFloat(formData.get("price")?.toString() || "0");
  if (isNaN(price) || price < 0) {
    errors.price = ["Valid price is required"];
    return { success: false, message: "Please fix validation errors", errors, slug };
  }

  // Parse JSON arrays
  let features: CMSPackageFeature[] = [];
  let specifications: CMSPackageSpecification[] = [];
  let gallery: CMSPackageGalleryItem[] = [];

  try {
    const featuresRaw = formData.get("features")?.toString();
    if (featuresRaw) features = JSON.parse(featuresRaw);
  } catch {
    errors.features = ["Invalid features format"];
  }

  try {
    const specsRaw = formData.get("specifications")?.toString();
    if (specsRaw) specifications = JSON.parse(specsRaw);
  } catch {
    errors.specifications = ["Invalid specifications format"];
  }

  try {
    const galleryRaw = formData.get("gallery")?.toString();
    if (galleryRaw) gallery = JSON.parse(galleryRaw);
  } catch {
    errors.gallery = ["Invalid gallery format"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix validation errors", errors, slug };
  }

  const payload: Record<string, unknown> = {
    name,
    slug,
    price,
    short_description: formData.get("short_description")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    display_order: parseInt(formData.get("display_order")?.toString() || "0", 10),
    is_active: formData.get("is_active") === "on",
    thumbnail_url: formData.get("thumbnail_url")?.toString() || "",
    banner_url: formData.get("banner_url")?.toString() || "",
    meta_title: formData.get("meta_title")?.toString() || "",
    meta_description: formData.get("meta_description")?.toString() || "",
    og_image_url: formData.get("og_image_url")?.toString() || "",
  };

  let packageIdNum: number;

  if (packageId) {
    // Update existing package
    const { error: updateError } = await supabase
      .from("cms_packages")
      .update({ ...payload, updated_by: userId })
      .eq("id", parseInt(packageId, 10));

    if (updateError) {
      return createErrorState(updateError.message);
    }
    packageIdNum = parseInt(packageId, 10);
  } else {
    // Insert new package
    const { data: insertData, error: insertError } = await supabase
      .from("cms_packages")
      .insert({ ...payload, site_id: DEFAULT_SITE_ID, created_by: userId })
      .select("id")
      .single();

    if (insertError || !insertData) {
      return createErrorState(insertError?.message || "Failed to create package");
    }
    packageIdNum = insertData.id;
  }

  // Replace features: delete all, then insert new
  const { error: delFeaturesError } = await supabase
    .from("cms_package_features")
    .delete()
    .eq("package_id", packageIdNum);

  if (delFeaturesError) {
    return createErrorState(`Failed to update features: ${delFeaturesError.message}`);
  }

  if (features.length > 0) {
    const { error: insFeaturesError } = await supabase
      .from("cms_package_features")
      .insert(
        features.map((f, i) => ({
          package_id: packageIdNum,
          icon: f.icon,
          title: f.title,
          description: f.description,
          display_order: i,
        }))
      );

    if (insFeaturesError) {
      return createErrorState(`Failed to save features: ${insFeaturesError.message}`);
    }
  }

  // Replace specifications
  const { error: delSpecsError } = await supabase
    .from("cms_package_specifications")
    .delete()
    .eq("package_id", packageIdNum);

  if (delSpecsError) {
    return createErrorState(`Failed to update specifications: ${delSpecsError.message}`);
  }

  if (specifications.length > 0) {
    const { error: insSpecsError } = await supabase
      .from("cms_package_specifications")
      .insert(
        specifications.map((s, i) => ({
          package_id: packageIdNum,
          category: s.category,
          item: s.item,
          brand: s.brand,
          remarks: s.remarks,
          display_order: i,
        }))
      );

    if (insSpecsError) {
      return createErrorState(`Failed to save specifications: ${insSpecsError.message}`);
    }
  }

  // Replace gallery
  const { error: delGalleryError } = await supabase
    .from("cms_package_gallery")
    .delete()
    .eq("package_id", packageIdNum);

  if (delGalleryError) {
    return createErrorState(`Failed to update gallery: ${delGalleryError.message}`);
  }

  if (gallery.length > 0) {
    const { error: insGalleryError } = await supabase
      .from("cms_package_gallery")
      .insert(
        gallery.map((g, i) => ({
          package_id: packageIdNum,
          image_url: g.image_url,
          caption: g.caption,
          display_order: i,
        }))
      );

    if (insGalleryError) {
      return createErrorState(`Failed to save gallery: ${insGalleryError.message}`);
    }
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/packages");
  return { success: true, message: "Package saved successfully", slug };
}

/**
 * Server action to delete a package and all its relations.
 */
export async function deletePackage(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const packageId = formData.get("id")?.toString();
  if (!packageId) {
    return createErrorState("Package ID is required");
  }

  // Relations are deleted via ON DELETE CASCADE
  const { error } = await supabase
    .from("cms_packages")
    .delete()
    .eq("id", parseInt(packageId, 10));

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/packages");
  return createSuccessState("Package deleted successfully");
}

/**
 * Server action to toggle package active status (publish/unpublish).
 */
export async function togglePackageActive(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const packageId = formData.get("id")?.toString();
  const currentActive = formData.get("is_active") === "on";

  if (!packageId) {
    return createErrorState("Package ID is required");
  }

  const { error } = await supabase
    .from("cms_packages")
    .update({ is_active: !currentActive, updated_by: userId })
    .eq("id", parseInt(packageId, 10));

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/packages");
  return createSuccessState(
    `Package ${currentActive ? "unpublished" : "published"} successfully`
  );
}

/**
 * Fetches all packages with their relations for the CMS list view.
 */
export async function getAllPackages(): Promise<CMSPackageFull[]> {
  const supabase = await createClient();

  const { data: packages, error } = await supabase
    .from("cms_packages")
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .order("display_order", { ascending: true });

  if (error || !packages) {
    return [];
  }

  const fullPackages: CMSPackageFull[] = [];

  for (const pkg of packages) {
    const [featuresResult, specsResult, galleryResult] = await Promise.all([
      supabase
        .from("cms_package_features")
        .select("*")
        .eq("package_id", pkg.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("cms_package_specifications")
        .select("*")
        .eq("package_id", pkg.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("cms_package_gallery")
        .select("*")
        .eq("package_id", pkg.id)
        .order("display_order", { ascending: true }),
    ]);

    fullPackages.push({
      package: pkg as CMSPackageRow,
      features: (featuresResult.data || []).map((f) => ({
        icon: f.icon,
        title: f.title,
        description: f.description,
      })),
      specifications: (specsResult.data || []).map((s) => ({
        category: s.category,
        item: s.item,
        brand: s.brand,
        remarks: s.remarks,
      })),
      gallery: (galleryResult.data || []).map((g) => ({
        image_url: g.image_url,
        caption: g.caption,
      })),
    });
  }

  return fullPackages;
}

/**
 * Fetches a single package with all relations by ID.
 */
export async function getPackageById(
  id: number
): Promise<CMSPackageFull | null> {
  const supabase = await createClient();

  const { data: pkg, error } = await supabase
    .from("cms_packages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !pkg) {
    return null;
  }

  const [featuresResult, specsResult, galleryResult] = await Promise.all([
    supabase
      .from("cms_package_features")
      .select("*")
      .eq("package_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("cms_package_specifications")
      .select("*")
      .eq("package_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("cms_package_gallery")
      .select("*")
      .eq("package_id", id)
      .order("display_order", { ascending: true }),
  ]);

  return {
    package: pkg as CMSPackageRow,
    features: (featuresResult.data || []).map((f) => ({
      icon: f.icon,
      title: f.title,
      description: f.description,
    })),
    specifications: (specsResult.data || []).map((s) => ({
      category: s.category,
      item: s.item,
      brand: s.brand,
      remarks: s.remarks,
    })),
  gallery: (galleryResult.data || []).map((g) => ({
    image_url: g.image_url,
    caption: g.caption,
  })),
  };
}

// ============================================================
// Project Actions
// ============================================================

/**
 * Server action to save (create or update) a project with its relations.
 * Handles gallery, before images, and after images as JSON arrays.
 */
export async function saveProject(
  prev: CMSProjectFormState,
  formData: FormData
): Promise<CMSProjectFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return { ...createErrorState("Authentication required"), errors: {} };
  }

  const projectId = formData.get("id")?.toString() || null;
  const name = formData.get("name")?.toString() || "";
  const slug = formData.get("slug")?.toString() || generateSlug(name);

  // Validate required fields
  const errors: Record<string, string[]> = {};
  if (!name.trim()) errors.name = ["Project name is required"];
  if (!slug.trim()) errors.slug = ["Slug is required"];
  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix validation errors", errors };
  }

  // Parse JSON arrays
  let gallery: CMSProjectGalleryItem[] = [];
  let beforeImages: CMSProjectBeforeAfterItem[] = [];
  let afterImages: CMSProjectBeforeAfterItem[] = [];

  try {
    const galleryRaw = formData.get("gallery")?.toString();
    if (galleryRaw) gallery = JSON.parse(galleryRaw);
  } catch {
    errors.gallery = ["Invalid gallery format"];
  }

  try {
    const beforeRaw = formData.get("before_images")?.toString();
    if (beforeRaw) beforeImages = JSON.parse(beforeRaw);
  } catch {
    errors.before_images = ["Invalid before images format"];
  }

  try {
    const afterRaw = formData.get("after_images")?.toString();
    if (afterRaw) afterImages = JSON.parse(afterRaw);
  } catch {
    errors.after_images = ["Invalid after images format"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix validation errors", errors };
  }

  // Parse numeric fields
  const customerRating = parseFloat(formData.get("customer_rating")?.toString() || "0");
  const displayOrder = parseInt(formData.get("display_order")?.toString() || "0", 10);

  const payload: Record<string, unknown> = {
    name,
    slug,
    client_name: formData.get("client_name")?.toString() || "",
    location: formData.get("location")?.toString() || "",
    project_type: formData.get("project_type")?.toString() || "",
    package_used: formData.get("package_used")?.toString() || "",
    plot_area: formData.get("plot_area")?.toString() || "",
    built_up_area: formData.get("built_up_area")?.toString() || "",
    floors: formData.get("floors")?.toString() || "",
    completion_date: formData.get("completion_date")?.toString() || "",
    status: formData.get("status")?.toString() || "ongoing",
    short_description: formData.get("short_description")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    cover_image_url: formData.get("cover_image_url")?.toString() || "",
    video_url: formData.get("video_url")?.toString() || "",
    project_value: formData.get("project_value")?.toString() || "",
    duration: formData.get("duration")?.toString() || "",
    team_size: formData.get("team_size")?.toString() || "",
    customer_rating: isNaN(customerRating) ? 0 : customerRating,
    display_order: displayOrder,
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    meta_title: formData.get("meta_title")?.toString() || "",
    meta_description: formData.get("meta_description")?.toString() || "",
    og_image_url: formData.get("og_image_url")?.toString() || "",
  };

  let projectIdNum: number;

  if (projectId) {
    // Update existing project
    const { error: updateError } = await supabase
      .from("cms_projects")
      .update({ ...payload, updated_by: userId })
      .eq("id", parseInt(projectId, 10));

    if (updateError) {
      return createErrorState(updateError.message);
    }
    projectIdNum = parseInt(projectId, 10);
  } else {
    // Insert new project
    const { data: insertData, error: insertError } = await supabase
      .from("cms_projects")
      .insert({ ...payload, site_id: DEFAULT_SITE_ID, created_by: userId })
      .select("id")
      .single();

    if (insertError || !insertData) {
      return createErrorState(insertError?.message || "Failed to create project");
    }
    projectIdNum = insertData.id;
  }

  // Replace gallery
  const { error: delGalleryError } = await supabase
    .from("cms_project_gallery")
    .delete()
    .eq("project_id", projectIdNum);

  if (delGalleryError) {
    return createErrorState(`Failed to update gallery: ${delGalleryError.message}`);
  }

  if (gallery.length > 0) {
    const { error: insGalleryError } = await supabase
      .from("cms_project_gallery")
      .insert(
        gallery.map((g, i) => ({
          project_id: projectIdNum,
          image_url: g.image_url,
          caption: g.caption,
          display_order: i,
        }))
      );

    if (insGalleryError) {
      return createErrorState(`Failed to save gallery: ${insGalleryError.message}`);
    }
  }

  // Replace before images
  const { error: delBeforeError } = await supabase
    .from("cms_project_before_images")
    .delete()
    .eq("project_id", projectIdNum);

  if (delBeforeError) {
    return createErrorState(`Failed to update before images: ${delBeforeError.message}`);
  }

  if (beforeImages.length > 0) {
    const { error: insBeforeError } = await supabase
      .from("cms_project_before_images")
      .insert(
        beforeImages.map((b, i) => ({
          project_id: projectIdNum,
          image_url: b.image_url,
          caption: b.caption,
          display_order: i,
        }))
      );

    if (insBeforeError) {
      return createErrorState(`Failed to save before images: ${insBeforeError.message}`);
    }
  }

  // Replace after images
  const { error: delAfterError } = await supabase
    .from("cms_project_after_images")
    .delete()
    .eq("project_id", projectIdNum);

  if (delAfterError) {
    return createErrorState(`Failed to update after images: ${delAfterError.message}`);
  }

  if (afterImages.length > 0) {
    const { error: insAfterError } = await supabase
      .from("cms_project_after_images")
      .insert(
        afterImages.map((a, i) => ({
          project_id: projectIdNum,
          image_url: a.image_url,
          caption: a.caption,
          display_order: i,
        }))
      );

    if (insAfterError) {
      return createErrorState(`Failed to save after images: ${insAfterError.message}`);
    }
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/projects");
  return { success: true, message: "Project saved successfully" };
}

/**
 * Server action to delete a project and all its relations.
 */
export async function deleteProject(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const projectId = formData.get("id")?.toString();
  if (!projectId) {
    return createErrorState("Project ID is required");
  }

  // Relations are deleted via ON DELETE CASCADE
  const { error } = await supabase
    .from("cms_projects")
    .delete()
    .eq("id", parseInt(projectId, 10));

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/projects");
  return createSuccessState("Project deleted successfully");
}

/**
 * Server action to toggle project active status (publish/unpublish).
 */
export async function toggleProjectActive(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const projectId = formData.get("id")?.toString();
  const currentActive = formData.get("is_active") === "on";

  if (!projectId) {
    return createErrorState("Project ID is required");
  }

  const { error } = await supabase
    .from("cms_projects")
    .update({ is_active: !currentActive, updated_by: userId })
    .eq("id", parseInt(projectId, 10));

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/projects");
  return createSuccessState(
    `Project ${currentActive ? "unpublished" : "published"} successfully`
  );
}

/**
 * Server action to toggle project featured status.
 */
export async function toggleProjectFeatured(
  prev: CMSFormState,
  formData: FormData
): Promise<CMSFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return createErrorState("Authentication required");
  }

  const projectId = formData.get("id")?.toString();
  const currentFeatured = formData.get("is_featured") === "on";

  if (!projectId) {
    return createErrorState("Project ID is required");
  }

  const { error } = await supabase
    .from("cms_projects")
    .update({ is_featured: !currentFeatured, updated_by: userId })
    .eq("id", parseInt(projectId, 10));

  if (error) {
    return createErrorState(error.message);
  }

  revalidatePath("/dashboard/cms");
  revalidatePath("/projects");
  return createSuccessState(
    `Project ${currentFeatured ? "removed from featured" : "marked as featured"} successfully`
  );
}

/**
 * Fetches all projects with their relations for the CMS list view.
 */
export async function getAllProjects(): Promise<CMSProjectFull[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("cms_projects")
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .order("display_order", { ascending: true });

  if (error || !projects) {
    return [];
  }

  const fullProjects: CMSProjectFull[] = [];

  for (const project of projects) {
    const [galleryResult, beforeResult, afterResult] = await Promise.all([
      supabase
        .from("cms_project_gallery")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("cms_project_before_images")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("cms_project_after_images")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order", { ascending: true }),
    ]);

    fullProjects.push({
      project: project as CMSProjectRow,
      gallery: (galleryResult.data || []).map((g) => ({
        image_url: g.image_url,
        caption: g.caption,
      })),
      beforeImages: (beforeResult.data || []).map((b) => ({
        image_url: b.image_url,
        caption: b.caption,
      })),
      afterImages: (afterResult.data || []).map((a) => ({
        image_url: a.image_url,
        caption: a.caption,
      })),
    });
  }

  return fullProjects;
}

/**
 * Fetches a single project with all relations by ID.
 */
export async function getProjectById(
  id: number
): Promise<CMSProjectFull | null> {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("cms_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    return null;
  }

  const [galleryResult, beforeResult, afterResult] = await Promise.all([
    supabase
      .from("cms_project_gallery")
      .select("*")
      .eq("project_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("cms_project_before_images")
      .select("*")
      .eq("project_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("cms_project_after_images")
      .select("*")
      .eq("project_id", id)
      .order("display_order", { ascending: true }),
  ]);

  return {
    project: project as CMSProjectRow,
    gallery: (galleryResult.data || []).map((g) => ({
      image_url: g.image_url,
      caption: g.caption,
    })),
    beforeImages: (beforeResult.data || []).map((b) => ({
      image_url: b.image_url,
      caption: b.caption,
    })),
    afterImages: (afterResult.data || []).map((a) => ({
      image_url: a.image_url,
      caption: a.caption,
    })),
  };
}
