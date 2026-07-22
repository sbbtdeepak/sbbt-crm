// ============================================================
// Lead Module — TypeScript Types
// SBBT CRM Next.js Project
// ============================================================

// ============================================================
// Base Types
// ============================================================

export interface LeadBase {
  id: number;
  lead_number: string;
  site_id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export type LeadInsert = Omit<
  LeadRow,
  "id" | "lead_number" | "created_at" | "updated_at" | "created_by" | "updated_by"
>;

export type LeadUpdate = Partial<
  Omit<LeadRow, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">
>;

// ============================================================
// Lead Status (reusable across CRM modules)
// ============================================================

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "follow_up",
  "site_visit_scheduled",
  "quotation_sent",
  "negotiation",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow Up",
  site_visit_scheduled: "Site Visit Scheduled",
  quotation_sent: "Quotation Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-indigo-100 text-indigo-700",
  follow_up: "bg-amber-100 text-amber-700",
  site_visit_scheduled: "bg-purple-100 text-purple-700",
  quotation_sent: "bg-cyan-100 text-cyan-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
};

// ============================================================
// Lead Source
// ============================================================

export const LEAD_SOURCES = [
  "hero_popup",
  "hero_form",
  "mobile_popup",
  "contact_form",
  "callback_request",
  "refer_and_earn",
  "join_us",
  "whatsapp",
  "chatbot",
  "landing_page",
  "advertisement",
  "other",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  hero_popup: "Hero Popup",
  hero_form: "Hero Form",
  mobile_popup: "Mobile Popup",
  contact_form: "Contact Form",
  callback_request: "Callback Request",
  refer_and_earn: "Refer & Earn",
  join_us: "Join Us",
  whatsapp: "WhatsApp",
  chatbot: "AI Chatbot",
  landing_page: "Landing Page",
  advertisement: "Advertisement",
  other: "Other",
};

// ============================================================
// Lead Row
// ============================================================

export interface LeadRow extends LeadBase {
  full_name: string | null;
  mobile_number: string | null;
  email: string | null;
  plot_location: string | null;
  budget: string | null;
  service_required: string | null;
  source: string | null;
  current_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ip_address: string | null;
  assigned_to: string | null;
  status: string;
  remarks: string | null;
  name: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
}

/** @deprecated Use LeadRow for database row type */
export type Lead = LeadRow;

// ============================================================
// Lead Form Data
// ============================================================

export interface LeadFormData {
  full_name: string;
  mobile_number: string;
  email: string;
  plot_location: string;
  budget: string;
  service_required: string;
  source: string;
  current_page: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  ip_address: string;
  message: string;
}

// ============================================================
// Lead Query Parameters
// ============================================================

export interface LeadQueryParams {
  search?: string;
  status?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface LeadQueryResult {
  data: LeadRow[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================
// Lead Form State (Server Action Response)
// ============================================================

export interface LeadFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  lead?: LeadRow | null;
}

// ============================================================
// Lead Remarks
// ============================================================

export interface LeadRemark {
  text: string;
  timestamp: string;
  added_by: string;
}
