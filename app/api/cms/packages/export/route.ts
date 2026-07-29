import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "@/app/dashboard/cms/types";
import { generatePackageExport } from "@/lib/import/package-template";
import type { CMSPackageFull } from "@/app/dashboard/cms/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: packages, error } = await supabase
      .from("cms_packages")
      .select("*, sections:cms_package_sections(*, items:cms_package_items(*))")
      .eq("site_id", DEFAULT_SITE_ID)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const typedPackages = (packages || []) as unknown as CMSPackageFull[];
    const buffer = generatePackageExport(typedPackages);
    const filename = `packages-export-${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}