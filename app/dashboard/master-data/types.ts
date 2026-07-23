// ============================================================
// Master Data — TypeScript Types
// SBBT CRM Next.js Project
//
// Defines all TypeScript interfaces for master data entities.
// Follows CMSBase pattern from CMS types for consistency.
// ============================================================

// ============================================================
// Audit Base (matches CMSBase convention)
// ============================================================

export interface MasterDataBase {
  id: number;
  site_id: string;
  version: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export type MasterDataInsert<T extends MasterDataBase> = Omit<
  T,
  "id" | "version" | "effective_from" | "effective_to" | "created_at" | "updated_at" | "created_by" | "updated_by"
>;

export type MasterDataUpdate<T extends MasterDataBase> = Partial<
  Omit<T, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">
>;

// ============================================================
// Server Action Form State
// ============================================================

export interface MasterDataFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  id?: number;
}

// ============================================================
// Default Site ID
// ============================================================

export const DEFAULT_SITE_ID = "00000000-0000-0000-0000-000000000001";

// ============================================================
// Material Categories
// ============================================================

export interface MaterialCategoryRow extends MasterDataBase {
  name: string;
  description: string;
  display_order: number;
}

export type MaterialCategoryInsert = MasterDataInsert<MaterialCategoryRow>;
export type MaterialCategoryUpdate = MasterDataUpdate<MaterialCategoryRow>;

// ============================================================
// Brands
// ============================================================

export interface BrandRow extends MasterDataBase {
  name: string;
  material_category_id: number | null;
  description: string;
  logo_url: string;
  display_order: number;
}

export type BrandInsert = MasterDataInsert<BrandRow>;
export type BrandUpdate = MasterDataUpdate<BrandRow>;

// ============================================================
// Pricing Regions
// ============================================================

export interface PricingRegionRow extends MasterDataBase {
  region_name: string;
  city: string;
  state: string;
  base_rate_per_sqft: number;
  labour_rate_per_sqft: number;
  currency: string;
}

export type PricingRegionInsert = MasterDataInsert<PricingRegionRow>;
export type PricingRegionUpdate = MasterDataUpdate<PricingRegionRow>;

// ============================================================
// Units
// ============================================================

export interface UnitRow extends MasterDataBase {
  name: string;
  short_name: string;
  category: string;
  conversion_factor: number;
}

export type UnitInsert = MasterDataInsert<UnitRow>;
export type UnitUpdate = MasterDataUpdate<UnitRow>;

// ============================================================
// Vendors
// ============================================================

export interface VendorRow extends MasterDataBase {
  name: string;
  company: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  gst: string;
  payment_terms: string;
}

export type VendorInsert = MasterDataInsert<VendorRow>;
export type VendorUpdate = MasterDataUpdate<VendorRow>;

// ============================================================
// Tax Master
// ============================================================

export interface TaxRow extends MasterDataBase {
  name: string;
  rate: number;
  type: string;
  hsn_sac_code: string;
  applicable_on: string;
}

export type TaxInsert = MasterDataInsert<TaxRow>;
export type TaxUpdate = MasterDataUpdate<TaxRow>;

// ============================================================
// Construction Activities
// ============================================================

export interface ConstructionActivityRow extends MasterDataBase {
  name: string;
  description: string;
  material_category_id: number | null;
  unit_id: number | null;
  display_order: number;
}

export type ConstructionActivityInsert = MasterDataInsert<ConstructionActivityRow>;
export type ConstructionActivityUpdate = MasterDataUpdate<ConstructionActivityRow>;

// ============================================================
// Add-ons
// ============================================================

export interface AddOnRow extends MasterDataBase {
  name: string;
  description: string;
  price: number;
  unit_type: string;
  material_category_id: number | null;
  unit_id: number | null;
  display_order: number;
}

export type AddOnInsert = MasterDataInsert<AddOnRow>;
export type AddOnUpdate = MasterDataUpdate<AddOnRow>;

// ============================================================
// Rate Master
// ============================================================

export interface RateMasterRow extends MasterDataBase {
  material_category_id: number | null;
  brand_id: number | null;
  unit_id: number | null;
  vendor_id: number | null;
  pricing_region_id: number | null;
  item_name: string;
  hsn_code: string;
  material_rate: number;
  labour_rate: number;
  wastage_percent: number;
  contractor_margin_percent: number;
  customer_margin_percent: number;
  gst_percent: number;
  currency: string;
}

export type RateMasterInsert = MasterDataInsert<RateMasterRow>;
export type RateMasterUpdate = MasterDataUpdate<RateMasterRow>;

// ============================================================
// Target Segment for Packages
// ============================================================

export const TARGET_SEGMENTS = [
  "economy",
  "standard",
  "premium",
  "luxury",
  "villa",
  "commercial",
] as const;

export type TargetSegment = (typeof TARGET_SEGMENTS)[number];

export const TARGET_SEGMENT_LABELS: Record<TargetSegment, string> = {
  economy: "Economy",
  standard: "Standard",
  premium: "Premium",
  luxury: "Luxury",
  villa: "Villa",
  commercial: "Commercial",
};

// ============================================================
// Segment support (customer/project types)
// ============================================================

export const PROJECT_SEGMENTS = [
  "residential",
  "commercial",
  "industrial",
  "institutional",
  "apartment",
  "villa",
  "independent_house",
  "office",
  "warehouse",
] as const;

export type ProjectSegment = (typeof PROJECT_SEGMENTS)[number];

export const PROJECT_SEGMENT_LABELS: Record<ProjectSegment, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  institutional: "Institutional",
  apartment: "Apartment",
  villa: "Villa",
  independent_house: "Independent House",
  office: "Office",
  warehouse: "Warehouse",
};

// ============================================================
// Unit Types for Add-ons
// ============================================================

export const UNIT_TYPES = ["sqft", "flat", "per_item"] as const;
export type UnitType = (typeof UNIT_TYPES)[number];

// ============================================================
// Tax Types
// ============================================================

export const TAX_TYPES = ["gst", "cess", "tds", "other"] as const;
export type TaxType = (typeof TAX_TYPES)[number];

// ============================================================
// Applicable On options
// ============================================================

export const APPLICABLE_ON = ["materials", "labour", "both"] as const;

// ============================================================
// Master Data Module Configuration
// ============================================================

export interface MasterDataModule {
  slug: string;
  name: string;
  description: string;
  icon: string;
  tableName: string;
  primaryLabel: string;
}

export const MASTER_DATA_MODULES: MasterDataModule[] = [
  {
    slug: "material-categories",
    name: "Material Categories",
    description: "Manage material categories for construction",
    icon: "M4 6h16M4 12h16M4 18h16",
    tableName: "material_categories",
    primaryLabel: "Category Name",
  },
  {
    slug: "brands",
    name: "Brands",
    description: "Manage brands linked to material categories",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.5 3.5 0 005.33 0M7.835 19.303a3.5 3.5 0 015.33 0",
    tableName: "brands",
    primaryLabel: "Brand Name",
  },
  {
    slug: "pricing-regions",
    name: "Pricing Regions",
    description: "Manage city/state pricing zones",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    tableName: "pricing_regions",
    primaryLabel: "Region Name",
  },
  {
    slug: "units",
    name: "Units",
    description: "Manage measurement units with conversion factors",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    tableName: "units",
    primaryLabel: "Unit Name",
  },
  {
    slug: "vendors",
    name: "Vendors",
    description: "Manage vendor/supplier information",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    tableName: "vendors",
    primaryLabel: "Vendor Name",
  },
  {
    slug: "tax-master",
    name: "Tax Master",
    description: "Manage GST and other tax rates",
    icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
    tableName: "tax_master",
    primaryLabel: "Tax Name",
  },
  {
    slug: "construction-activities",
    name: "Construction Activities",
    description: "Manage construction activity types",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    tableName: "construction_activities",
    primaryLabel: "Activity Name",
  },
  {
    slug: "add-ons",
    name: "Add-ons",
    description: "Manage optional add-on items for quotations",
    icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
    tableName: "add_ons",
    primaryLabel: "Add-on Name",
  },
  {
    slug: "rate-master",
    name: "Rate Master",
    description: "Central rates repository for all materials and labour",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    tableName: "rate_master",
    primaryLabel: "Item Name",
  },
];