import {
  isValidIndianMobile,
  isValidName,
  isValidBudget,
  sanitizeMobileInput,
  sanitizeNameInput,
  sanitizeNumericInput,
} from "@/lib/validation";

export interface LeadFormData {
  name: string;
  contact: string;
  location: string;
  budget: string;
  email?: string;
  plotArea?: string;
  serviceRequired?: string;
  source: string;
  currentPage: string;
}

export interface LeadSubmitResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Validates lead form data using shared validation utilities.
 * Returns an object with error messages keyed by field name.
 */
export function validateLeadForm(data: LeadFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "Name is required";
  } else if (!isValidName(data.name)) {
    errors.name = "Name can only contain letters and spaces";
  }

  if (!data.contact) {
    errors.contact = "Mobile number is required";
  } else if (!isValidIndianMobile(data.contact)) {
    errors.contact = "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
  }

  if (!data.location) {
    errors.location = "Location is required";
  }

  if (!data.budget) {
    errors.budget = "Budget is required";
  } else if (!isValidBudget(data.budget)) {
    errors.budget = "Budget must be between ₹21 Lakhs and ₹99,99,99,999.";
  }

  return errors;
}

/**
 * Sanitizes lead form input values.
 */
export function sanitizeLeadForm(data: LeadFormData): LeadFormData {
  return {
    ...data,
    name: sanitizeNameInput(data.name),
    contact: sanitizeMobileInput(data.contact),
    budget: sanitizeNumericInput(data.budget, 10),
  };
}

/**
 * Submits a lead to the /api/leads endpoint.
 * Shared by Hero popup form and /quote page.
 */
export async function submitLead(data: LeadFormData): Promise<LeadSubmitResult> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: data.name,
        mobile_number: data.contact,
        email: data.email || undefined,
        plot_location: data.location,
        budget: data.budget,
        service_required: data.serviceRequired || "quote_request",
        remarks: [
          "Lead created from Website Quote Form",
          data.plotArea ? `Plot Area: ${data.plotArea} sq.ft.` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        source: data.source,
        current_page: data.currentPage,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.error || result.message || "Something went wrong. Please try again.",
        error: result.error || result.message,
      };
    }

    return {
      success: true,
      message: result.message || "Quote request submitted successfully!",
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
      error: "Network error",
    };
  }
}