// ============================================================
// Estimate Engine — TypeScript Types
// SBBT CRM Next.js Project
//
// Defines all TypeScript interfaces for the Estimate Engine module.
// Types follow the CMSBase / MasterDataBase pattern for consistency.
// ============================================================

// ============================================================
// Constants
// ============================================================

/** Default site UUID for single-site deployments */
export const DEFAULT_SITE_ID = "00000000-0000-0000-0000-000000000001";

// ============================================================
// Estimate Status
// ============================================================

export const ESTIMATE_STATUSES = [
  "draft",
  "calculated",
  "estimated",
  "shared",
  "viewed",
  "negotiation",
  "approved",
  "rejected",
  "converted",
  "archived",
] as const;

export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

export const ESTIMATE_STATUS_LABELS: Record<EstimateStatus, string> = {
  draft: "Draft",
  calculated: "Calculated",
  estimated: "Estimated",
  shared: "Shared",
  viewed: "Viewed",
  negotiation: "Negotiation",
  approved: "Approved",
  rejected: "Rejected",
  converted: "Converted",
  archived: "Archived",
};

export const ESTIMATE_STATUS_COLORS: Record<EstimateStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  calculated: "bg-blue-100 text-blue-700",
  estimated: "bg-indigo-100 text-indigo-700",
  shared: "bg-cyan-100 text-cyan-700",
  viewed: "bg-purple-100 text-purple-700",
  negotiation: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  converted: "bg-green-600 text-white",
  archived: "bg-slate-100 text-slate-700",
};

// ============================================================
// Project Types
// ============================================================

export const PROJECT_TYPES = [
  "residential",
  "commercial",
  "villa",
  "apartment",
  "independent_house",
  "office",
  "warehouse",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  villa: "Villa",
  apartment: "Apartment",
  independent_house: "Independent House",
  office: "Office",
  warehouse: "Warehouse",
};

// ============================================================
// Floor Options
// ============================================================

export const FLOOR_OPTIONS = [
  "ground",
  "g+1",
  "g+2",
  "custom",
] as const;

export type FloorOption = (typeof FLOOR_OPTIONS)[number];

export const FLOOR_OPTION_LABELS: Record<FloorOption, string> = {
  ground: "Ground Floor",
  "g+1": "G + 1",
  "g+2": "G + 2",
  custom: "Custom",
};

// ============================================================
// Item Source
// ============================================================

export const ITEM_SOURCES = ["PACKAGE", "ADDON", "RATE_MASTER", "CUSTOM"] as const;

export type ItemSource = (typeof ITEM_SOURCES)[number];

// ============================================================
// Base Types
// ============================================================

export interface EstimateBase {
  id: number;
  site_id: string;
  version: number;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

// ============================================================
// Estimate Row
// ============================================================

export interface EstimateRow extends EstimateBase {
  estimate_number: string;
  status: string;
  project_type: string;
  pricing_region_id: number | null;
  region_name: string;
  package_id: number | null;
  package_name: string;
  package_price: number;
  currency: string;
  plot_width: number;
  plot_length: number;
  plot_area: number;
  road_facing: string;
  basement: boolean;
  stilt: boolean;
  floors: string;
  custom_floors: number;
  total_area: number;
  base_rate_per_sqft: number;
  labour_rate_per_sqft: number;
  construction_cost: number;
  material_cost: number;
  labour_cost: number;
  wastage_amount: number;
  contractor_margin_amount: number;
  customer_margin_amount: number;
  discount_amount: number;
  tax_rate: number;
  gst_amount: number;
  grand_total: number;
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  lead_id: number | null;
  notes: string;
}

export type EstimateInsert = Omit<
  EstimateRow,
  "id" | "estimate_number" | "version" | "created_at" | "updated_at" | "created_by" | "updated_by"
>;

export type EstimateUpdate = Partial<
  Omit<EstimateRow, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">
>;

/** @deprecated Use EstimateRow for database row type */
export type Estimate = EstimateRow;

// ============================================================
// Estimate Item
// ============================================================

export interface EstimateItemRow {
  id: number;
  site_id: string;
  estimate_id: number;
  item_source: string;
  item_id: number | null;
  item_name: string;
  category: string;
  brand: string;
  quantity: number;
  unit: string;
  rate: number;
  material_rate: number;
  labour_rate: number;
  wastage_percent: number;
  contractor_margin_percent: number;
  customer_margin_percent: number;
  gst_percent: number;
  amount: number;
  sort_order: number;
  created_at: string | null;
}

export type EstimateItemInsert = Omit<
  EstimateItemRow,
  "id" | "site_id" | "created_at"
>;

// ============================================================
// Estimate Version
// ============================================================

export interface EstimateVersionRow {
  id: number;
  site_id: string;
  estimate_id: number;
  version_number: number;
  version_name: string;
  change_reason: string;
  data: Record<string, unknown>;
  created_at: string | null;
  created_by: string | null;
}

export type EstimateVersionInsert = Omit<
  EstimateVersionRow,
  "id" | "site_id" | "created_at"
>;

// ============================================================
// Estimate Note
// ============================================================

export interface EstimateNoteRow {
  id: number;
  site_id: string;
  estimate_id: number;
  note: string;
  is_internal: boolean;
  created_at: string | null;
  created_by: string | null;
}

export type EstimateNoteInsert = Omit<
  EstimateNoteRow,
  "id" | "site_id" | "created_at"
>;

// ============================================================
// Estimate Attachment
// ============================================================

export interface EstimateAttachmentRow {
  id: number;
  site_id: string;
  estimate_id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  attachment_type: string;
  created_at: string | null;
  created_by: string | null;
}

// ============================================================
// Calculation Types
// ============================================================

/**
 * Input for the pricing engine calculation.
 * All values come from Master Data (pricing_regions, rate_master, add_ons).
 */
export interface PricingEngineInput {
  // Plot information
  plot_area: number;
  total_area: number;

  // Pricing region data (from master data)
  base_rate_per_sqft: number;
  labour_rate_per_sqft: number;

  // Package items (from rate_master via cms_package_specifications)
  packageItems: PricingItem[];

  // Add-on items (from add_ons master data)
  addOnItems: PricingItem[];

  // User-specified overrides
  discount_amount?: number;
  tax_rate?: number;
}

/**
 * A single line item for pricing calculation.
 */
export interface PricingItem {
  item_name: string;
  category: string;
  brand: string;
  quantity: number;
  unit: string;
  material_rate: number;
  labour_rate: number;
  wastage_percent: number;
  contractor_margin_percent: number;
  customer_margin_percent: number;
  gst_percent: number;
}

/**
 * Output from the pricing engine calculation.
 * Contains all calculated values with no hardcoded numbers.
 */
export interface PricingEngineOutput {
  // Base calculations
  base_rate_per_sqft: number;
  labour_rate_per_sqft: number;

  // Cost breakdown
  construction_cost: number;
  material_cost: number;
  labour_cost: number;
  wastage_amount: number;

  // Margins
  contractor_margin_amount: number;
  customer_margin_amount: number;

  // Discount and tax
  discount_amount: number;
  tax_rate: number;
  gst_amount: number;

  // Final total
  grand_total: number;

  // Subtotal (before discount and tax)
  subtotal: number;
}

// ============================================================
// Estimate With Relations
// ============================================================

/**
 * Full estimate data including items and notes.
 * Used for the estimate details view.
 */
export interface EstimateWithRelations {
  estimate: EstimateRow;
  items: EstimateItemRow[];
  versions: EstimateVersionRow[];
  notes: (EstimateNoteRow & { created_by_name?: string })[];
  attachments: EstimateAttachmentRow[];
}

// ============================================================
// Query Parameters
// ============================================================

export interface EstimateQueryParams {
  search?: string;
  status?: string;
  project_type?: string;
  region_id?: string;
  package_id?: string;
  customer?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface EstimateQueryResult {
  data: EstimateRow[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================
// Form State
// ============================================================

export interface EstimateFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  estimate?: EstimateRow | null;
}

// ============================================================
// Wizard Step
// ============================================================

export interface WizardStep {
  id: string;
  label: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "customer", label: "Customer Information", description: "Enter customer details and optionally link to an existing lead" },
  { id: "project", label: "Project Information", description: "Select project type" },
  { id: "location", label: "Location", description: "Select pricing region from master data" },
  { id: "plot", label: "Plot Information", description: "Enter plot dimensions and features" },
  { id: "floors", label: "Floors", description: "Select number of floors" },
  { id: "package", label: "Package", description: "Select a package from master data" },
  { id: "addons", label: "Add-ons", description: "Select optional add-ons" },
  { id: "calculation", label: "Automatic Calculation", description: "Review auto-calculated pricing" },
  { id: "summary", label: "Estimate Summary", description: "Review and edit final summary" },
  { id: "save", label: "Save Estimate", description: "Generate estimate number and save" },
];
