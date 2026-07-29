// ============================================================
// Package Import Server Action
// SBBT CRM v2
// Bulk import packages from Excel template
// ============================================================

'use server';

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "../types";
import { parseExcelBuffer, logImportToDb } from "@/lib/import/package-template";
import { Parser } from "@/lib/import/Parser";
import { Validator } from "@/lib/import/Validator";
import {
  PACKAGE_COLUMNS,
  PACKAGE_IDENTITY_FIELDS,
  PACKAGE_IMPORT_MODULE,
  PACKAGE_TEMPLATE_VERSION,
} from "@/lib/import/package-columns";
import { slugify } from "@/lib/import/Utils";
import { revalidatePath } from "next/cache";
import type { ValidatedRow } from "@/lib/import/Types";

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
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
    skipped: 0,
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

    // Step 1: Parse Excel buffer
    const parseResult = parseExcelBuffer(buffer, PACKAGE_COLUMNS);
    if (!parseResult.success || !parseResult.parsed) {
      result.errors = parseResult.errors || ["Failed to parse Excel file."];
      return result;
    }

    const parsed = parseResult.parsed;

    // Step 2: Validate template headers and columns
    const parser = new Parser();
    const parseOutput = parser.parse(
      parsed,
      PACKAGE_COLUMNS,
      PACKAGE_IMPORT_MODULE,
      PACKAGE_TEMPLATE_VERSION
    );

    if (!parseOutput.valid) {
      result.errors = parseOutput.errors.map(
        (e) => `[Row ${e.row}] ${e.column}: ${e.message}`
      );
      result.warnings = parseOutput.warnings.map((w) => `[Row ${w.row}] ${w.message}`);
      return result;
    }

    // Step 3: Validate rows
    const validator = new Validator();
    const validation = validator.validate(parseOutput.rows, PACKAGE_COLUMNS, {
      identityFields: PACKAGE_IDENTITY_FIELDS,
    });

    // Step 4: Fetch existing packages
    const supabase = await createClient();
    const { data: existingPackages } = await supabase
      .from("cms_packages")
      .select("id, name, slug")
      .eq("site_id", DEFAULT_SITE_ID);

    const existingBySlug = new Map<string, { id: number; name: string; slug: string }>();
    const existingByName = new Map<string, { id: number; name: string; slug: string }>();

    for (const pkg of existingPackages || []) {
      existingBySlug.set(String(pkg.slug).toLowerCase(), pkg);
      existingByName.set(String(pkg.name).toLowerCase(), pkg);
    }

    // Step 5: Group rows by package
    const packageGroups = new Map<string, ValidatedRow[]>();
    const packageOrder: string[] = [];

    for (const row of validation.rows) {
      const pkgName = String(row.data.package_name || "").trim();
      if (!pkgName) continue;
      if (!packageGroups.has(pkgName)) {
        packageGroups.set(pkgName, []);
        packageOrder.push(pkgName);
      }
      packageGroups.get(pkgName)!.push(row);
    }

    // Step 6: Execute import
    for (const pkgName of packageOrder) {
      const rows = packageGroups.get(pkgName)!;
      const firstRow = rows[0];

      // Check for row-level validation errors
      const rowErrors = rows.filter((r) => r.errors.length > 0);
      if (rowErrors.length > 0) {
        result.skipped++;
        result.errors.push(`Package "${pkgName}" skipped: ${rowErrors.length} row(s) with validation errors`);
        continue;
      }

      // Determine slug
      const slug =
        String(firstRow.data.package_slug || "").trim() ||
        slugify(pkgName);

      // Check for duplicate sections within the file
      const seenSections = new Set<string>();
      let hasDuplicateSection = false;
      for (const row of rows) {
        const sectionTitle = String(row.data.section_title || "Default").trim();
        if (seenSections.has(sectionTitle.toLowerCase())) {
          hasDuplicateSection = true;
        }
        seenSections.add(sectionTitle.toLowerCase());
      }
      if (hasDuplicateSection) {
        result.skipped++;
        result.errors.push(`Package "${pkgName}" skipped: duplicate sections detected`);
        continue;
      }

      // Group rows by section
      const sectionGroups = new Map<string, ValidatedRow[]>();
      for (const row of rows) {
        const sectionTitle = String(row.data.section_title || "Default").trim();
        if (!sectionGroups.has(sectionTitle)) sectionGroups.set(sectionTitle, []);
        sectionGroups.get(sectionTitle)!.push(row);
      }

      // Check for duplicate items within sections
      let hasDuplicateItem = false;
      for (const [sectionTitle, sectionRows] of sectionGroups) {
        const seenItems = new Set<string>();
        for (const row of sectionRows) {
          const itemName = String(row.data.item_name || "").trim();
          if (itemName && seenItems.has(itemName.toLowerCase())) {
            hasDuplicateItem = true;
            result.errors.push(`Duplicate item "${itemName}" in section "${sectionTitle}" of package "${pkgName}"`);
          }
          seenItems.add(itemName.toLowerCase());
        }
      }
      if (hasDuplicateItem) {
        result.skipped++;
        result.errors.push(`Package "${pkgName}" skipped: duplicate items detected`);
        continue;
      }

      // Determine existing package
      const existingBySlugEntry = existingBySlug.get(slug.toLowerCase());
      const existingByNameEntry = existingByName.get(pkgName.toLowerCase());
      const existing = existingBySlugEntry || existingByNameEntry;

      let packageId: number;

      if (existing) {
        // Update existing package
        const { error: updateError } = await supabase
          .from("cms_packages")
          .update({
            name: pkgName,
            slug,
            price: Number(firstRow.data.package_price) || 0,
            description: String(firstRow.data.package_description || ""),
            display_order: Number(firstRow.data.package_display_order) || 0,
            is_active: String(firstRow.data.package_is_active).toLowerCase() !== "no",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          result.errors.push(`Failed to update package "${pkgName}": ${updateError.message}`);
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
            slug,
            price: Number(firstRow.data.package_price) || 0,
            description: String(firstRow.data.package_description || ""),
            display_order: Number(firstRow.data.package_display_order) || 0,
            is_active: String(firstRow.data.package_is_active).toLowerCase() !== "no",
          })
          .select("id")
          .single();

        if (insertError || !newPkg) {
          result.errors.push(`Failed to create package "${pkgName}": ${insertError?.message || "Unknown error"}`);
          continue;
        }
        packageId = newPkg.id;
        result.imported++;
      }

      // Delete old sections + items for this package (replace strategy)
      const { data: existingSections } = await supabase
        .from("cms_package_sections")
        .select("id")
        .eq("package_id", packageId);

      if (existingSections && existingSections.length > 0) {
        const sectionIds = existingSections.map((s: { id: number }) => s.id);
        await supabase.from("cms_package_items").delete().in("section_id", sectionIds);
        await supabase.from("cms_package_sections").delete().eq("package_id", packageId);
      }

      // Insert sections + items
      let sectionOrder = 0;
      for (const [sectionTitle, sectionRows] of sectionGroups) {
        const firstSectionRow = sectionRows[0];
        const { data: section, error: sectionError } = await supabase
          .from("cms_package_sections")
          .insert({
            package_id: packageId,
            title: sectionTitle,
            display_order: Number(firstSectionRow.data.section_display_order) || sectionOrder,
          })
          .select("id")
          .single();

        if (sectionError || !section) {
          result.warnings.push(`Failed to create section "${sectionTitle}": ${sectionError?.message || "Unknown"}`);
          sectionOrder++;
          continue;
        }

        const items = sectionRows.map((row, idx) => ({
          section_id: section.id,
          item: String(row.data.item_name || ""),
          brand: String(row.data.item_brand || ""),
          specification: String(row.data.item_specification || ""),
          remarks: String(row.data.item_remarks || ""),
          display_order: Number(row.data.item_display_order) || idx + 1,
        }));

        const { error: itemsError } = await supabase.from("cms_package_items").insert(items);
        if (itemsError) {
          result.warnings.push(`Failed to insert items for "${sectionTitle}": ${itemsError.message}`);
        }
        sectionOrder++;
      }
    }

    // Log to import_logs table
    await logImportToDb(supabase, {
      module: PACKAGE_IMPORT_MODULE,
      filename: file.name,
      importMode: "upsert",
      status: result.errors.length > 0 ? "completed" : "completed",
      totalRows: validation.rows.length,
      validRows: validation.rows.filter((r) => r.errors.length === 0).length,
      errorRows: validation.rows.filter((r) => r.errors.length > 0).length,
      skippedRows: result.skipped,
      insertedRows: result.imported,
      updatedRows: result.updated,
      failedRows: 0,
      errors: parseOutput.errors,
      warnings: parseOutput.warnings,
      dryRunResult: [],
      durationMs: 0,
    });

    revalidatePath("/dashboard/cms");
    revalidatePath("/packages");
    revalidatePath("/", "layout");

    result.success = result.errors.length === 0;
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    result.errors.push(`Unexpected error: ${message}`);
    result.success = false;
    return result;
  }
}
