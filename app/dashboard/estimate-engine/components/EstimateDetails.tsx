"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_STATUS_COLORS,
  PROJECT_TYPE_LABELS,
  type EstimateWithRelations,
} from "../types";

interface Props {
  estimateData: EstimateWithRelations;
}

export default function EstimateDetails({ estimateData }: Props) {
  const { estimate, items, versions, notes } = estimateData;
  const [activeTab, setActiveTab] = useState<"details" | "items" | "versions" | "notes">("details");
  const [noteText, setNoteText] = useState("");

  const statusKey = estimate.status as keyof typeof ESTIMATE_STATUS_COLORS;
  const statusColor =
    ESTIMATE_STATUS_COLORS[statusKey] || "bg-gray-100 text-gray-700";
  const statusLabel =
    ESTIMATE_STATUS_LABELS[statusKey] || estimate.status;
  const projectTypeLabel =
    PROJECT_TYPE_LABELS[
      estimate.project_type as keyof typeof PROJECT_TYPE_LABELS
    ] || estimate.project_type;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {estimate.estimate_number}
          </h1>
          <p className="text-gray-500 mt-1">
            {estimate.customer_name} • {projectTypeLabel}
          </p>
        </div>
        <Link
          href="/dashboard/estimate-engine"
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
        >
          Back to Estimates
        </Link>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
        <span className="text-sm text-gray-500">
          Version {estimate.version}
        </span>
        <span className="text-sm text-gray-500">
          Created {new Date(estimate.created_at || "").toLocaleDateString()}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: "details", label: "Details" },
            { id: "items", label: "Items" },
            { id: "versions", label: "Versions" },
            { id: "notes", label: "Notes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estimate Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-medium">{estimate.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Mobile:</span>{" "}
                  <span className="font-medium">{estimate.customer_mobile}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="font-medium">{estimate.customer_email || "—"}</span>
                </div>
                {estimate.lead_id && (
                  <div>
                    <span className="text-gray-500">Lead ID:</span>{" "}
                    <span className="font-medium">{estimate.lead_id}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Project Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Project Type:</span>{" "}
                  <span className="font-medium">{projectTypeLabel}</span>
                </div>
                <div>
                  <span className="text-gray-500">Region:</span>{" "}
                  <span className="font-medium">{estimate.region_name || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Package:</span>{" "}
                  <span className="font-medium">{estimate.package_name || "—"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Plot Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Width:</span>{" "}
                  <span className="font-medium">{estimate.plot_width} ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Length:</span>{" "}
                  <span className="font-medium">{estimate.plot_length} ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Area:</span>{" "}
                  <span className="font-medium">{estimate.plot_area.toLocaleString()} Sq.Ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Road Facing:</span>{" "}
                  <span className="font-medium">{estimate.road_facing || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Basement:</span>{" "}
                  <span className="font-medium">{estimate.basement ? "Yes" : "No"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stilt:</span>{" "}
                  <span className="font-medium">{estimate.stilt ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Floors & Pricing
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Floors:</span>{" "}
                  <span className="font-medium">{estimate.floors}</span>
                </div>
                {estimate.floors === "custom" && (
                  <div>
                    <span className="text-gray-500">Custom Floors:</span>{" "}
                    <span className="font-medium">{estimate.custom_floors}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Base Rate:</span>{" "}
                  <span className="font-medium">₹{estimate.base_rate_per_sqft}/Sq.Ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Labour Rate:</span>{" "}
                  <span className="font-medium">₹{estimate.labour_rate_per_sqft}/Sq.Ft</span>
                </div>
                <div>
                  <span className="text-gray-500">Currency:</span>{" "}
                  <span className="font-medium">{estimate.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">
              Pricing Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Construction Cost</span>
                <span className="font-medium">
                  ₹{estimate.construction_cost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Material Cost</span>
                <span className="font-medium">
                  ₹{estimate.material_cost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Labour Cost</span>
                <span className="font-medium">
                  ₹{estimate.labour_cost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wastage</span>
                <span className="font-medium">
                  ₹{estimate.wastage_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Contractor Margin</span>
                <span className="font-medium text-emerald-600">
                  +₹{estimate.contractor_margin_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer Margin</span>
                <span className="font-medium text-emerald-600">
                  +₹{estimate.customer_margin_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">
                  -₹{estimate.discount_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST ({estimate.tax_rate}%)</span>
                <span className="font-medium">
                  ₹{estimate.gst_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Grand Total</span>
                <span className="text-indigo-600">
                  ₹{estimate.grand_total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {estimate.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {estimate.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "items" && (
        <div className="rounded-xl bg-white shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {item.item_name}
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.item_source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.category}</td>
                    <td className="px-4 py-3 text-gray-700">{item.brand || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      ₹{item.rate.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "versions" && (
        <div className="rounded-xl bg-white shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Change Reason
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr
                    key={version.id}
                    className="border-b border-gray-100"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      v{version.version_number}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {version.version_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {version.change_reason}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {version.created_by || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(version.created_at || "").toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-4">
          {/* Add Note Form */}
          <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
            <h3 className="font-medium text-gray-700 mb-3">
              Add a Note
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              rows={3}
              placeholder="Enter a note..."
            />
            <button
              onClick={async () => {
                if (!noteText.trim()) return;
                const { addEstimateNote } = await import("../actions");
                await addEstimateNote(estimate.id, noteText.trim(), false);
                setNoteText("");
                window.location.reload();
              }}
              className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Add Note
            </button>
          </div>

          {/* Notes List */}
          <div className="rounded-xl bg-white shadow border border-gray-100">
            {notes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notes yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notes.map((note) => (
                  <div key={note.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(note.created_at || "").toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
