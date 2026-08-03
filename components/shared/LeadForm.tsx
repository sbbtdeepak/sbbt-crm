"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isValidIndianMobile,
  isValidName,
  isValidBudget,
  sanitizeMobileInput,
  sanitizeNameInput,
  sanitizeNumericInput,
  formatIndianCurrency,
  MIN_BUDGET,
} from "@/lib/validation";
import { submitLead, type LeadFormData } from "@/lib/lead-submit";
import SearchableSelect from "@/components/ui/SearchableSelect";

// ============================================================
// Reusable LeadForm
// Single component shared by /quote page and Homepage Hero.
// Contains ALL form logic with ZERO duplication:
//   - form fields (name, mobile +91 prefix, email, location,
//     plot area, budget)
//   - real-time validation (shared Lib/validation.ts)
//   - submit handler (shared Lib/lead-submit.ts → /api/leads)
//   - loading state
//   - success state/popup + auto reset
//   - error display
//   - logged-in user prefill (name / phone / email)
//
// Variants (presentation only — same logic):
//   "page"   → full /quote page (white card, success screen)
//   "inline" → compact desktop hero quick-quote bar
//   "popup"  → modal used by Hero popup
// ============================================================

export const LEAD_LOCATIONS = [
  "Delhi",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Gurgaon",
  "Faridabad",
  "Delhi NCR",
  "Other",
] as const;

type LeadLocation = (typeof LEAD_LOCATIONS)[number];

interface LeadFormErrors {
  name?: string;
  mobile?: string;
  location?: string;
  budget?: string;
}

type LeadFormVariant = "page" | "inline" | "popup";

interface LeadFormProps {
  variant?: LeadFormVariant;
  /** Lead source tag stored on the lead ("website" | "hero_popup") */
  source: string;
  /** Page path the lead came from */
  currentPage: string;
  /** Popup variant only — controls modal visibility */
  isOpen?: boolean;
  /** Popup variant only — called when user closes modal */
  onClose?: () => void;
  /** Called after a successful submit (e.g. analytics) */
  onSuccess?: () => void;
  /** Page variant — show plot area field */
  showPlotArea?: boolean;
  /** Initial values (e.g. from /quote?plotSize=&estimatedCost=) */
  initialPlotArea?: string;
  initialBudget?: string;
}

const SUCCESS_MESSAGE = "Quote request submitted successfully! We'll contact you soon.";

export default function LeadForm({
  variant = "page",
  source,
  currentPage,
  isOpen = false,
  onClose,
  onSuccess,
  showPlotArea = false,
  initialPlotArea = "",
  initialBudget = "",
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState<LeadLocation | "">("");
  const [plotArea, setPlotArea] = useState(initialPlotArea);
  const [budget, setBudget] = useState(initialBudget);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------
  // Auto-fill contact details from logged-in user profile
  // ----------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // NOTE: Use getSession() (NOT getUser()) here.
    // getUser() performs a network round-trip to /auth/v1/user and, when the
    // access token is near expiry, triggers a token refresh that ROTATES the
    // refresh token and rewrites cookies. That races with the server-side
    // createClient() calls (e.g. /api/leads, /api/public/company) which read
    // the old cookie, causing "PGRST303 JWT expired".
    // getSession() only reads the session from the cookie — no network call,
    // no token rotation — so the server cookie state stays consistent.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user || !isMounted) return;

      // Name from profile display_name or user metadata
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (profile?.display_name) {
        setName(sanitizeNameInput(profile.display_name));
      } else if (user.user_metadata?.full_name) {
        setName(sanitizeNameInput(String(user.user_metadata.full_name)));
      }

      if (profile?.phone) {
        setMobile(sanitizeMobileInput(profile.phone));
      } else if (user.phone) {
        setMobile(sanitizeMobileInput(user.phone));
      }

      if (user.email) {
        setEmail(user.email);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // ----------------------------------------------------------
  // Popup modal behavior: escape key, click outside, body scroll
  // ----------------------------------------------------------
  useEffect(() => {
    if (variant !== "popup" || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [variant, isOpen, onClose]);

  // ----------------------------------------------------------
  // Real-time validation (shared Lib/validation.ts)
  // ----------------------------------------------------------
  const validateField = useCallback(
    (field: keyof LeadFormErrors, value: string): string | undefined => {
      switch (field) {
        case "name":
          if (!value.trim()) return "Name is required";
          if (!isValidName(value)) return "Name can only contain letters and spaces";
          return undefined;
        case "mobile":
          if (!value) return "Mobile number is required";
          if (!isValidIndianMobile(value)) return "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
          return undefined;
        case "location":
          if (!value) return "Location is required";
          return undefined;
        case "budget":
          if (!value) return "Budget is required";
          if (!isValidBudget(value)) return "Minimum project budget is ₹21 Lakhs.";
          return undefined;
        default:
          return undefined;
      }
    },
    []
  );

  const validateForm = useCallback((): LeadFormErrors => {
    const newErrors: LeadFormErrors = {};
    const nameError = validateField("name", name);
    const mobileError = validateField("mobile", mobile);
    const locationError = validateField("location", location);
    const budgetError = validateField("budget", budget);

    if (nameError) newErrors.name = nameError;
    if (mobileError) newErrors.mobile = mobileError;
    if (locationError) newErrors.location = locationError;
    if (budgetError) newErrors.budget = budgetError;

    return newErrors;
  }, [name, mobile, location, budget, validateField]);

  const isFormValid = Object.keys(validateForm()).length === 0;

  // ----------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------
  const handleFieldChange = (field: keyof LeadFormErrors, value: string) => {
    // Update state based on field (sanitized)
    if (field === "name") setName(sanitizeNameInput(value));
    else if (field === "mobile") setMobile(sanitizeMobileInput(value));
    else if (field === "location") setLocation(value as LeadLocation | "");
    else if (field === "budget") setBudget(sanitizeNumericInput(value, 10));

    // Validate the changed field in real-time
    const fieldError = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const handleBlur = (field: keyof LeadFormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentValue =
      field === "name" ? name : field === "mobile" ? mobile : field === "location" ? location : budget;
    const fieldError = validateField(field, currentValue);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all fields before submit
    const formErrors = validateForm();
    setErrors(formErrors);
    setTouched({ name: true, mobile: true, location: true, budget: true });

    if (Object.keys(formErrors).length > 0) return;

    setIsSubmitting(true);

    const formData: LeadFormData = {
      name,
      contact: mobile,
      location: location as LeadLocation,
      budget,
      email: email || undefined,
      plotArea,
      serviceRequired: "quote_request",
      source,
      currentPage,
    };

    const result = await submitLead(formData);

    if (result.success) {
      setSubmitted(true);
      onSuccess?.();
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setName("");
    setMobile("");
    setEmail("");
    setLocation("");
    setPlotArea(initialPlotArea);
    setBudget(initialBudget);
    setErrors({});
    setTouched({});
    setError("");
    setSubmitted(false);
  };

  // Auto-reset + auto-close popup after success (non-page variants)
  useEffect(() => {
    if (!submitted || variant === "page") return;

    const timer = setTimeout(() => {
      handleReset();
      if (variant === "popup") onClose?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [submitted, variant, onClose]);

  // ----------------------------------------------------------
  // Presentation helpers
  // ----------------------------------------------------------
  const isPopup = variant === "popup";
  const isInline = variant === "inline";

  const inputClasses = (hasError: boolean) => {
    if (isInline) {
      return `w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition bg-white ${
        hasError
          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          : "border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      }`;
    }
    return `mt-1 w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
      hasError ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;
  };

  const renderFieldError = (field: keyof LeadFormErrors) =>
    errors[field] && touched[field] ? (
      <p className="mt-1 text-sm text-red-600" role="alert">
        {errors[field]}
      </p>
    ) : null;

  const renderSuccess = () => {
    if (variant === "page") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center animate-popup-scale">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">✅ Request Submitted!</h1>
            <p className="text-gray-600 mt-2">{"We'll get back to you shortly."}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleReset}
                className="inline-block text-indigo-600 hover:underline font-medium"
              >
                Submit another request
              </button>
              <Link href="/" className="inline-block text-indigo-600 hover:underline font-medium">
                Go back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Inline / popup success state
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="text-emerald-700 font-medium">{SUCCESS_MESSAGE}</p>
      </div>
    );
  };

  const renderFields = () => {
    return (
      <>
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Name *
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            maxLength={50}
            autoComplete="name"
            className={inputClasses(!!errors.name && touched.name)}
          />
          {renderFieldError("name")}
        </div>

        {/* Mobile with +91 prefix */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Mobile Number *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium pointer-events-none select-none">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              className={`${inputClasses(!!errors.mobile && touched.mobile)} pl-14`}
              value={mobile}
              onChange={(e) => handleFieldChange("mobile", e.target.value)}
              onBlur={() => handleBlur("mobile")}
              maxLength={10}
              autoComplete="tel-national"
            />
          </div>
          {renderFieldError("mobile")}
        </div>

        {/* Email (optional, auto-filled) */}
        {!isInline && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email {email ? "" : "(optional)"}
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className={inputClasses(false)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        )}

        {/* Location — searchable dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Location *
          </label>
          <SearchableSelect
            value={location}
            onChange={(value) => handleFieldChange("location", value)}
            onBlur={() => handleBlur("location")}
            options={LEAD_LOCATIONS}
            placeholder="Search and select your location"
            hasError={!!errors.location && touched.location}
            className={isInline ? "" : "mt-1"}
          />
          {renderFieldError("location")}
        </div>

        {/* Plot Area (page variant only) */}
        {variant === "page" && showPlotArea && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Plot Area (sq.ft.)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1200"
              className={inputClasses(false)}
              value={plotArea}
              onChange={(e) => setPlotArea(sanitizeNumericInput(e.target.value, 6))}
            />
          </div>
        )}

        {/* Budget */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Budget *
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder={`Minimum ₹${MIN_BUDGET.toLocaleString("en-IN")}`}
            className={inputClasses(!!errors.budget && touched.budget)}
            value={budget ? formatIndianCurrency(budget) : ""}
            onChange={(e) => handleFieldChange("budget", e.target.value)}
            onBlur={() => handleBlur("budget")}
            maxLength={10}
          />
          {renderFieldError("budget")}
          {!errors.budget && budget && isValidBudget(budget) && (
            <p className="mt-1 text-sm text-emerald-600">✓ Valid budget</p>
          )}
        </div>
      </>
    );
  };

  const submitLabel = isInline || isPopup ? "GET QUOTE NOW" : "Submit Quote Request";
  const submittingLabel = isInline || isPopup ? "Submitting..." : "Submitting...";

  // ----------------------------------------------------------
  // Render by variant
  // ----------------------------------------------------------

  // POPUP
  if (isPopup) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="animate-popup-scale w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-900/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Get a Free Quote</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              aria-label="Close form"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {submitted ? (
            <div className="p-6">{renderSuccess()}</div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm" role="alert">
                  {error}
                </div>
              )}
              {renderFields()}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // INLINE — compact desktop hero quick-quote bar
  if (isInline) {
    return (
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-900/10 p-6 sm:p-8"
      >
        {submitted ? (
          renderSuccess()
        ) : (
          <>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm" role="alert">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
              {renderFields()}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </button>
            </div>
          </>
        )}
      </form>
    );
  }

  // PAGE — full /quote page
  if (submitted) return renderSuccess();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Get a Quote</h1>
          <p className="text-gray-600 mt-2 text-center">
            Tell us about your project and {"we'll"} get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {renderFields()}

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}