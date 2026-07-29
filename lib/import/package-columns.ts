// ============================================================
// Enterprise Import Framework v1.0 — Package Column Configs
// SBBT CRM v2
//
// Column configurations for CMS Packages Import/Export.
// ============================================================

import type { ColumnConfig } from "./Types";

export const PACKAGE_COLUMNS: ColumnConfig[] = [
  { field: "package_name", label: "Package Name", required: true, type: "text", maxLength: 255 },
  { field: "package_slug", label: "Package Slug", required: false, type: "text", maxLength: 255 },
  { field: "package_price", label: "Package Price", required: false, type: "number", min: 0 },
  { field: "package_description", label: "Package Description", required: false, type: "text", maxLength: 2000 },
  { field: "package_display_order", label: "Package Display Order", required: false, type: "integer", min: 0 },
  { field: "package_is_active", label: "Package Active", required: false, type: "boolean" },
  { field: "section_title", label: "Section Title", required: true, type: "text", maxLength: 255 },
  { field: "section_display_order", label: "Section Order", required: false, type: "integer", min: 0 },
  { field: "item_name", label: "Item Name", required: true, type: "text", maxLength: 255 },
  { field: "item_brand", label: "Item Brand", required: false, type: "text", maxLength: 255 },
  { field: "item_specification", label: "Item Specification", required: false, type: "text", maxLength: 500 },
  { field: "item_remarks", label: "Item Remarks", required: false, type: "text", maxLength: 500 },
  { field: "item_display_order", label: "Item Order", required: false, type: "integer", min: 0 },
];

export const PACKAGE_IDENTITY_FIELDS: string[] = [];
export const PACKAGE_TEMPLATE_VERSION = "1.0";
export const PACKAGE_IMPORT_MODULE = "cms_packages";