// ============================================================
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
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Template generation failed" };
  }
}
