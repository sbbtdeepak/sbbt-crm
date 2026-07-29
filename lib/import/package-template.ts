// ============================================================
// Enterprise Import Framework v1.0 — Package Template Generator
// SBBT CRM v2
//
// Generates Excel templates for package import/export.
// Also provides Excel buffer parsing for the import pipeline.
// ============================================================

import * as XLSX from "xlsx";
import type { CMSPackageFull } from "@/app/dashboard/cms/types";
import { PACKAGE_COLUMNS, PACKAGE_TEMPLATE_VERSION } from "./package-columns";
import { TEMPLATE_HEADER_KEYS } from "./Constants";
import { Parser } from "./Parser";
import type { ParsedExcel } from "./Parser";
import type { TemplateHeader } from "./Types";

const MODULE_NAME = "cms_packages";
const CRM_VERSION = "2.0.0";

// ============================================================
// Excel Buffer Parsing (Package-Specific)
// ============================================================

/**
 * Parse an Excel buffer into a ParsedExcel structure.
 *
 * Expected Excel layout (Template sheet or first sheet):
 *   Row 1: Metadata key-value pairs (TEMPLATE_VERSION, MODULE, TEMPLATE_DATE, CRM_VERSION)
 *   Row 2: Column headers
 *   Row 3+: Data rows
 *
 * If no metadata row is found, a warning is generated but parsing continues.
 */
export function parseExcelBuffer(
  buffer: Buffer,
  columns: typeof PACKAGE_COLUMNS
): {
  success: boolean;
  parsed: ParsedExcel | null;
  errors: string[];
} {
  const errors: string[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to read Excel file";
    errors.push(msg);
    return { success: false, parsed: null, errors };
  }

  // Find the data sheet — prefer "Template" or "Packages Export", fall back to first sheet
  const sheetName =
    workbook.SheetNames.find(
      (name) => name.toLowerCase() === "template" || name.toLowerCase().includes("export")
    ) || workbook.SheetNames[0];

  if (!sheetName) {
    errors.push("No sheets found in the Excel file.");
    return { success: false, parsed: null, errors };
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    errors.push(`Sheet "${sheetName}" not found.`);
    return { success: false, parsed: null, errors };
  }

  // Convert sheet to JSON array (array of arrays)
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][];

  if (data.length < 2) {
    errors.push("Excel file must have at least a header row and a column header row.");
    return { success: false, parsed: null, errors };
  }

  // Row 1: Metadata (key-value pairs in alternating columns)
  const metadataRow = data[0] || [];
  const metadata: Record<string, string> = {};
  for (let i = 0; i + 1 < metadataRow.length; i += 2) {
    const key = String(metadataRow[i] ?? "").trim();
    const value = String(metadataRow[i + 1] ?? "").trim();
    if (key) {
      metadata[key] = value;
    }
  }

  // If no metadata found in row 1, check if row 1 looks like column headers
  // (i.e., it matches expected column labels). If so, treat row 1 as headers
  // and there is no metadata row.
  const expectedLabels = new Set(columns.map((c) => c.label.toLowerCase()));
  const firstRowLabels = metadataRow
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map((v) => String(v).trim().toLowerCase());

  let hasMetadata = Object.keys(metadata).length > 0;

  // Check if first row looks like column headers instead of metadata
  const matchingHeaders = firstRowLabels.filter((label) => expectedLabels.has(label));
  if (matchingHeaders.length >= Math.min(3, expectedLabels.size)) {
    hasMetadata = false;
  }

  let header: TemplateHeader;
  let columnsRow: string[];
  let dataRows: unknown[][];

  if (hasMetadata) {
    // Row 1 = metadata, Row 2 = column headers, Row 3+ = data
    header = Parser.extractHeader(metadata);
    columnsRow = (data[1] || []).map((v) => String(v ?? "").trim());
    dataRows = data.slice(2);
  } else {
    // No metadata row — Row 1 = column headers, Row 2+ = data
    header = {
      templateVersion: PACKAGE_TEMPLATE_VERSION,
      module: MODULE_NAME,
      templateDate: new Date().toISOString().split("T")[0],
      crmVersion: CRM_VERSION,
    };
    columnsRow = (data[0] || []).map((v) => String(v ?? "").trim());
    dataRows = data.slice(1);
  }

  // Convert data rows to objects keyed by column header
  const rows: Record<string, unknown>[] = [];
  for (const rawRow of dataRows) {
    // Skip completely empty rows
    const values = rawRow.filter((v) => v !== null && v !== undefined && v !== "");
    if (values.length === 0) continue;

    const rowObj: Record<string, unknown> = {};
    columnsRow.forEach((col, idx) => {
      if (col) {
        rowObj[col] = rawRow[idx] !== undefined ? rawRow[idx] : null;
      }
    });
    rows.push(rowObj);
  }

  const parsed: ParsedExcel = {
    header,
    columns: columnsRow,
    rows,
    filename: "uploaded.xlsx",
  };

  return { success: true, parsed, errors };
}

// ============================================================
// Template Generation
// ============================================================

/**
 * Generate a blank template Excel file for package import.
 * Returns a Node.js Buffer containing the .xlsx file.
 *
 * Structure:
 *   - Instructions sheet: Human-readable guide with required fields, sample data
 *   - Template sheet: Metadata row + column headers (ready for user input)
 *   - Sample Data sheet: Metadata row + column headers + sample rows
 */
export function generatePackageTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  // ---- Instructions Sheet ----
  const instructions: unknown[][] = [
    ["SBBT CRM — Package Import Template"],
    [""],
    ["Module:", MODULE_NAME],
    ["Template Version:", PACKAGE_TEMPLATE_VERSION],
    ["CRM Version:", CRM_VERSION],
    ["Generated:", new Date().toISOString()],
    [""],
    ["INSTRUCTIONS:"],
    ["1. Each row represents ONE item within a section within a package."],
    ["2. Package-level fields (columns A-F) repeat for every row belonging to the same package."],
    ["3. Section-level fields (columns G-H) repeat for every row belonging to the same section."],
    ["4. Item fields (columns I-M) are unique to each row."],
    ["5. To create a package with 3 sections, each having 5 items, you need 15 rows."],
    ["6. All rows with the same Package Name belong to the same package."],
    ["7. All rows with the same Package Name + Section Title belong to the same section."],
    [""],
    ["REQUIRED FIELDS:"],
    ["- Package Name (cannot be empty)"],
    ["- Package Price (must be a number >= 0)"],
    ["- Section Title (cannot be empty)"],
    ["- Item Name (cannot be empty)"],
    [""],
    ["UPSERT LOGIC:"],
    ["- If a package with matching slug exists, it will be UPDATED."],
    ["- If no matching package is found, a new package will be INSERTED."],
    ["- Section and item data is always REPLACED (delete + re-insert)."],
    ["- Identity is determined by Package Slug (preferred) or Package Name."],
    [""],
    ["VALIDATION RULES:"],
    ["- Duplicate Package: Same slug or name within the file"],
    ["- Duplicate Section: Same title within the same package"],
    ["- Duplicate Item: Same item name within the same section"],
    ["- Display Order: Must be a non-negative integer"],
    ["- Invalid Data Types: Price must be numeric, Active must be yes/no"],
    [""],
    ["SAMPLE DATA:"],
    [
      "Package Name",
      "Package Slug",
      "Package Price",
      "Package Description",
      "Package Display Order",
      "Package Active",
      "Section Title",
      "Section Order",
      "Item Name",
      "Item Brand",
      "Item Specification",
      "Item Remarks",
      "Item Order",
    ],
    [
      "Premium Home",
      "premium-home",
      "2500000",
      "Premium residential construction package",
      "1",
      "yes",
      "Structure",
      "1",
      "AAC Blocks",
      "Magicrete",
      "6 inch",
      "Load bearing walls",
      "1",
    ],
    [
      "Premium Home",
      "premium-home",
      "2500000",
      "Premium residential construction package",
      "1",
      "yes",
      "Structure",
      "1",
      "TMT Steel",
      "TATA Tiscon",
      "Fe 500D",
      "All structural members",
      "2",
    ],
    [
      "Premium Home",
      "premium-home",
      "2500000",
      "Premium residential construction package",
      "1",
      "yes",
      "Structure",
      "1",
      "RMC Concrete",
      "UltraTech",
      "M25 Grade",
      "Foundation to roof",
      "3",
    ],
    [
      "Premium Home",
      "premium-home",
      "2500000",
      "Premium residential construction package",
      "1",
      "yes",
      "Kitchen",
      "2",
      "Granite Countertop",
      "Local",
      "Black Galaxy 3cm",
      "Kitchen platform",
      "1",
    ],
    [
      "Premium Home",
      "premium-home",
      "2500000",
      "Premium residential construction package",
      "1",
      "yes",
      "Kitchen",
      "2",
      "Sink",
      "Franke",
      "Single bowl SS",
      "Kitchen sink",
      "2",
    ],
    [
      "Economy Home",
      "economy-home",
      "1800000",
      "Budget friendly construction package",
      "2",
      "yes",
      "Structure",
      "1",
      "Red Bricks",
      "Local",
      "9x4x3 inch",
      "Wall construction",
      "1",
    ],
    [
      "Economy Home",
      "economy-home",
      "1800000",
      "Budget friendly construction package",
      "2",
      "yes",
      "Flooring",
      "2",
      "Vitrified Tiles",
      "Kajaria",
      "600x600mm",
      "All rooms",
      "1",
    ],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, instructionsSheet, "Instructions");

  // ---- Template Sheet (with metadata row) ----
  const headers = PACKAGE_COLUMNS.map((c) => c.label);

  // Metadata row: key-value pairs in alternating columns
  const metadataRow: unknown[] = [];
  const metaEntries = [
    [TEMPLATE_HEADER_KEYS.VERSION, PACKAGE_TEMPLATE_VERSION],
    [TEMPLATE_HEADER_KEYS.MODULE, MODULE_NAME],
    [TEMPLATE_HEADER_KEYS.DATE, new Date().toISOString().split("T")[0]],
    [TEMPLATE_HEADER_KEYS.CRM_VERSION, CRM_VERSION],
  ];
  for (const [key, value] of metaEntries) {
    metadataRow.push(key, value);
  }

  const templateSheet = XLSX.utils.aoa_to_sheet([metadataRow, headers]);

  // Set column widths
  const colWidths = PACKAGE_COLUMNS.map((c) => ({
    wch: Math.min(Math.max(c.label.length + 4, c.maxLength ? Math.min(c.maxLength, 30) : 15), 40),
  }));
  templateSheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, templateSheet, "Template");

  // ---- Sample Data Sheet (with metadata row + sample rows) ----
  const sampleHeaders = instructions[10] as string[];
  const sampleRows = instructions.slice(11).map((row) => row as string[]);
  const sampleSheet = XLSX.utils.aoa_to_sheet([metadataRow, sampleHeaders, ...sampleRows]);
  sampleSheet["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(wb, sampleSheet, "Sample Data");

  // Generate buffer
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}

// ============================================================
// Export Generation
// ============================================================

/**
 * Generate Excel from existing package data (Export).
 * Maintains the same structure as the import template for round-trip compatibility.
 *
 * Structure:
 *   - Template sheet: Metadata row + column headers + data rows
 *   - Metadata sheet: Export metadata (module, version, date, counts)
 */
export function generatePackageExport(packages: CMSPackageFull[]): Buffer {
  const wb = XLSX.utils.book_new();

  // Build flat rows from nested package data
  const rows: Array<Record<string, unknown>> = [];

  for (const pkg of packages) {
    if (!pkg.sections || pkg.sections.length === 0) {
      // Package with no sections — emit one row with just package info
      rows.push({
        "Package Name": pkg.package.name,
        "Package Slug": pkg.package.slug,
        "Package Price": pkg.package.price,
        "Package Description": pkg.package.description,
        "Package Display Order": pkg.package.display_order,
        "Package Active": pkg.package.is_active ? "yes" : "no",
        "Section Title": "",
        "Section Order": "",
        "Item Name": "",
        "Item Brand": "",
        "Item Specification": "",
        "Item Remarks": "",
        "Item Order": "",
      });
      continue;
    }

    for (const section of pkg.sections) {
      if (!section.items || section.items.length === 0) {
        // Section with no items
        rows.push({
          "Package Name": pkg.package.name,
          "Package Slug": pkg.package.slug,
          "Package Price": pkg.package.price,
          "Package Description": pkg.package.description,
          "Package Display Order": pkg.package.display_order,
          "Package Active": pkg.package.is_active ? "yes" : "no",
          "Section Title": section.title,
          "Section Order": section.display_order,
          "Item Name": "",
          "Item Brand": "",
          "Item Specification": "",
          "Item Remarks": "",
          "Item Order": "",
        });
        continue;
      }

      for (let ii = 0; ii < section.items.length; ii++) {
        const item = section.items[ii];
        rows.push({
          "Package Name": pkg.package.name,
          "Package Slug": pkg.package.slug,
          "Package Price": pkg.package.price,
          "Package Description": pkg.package.description,
          "Package Display Order": pkg.package.display_order,
          "Package Active": pkg.package.is_active ? "yes" : "no",
          "Section Title": section.title,
          "Section Order": section.display_order,
          "Item Name": item.item,
          "Item Brand": item.brand,
          "Item Specification": item.specification,
          "Item Remarks": item.remarks,
          "Item Order": ii + 1,
        });
      }
    }
  }

  // Metadata row (same format as template)
  const metadataRow: unknown[] = [];
  const metaEntries = [
    [TEMPLATE_HEADER_KEYS.VERSION, PACKAGE_TEMPLATE_VERSION],
    [TEMPLATE_HEADER_KEYS.MODULE, MODULE_NAME],
    [TEMPLATE_HEADER_KEYS.DATE, new Date().toISOString().split("T")[0]],
    [TEMPLATE_HEADER_KEYS.CRM_VERSION, CRM_VERSION],
  ];
  for (const [key, value] of metaEntries) {
    metadataRow.push(key, value);
  }

  const headers = PACKAGE_COLUMNS.map((c) => c.label);
  const sheetData = [
    metadataRow,
    headers,
    ...rows.map((r) => headers.map((h) => r[h] ?? "")),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet["!cols"] = PACKAGE_COLUMNS.map((c) => ({
    wch: Math.min(Math.max(c.label.length + 4, 15), 40),
  }));

  XLSX.utils.book_append_sheet(wb, sheet, "Template");

  // Metadata sheet
  const metaSheet = XLSX.utils.aoa_to_sheet([
    ["Export Metadata"],
    [""],
    ["Module", MODULE_NAME],
    ["Template Version", PACKAGE_TEMPLATE_VERSION],
    ["CRM Version", CRM_VERSION],
    ["Export Date", new Date().toISOString()],
    ["Total Packages", packages.length],
    ["Total Rows", rows.length],
  ]);
  XLSX.utils.book_append_sheet(wb, metaSheet, "Metadata");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}

// ============================================================
// Import Log Helper
// ============================================================

/**
 * Log an import operation to the import_logs table.
 * This is a lightweight helper that writes to Supabase directly.
 */
export async function logImportToDb(supabase: unknown, logData: {
  module: string;
  filename: string;
  importMode: string;
  status: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  skippedRows: number;
  insertedRows: number;
  updatedRows: number;
  failedRows: number;
  errors: unknown[];
  warnings: unknown[];
  dryRunResult: unknown;
  durationMs: number;
}): Promise<void> {
  const client = supabase as {
    from: (table: string) => {
      insert: (data: Record<string, unknown>) => Promise<{ error?: { message: string } }>;
    };
  };

  await client.from("import_logs").insert({
    module: logData.module,
    filename: logData.filename,
    import_mode: logData.importMode,
    status: logData.status,
    total_rows: logData.totalRows,
    valid_rows: logData.validRows,
    error_rows: logData.errorRows,
    skipped_rows: logData.skippedRows,
    inserted_rows: logData.insertedRows,
    updated_rows: logData.updatedRows,
    failed_rows: logData.failedRows,
    dry_run_result: JSON.stringify(logData.dryRunResult || {}),
    errors: JSON.stringify(logData.errors || []),
    warnings: JSON.stringify(logData.warnings || []),
    duration_ms: logData.durationMs,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  });
}
