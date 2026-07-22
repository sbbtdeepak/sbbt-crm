"use client";

import { LeadRow } from "../types";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "../types";
import { updateLeadStatus, deleteLead } from "../actions";

interface Props {
  leads: LeadRow[];
  onViewDetails: (lead: LeadRow) => void;
}

export default function LeadTable({ leads, onViewDetails }: Props) {
  if (!leads.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">No Leads Found</h2>
        <p className="mt-2 text-gray-500">
          Website leads will appear here automatically.
        </p>
      </div>
    );
  }

  const handleStatusChange = async (lead: LeadRow, newStatus: string) => {
    try {
      await updateLeadStatus(lead.id, newStatus);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (lead: LeadRow) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await deleteLead(lead.id);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete lead:", error);
      alert("Failed to delete lead. Please try again.");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDisplayName = (lead: LeadRow): string => {
    return lead.full_name || lead.name || "Unknown";
  };

  const getDisplayPhone = (lead: LeadRow): string => {
    return lead.mobile_number || lead.phone || "-";
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Lead #</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => {
              const statusKey = lead.status as keyof typeof LEAD_STATUS_COLORS;
              const statusColor = LEAD_STATUS_COLORS[statusKey] || "bg-gray-100 text-gray-700";

              return (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-gray-500">
                      {lead.lead_number || `#${lead.id}`}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-semibold">{getDisplayName(lead)}</div>
                    {lead.message && (
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        {lead.message}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm">{getDisplayPhone(lead)}</td>

                  <td className="px-4 py-4 text-sm">{lead.email || "-"}</td>

                  <td className="px-4 py-4 text-sm">
                    {lead.source || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <select
                      defaultValue={lead.status}
                      className={`rounded border px-2 py-1 text-xs font-medium ${statusColor}`}
                      onChange={async (e) => {
                        await handleStatusChange(lead, e.target.value);
                      }}
                    >
                      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {formatDate(lead.created_at)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewDetails(lead)}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(lead)}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
