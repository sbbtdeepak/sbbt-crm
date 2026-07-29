import { NextResponse } from "next/server";
import { generatePackageTemplate } from "@/lib/import/package-template";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buffer = generatePackageTemplate();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="package-import-template.xlsx"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Template generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}