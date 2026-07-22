import { createLeadFromAPI } from "@/app/dashboard/leads/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Use the unified lead creation logic
    const result = await createLeadFromAPI({
      full_name: body.full_name || body.name,
      mobile_number: body.mobile_number || body.phone || body.contact,
      email: body.email,
      plot_location: body.plot_location || body.location,
      budget: body.budget,
      service_required: body.service_required,
      source: body.source || "hero_popup",
      current_page: body.current_page || request.headers.get("referer") || "",
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      ip_address: body.ip_address || request.headers.get("x-forwarded-for") || "",
      message: body.message || body.remarks,
    });

    if (!result.success) {
      return Response.json(
        { success: false, error: result.message, errors: result.errors },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: result.message,
      lead: result.lead,
    });
  } catch (error) {
    console.error("Lead API error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
