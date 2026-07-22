"use client";

import { useEffect, useRef } from "react";

interface LeadFormState {
  name: string;
  contact: string;
  location: string;
  budget: string;
}

interface LeadPopupFormProps {
  isOpen: boolean;
  onClose: () => void;
  leadForm: LeadFormState;
  onFormChange: (field: keyof LeadFormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitMessage: string;
}

export default function LeadPopupForm({
  isOpen,
  onClose,
  leadForm,
  onFormChange,
  onSubmit,
  isSubmitting,
  submitMessage,
}: LeadPopupFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
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

          {/* Form */}
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            {submitMessage ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="text-emerald-700 font-medium">{submitMessage}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={leadForm.name}
                    onChange={(e) => onFormChange("name", e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={leadForm.contact}
                    onChange={(e) => onFormChange("contact", e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Plot Location</label>
                  <input
                    type="text"
                    placeholder="Enter your plot location"
                    value={leadForm.location}
                    onChange={(e) => onFormChange("location", e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Budget (₹)</label>
                  <input
                    type="text"
                    placeholder="Your budget estimate"
                    value={leadForm.budget}
                    onChange={(e) => onFormChange("budget", e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "GET QUOTE NOW"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}