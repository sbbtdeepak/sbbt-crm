"use server";

// ============================================================
// Estimate Engine — Server Actions
// SBBT CRM Next.js Project
//
// Follows the existing Server Action pattern from:
//   - app/dashboard/leads/actions.ts
//   - app/dashboard/cms/actions.ts
//   - app/dashboard/master-data/actions.ts
//
// All actions use:
//   - createClient() from @/lib/supabase/server
//   - revalidatePath() for cache invalidation
//   - { success, message } return shape
//   - getCurrentUserId() for audit trail
// ============================================================

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SITE_ID,
  ESTIMATE_STATUSES,
  type EstimateRow,
  type EstimateItemRow,
  type EstimateVersionRow,
  type EstimateNoteRow,
  type EstimateAttachmentRow,
  type EstimateQueryParams,
  type EstimateQueryResult,
  type EstimateFormState,
  type EstimateWithRelations,
  type PricingEngineInput,
  type PricingItem,
} from "./types";
import { calculatePricing, calculateItemTotal } from "./lib/pricing-engine";
import {
  notifyNewEstimate,
  notifyEstimateStatusChange,
  notifyEstimateNoteAdded,
} from "./lib/estimate-notifications";

// ============================================================
// Constants
// ============================================================

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Gets the current authenticated user's ID.
 * Used for audit trail (created_by, updated_by).
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Sanitizes a string value by trimming whitespace.
 * Accepts FormDataEntryValue (string | File | null) for direct use with formData.get().
 */
function sanitizeInput(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, 2000);
}

/**
 * Parses a numeric value from a string, returning 0 on failure.
 * Accepts FormDataEntryValue for direct use with formData.get().
 */
function parseNumber(value: unknown): number {
  if (!value) return 0;
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
}

/**
 * Parses an integer value from a string, returning 0 on failure.
 * Accepts FormDataEntryValue for direct use with formData.get().
 * Uses Number.parseInt to avoid shadowing the global parseInt.
 */
function parseInteger(value: unknown): number {
  if (!value) return 0;
  const num = Number.parseInt(String(value), 10);
  return isNaN(num) ? 0 : num;
}

// ============================================================
// Master Data Fetching (for wizard dropdowns)
// ============================================================

/**
 * Fetches pricing regions for the location dropdown.
 * Read-only from master data.
 */
export async function getPricingRegions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_regions")
    .select("id, region_name, city, state, base_rate_per_sqft, labour_rate_per_sqft, currency")
    .eq("site_id", DEFAULT_SITE_ID)
    .eq("is_active", true)
    .order("region_name");

  if (error) {
    console.error("Failed to fetch pricing regions:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Fetches packages for the package selection step.
 * Read-only from CMS master data.
 */
export async function getPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_packages")
    .select("id, name, slug, price, short_description, target_segment, thumbnail_url")
    .eq("site_id", DEFAULT_SITE_ID)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch packages:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Fetches add-ons for the add-ons selection step.
 * Read-only from master data.
 */
export async function getAddOns() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("add_ons")
    .select("id, name, description, price, unit_type, material_category_id")
    .eq("site_id", DEFAULT_SITE_ID)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch add-ons:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Fetches rate master items for a given package.
 * These are the line items that make up the package pricing.
 * Read-only from master data.
 */
export async function getPackageRateItems(packageId: number) {
  const supabase = await createClient();

  // Fetch package specifications with rate_master links
  const { data: specs, error: specsError } = await supabase
    .from("cms_package_specifications")
    .select("category, item, brand, remarks, rate_master_id")
    .eq("package_id", packageId);

  if (specsError) {
    console.error("Failed to fetch package specs:", specsError.message);
    return [];
  }

  // Fetch rate master data for each specification
  const rateMasterIds = specs
    .map((s) => s.rate_master_id)
    .filter((id) => id !== null) as number[];

  if (rateMasterIds.length === 0) {
    return [];
  }

  const { data: rates, error: ratesError } = await supabase
    .from("rate_master")
    .select("*")
    .in("id", rateMasterIds)
    .eq("is_active", true);

  if (ratesError) {
    console.error("Failed to fetch rate master:", ratesError.message);
    return [];
  }

  // Map specs to rate master items
  return specs.map((spec) => {
    const rate = rates.find((r) => r.id === spec.rate_master_id);
    return {
      item_name: spec.item,
      category: spec.category,
      brand: spec.brand,
      quantity: 1,
      unit: "sqft",
      material_rate: rate?.material_rate || 0,
      labour_rate: rate?.labour_rate || 0,
      wastage_percent: rate?.wastage_percent || 0,
      contractor_margin_percent: rate?.contractor_margin_percent || 0,
      customer_margin_percent: rate?.customer_margin_percent || 0,
      gst_percent: rate?.gst_percent || 18,
      rate_master_id: rate?.id,
      remarks: spec.remarks,
    };
  });
}

/**
 * Fetches add-on rate items by IDs.
 * Read-only from master data.
 */
export async function getAddOnItems(addOnIds: number[]) {
  if (addOnIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("add_ons")
    .select("id, name, description, price, unit_type, material_category_id")
    .in("id", addOnIds)
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch add-on items:", error.message);
    return [];
  }

  return data.map((addon) => ({
    item_name: addon.name,
    category: "Add-on",
    brand: "",
    quantity: 1,
    unit: addon.unit_type || "flat",
    material_rate: addon.price || 0,
    labour_rate: 0,
    wastage_percent: 0,
    contractor_margin_percent: 0,
    customer_margin_percent: 0,
    gst_percent: 18,
    add_on_id: addon.id,
    description: addon.description,
  }));
}

// ============================================================
// Lead Integration (CRM)
// ============================================================

/**
 * Searches for an existing lead by mobile number.
 * Used in Step 11 — CRM Integration.
 */
export async function findLeadByMobile(mobile: string): Promise<{
  id: number;
  lead_number: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
} | null> {
  if (!mobile) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_leads")
    .select("id, lead_number, full_name, mobile_number, email")
    .eq("mobile_number", mobile)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Failed to find lead by mobile:", error.message);
    return null;
  }

  return data;
}

/**
 * Creates a new lead from estimate customer data.
 * Used in Step 11 — CRM Integration (when no existing lead found).
 * Reuses the existing createLeadFromAPI pattern.
 */
export async function createLeadFromEstimate(
  customerName: string,
  customerMobile: string,
  customerEmail: string
): Promise<number | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("contact_leads")
    .insert({
      full_name: customerName,
      mobile_number: customerMobile,
      email: customerEmail,
      source: "estimate_engine",
      status: "new",
      service_required: "estimate",
      site_id: DEFAULT_SITE_ID,
      created_by: userId,
      name: customerName,
      phone: customerMobile,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create lead from estimate:", error.message);
    return null;
  }

  revalidatePath("/dashboard/leads");
  return data?.id || null;
}

// ============================================================
// Estimate Creation
// ============================================================

/**
 * Creates a new estimate from wizard form data.
 *
 * This is the single entry point for all estimate creation.
 *
 * Features:
 * - Server-side validation
 * - Pricing calculation via pricing-engine.ts (no hardcoded values)
 * - Version 1 saved automatically
 * - Estimate number auto-generated (EST-YYYY-NNNNNN)
 * - CRM integration: links to existing lead or creates new
 * - Notification trigger via Notification Hub
 *
 * @param prevState Previous form state
 * @param formData Wizard form data
 * @returns EstimateFormState with success/error status
 */
export async function createEstimate(
  prevState: EstimateFormState,
  formData: FormData
): Promise<EstimateFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  // --- Extract customer information (Step 1) ---
  const customer_name = sanitizeInput(formData.get("customer_name"));
  const customer_mobile = sanitizeInput(formData.get("customer_mobile"));
  const customer_email = sanitizeInput(formData.get("customer_email"));
  const lead_id = formData.get("lead_id") ? parseInteger(formData.get("lead_id") as string) : null;

  // --- Extract project information (Step 2) ---
  const project_type = sanitizeInput(formData.get("project_type")) || "residential";

  // --- Extract location (Step 3) ---
  const pricing_region_id = formData.get("pricing_region_id")
    ? parseInteger(formData.get("pricing_region_id") as string)
    : null;
  const region_name = sanitizeInput(formData.get("region_name"));
  const base_rate_per_sqft = parseNumber(formData.get("base_rate_per_sqft") as string);
  const labour_rate_per_sqft = parseNumber(formData.get("labour_rate_per_sqft") as string);
  const currency = sanitizeInput(formData.get("currency")) || "INR";

  // --- Extract plot information (Step 4) ---
  const plot_width = parseNumber(formData.get("plot_width") as string);
  const plot_length = parseNumber(formData.get("plot_length") as string);
  const plot_area = parseNumber(formData.get("plot_area") as string);
  const road_facing = sanitizeInput(formData.get("road_facing"));
  const basement = formData.get("basement") === "on" || formData.get("basement") === "true";
  const stilt = formData.get("stilt") === "on" || formData.get("stilt") === "true";

  // --- Extract floors (Step 5) ---
  const floors = sanitizeInput(formData.get("floors")) || "ground";
  const custom_floors = parseInteger(formData.get("custom_floors") as string) || 1;

  // --- Extract package (Step 6) ---
  const package_id = formData.get("package_id")
    ? parseInteger(formData.get("package_id") as string)
    : null;
  const package_name = sanitizeInput(formData.get("package_name"));
  const package_price = parseNumber(formData.get("package_price") as string);

  // --- Extract add-ons (Step 7) ---
  const add_on_ids_raw = formData.get("add_on_ids") as string;
  const add_on_ids: number[] = add_on_ids_raw
    ? add_on_ids_raw.split(",").map((id) => parseInteger(id.trim())).filter((id) => !isNaN(id))
    : [];

  // --- Extract calculation overrides (Step 8) ---
  const discount_amount = parseNumber(formData.get("discount_amount") as string);
  const tax_rate = parseNumber(formData.get("tax_rate") as string) || 18;

  // --- Extract notes ---
  const notes = sanitizeInput(formData.get("notes"));

  // --- Validation ---
  if (!customer_name) {
    return { success: false, message: "Customer name is required" };
  }
  if (!customer_mobile) {
    return { success: false, message: "Customer mobile is required" };
  }

  // --- Calculate total area ---
  const total_area = plot_area > 0 ? plot_area : plot_width * plot_length;

  // --- Fetch package items from master data ---
  let packageItems: PricingItem[] = [];
  if (package_id) {
    const items = await getPackageRateItems(package_id);
    packageItems = items.map((item) => ({
      item_name: item.item_name,
      category: item.category,
      brand: item.brand,
      quantity: item.quantity,
      unit: item.unit,
      material_rate: item.material_rate,
      labour_rate: item.labour_rate,
      wastage_percent: item.wastage_percent,
      contractor_margin_percent: item.contractor_margin_percent,
      customer_margin_percent: item.customer_margin_percent,
      gst_percent: item.gst_percent,
    }));
  }

  // --- Fetch add-on items from master data ---
  let addOnItems: PricingItem[] = [];
  if (add_on_ids.length > 0) {
    const items = await getAddOnItems(add_on_ids);
    addOnItems = items.map((item) => ({
      item_name: item.item_name,
      category: item.category,
      brand: item.brand,
      quantity: item.quantity,
      unit: item.unit,
      material_rate: item.material_rate,
      labour_rate: item.labour_rate,
      wastage_percent: item.wastage_percent,
      contractor_margin_percent: item.contractor_margin_percent,
      customer_margin_percent: item.customer_margin_percent,
      gst_percent: item.gst_percent,
    }));
  }

  // --- Run pricing engine (pure calculation, no hardcoded values) ---
  const pricingInput: PricingEngineInput = {
    plot_area,
    total_area,
    base_rate_per_sqft,
    labour_rate_per_sqft,
    packageItems,
    addOnItems,
    discount_amount,
    tax_rate,
  };

  const pricing = calculatePricing(pricingInput);

  // --- CRM Integration (Step 11) ---
  let resolvedLeadId = lead_id;
  if (!resolvedLeadId && customer_mobile) {
    // Check if lead exists
    const existingLead = await findLeadByMobile(customer_mobile);
    if (existingLead) {
      resolvedLeadId = existingLead.id;
    } else {
      // Create new lead
      resolvedLeadId = await createLeadFromEstimate(
        customer_name,
        customer_mobile,
        customer_email
      );
    }
  }

  // --- Build estimate payload ---
  const estimatePayload: Record<string, unknown> = {
    site_id: DEFAULT_SITE_ID,
    status: "calculated",
    version: 1,
    project_type,
    pricing_region_id,
    region_name,
    package_id,
    package_name,
    package_price,
    currency,
    plot_width,
    plot_length,
    plot_area,
    road_facing,
    basement,
    stilt,
    floors,
    custom_floors,
    total_area,
    base_rate_per_sqft,
    labour_rate_per_sqft,
    construction_cost: pricing.construction_cost,
    material_cost: pricing.material_cost,
    labour_cost: pricing.labour_cost,
    wastage_amount: pricing.wastage_amount,
    contractor_margin_amount: pricing.contractor_margin_amount,
    customer_margin_amount: pricing.customer_margin_amount,
    discount_amount: pricing.discount_amount,
    tax_rate: pricing.tax_rate,
    gst_amount: pricing.gst_amount,
    grand_total: pricing.grand_total,
    customer_name,
    customer_mobile,
    customer_email,
    lead_id: resolvedLeadId,
    notes,
    created_by: userId,
    updated_by: userId,
  };

  // --- Insert estimate ---
  const { data: estimateData, error: estimateError } = await supabase
    .from("estimates")
    .insert(estimatePayload)
    .select("*")
    .single();

  if (estimateError) {
    console.error("Estimate creation error:", estimateError.message);
    return {
      success: false,
      message: `Failed to create estimate: ${estimateError.message}`,
    };
  }

  const estimate = estimateData as EstimateRow;

  // --- Insert estimate items ---
  const itemPayloads: Record<string, unknown>[] = [];

  // Package items
  if (package_id) {
    const pkgItems = await getPackageRateItems(package_id);
    pkgItems.forEach((item, index) => {
      const pricingItem: PricingItem = {
        item_name: item.item_name,
        category: item.category,
        brand: item.brand,
        quantity: item.quantity,
        unit: item.unit,
        material_rate: item.material_rate,
        labour_rate: item.labour_rate,
        wastage_percent: item.wastage_percent,
        contractor_margin_percent: item.contractor_margin_percent,
        customer_margin_percent: item.customer_margin_percent,
        gst_percent: item.gst_percent,
      };

      itemPayloads.push({
        site_id: DEFAULT_SITE_ID,
        estimate_id: estimate.id,
        item_source: "PACKAGE",
        item_id: item.rate_master_id,
        item_name: item.item_name,
        category: item.category,
        brand: item.brand,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.material_rate + item.labour_rate,
        material_rate: item.material_rate,
        labour_rate: item.labour_rate,
        wastage_percent: item.wastage_percent,
        contractor_margin_percent: item.contractor_margin_percent,
        customer_margin_percent: item.customer_margin_percent,
        gst_percent: item.gst_percent,
        amount: calculateItemTotal(pricingItem),
        sort_order: index,
      });
    });
  }

  // Add-on items
  if (add_on_ids.length > 0) {
    const addonItems = await getAddOnItems(add_on_ids);
    addonItems.forEach((item, index) => {
      const pricingItem: PricingItem = {
        item_name: item.item_name,
        category: item.category,
        brand: item.brand,
        quantity: item.quantity,
        unit: item.unit,
        material_rate: item.material_rate,
        labour_rate: item.labour_rate,
        wastage_percent: item.wastage_percent,
        contractor_margin_percent: item.contractor_margin_percent,
        customer_margin_percent: item.customer_margin_percent,
        gst_percent: item.gst_percent,
      };

      itemPayloads.push({
        site_id: DEFAULT_SITE_ID,
        estimate_id: estimate.id,
        item_source: "ADDON",
        item_id: item.add_on_id,
        item_name: item.item_name,
        category: item.category,
        brand: item.brand,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.material_rate,
        material_rate: item.material_rate,
        labour_rate: item.labour_rate,
        wastage_percent: item.wastage_percent,
        contractor_margin_percent: item.contractor_margin_percent,
        customer_margin_percent: item.customer_margin_percent,
        gst_percent: item.gst_percent,
        amount: calculateItemTotal(pricingItem),
        sort_order: 1000 + index,
      });
    });
  }

  if (itemPayloads.length > 0) {
    const { error: itemsError } = await supabase
      .from("estimate_items")
      .insert(itemPayloads);

    if (itemsError) {
      console.error("Estimate items creation error:", itemsError.message);
      // Don't fail — estimate is created, items can be added later
    }
  }

  // --- Save version 1 snapshot ---
  const versionPayload = {
    site_id: DEFAULT_SITE_ID,
    estimate_id: estimate.id,
    version_number: 1,
    version_name: "Initial Estimate",
    change_reason: "Initial estimate creation",
    data: JSON.stringify({
      estimate,
      items: itemPayloads,
      pricing,
    }),
    created_by: userId,
  };

  const { error: versionError } = await supabase
    .from("estimate_versions")
    .insert(versionPayload);

  if (versionError) {
    console.error("Version save error:", versionError.message);
  }

  // --- Revalidate paths ---
  revalidatePath("/dashboard/estimate-engine");

  // --- Fire notification (fire-and-forget) ---
  notifyNewEstimate(estimate).catch((err) =>
    console.error("Estimate notification error:", err)
  );

  return {
    success: true,
    message: `Estimate ${estimate.estimate_number} created successfully!`,
    estimate,
  };
}

// ============================================================
// Estimate Fetching
// ============================================================

/**
 * Fetches estimates with search, filter, and pagination.
 * Used by the admin Estimate Dashboard.
 */
export async function getEstimates(
  params: EstimateQueryParams
): Promise<EstimateQueryResult> {
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit || DEFAULT_PAGE_SIZE));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("estimates")
    .select("*", { count: "exact" });

  // Search: match estimate_number, customer_name, customer_mobile, customer_email
  if (params.search && params.search.trim()) {
    const searchTerm = params.search.trim();
    query = query.or(
      `estimate_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,customer_mobile.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`
    );
  }

  // Filter by status
  if (params.status && params.status.trim()) {
    query = query.eq("status", params.status.trim());
  }

  // Filter by project type
  if (params.project_type && params.project_type.trim()) {
    query = query.eq("project_type", params.project_type.trim());
  }

  // Filter by region
  if (params.region_id && params.region_id.trim()) {
    query = query.eq("pricing_region_id", parseInteger(params.region_id));
  }

  // Filter by package
  if (params.package_id && params.package_id.trim()) {
    query = query.eq("package_id", parseInteger(params.package_id));
  }

  // Filter by customer
  if (params.customer && params.customer.trim()) {
    query = query.or(
      `customer_name.ilike.%${params.customer}%,customer_mobile.ilike.%${params.customer}%`
    );
  }

  // Filter by date range
  if (params.date_from && params.date_from.trim()) {
    query = query.gte("created_at", params.date_from.trim());
  }
  if (params.date_to && params.date_to.trim()) {
    query = query.lte("created_at", params.date_to.trim());
  }

  // Order by created_at descending (latest first)
  query = query.order("created_at", { ascending: false });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch estimates:", error.message);
    return {
      data: [],
      count: 0,
      page,
      limit,
      total_pages: 0,
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: (data || []) as EstimateRow[],
    count: total,
    page,
    limit,
    total_pages: totalPages,
  };
}

/**
 * Fetches a single estimate by ID, including items, versions, notes, and attachments.
 */
export async function getEstimateById(id: number): Promise<EstimateWithRelations | null> {
  const supabase = await createClient();

  const { data: estimate, error: estimateError } = await supabase
    .from("estimates")
    .select("*")
    .eq("id", id)
    .single();

  if (estimateError) {
    console.error("Failed to fetch estimate:", estimateError.message);
    return null;
  }

  // Fetch items
  const { data: items } = await supabase
    .from("estimate_items")
    .select("*")
    .eq("estimate_id", id)
    .order("sort_order", { ascending: true });

  // Fetch versions
  const { data: versions } = await supabase
    .from("estimate_versions")
    .select("*")
    .eq("estimate_id", id)
    .order("version_number", { ascending: false });

  // Fetch notes
  const { data: notes } = await supabase
    .from("estimate_notes")
    .select("*")
    .eq("estimate_id", id)
    .order("created_at", { ascending: false });

  // Fetch attachments
  const { data: attachments } = await supabase
    .from("estimate_attachments")
    .select("*")
    .eq("estimate_id", id)
    .order("created_at", { ascending: false });

  return {
    estimate: estimate as EstimateRow,
    items: (items || []) as EstimateItemRow[],
    versions: (versions || []) as EstimateVersionRow[],
    notes: (notes || []) as EstimateNoteRow[],
    attachments: (attachments || []) as EstimateAttachmentRow[],
  };
}

// ============================================================
// Estimate Update (with versioning)
// ============================================================

/**
 * Updates an estimate, creating a new version snapshot.
 *
 * Every edit creates a new version in estimate_versions.
 * Old versions remain intact (immutable history).
 *
 * @param prevState Previous form state
 * @param formData Form data with updated fields
 * @returns EstimateFormState
 */
export async function updateEstimate(
  prevState: EstimateFormState,
  formData: FormData
): Promise<EstimateFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const estimateId = parseInteger(formData.get("id") as string);
  if (isNaN(estimateId)) {
    return { success: false, message: "Invalid estimate ID" };
  }

  // Fetch current estimate for version snapshot
  const { data: currentEstimate, error: fetchError } = await supabase
    .from("estimates")
    .select("*")
    .eq("id", estimateId)
    .single();

  if (fetchError) {
    return { success: false, message: `Estimate not found: ${fetchError.message}` };
  }

  const current = currentEstimate as EstimateRow;
  const version_name = sanitizeInput(formData.get("version_name")) || `Version ${current.version + 1}`;
  const change_reason = sanitizeInput(formData.get("change_reason")) || "Updated estimate";

  // --- Build update payload ---
  const updatePayload: Record<string, unknown> = {
    updated_by: userId,
  };

  // Update only provided fields
  const updatableFields = [
    "customer_name", "customer_mobile", "customer_email",
    "project_type", "pricing_region_id", "region_name",
    "package_id", "package_name", "package_price", "currency",
    "plot_width", "plot_length", "plot_area", "road_facing",
    "basement", "stilt", "floors", "custom_floors", "total_area",
    "base_rate_per_sqft", "labour_rate_per_sqft",
    "construction_cost", "material_cost", "labour_cost",
    "wastage_amount", "contractor_margin_amount", "customer_margin_amount",
    "discount_amount", "tax_rate", "gst_amount", "grand_total",
    "notes", "status",
  ];

  for (const field of updatableFields) {
    const value = formData.get(field);
    if (value !== null && value !== undefined && value !== "") {
      if (["basement", "stilt"].includes(field)) {
        updatePayload[field] = value === "on" || value === "true";
      } else if (["plot_width", "plot_length", "plot_area", "total_area",
                   "base_rate_per_sqft", "labour_rate_per_sqft",
                   "construction_cost", "material_cost", "labour_cost",
                   "wastage_amount", "contractor_margin_amount", "customer_margin_amount",
                   "discount_amount", "tax_rate", "gst_amount", "grand_total",
                   "package_price"].includes(field)) {
        updatePayload[field] = parseNumber(value as string);
      } else if (["pricing_region_id", "package_id", "custom_floors"].includes(field)) {
        updatePayload[field] = parseInteger(value as string);
      } else {
        updatePayload[field] = sanitizeInput(value as string);
      }
    }
  }

  // Increment version
  updatePayload.version = current.version + 1;

  // --- Update estimate ---
  const { error: updateError } = await supabase
    .from("estimates")
    .update(updatePayload)
    .eq("id", estimateId);

  if (updateError) {
    return { success: false, message: `Failed to update estimate: ${updateError.message}` };
  }

  // --- Save version snapshot ---
  const { data: updatedEstimate } = await supabase
    .from("estimates")
    .select("*")
    .eq("id", estimateId)
    .single();

  const { data: currentItems } = await supabase
    .from("estimate_items")
    .select("*")
    .eq("estimate_id", estimateId);

  const versionPayload = {
    site_id: DEFAULT_SITE_ID,
    estimate_id: estimateId,
    version_number: current.version + 1,
    version_name,
    change_reason,
    data: JSON.stringify({
      estimate: updatedEstimate,
      items: currentItems,
    }),
    created_by: userId,
  };

  const { error: versionError } = await supabase
    .from("estimate_versions")
    .insert(versionPayload);

  if (versionError) {
    console.error("Version save error:", versionError.message);
  }

  revalidatePath("/dashboard/estimate-engine");
  revalidatePath(`/dashboard/estimate-engine/${estimateId}`);

  // --- Fire notification if status changed ---
  if (updatePayload.status && updatePayload.status !== current.status) {
    notifyEstimateStatusChange(
      updatedEstimate as EstimateRow,
      current.status,
      updatePayload.status as string
    ).catch((err) => console.error("Status change notification error:", err));
  }

  return {
    success: true,
    message: `Estimate updated to version ${current.version + 1}`,
    estimate: updatedEstimate as EstimateRow,
  };
}

// ============================================================
// Status Management
// ============================================================

/**
 * Updates the status of an estimate.
 */
export async function updateEstimateStatus(
  id: number,
  status: string
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  // Validate status
  if (!ESTIMATE_STATUSES.includes(status as never)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // Fetch current estimate
  const { data: currentEstimate, error: fetchError } = await supabase
    .from("estimates")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const oldStatus = (currentEstimate as EstimateRow).status;

  const { error } = await supabase
    .from("estimates")
    .update({
      status,
      updated_by: userId,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/estimate-engine");
  revalidatePath(`/dashboard/estimate-engine/${id}`);

  // Fire status change notification
  if (oldStatus !== status) {
    notifyEstimateStatusChange(
      currentEstimate as EstimateRow,
      oldStatus,
      status
    ).catch((err) => console.error("Status change notification error:", err));
  }
}

// ============================================================
// Notes
// ============================================================

/**
 * Adds a note to an estimate.
 */
export async function addEstimateNote(
  estimateId: number,
  note: string,
  isInternal: boolean = false
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!note || !note.trim()) {
    throw new Error("Note cannot be empty");
  }

  const { error } = await supabase.from("estimate_notes").insert({
    site_id: DEFAULT_SITE_ID,
    estimate_id: estimateId,
    note: note.trim(),
    is_internal: isInternal,
    created_by: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/estimate-engine/${estimateId}`);

  // Fire note notification
  const { data: estimate } = await supabase
    .from("estimates")
    .select("*")
    .eq("id", estimateId)
    .single();

  if (estimate) {
    notifyEstimateNoteAdded(estimate as EstimateRow, note.trim()).catch(
      (err) => console.error("Note notification error:", err)
    );
  }
}

// ============================================================
// Version History
// ============================================================

/**
 * Fetches all versions for an estimate.
 */
export async function getEstimateVersions(
  estimateId: number
): Promise<EstimateVersionRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimate_versions")
    .select("*")
    .eq("estimate_id", estimateId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("Failed to fetch versions:", error.message);
    return [];
  }

  return (data || []) as EstimateVersionRow[];
}

// ============================================================
// Statistics (for dashboard widgets)
// ============================================================

/**
 * Fetches estimate statistics for the admin dashboard.
 * Returns counts by status and project type.
 */
export async function getEstimateStats(): Promise<{
  total: number;
  by_status: Record<string, number>;
  by_project_type: Record<string, number>;
  recent_count: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimates")
    .select("status, project_type, created_at");

  if (error) {
    console.error("Failed to fetch estimate stats:", error.message);
    return {
      total: 0,
      by_status: {},
      by_project_type: {},
      recent_count: 0,
    };
  }

  const byStatus: Record<string, number> = {};
  const byProjectType: Record<string, number> = {};
  let recentCount = 0;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  for (const estimate of data || []) {
    const status = estimate.status || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;

    const projectType = estimate.project_type || "unknown";
    byProjectType[projectType] = (byProjectType[projectType] || 0) + 1;

    if (new Date(estimate.created_at).getTime() > oneDayAgo) {
      recentCount++;
    }
  }

  return {
    total: data?.length || 0,
    by_status: byStatus,
    by_project_type: byProjectType,
    recent_count: recentCount,
  };
}
