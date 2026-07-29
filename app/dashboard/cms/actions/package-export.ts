// ============================================================
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
      .select(`
        *,
        sections:cms_package_sections(
          *,
          items:cms_package_items(*)
        )
      `)
      .eq("site_id", DEFAULT_SITE_ID)
      .order("display_order", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const typedPackages = (packages || []) as unknown as CMSPackageFull[];
    const buffer = generatePackageExport(typedPackages);

    const filename = `packages-export-${new Date().toISOString().split("T")[0]}.xlsx`;

    return {
      success: true,
      buffer,
      filename,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Export failed",
    };
  }
}
