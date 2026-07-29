// ============================================================
// Package Import — History Endpoint
// SBBT CRM v2 — Enterprise Import Framework v1.0
//
// Fetches import history from the import_logs table for
// the cms_packages module.
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PACKAGE_IMPORT_MODULE } from "@/lib/import/package-columns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const { data: logs, error } = await supabase
      .from("import_logs")
      .select("*")
      .eq("module", PACKAGE_IMPORT_MODULE)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Parse JSON fields for client consumption
    const parsedLogs = (logs || []).map((log) => ({
      ...log,
      dry_run_result: typeof log.dry_run_result === "string"
        ? JSON.parse(log.dry_run_result)
        : log.dry_run_result,
      errors: typeof log.errors === "string"
        ? JSON.parse(log.errors)
        : log.errors,
      warnings: typeof log.warnings === "string"
        ? JSON.parse(log.warnings)
        : log.warnings,
    }));

    return NextResponse.json({
      success: true,
      logs: parsedLogs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
