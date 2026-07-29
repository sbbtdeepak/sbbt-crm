/**
 * Brands module utilities
 * Helper functions for brand operations
 */

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "@/app/dashboard/cms/types";

/**
 * Get all active brands for homepage display
 */
export async function getActiveBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_brands")
    .select("id, name, category, logo_url, website_url, display_order, is_active")
    .eq("site_id", DEFAULT_SITE_ID)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching active brands:", error);
    return [];
  }

  return data || [];
}

/**
 * Get brand by ID
 */
export async function getBrandById(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_brands")
    .select("*")
    .eq("id", id)
    .eq("site_id", DEFAULT_SITE_ID)
    .single();

  if (error) {
    console.error("Error fetching brand:", error);
    return null;
  }

  return data;
}

/**
 * Check for duplicate brand names
 */
export async function checkDuplicateBrandName(name: string, excludeId?: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_brands")
    .select("id")
    .eq("site_id", DEFAULT_SITE_ID)
    .eq("name", name.trim())
    .neq("id", excludeId ?? 0)
    .limit(1);

  if (error) {
    console.error("Error checking duplicate brand:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/**
 * Get all brands (admin view)
 */
export async function getAllBrands(search?: string, categoryFilter?: string, activeFilter?: boolean) {
  const supabase = await createClient();
  
  let query = supabase
    .from("cms_brands")
    .select("*")
    .order("display_order", { ascending: true });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  if (activeFilter !== undefined) {
    query = query.eq("is_active", activeFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }

  return data || [];
}

/**
 * Get unique categories for filter dropdown
 */
export async function getBrandCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_brands")
    .select("category")
    .eq("site_id", DEFAULT_SITE_ID)
    .neq("category", "")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  const categories = [...new Set(data?.map((item) => item.category) || [])];
  return categories.sort();
}

/**
 * Reorder brands by display_order
 */
export async function reorderBrands(orders: Array<{ id: number; display_order: number }>) {
  const supabase = await createClient();

  for (const item of orders) {
    const { error } = await supabase
      .from("cms_brands")
      .update({ display_order: item.display_order })
      .eq("id", item.id)
      .eq("site_id", DEFAULT_SITE_ID);

    if (error) {
      console.error(`Error updating brand ${item.id}:`, error);
      return { success: false, message: `Failed to reorder brand: ${error.message}` };
    }
  }

  return { success: true, message: "Brands reordered successfully" };
}

/**
 * Upload brand logo to storage
 */
export async function uploadBrandLogo(file: File, brandName: string): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  const supabase = await createClient();
  
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).slice(2, 8);
  const safeName = brandName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+$/, "")
    .slice(0, 30);
  
  const filename = `${safeName}-${timestamp}-${randomStr}.${extension}`;
  const storagePath = `brands/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("cms")
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading brand logo:", uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from("cms").getPublicUrl(storagePath);
  
  return { success: true, url: urlData.publicUrl, path: storagePath };
}

/**
 * Delete brand logo from storage
 */
export async function deleteBrandLogo(storagePath: string): Promise<{ success: boolean; error?: string }> {
  if (!storagePath) {
    return { success: true }; // Nothing to delete
  }

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("cms")
    .remove([storagePath]);

  if (error) {
    console.error("Error deleting brand logo:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Check for orphan files in brands folder
 */
export async function checkOrphanBrandFiles(): Promise<string[]> {
  const supabase = await createClient();
  
  // Get all stored brand files
  const { data: storedFiles, error: listError } = await supabase.storage
    .from("cms")
    .list("brands");

  if (listError) {
    console.error("Error listing brand files:", listError);
    return [];
  }

  // Get all brand logo URLs from database
  const { data: brands, error: dbError } = await supabase
    .from("cms_brands")
    .select("logo_url")
    .eq("site_id", DEFAULT_SITE_ID);

  if (dbError) {
    console.error("Error fetching brand URLs:", dbError);
    return [];
  }

  const validPaths = new Set(
    (brands || [])
      .map((b) => {
        const url = b.logo_url;
        if (!url) return null;
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/cms/");
        return pathParts.length > 1 ? pathParts[1] : null;
      })
      .filter((p): p is string => p !== null)
  );

  // Find orphan files
  const orphanFiles = (storedFiles || [])
    .map((f) => `brands/${f.name}`)
    .filter((path) => !validPaths.has(path));

  return orphanFiles;
}

/**
 * Search brands with filters
 */
export interface BrandSearchParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: "display_order" | "name" | "created_at" | "updated_at";
  sortDirection?: "asc" | "desc";
}

export async function searchBrands(params: BrandSearchParams) {
  const supabase = await createClient();
  
  let query = supabase.from("cms_brands").select("*");

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,category.ilike.%${params.search}%`);
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.isActive !== undefined) {
    query = query.eq("is_active", params.isActive);
  }

  const sortField = params.sortBy || "display_order";
  const sortDirection = params.sortDirection || "asc";
  query = query.order(sortField, { ascending: sortDirection === "asc" });

  const { data, error } = await query;

  if (error) {
    console.error("Error searching brands:", error);
    return [];
  }

  return data || [];
}