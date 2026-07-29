// ============================================================
// Package Import — Preview / Dry-Run Endpoint
// SBBT CRM v2 — Enterprise Import Framework v1.0
//
// Parses an uploaded Excel file and returns a preview of what
// the import would do: New, Updated, Skipped packages,
// validation errors, section count, and item count.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export const dynamic = "force-dynamic";

interface PackagePreview {
  name: string;
  slug: string;
  price: number;
  action: "insert" | "update" | "skip";
  reason: string;
  sectionCount: number;
  itemCount: number;
  sections: Array<{
    title: string;
    itemCount: number;
    duplicateItems: string[];
  }>;
  errors: Array<{ row: number; column: string; message: string }>;
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Fetch existing packages once for all files
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

    console.log("[Preview][DEBUG] Existing packages count:", (existingPackages || []).length);
    console.log("[Preview][DEBUG] Existing packages:", JSON.stringify((existingPackages || []).map(p => ({ id: p.id, slug: p.slug, name: p.name }))));

    const allPreviews: PackagePreview[] = [];
    let totalNewCount = 0;
    let totalUpdateCount = 0;
    let totalSkipCount = 0;
    const allErrors: Array<{ row: number; column: string; message: string; severity: string }> = [];
    const allWarnings: Array<{ row: number; message: string; severity: string }> = [];

    // Process each file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Step 1: Parse Excel buffer
      const parseResult = parseExcelBuffer(buffer, PACKAGE_COLUMNS);

      if (!parseResult.success || !parseResult.parsed) {
        allErrors.push({
          row: 0,
          column: "file",
          message: `Failed to parse ${file.name}: ${parseResult.errors.join(", ")}`,
          severity: "error",
        });
        continue;
      }

      const parsed = parseResult.parsed;

      // Step 2: Validate template headers
      const parser = new Parser();
      const parseOutput = parser.parse(
        parsed,
        PACKAGE_COLUMNS,
        PACKAGE_IMPORT_MODULE,
        PACKAGE_TEMPLATE_VERSION
      );

      if (!parseOutput.valid) {
        allErrors.push(
          ...parseOutput.errors.map((e) => ({ ...e, severity: "error" as const }))
        );
        allWarnings.push(
          ...parseOutput.warnings.map((w) => ({ ...w, severity: "warning" as const }))
        );
        continue;
      }

      // Step 3: Validate rows
      const validator = new Validator();
      const validation = validator.validate(parseOutput.rows, PACKAGE_COLUMNS, {
        identityFields: PACKAGE_IDENTITY_FIELDS,
      });

      // DEBUG: show first 5 parsed rows and validation errors
      console.log("[Preview][DEBUG] First 5 rows:", JSON.stringify(parseOutput.rows.slice(0, 5), null, 2));
      console.log("[Preview][DEBUG] Validation errors:", JSON.stringify(validation.errors.slice(0, 20), null, 2));

      // Step 4: Group by package and build preview
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

      for (const pkgName of packageOrder) {
        const rows = packageGroups.get(pkgName)!;
        const firstRow = rows[0];

        const slug =
          String(firstRow.data.package_slug || "").trim() ||
          slugify(pkgName);

        console.log("[Preview][DEBUG] Incoming package:", { slug, name: pkgName });

        const existingBySlugEntry = existingBySlug.get(slug.toLowerCase());
        const existingByNameEntry = existingByName.get(pkgName.toLowerCase());
        const existing = existingBySlugEntry || existingByNameEntry;

        console.log("[Preview][DEBUG] Match result:", { slugMatch: !!existingBySlugEntry, nameMatch: !!existingByNameEntry, existingId: existing?.id });

        let action: "insert" | "update" | "skip";
        let reason: string;

        if (existing) {
          action = "update";
          reason = `Package "${pkgName}" (slug: ${slug}) already exists — will be updated`;
          totalUpdateCount++;
        } else {
          action = "insert";
          reason = `Package "${pkgName}" (slug: ${slug}) is new — will be inserted`;
          totalNewCount++;
        }

        // Group by section
        const sectionGroups = new Map<string, typeof rows>();
        const sectionOrder: string[] = [];

        for (const row of rows) {
          const sectionTitle = String(row.data.section_title || "Default").trim();
          if (!sectionGroups.has(sectionTitle)) {
            sectionGroups.set(sectionTitle, []);
            sectionOrder.push(sectionTitle);
          }
          sectionGroups.get(sectionTitle)!.push(row);
        }

        // Build section previews
        const sectionPreviews: PackagePreview["sections"] = [];
        let totalItemCount = 0;

        for (const sectionTitle of sectionOrder) {
          const sectionRows = sectionGroups.get(sectionTitle)!;
          const seenItems = new Set<string>();
          const duplicateItems: string[] = [];

          for (const row of sectionRows) {
            const itemName = String(row.data.item_name || "").trim();
            if (itemName) {
              if (seenItems.has(itemName.toLowerCase())) {
                duplicateItems.push(itemName);
              }
              seenItems.add(itemName.toLowerCase());
            }
          }

          sectionPreviews.push({
            title: sectionTitle,
            itemCount: sectionRows.length,
            duplicateItems,
          });

          totalItemCount += sectionRows.length;
        }

        // Check for row-level validation errors
        const rowErrors = rows.filter((r) => r.errors.length > 0);
        if (rowErrors.length > 0) {
          action = "skip";
          reason = `Package "${pkgName}" has ${rowErrors.length} row(s) with validation errors — will be skipped`;
          totalSkipCount++;
        }

        allPreviews.push({
          name: pkgName,
          slug,
          price: Number(firstRow.data.package_price) || 0,
          action,
          reason,
          sectionCount: sectionPreviews.length,
          itemCount: totalItemCount,
          sections: sectionPreviews,
          errors: rowErrors.flatMap((r) =>
            r.errors.map((e) => ({ row: e.row, column: e.column, message: e.message }))
          ),
        });

        // Collect errors
        for (const row of rows) {
          for (const err of row.errors) {
            allErrors.push({
              row: err.row,
              column: err.column,
              message: err.message,
              severity: "error",
            });
          }
        }
      }

      // Collect warnings from parser
      allWarnings.push(
        ...parseOutput.warnings.map((w) => ({ ...w, severity: "warning" as const }))
      );
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      preview: {
        filename: files.map(f => f.name).join(", "),
        totalPackages: allPreviews.length,
        newPackages: totalNewCount,
        updatedPackages: totalUpdateCount,
        skippedPackages: totalSkipCount,
        totalSections: allPreviews.reduce((sum, p) => sum + p.sectionCount, 0),
        totalItems: allPreviews.reduce((sum, p) => sum + p.itemCount, 0),
        packages: allPreviews,
        errors: allErrors,
        warnings: allWarnings,
      },
      durationMs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Preview failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
