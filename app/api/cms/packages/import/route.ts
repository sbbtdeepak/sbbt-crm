// ============================================================
// Package Import — Execution Endpoint
// SBBT CRM v2 — Enterprise Import Framework v1.0
//
// Executes the actual import after preview/dry-run has been
// reviewed. Supports Insert, Update, and Upsert modes.
// Uses package slug (preferred) or package name as identity.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_SITE_ID } from "@/app/dashboard/cms/types";
import { parseExcelBuffer } from "@/lib/import/package-template";
import { Parser } from "@/lib/import/Parser";
import { Validator } from "@/lib/import/Validator";
import {
  PACKAGE_COLUMNS,
  PACKAGE_IDENTITY_FIELDS,
  PACKAGE_IMPORT_MODULE,
  PACKAGE_TEMPLATE_VERSION,
} from "@/lib/import/package-columns";
import { slugify } from "@/lib/import/Utils";
import { logImportToDb } from "@/lib/import/package-template";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const importMode = (formData.get("importMode") as string) || "upsert";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Parse Excel buffer
    const parseResult = parseExcelBuffer(buffer, PACKAGE_COLUMNS);

    if (!parseResult.success || !parseResult.parsed) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse Excel file",
          errors: parseResult.errors,
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: "Template validation failed",
          errors: parseOutput.errors,
          warnings: parseOutput.warnings,
        },
        { status: 400 }
      );
    }

    // Step 3: Validate rows
    const validator = new Validator();
    const validation = validator.validate(parseOutput.rows, PACKAGE_COLUMNS, {
      identityFields: PACKAGE_IDENTITY_FIELDS,
    });

    // Step 4: Fetch existing packages
    const supabase = await createClient();
    const { data: existingPackages, error: existingError } = await supabase
      .from("cms_packages")
      .select("id, name, slug")
      .eq("site_id", DEFAULT_SITE_ID);

    if (existingError) {
      console.error("[DEBUG] Failed to fetch existing packages:", existingError);
    }
    console.log("[DEBUG] Existing packages fetched:", existingPackages?.length || 0);
    console.log("[DEBUG] Existing package names:", existingPackages?.map((p) => p.name) || []);

    const existingBySlug = new Map<string, { id: number; name: string; slug: string }>();
    const existingByName = new Map<string, { id: number; name: string; slug: string }>();

    for (const pkg of existingPackages || []) {
      existingBySlug.set(String(pkg.slug).toLowerCase(), pkg);
      existingByName.set(String(pkg.name).toLowerCase(), pkg);
    }

    // Step 5: Group rows by package
    const packageGroups = new Map<string, typeof validation.rows>();
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
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [...parseOutput.errors.map((e) => `[Row ${e.row}] ${e.column}: ${e.message}`)];
    const warnings: string[] = [...parseOutput.warnings.map((w) => `[Row ${w.row}] ${w.message}`)];
    const dryRunResult: Array<Record<string, unknown>> = [];

    for (const pkgName of packageOrder) {
      const rows = packageGroups.get(pkgName)!;
      const firstRow = rows[0];

      // Determine slug
      const slug =
        String(firstRow.data.package_slug || "").trim() ||
        slugify(pkgName);

      // Check for row-level validation errors
      const rowErrors = rows.filter((r) => r.errors.length > 0);
      if (rowErrors.length > 0) {
        skipped++;
        errors.push(`Package "${pkgName}" skipped: ${rowErrors.length} row(s) with validation errors`);
        dryRunResult.push({
          package: pkgName,
          slug,
          action: "skip",
          reason: `${rowErrors.length} row(s) with validation errors`,
        });
        continue;
      }

      // Check for duplicate sections within the file
      const seenSections = new Set<string>();
      let hasDuplicateSection = false;
      for (const row of rows) {
        const sectionTitle = String(row.data.section_title || "Default").trim();
        if (seenSections.has(sectionTitle.toLowerCase())) {
          hasDuplicateSection = true;
          errors.push(`Duplicate section "${sectionTitle}" in package "${pkgName}"`);
        }
        seenSections.add(sectionTitle.toLowerCase());
      }
      if (hasDuplicateSection) {
        skipped++;
        dryRunResult.push({
          package: pkgName,
          slug,
          action: "skip",
          reason: "Duplicate sections detected",
        });
        continue;
      }

      // Check for duplicate items within sections
      const sectionGroups = new Map<string, typeof rows>();
      for (const row of rows) {
        const sectionTitle = String(row.data.section_title || "Default").trim();
        if (!sectionGroups.has(sectionTitle)) sectionGroups.set(sectionTitle, []);
        sectionGroups.get(sectionTitle)!.push(row);
      }

      let hasDuplicateItem = false;
      for (const [sectionTitle, sectionRows] of sectionGroups) {
        const seenItems = new Set<string>();
        for (const row of sectionRows) {
          const itemName = String(row.data.item_name || "").trim();
          if (itemName && seenItems.has(itemName.toLowerCase())) {
            hasDuplicateItem = true;
            errors.push(`Duplicate item "${itemName}" in section "${sectionTitle}" of package "${pkgName}"`);
          }
          seenItems.add(itemName.toLowerCase());
        }
      }
      if (hasDuplicateItem) {
        skipped++;
        dryRunResult.push({
          package: pkgName,
          slug,
          action: "skip",
          reason: "Duplicate items detected",
        });
        continue;
      }

      // Determine existing package
      const existingBySlugEntry = existingBySlug.get(slug.toLowerCase());
      const existingByNameEntry = existingByName.get(pkgName.toLowerCase());
      const existing = existingBySlugEntry || existingByNameEntry;

      let packageId: number;

      if (existing) {
        // Update existing package
        console.log(`[DEBUG] Updating existing package: ${pkgName}`);
        const updatePayload = {
          name: pkgName,
          slug,
          price: Number(firstRow.data.package_price) || 0,
          description: String(firstRow.data.package_description || ""),
          display_order: Number(firstRow.data.package_display_order) || 0,
          is_active: firstRow.data.package_is_active !== false,
          updated_at: new Date().toISOString(),
        };
        console.log(`[DEBUG] UPDATE package payload:`, updatePayload);
        const { data: updateData, error: updateError } = await supabase
          .from("cms_packages")
          .update(updatePayload)
          .eq("id", existing.id)
          .select("id")
          .single();

        console.log(`[DEBUG] UPDATE response:`, updateData);
        console.log(`[DEBUG] UPDATE error:`, updateError);

        if (updateError) {
          console.error(`[DEBUG] UPDATE FAILED for package "${pkgName}":`, updateError);
          errors.push(`Failed to update package "${pkgName}": ${updateError.message}`);
          skipped++;
          dryRunResult.push({ package: pkgName, slug, action: "skip", reason: updateError.message });
          continue;
        }
        if (!updateData) {
          console.error(`[DEBUG] UPDATE returned no data for package "${pkgName}"`);
          errors.push(`Failed to update package "${pkgName}": No data returned`);
          skipped++;
          dryRunResult.push({ package: pkgName, slug, action: "skip", reason: "No data returned" });
          continue;
        }
        packageId = updateData.id;
        console.log(`[DEBUG] Package updated, id=${packageId}`);
        updated++;
      } else {
        // Insert new package
        console.log(`[DEBUG] INSERTING new package: ${pkgName}`);
        const insertPayload = {
          site_id: DEFAULT_SITE_ID,
          state_id: null,
          name: pkgName,
          slug,
          price: Number(firstRow.data.package_price) || 0,
          description: String(firstRow.data.package_description || ""),
          display_order: Number(firstRow.data.package_display_order) || 0,
          is_active: firstRow.data.package_is_active !== false,
        };
        console.log(`[DEBUG] INSERT package payload:`, insertPayload);
        const { data: newPkg, error: insertError } = await supabase
          .from("cms_packages")
          .insert(insertPayload)
          .select("id")
          .single();

        console.log(`[DEBUG] INSERT response:`, newPkg);
        console.log(`[DEBUG] INSERT error:`, insertError);

        if (insertError || !newPkg) {
          console.error(`[DEBUG] INSERT FAILED for package "${pkgName}":`, insertError?.message || "Unknown error");
          errors.push(`Failed to create package "${pkgName}": ${insertError?.message || "Unknown error"}`);
          skipped++;
          dryRunResult.push({ package: pkgName, slug, action: "skip", reason: insertError?.message || "Unknown error" });
          continue;
        }
        packageId = newPkg.id;
        console.log(`[DEBUG] Package inserted, id=${packageId}`);
        imported++;
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
      let sectionsInserted = 0;
      let itemsInserted = 0;
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
          console.error(`[DEBUG] Section insert FAILED for "${sectionTitle}" in package "${pkgName}":`, sectionError?.message || "Unknown");
          warnings.push(`Failed to create section "${sectionTitle}": ${sectionError?.message || "Unknown"}`);
          sectionOrder++;
          continue;
        }

        sectionsInserted++;

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
          console.error(`[DEBUG] Items insert FAILED for "${sectionTitle}" in package "${pkgName}":`, itemsError.message);
          warnings.push(`Failed to insert items for "${sectionTitle}": ${itemsError.message}`);
        } else {
          itemsInserted += items.length;
        }
        sectionOrder++;
      }

      console.log(`[DEBUG] Sections inserted: ${sectionsInserted}`);
      console.log(`[DEBUG] Items inserted: ${itemsInserted}`);

      dryRunResult.push({
        package: pkgName,
        slug,
        action: existing ? "update" : "insert",
        sections: Array.from(sectionGroups.keys()).length,
        items: rows.length,
      });
    }

    // After ALL inserts execute — verify what actually landed in the database
    const { data: allPackages, error: countError } = await supabase
      .from("cms_packages")
      .select("name")
      .eq("site_id", DEFAULT_SITE_ID);

    console.log(`[DEBUG] After import`);
    console.log(`[DEBUG] Total package count:`, allPackages?.length || 0);
    console.log(`[DEBUG] Package names:`, allPackages?.map((p) => p.name) || []);
    if (countError) {
      console.error(`[DEBUG] Failed to query package count after import:`, countError);
    }

    const durationMs = Date.now() - startTime;

    revalidatePath("/dashboard/cms");
    revalidatePath("/packages");
    revalidatePath("/", "layout");

    // Log to import_logs table
    await logImportToDb(supabase, {
      module: PACKAGE_IMPORT_MODULE,
      filename: file.name,
      importMode,
      status: errors.length > 0 ? "completed" : "completed",
      totalRows: validation.rows.length,
      validRows: validation.rows.filter((r) => r.errors.length === 0).length,
      errorRows: validation.rows.filter((r) => r.errors.length > 0).length,
      skippedRows: skipped,
      insertedRows: imported,
      updatedRows: updated,
      failedRows: 0,
      errors: parseOutput.errors,
      warnings: parseOutput.warnings,
      dryRunResult,
      durationMs,
    });

    // Do NOT return success when insert failed — surface errors to the caller
    const hasInsertErrors = errors.length > 0;

    return NextResponse.json({
      success: !hasInsertErrors,
      imported,
      updated,
      skipped,
      totalRows: validation.rows.length,
      errors,
      warnings,
      durationMs,
    }, hasInsertErrors ? { status: 500 } : { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
