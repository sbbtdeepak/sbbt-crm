"use client";

import { useState } from "react";
import { LeadRow, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "../types";
import { updateLeadStatus, addLeadRemarks } from "../actions";

interface Props {
  lead: LeadRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadDetailsModal({ lead, isOpen, onClose }: Props) {
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const [remarkText, setRemarkText] = useState("");

  if (!isOpen || !lead) return null;

  const statusKey = lead.status as keyof typeof LEAD_STATUS_COLORS;
  const statusColor = LEAD_STATUS_COLORS[statusKey] || "bg-gray-100 text-gray-700";

  const getDisplayName = (): string => {
    return lead.full_name || lead.name || "Unknown";
  };

  const getDisplayPhone = (): string => {
    return lead.mobile_number || lead.phone || "-";
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateLeadStatus(lead.id, newStatus);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;
    setIsAddingRemark(true);
    try {
      await addLeadRemarks(lead.id, remarkText, "admin");
      setRemarkText("");
      window.location.reload();
    } catch (error) {
      console.error("Failed to add remark:", error);
      alert("Failed to add remark. Please try again.");
    } finally {
      setIsAddingRemark(false);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Lead Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {lead.lead_number || `#${lead.id}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Lead Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {getDisplayName()}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Mobile Number
                </label>
                <p className="text-sm text-gray-900">{getDisplayPhone()}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{lead.email || "-"}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Plot Location
                </label>
                <p className="text-sm text-gray-900">{lead.plot_location || lead.location || "-"}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Budget
                </label>
                <p className="text-sm text-gray-900">{lead.budget || "-"}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Service Required
                </label>
                <p className="text-sm text-gray-900">{lead.service_required || "-"}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Source
                </label>
                <p className="text-sm text-gray-900">{lead.source || "-"}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Current Page
                </label>
                <p className="text-sm text-gray-900">{lead.current_page || "-"}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  defaultValue={lead.status}
                  className={`rounded border px-2 py-1 text-xs font-medium ${statusColor}`}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">{formatDate(lead.created_at)}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">{formatDate(lead.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* UTM Tracking */}
          {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">
                UTM Tracking
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Source:</span>{" "}
                  <span className="text-gray-900">{lead.utm_source || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Medium:</span>{" "}
                  <span className="text-gray-900">{lead.utm_medium || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Campaign:</span>{" "}
                  <span className="text-gray-900">{lead.utm_campaign || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {lead.message && (
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Message
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {lead.message}
              </p>
            </div>
          )}

          {/* Remarks */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Remarks
            </label>
            {lead.remarks ? (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {lead.remarks}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No remarks yet.</p>
            )}

            {/* Add Remark Form */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Add a remark..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && remarkText.trim()) {
                    handleAddRemark();
                  }
                }}
              />
              <button
                onClick={handleAddRemark}
                disabled={isAddingRemark || !remarkText.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isAddingRemark ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
