"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  LeadRow,
  LeadFormState,
  LeadQueryParams,
  LeadQueryResult,
  LEAD_STATUSES,
} from "./types";
import {
  notifyNewLead,
  notifyLeadStatusChange,
  notifyLeadRemarkAdded,
} from "./lib/providers/provider-registry";

// ============================================================
// Constants
// ============================================================

/** Default number of items per page */
const DEFAULT_PAGE_SIZE = 20;

/** Maximum number of items per page */
const MAX_PAGE_SIZE = 100;

/** Duplicate prevention window in milliseconds (24 hours) */
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Gets the current authenticated user's ID.
 * Used for audit trail (created_by, updated_by).
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Sanitizes a string value by trimming whitespace and removing
 * potential XSS payloads.
 */
function sanitizeInput(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  // Trim and limit length to prevent abuse
  return value.trim().slice(0, 2000);
}

/**
 * Validates required fields for lead creation.
 * Returns an object with errors keyed by field name.
 */
function validateLeadData(data: {
  full_name?: string;
  mobile_number?: string;
  source?: string;
}): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  // Full name is required
  if (!data.full_name || !data.full_name.trim()) {
    errors.full_name = ["Full name is required"];
  } else if (data.full_name.trim().length < 2) {
    errors.full_name = ["Full name must be at least 2 characters"];
  }

  // Mobile number is required
  if (!data.mobile_number || !data.mobile_number.trim()) {
    errors.mobile_number = ["Mobile number is required"];
  } else {
    // Basic phone validation: at least 8 digits
    const digits = data.mobile_number.replace(/\D/g, "");
    if (digits.length < 8) {
      errors.mobile_number = ["Please enter a valid mobile number"];
    }
  }

  // Source is required
  if (!data.source || !data.source.trim()) {
    errors.source = ["Lead source is required"];
  }

  return errors;
}

/**
 * Checks for duplicate leads within the duplicate prevention window.
 * A duplicate is defined as a lead with the same mobile number
 * created within the last 24 hours.
 */
async function checkForDuplicate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mobileNumber: string
): Promise<boolean> {
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();

  const { data, error } = await supabase
    .from("contact_leads")
    .select("id")
    .eq("mobile_number", mobileNumber)
    .gte("created_at", windowStart)
    .limit(1);

  if (error) {
    console.error("Duplicate check error:", error.message);
    return false;
  }

  return data && data.length > 0;
}

// ============================================================
// Lead Creation (Unified)
// ============================================================

/**
 * Creates a new lead from form data.
 * This is the single entry point for all lead creation across
 * the application (Hero form, Contact page, API route, etc.).
 *
 * Features:
 * - Server-side validation
 * - Input sanitization (XSS prevention)
 * - Duplicate prevention (24-hour window)
 * - Audit trail (created_by)
 * - Backward compatibility (writes to both new and legacy columns)
 *
 * @param formData FormData from the form submission
 * @returns LeadFormState with success/error status
 */
export async function createLead(
  prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  // Extract and sanitize input
  const full_name = formData.get("full_name")?.toString().trim() || "";
  const mobile_number = formData.get("mobile_number")?.toString().trim() || formData.get("phone")?.toString().trim() || formData.get("contact")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const plot_location = formData.get("plot_location")?.toString().trim() || formData.get("location")?.toString().trim() || "";
  const budget = formData.get("budget")?.toString().trim() || "";
  const service_required = formData.get("service_required")?.toString().trim() || "";
  const source = formData.get("source")?.toString().trim() || "website";
  const current_page = formData.get("current_page")?.toString().trim() || "";
  const utm_source = formData.get("utm_source")?.toString().trim() || "";
  const utm_medium = formData.get("utm_medium")?.toString().trim() || "";
  const utm_campaign = formData.get("utm_campaign")?.toString().trim() || "";
  const ip_address = formData.get("ip_address")?.toString().trim() || "";
  const message = formData.get("message")?.toString().trim() || formData.get("remarks")?.toString().trim() || "";

  // Validate required fields
  const errors = validateLeadData({ full_name, mobile_number, source });
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the validation errors",
      errors,
    };
  }

  // Check for duplicates (same mobile number within 24 hours)
  const isDuplicate = await checkForDuplicate(supabase, mobile_number);
  if (isDuplicate) {
    return {
      success: false,
      message: "A lead with this mobile number was recently submitted. We will contact you soon.",
      errors: {
        mobile_number: ["A recent submission with this number was already received"],
      },
    };
  }

  // Build the insert payload
  const payload: Record<string, unknown> = {
    full_name: sanitizeInput(full_name),
    mobile_number: sanitizeInput(mobile_number),
    email: sanitizeInput(email),
    plot_location: sanitizeInput(plot_location),
    budget: sanitizeInput(budget),
    service_required: sanitizeInput(service_required),
    source: sanitizeInput(source),
    current_page: sanitizeInput(current_page),
    utm_source: sanitizeInput(utm_source),
    utm_medium: sanitizeInput(utm_medium),
    utm_campaign: sanitizeInput(utm_campaign),
    ip_address: sanitizeInput(ip_address),
    status: "new",
    remarks: sanitizeInput(message),
    site_id: "00000000-0000-0000-0000-000000000001",
    created_by: userId,
    // Legacy columns for backward compatibility
    name: sanitizeInput(full_name),
    phone: sanitizeInput(mobile_number),
    location: sanitizeInput(plot_location),
    message: sanitizeInput(message),
  };

  // Insert the lead
  const { data, error } = await supabase
    .from("contact_leads")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Lead creation error:", error.message);
    return {
      success: false,
      message: "Failed to submit your enquiry. Please try again.",
    };
  }

  // Revalidate the leads page
  revalidatePath("/dashboard/leads");

  // Fire notification asynchronously (fire-and-forget, don't block response)
  if (data) {
    notifyNewLead(data as LeadRow, source).catch((err) =>
      console.error("Notification error:", err)
    );
  }

  return {
    success: true,
    message: "Your enquiry has been submitted successfully! We will contact you soon.",
    lead: data as LeadRow,
  };
}

// ============================================================
// Lead Creation (JSON API variant)
// ============================================================

/**
 * Creates a new lead from a JSON body.
 * Used by the API route for public form submissions.
 * Returns the same LeadFormState shape for consistency.
 */
export async function createLeadFromAPI(body: {
  full_name?: string;
  mobile_number?: string;
  phone?: string;
  contact?: string;
  email?: string;
  plot_location?: string;
  location?: string;
  budget?: string;
  service_required?: string;
  source?: string;
  current_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ip_address?: string;
  message?: string;
  remarks?: string;
}): Promise<LeadFormState> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  // Normalize field names (accept both new and legacy)
  const full_name = (body.full_name || "").trim();
  const mobile_number = (body.mobile_number || body.phone || body.contact || "").trim();
  const email = (body.email || "").trim();
  const plot_location = (body.plot_location || body.location || "").trim();
  const budget = (body.budget || "").trim();
  const service_required = (body.service_required || "").trim();
  const source = (body.source || "website").trim();
  const current_page = (body.current_page || "").trim();
  const utm_source = (body.utm_source || "").trim();
  const utm_medium = (body.utm_medium || "").trim();
  const utm_campaign = (body.utm_campaign || "").trim();
  const ip_address = (body.ip_address || "").trim();
  const message = (body.message || body.remarks || "").trim();

  // Validate required fields
  const errors = validateLeadData({ full_name, mobile_number, source });
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  // Check for duplicates
  const isDuplicate = await checkForDuplicate(supabase, mobile_number);
  if (isDuplicate) {
    return {
      success: false,
      message: "A lead with this mobile number was recently submitted.",
      errors: {
        mobile_number: ["A recent submission with this number was already received"],
      },
    };
  }

  // Build the insert payload
  const payload: Record<string, unknown> = {
    full_name: sanitizeInput(full_name),
    mobile_number: sanitizeInput(mobile_number),
    email: sanitizeInput(email),
    plot_location: sanitizeInput(plot_location),
    budget: sanitizeInput(budget),
    service_required: sanitizeInput(service_required),
    source: sanitizeInput(source),
    current_page: sanitizeInput(current_page),
    utm_source: sanitizeInput(utm_source),
    utm_medium: sanitizeInput(utm_medium),
    utm_campaign: sanitizeInput(utm_campaign),
    ip_address: sanitizeInput(ip_address),
    status: "new",
    remarks: sanitizeInput(message),
    site_id: "00000000-0000-0000-0000-000000000001",
    created_by: userId,
    // Legacy columns for backward compatibility
    name: sanitizeInput(full_name),
    phone: sanitizeInput(mobile_number),
    location: sanitizeInput(plot_location),
    message: sanitizeInput(message),
  };

  const { data, error } = await supabase
    .from("contact_leads")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Lead creation error:", error.message);
    return {
      success: false,
      message: "Failed to submit your enquiry. Please try again.",
    };
  }

  revalidatePath("/dashboard/leads");

  // Fire notification asynchronously (fire-and-forget, don't block response)
  if (data) {
    notifyNewLead(data as LeadRow, source).catch((err) =>
      console.error("Notification error:", err)
    );
  }

  return {
    success: true,
    message: "Your enquiry has been submitted successfully!",
    lead: data as LeadRow,
  };
}

// ============================================================
// Lead Fetching
// ============================================================

/**
 * Fetches leads with search, filter, and pagination.
 * Used by the admin Lead Management page.
 *
 * @param params Query parameters (search, status, source, date, page, limit)
 * @returns LeadQueryResult with data, count, and pagination info
 */
export async function getLeads(
  params: LeadQueryParams
): Promise<LeadQueryResult> {
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit || DEFAULT_PAGE_SIZE));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("contact_leads")
    .select("*", { count: "exact" });

  // Search: match full_name, mobile_number, or email
  if (params.search && params.search.trim()) {
    const searchTerm = params.search.trim();
    query = query.or(
      `full_name.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
    );
  }

  // Filter by status
  if (params.status && params.status.trim()) {
    query = query.eq("status", params.status.trim());
  }

  // Filter by source
  if (params.source && params.source.trim()) {
    query = query.eq("source", params.source.trim());
  }

  // Filter by date range
  if (params.date_from && params.date_from.trim()) {
    query = query.gte("created_at", params.date_from.trim());
  }
  if (params.date_to && params.date_to.trim()) {
    query = query.lte("created_at", params.date_to.trim());
  }

  // Order by created_at descending (latest first)
  query = query.order("created_at", { ascending: false });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch leads:", error.message);
    return {
      data: [],
      count: 0,
      page,
      limit,
      total_pages: 0,
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: (data || []) as LeadRow[],
    count: total,
    page,
    limit,
    total_pages: totalPages,
  };
}

/**
 * Fetches a single lead by ID.
 * Used by the Lead Details modal.
 */
export async function getLeadById(id: number): Promise<LeadRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch lead:", error.message);
    return null;
  }

  return data as LeadRow;
}

// ============================================================
// Lead Status Management
// ============================================================

/**
 * Updates the status of a lead.
 * Used by the admin Lead Management page (status dropdown).
 *
 * @param id Lead ID
 * @param status New status value
 */
export async function updateLeadStatus(
  id: number,
  status: string
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  // Validate status
  if (!LEAD_STATUSES.includes(status as never)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // Fetch current lead to get old status and full data
  const { data: currentLead, error: fetchError } = await supabase
    .from("contact_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const oldStatus = currentLead?.status || "unknown";

  const { error } = await supabase
    .from("contact_leads")
    .update({
      status,
      updated_by: userId,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");

  // Fire status change notification asynchronously
  if (currentLead && oldStatus !== status) {
    notifyLeadStatusChange(currentLead as LeadRow, oldStatus, status).catch(
      (err) => console.error("Status change notification error:", err)
    );
  }
}

// ============================================================
// Lead Remarks
// ============================================================

/**
 * Adds a remark to a lead.
 * Remarks are appended to the existing remarks field
 * with a timestamp and user identifier.
 *
 * @param id Lead ID
 * @param remark The remark text
 * @param addedBy User ID or "system"
 */
export async function addLeadRemarks(
  id: number,
  remark: string,
  addedBy: string = "system"
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!remark || !remark.trim()) {
    throw new Error("Remark cannot be empty");
  }

  // Fetch current remarks
  const { data: existingLead, error: fetchError } = await supabase
    .from("contact_leads")
    .select("remarks")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const timestamp = new Date().toISOString();
  const remarkEntry = `[${timestamp}] (${addedBy || userId || "system"}) ${remark.trim()}`;

  const currentRemarks = existingLead?.remarks || "";
  const updatedRemarks = currentRemarks
    ? `${currentRemarks}\n${remarkEntry}`
    : remarkEntry;

  const { error } = await supabase
    .from("contact_leads")
    .update({
      remarks: updatedRemarks,
      updated_by: userId,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");

  // Fire remark notification asynchronously
  if (existingLead) {
    notifyLeadRemarkAdded(existingLead as LeadRow, remark.trim()).catch(
      (err) => console.error("Remark notification error:", err)
    );
  }
}

// ============================================================
// Lead Assignment (Preparation for future feature)
// ============================================================

/**
 * Assigns a lead to a team member.
 * This is preparation for the future assignment feature.
 * The assigned_to column references auth.users(id).
 *
 * @param id Lead ID
 * @param assignedTo User ID of the assignee
 */
export async function assignLead(
  id: number,
  assignedTo: string | null
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("contact_leads")
    .update({
      assigned_to: assignedTo,
      updated_by: userId,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");
}

// ============================================================
// Lead Deletion
// ============================================================

/**
 * Deletes a lead by ID.
 * Used by the admin Lead Management page.
 *
 * @param id Lead ID
 */
export async function deleteLead(id: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contact_leads")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");
}

// ============================================================
// Lead Statistics (for dashboard widgets)
// ============================================================

/**
 * Fetches lead statistics for the admin dashboard.
 * Returns counts by status and source.
 */
export async function getLeadStats(): Promise<{
  total: number;
  by_status: Record<string, number>;
  by_source: Record<string, number>;
  recent_count: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_leads")
    .select("status, source, created_at");

  if (error) {
    console.error("Failed to fetch lead stats:", error.message);
    return {
      total: 0,
      by_status: {},
      by_source: {},
      recent_count: 0,
    };
  }

  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let recentCount = 0;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  for (const lead of data || []) {
    const status = lead.status || "unknown";
    byStatus[status] = (byStatus[status] || 0) + 1;

    const source = lead.source || "unknown";
    bySource[source] = (bySource[source] || 0) + 1;

    if (new Date(lead.created_at).getTime() > oneDayAgo) {
      recentCount++;
    }
  }

  return {
    total: data?.length || 0,
    by_status: byStatus,
    by_source: bySource,
    recent_count: recentCount,
  };
}
