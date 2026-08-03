  // ============================================================
  // CRM Leads V2 - Lead Submission Service
  // ============================================================
  // Creates a new lead in crm_leads table.
  // Uses server client + generated lead number.
  // ============================================================

  import { createClient } from "@/lib/supabase/server";
  import { generateLeadNumber } from "./lead-number";
  import type { CreateLeadInput, CreateLeadResult } from "./types";

  /**
   * Creates a lead submission in crm_leads.
   *
   * Workflow:
   * 1. Create Supabase server client.
   * 2. Generate lead number.
   * 3. Insert into crm_leads.
   * 4. Return inserted row.
   * 5. Throw Error(error.message) if Supabase returns error.
   */
  export async function createLeadSubmission(
    input: CreateLeadInput
  ): Promise<CreateLeadResult> {
    const supabase = await createClient();

    const leadNumber = await generateLeadNumber();

    const { error } = await supabase
      .from("crm_leads")
      .insert({
        ...input,
        lead_number: leadNumber,
      });

    if (error) {
      console.error("Supabase insert error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Lead created successfully.",
      lead: undefined,
    };
  }
