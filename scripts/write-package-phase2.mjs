import fs from "fs";
import path from "path";

const files = {};

// 1. Fix package-columns.ts
const columnsPath = "Lib/import/package-columns.ts";
let columnsContent = fs.readFileSync(columnsPath, "utf8");
columnsContent = columnsContent
  .replace(/^Import /gm, "import ")
  .replace(/^Export /gm, "export ");
fs.writeFileSync(columnsPath, columnsContent);

// 2. Fix package-template.ts - must use lowercase app/
const templatePath = "Lib/import/package-template.ts";
let templateContent = fs.readFileSync(templatePath, "utf8");
templateContent = templateContent
  .replace(/^Import /gm, "import ")
  .replace(/^Export /gm, "export ")
  .replace(/^Const /gm, "const ")
  .replace(/^Return /gm, "return ")
  .replace(/^Continue;/gm, "continue;")
  .replace(/@\/App\//g, "@/app/");
fs.writeFileSync(templatePath, templateContent);

console.log("Fixed package-columns.ts and package-template.ts");

// 3. Create package-import.ts
files["App/dashboard/cms/actions/package-import.ts"] = `// ============================================================
// Package Import Server Action
// SBBT CRM v2
// Bulk import packages from Excel template
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "../types";
import { parseExcelBuffer } from "@/lib/import/Parser";
import { validateRows } from "@/lib/import/Validator";
import { PACKAGE_COLUMNS, PACKAGE_IDENTITY_FIELDS, PACKAGE_IMPORT_MODULE } from "@/lib/import/package-columns";
import { logImport } from "@/lib/import/Utils";
import { ImportMode } from "@/lib/import/Types";

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
  warnings: string[];
}

export async function importPackagesFromExcel(
  formData: FormData
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: [],
    warnings: [],
  };

  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      result.errors.push("No file provided.");
      return result;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseExcelBuffer(buffer, PACKAGE_COLUMNS);
    if (!parsed.success) {
      result.errors = parsed.errors || ["Failed to parse Excel file."];
      return result;
    }

    const validation = await validateRows(parsed.rows, PACKAGE_COLUMNS, {
      identityFields: PACKAGE_IDENTITY_FIELDS,
    });
    if (validation.errors.length > 0) {
      result.errors = validation.errors;
      result.warnings = validation.warnings;
      return result;
    }

    const supabase = await createClient();
    const validRows = validation.validRows;

    // Group rows by package and section
    const packageMap = new Map<string, any[]>();

    for (const row of validRows) {
      const pkgKey = row.package_name as string;
      if (!packageMap.has(pkgKey)) {
        packageMap.set(pkgKey, []);
      }
      packageMap.get(pkgKey)!.push(row);
    }

    for (const [pkgName, rows] of packageMap) {
      const firstRow = rows[0];

      // Check if package exists by slug
      const slug = (firstRow.package_slug as string) || pkgName.toLowerCase().replace(/\\s+/g, "-");
      const { data: existing } = await supabase
        .from("cms_packages")
        .select("id")
        .eq("site_id", DEFAULT_SITE_ID)
        .eq("slug", slug)
        .maybeSingle();

      let packageId: number;

      if (existing) {
        // Update existing package
        const { error: updateError } = await supabase
          .from("cms_packages")
          .update({
            name: pkgName,
            slug: slug,
            price: Number(firstRow.package_price) || 0,
            description: (firstRow.package_description as string) || "",
            display_order: Number(firstRow.package_display_order) || 0,
            is_active: firstRow.package_is_active !== "no",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          result.errors.push(\`Failed to update package "\${pkgName}": \${updateError.message}\`);
          continue;
        }
        packageId = existing.id;
        result.updated++;
      } else {
        // Insert new package
        const { data: newPkg, error: insertError } = await supabase
          .from("cms_packages")
          .insert({
            site_id: DEFAULT_SITE_ID,
            name: pkgName,
            slug: slug,
            price: Number(firstRow.package_price) || 0,
            description: (firstRow.package_description as string) || "",
            display_order: Number(firstRow.package_display_order) || 0,
            is_active: firstRow.package_is_active !== "no",
          })
          .select("id")
          .single();

        if (insertError || !newPkg) {
          result.errors.push(\`Failed to create package "\${pkgName}": \${insertError?.message || "Unknown error"}\`);
          continue;
        }
        packageId = newPkg.id;
        result.imported++;
      }

      // Delete existing sections and items for this package
      const { data: existingSections } = await supabase
        .from("cms_package_sections")
        .select("id")
        .eq("package_id", packageId);

      if (existingSections && existingSections.length > 0) {
        const sectionIds = existingSections.map((s: any) => s.id);
        await supabase.from("cms_package_items").delete().in("section_id", sectionIds);
        await supabase.from("cms_package_sections").delete().eq("package_id", packageId);
      }

      // Group rows by section
      const sectionMap = new Map<string, any[]>();
      for (const row of rows) {
        const sectionTitle = (row.section_title as string) || "Default";
        if (!sectionMap.has(sectionTitle)) {
          sectionMap.set(sectionTitle, []);
        }
        sectionMap.get(sectionTitle)!.push(row);
      }

      // Insert sections and items
      for (const [sectionTitle, sectionRows] of sectionMap) {
        const firstSectionRow = sectionRows[0];
        const { data: section, error: sectionError } = await supabase
          .from("cms_package_sections")
          .insert({
            package_id: packageId,
            title: sectionTitle,
            display_order: Number(firstSectionRow.section_display_order) || 0,
          })
          .select("id")
          .single();

        if (sectionError || !section) {
          result.warnings.push(\`Failed to create section "\${sectionTitle}" for "\${pkgName}": \${sectionError?.message || "Unknown"}\`);
          continue;
        }

        const items = sectionRows.map((row: any, idx: number) => ({
          section_id: section.id,
          item: (row.item_name as string) || "",
          brand: (row.item_brand as string) || "",
          specification: (row.item_specification as string) || "",
          remarks: (row.item_remarks as string) || "",
          display_order: Number(row.item_display_order) || idx + 1,
        }));

        const { error: itemsError } = await supabase
          .from("cms_package_items")
          .insert(items);

        if (itemsError) {
          result.warnings.push(\`Failed to insert items for section "\${sectionTitle}": \${itemsError.message}\`);
        }
      }
    }

    await logImport({
      module: PACKAGE_IMPORT_MODULE,
      totalRows: validRows.length,
      inserted: result.imported,
      updated: result.updated,
      errors: result.errors,
      warnings: result.warnings,
      status: result.errors.length === 0 ? "completed" : "completed_with_warnings",
    });

    result.success = result.errors.length === 0;
    return result;
  } catch (err: any) {
    result.errors.push(\`Unexpected error: \${err.message || "Unknown"}\`);
    result.success = false;
    return result;
  }
}
`;

// 4. Create package-export.ts
files["App/dashboard/cms/actions/package-export.ts"] = `// ============================================================
// Package Export Server Action
// SBBT CRM v2
// Bulk export packages to Excel
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "../types";
import { generatePackageExport } from "@/lib/import/package-template";
import type { CMSPackageFull } from "../types";

export async function exportPackagesToExcel(): Promise<{
  success: boolean;
  buffer?: Buffer;
  filename?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Fetch all packages with sections and items
    const { data: packages, error } = await supabase
      .from("cms_packages")
      .select(\`
        *,
        sections:cms_package_sections(
          *,
          items:cms_package_items(*)
        )
      \`)
      .eq("site_id", DEFAULT_SITE_ID)
      .order("display_order", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const typedPackages = (packages || []) as unknown as CMSPackageFull[];
    const buffer = generatePackageExport(typedPackages);

    const filename = \`packages-export-\${new Date().toISOString().split("T")[0]}.xlsx\`;

    return {
      success: true,
      buffer,
      filename,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Export failed",
    };
  }
}
`;

// 5. Create package-template-download.ts (for generating blank template)
files["App/dashboard/cms/actions/package-template.ts"] = `// ============================================================
// Package Template Download Action
// SBBT CRM v2
// Generate blank template for package import
// ============================================================

import { generatePackageTemplate } from "@/lib/import/package-template";

export async function downloadPackageTemplate(): Promise<{
  success: boolean;
  buffer?: Buffer;
  filename?: string;
  error?: string;
}> {
  try {
    const buffer = generatePackageTemplate();
    const filename = "package-import-template.xlsx";
    return { success: true, buffer, filename };
  } catch (err: any) {
    return { success: false, error: err.message || "Template generation failed" };
  }
}
`;

// Write all files
for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log("Created:", filePath);
}

console.log("\\nAll Phase 2 files created successfully!");