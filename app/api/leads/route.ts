import { createLeadFromAPI } from "@/app/dashboard/leads/actions";
import { createClient } from "@/lib/supabase/server";

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

    // Forward lead to webhook if configured
    void forwardToWebhook(body, request);

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


async function forwardToWebhook(body: Record<string, unknown>, request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("cms_internal_settings")
      .select("webhook_url, webhook_enabled, webhook_secret")
      .eq("id", 1)
      .single();

    if (!data?.webhook_enabled || !data.webhook_url) return;

    await fetch(data.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(data.webhook_secret ? { "X-Webhook-Secret": data.webhook_secret } : {}),
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        source_ip: request.headers.get("x-forwarded-for") || "",
        lead: body,
      }),
    });
  } catch (error) {
    console.error("Webhook forward error:", error);
  }
}