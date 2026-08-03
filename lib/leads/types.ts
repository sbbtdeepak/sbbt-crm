// ============================================================
// CRM Leads V2 - Types
// ============================================================

/** Shape of a row in the crm_leads table. */
export interface CrmLead {
  id: string;
  lead_number: string;
  full_name: string;
  mobile: string;
  email: string | null;
  location: string | null;
  plot_area: string | null;
  budget: string | null;
  service: string | null;
  message: string | null;
  source: string;
  page_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ip_address: string | null;
  status: string;
  assigned_to: string | null;
  otp_verified: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload accepted by the public /api/leads endpoint. */
export interface CreateLeadInput {
  full_name: string;
  mobile: string;
  email?: string;
  location?: string;
  plot_area?: string;
  budget?: string;
  service?: string;
  message?: string;
  source?: string;
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ip_address?: string;
}

/** Result returned by the lead service. */
export interface CreateLeadResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  lead?: CrmLead;
}