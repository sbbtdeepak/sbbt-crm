"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  LeadRow,
  LeadQueryParams,
  LeadQueryResult,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "./types";
import {
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

// ============================================================
// Helper Functions
// ============================================================

/**
 * Gets the current authenticated user's ID.
 * Used for audit trail (assigned_to, updated_by).
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
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
    .from("crm_leads")
    .select("*", { count: "exact" });

  // Search: match full_name, mobile, or email
  if (params.search && params.search.trim()) {
    const searchTerm = params.search.trim();
    query = query.or(
      `full_name.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
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

  // Filter by assigned_to
  if (params.assigned_to && params.assigned_to.trim()) {
    query = query.eq("assigned_to", params.assigned_to.trim());
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
      stage_counts: {},
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  // Compute stage counts from the fetched page data.
  const stageCounts: Record<string, number> = {};
  for (const row of data || []) {
    const key = row.status || "unknown";
    stageCounts[key] = (stageCounts[key] || 0) + 1;
  }

  return {
    data: (data || []) as LeadRow[],
    count: total,
    page,
    limit,
    total_pages: totalPages,
    stage_counts: stageCounts,
  };
}

/**
 * Fetches a single lead by ID.
 * Used by the Lead Details modal.
 */
export async function getLeadById(id: string): Promise<LeadRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_leads")
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
  id: string,
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
    .from("crm_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const oldStatus = currentLead?.status || "unknown";

  const { error } = await supabase
    .from("crm_leads")
    .update({
      status,
      updated_at: new Date().toISOString(),
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
 * Remarks are appended to the existing message field
 * with a timestamp and user identifier.
 *
 * @param id Lead ID
 * @param remark The remark text
 * @param addedBy User ID or "system"
 */
export async function addLeadRemarks(
  id: string,
  remark: string,
  addedBy: string = "system"
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!remark || !remark.trim()) {
    throw new Error("Remark cannot be empty");
  }

  // Fetch current message
  const { data: existingLead, error: fetchError } = await supabase
    .from("crm_leads")
    .select("message")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const timestamp = new Date().toISOString();
  const remarkEntry = `[${timestamp}] (${addedBy || userId || "system"}) ${remark.trim()}`;

  const currentMessage = existingLead?.message || "";
  const updatedMessage = currentMessage
    ? `${currentMessage}\n${remarkEntry}`
    : remarkEntry;

  const { error } = await supabase
    .from("crm_leads")
    .update({
      message: updatedMessage,
      updated_at: new Date().toISOString(),
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
// Lead Assignment
// ============================================================

/**
 * Assigns a lead to a team member.
 *
 * @param id Lead ID
 * @param assignedTo User ID of the assignee
 */
export async function assignLead(
  id: string,
  assignedTo: string | null
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("crm_leads")
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString(),
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
export async function deleteLead(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("crm_leads")
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
    .from("crm_leads")
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