"use server";

// ============================================================
// Master Data — Server Actions
// SBBT CRM Next.js Project
//
// Generic CRUD server actions for all master data entities.
// Each entity has: list, getById, create, update, toggleActive, delete
// ============================================================

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID, type MasterDataFormState } from "./types";

// ============================================================
// Helper
// ============================================================

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

// ============================================================
// Generic CRUD Factory
// ============================================================

export type TableName =
  | "material_categories"
  | "brands"
  | "pricing_regions"
  | "units"
  | "vendors"
  | "tax_master"
  | "construction_activities"
  | "add_ons"
  | "rate_master";

/**
 * Lists all rows from a master data table.
 */
export async function listMasterData(table: TableName) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true, nullsFirst: false });

  if (error) {
    console.error(`Error listing ${table}:`, error.message);
    return [];
  }

  return data || [];
}

/**
 * Gets a single row by ID.
 */
export async function getMasterDataById(table: TableName, id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching ${table}:`, error.message);
    return null;
  }

  return data;
}

/**
 * Creates a new row in a master data table.
 */
export async function createMasterData(
  table: TableName,
  prevState: MasterDataFormState,
  formData: FormData
): Promise<MasterDataFormState> {
  const supabase = await createClient();
  const userId = await getUserId();

  // Convert FormData to a plain object
  const payload: Record<string, unknown> = {
    site_id: DEFAULT_SITE_ID,
  };

  for (const [key, value] of formData.entries()) {
    if (key === "$ACTION_ID" || key.startsWith("$")) continue;

    // Handle numeric fields
    if (
      [
        "display_order",
        "price",
        "base_rate_per_sqft",
        "labour_rate_per_sqft",
        "material_rate",
        "labour_rate",
        "wastage_percent",
        "contractor_margin_percent",
        "customer_margin_percent",
        "gst_percent",
        "rate",
        "conversion_factor",
      ].includes(key)
    ) {
      payload[key] = parseFloat(value as string) || 0;
    } else if (
      ["material_category_id", "brand_id", "unit_id", "vendor_id", "pricing_region_id"].includes(key)
    ) {
      const num = parseInt(value as string);
      payload[key] = isNaN(num) ? null : num;
    } else if (key === "is_active" || key === "is_featured") {
      payload[key] = value === "on" || value === "true";
    } else {
      payload[key] = (value as string).trim();
    }
  }

  if (userId) payload.created_by = userId;

  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error(`Error creating ${table}:`, error.message);
    return { success: false, message: `Failed to create: ${error.message}` };
  }

  revalidatePath("/dashboard/master-data");
  return { success: true, message: "Created successfully.", id: data?.id };
}

/**
 * Updates an existing row in a master data table.
 */
export async function updateMasterData(
  table: TableName,
  prevState: MasterDataFormState,
  formData: FormData
): Promise<MasterDataFormState> {
  const supabase = await createClient();
  const userId = await getUserId();

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return { success: false, message: "Invalid ID." };
  }

  const payload: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (key === "$ACTION_ID" || key.startsWith("$") || key === "id") continue;

    if (
      [
        "display_order",
        "price",
        "base_rate_per_sqft",
        "labour_rate_per_sqft",
        "material_rate",
        "labour_rate",
        "wastage_percent",
        "contractor_margin_percent",
        "customer_margin_percent",
        "gst_percent",
        "rate",
        "conversion_factor",
      ].includes(key)
    ) {
      payload[key] = parseFloat(value as string) || 0;
    } else if (
      ["material_category_id", "brand_id", "unit_id", "vendor_id", "pricing_region_id"].includes(key)
    ) {
      const num = parseInt(value as string);
      payload[key] = isNaN(num) ? null : num;
    } else if (key === "is_active" || key === "is_featured") {
      payload[key] = value === "on" || value === "true";
    } else {
      payload[key] = (value as string).trim();
    }
  }

  if (userId) payload.updated_by = userId;

  const { error } = await supabase
    .from(table)
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error(`Error updating ${table}:`, error.message);
    return { success: false, message: `Failed to update: ${error.message}` };
  }

  revalidatePath("/dashboard/master-data");
  return { success: true, message: "Updated successfully." };
}

/**
 * Toggles is_active status.
 */
export async function toggleMasterDataActive(
  table: TableName,
  _prevState: MasterDataFormState,
  formData: FormData
): Promise<MasterDataFormState> {
  const supabase = await createClient();
  const userId = await getUserId();

  const id = parseInt(formData.get("id") as string);
  const isActive = formData.get("is_active") === "on" || formData.get("is_active") === "true";

  if (isNaN(id)) {
    return { success: false, message: "Invalid ID." };
  }

  const { error } = await supabase
    .from(table)
    .update({ is_active: isActive, updated_by: userId })
    .eq("id", id);

  if (error) {
    console.error(`Error toggling ${table}:`, error.message);
    return { success: false, message: `Failed to toggle: ${error.message}` };
  }

  revalidatePath("/dashboard/master-data");
  return { success: true, message: isActive ? "Activated." : "Deactivated." };
}

/**
 * Deletes a row.
 */
export async function deleteMasterData(
  table: TableName,
  _prevState: MasterDataFormState,
  formData: FormData
): Promise<MasterDataFormState> {
  const supabase = await createClient();

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return { success: false, message: "Invalid ID." };
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting ${table}:`, error.message);
    return { success: false, message: `Failed to delete: ${error.message}` };
  }

  revalidatePath("/dashboard/master-data");
  return { success: true, message: "Deleted successfully." };
}

// ============================================================
// Reference Data (for dropdowns)
// ============================================================

/**
 * Fetches reference data for dropdown selects.
 */
export async function getReferenceData() {
  const supabase = await createClient();

  const [categories, brands, regions, unitsList, vendorsList, taxes] = await Promise.all([
    supabase.from("material_categories").select("id, name").eq("site_id", DEFAULT_SITE_ID).eq("is_active", true).order("name"),
    supabase.from("brands").select("id, name, material_category_id").eq("site_id", DEFAULT_SITE_ID).eq("is_active", true).order("name"),
    supabase.from("pricing_regions").select("id, region_name, city").eq("site_id", DEFAULT_SITE_ID).eq("is_active", true).order("region_name"),
    supabase.from("units").select("id, name, short_name").eq("site_id", DEFAULT_SITE_ID).eq("is_active", true).order("name"),
    supabase.from("vendors").select("id, name, company").eq("site_id", DEFAULT_SITE_ID).eq("is_active", true).order("name"),
    supabase.from("tax_master").select("id, name, rate").eq("site_id", DEFAULT_SITE_ID).eq("is_active", true).order("name"),
  ]);

  return {
    categories: categories.data || [],
    brands: brands.data || [],
    regions: regions.data || [],
    units: unitsList.data || [],
    vendors: vendorsList.data || [],
    taxes: taxes.data || [],
  };
}