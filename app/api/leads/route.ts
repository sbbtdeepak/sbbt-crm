import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, location, budget } = body;

    // Validate required fields
    if (!name || !contact) {
      return Response.json(
        { success: false, error: "Name and contact are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert lead into contact_leads table (reusing existing architecture)
    const { error } = await supabase.from("contact_leads").insert({
      name,
      phone: contact,
      location: location || "",
      budget: budget || "",
      status: "new",
      source: "hero_popup",
    });

    if (error) {
      console.error("Lead submission error:", error.message);
      return Response.json(
        { success: false, error: "Failed to submit lead" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, message: "Lead submitted successfully" });
  } catch (error) {
    console.error("Lead API error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}