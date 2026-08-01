"use client";

import { useState } from "react";
import Link from "next/link";
import { EstimateRow, EstimateItemRow, ESTIMATE_STATUS_LABELS, ESTIMATE_STATUS_COLORS, PROJECT_TYPE_LABELS } from "@/app/dashboard/estimate-engine/types";
import { updateEstimateStatus } from "@/app/dashboard/estimate-engine/actions";

interface Props {
  estimate: EstimateRow;
  items: EstimateItemRow[];
}

export default function QuotationDetailsClient({ estimate, items }: Props) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState("");

  const statusKey = estimate.status as keyof typeof ESTIMATE_STATUS_COLORS;
  const statusColor = ESTIMATE_STATUS_COLORS[statusKey] || "bg-gray-100 text-gray-700";
  const statusLabel = ESTIMATE_STATUS_LABELS[statusKey] || estimate.status;
  const projectTypeLabel = PROJECT_TYPE_LABELS[estimate.project_type as keyof typeof PROJECT_TYPE_LABELS] || estimate.project_type;

  async function handleStatusChange(newStatus: string) {
    setUpdatingStatus(true);
    setMessage("");
    try {
      await updateEstimateStatus(estimate.id, newStatus);
      setMessage(`Status updated to ${ESTIMATE_STATUS_LABELS[newStatus as keyof typeof ESTIMATE_STATUS_LABELS]}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleDownloadPDF() {
    // TODO: Implement PDF generation
    // For now, open print dialog
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/quotations"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Quotations
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Quotation {estimate.estimate_number}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Version {estimate.version} • Created {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : "N/A"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Download PDF
          </button>
          <Link
            href={`/dashboard/estimate-engine/${estimate.id}`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Edit
          </Link>
        </div>
      </div>

      {message && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          {message}
        </div>
      )}

      {/* Status and Actions */}
      <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Status</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Status
            </label>
            <select
              value={estimate.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="draft">Draft</option>
              <option value="calculated">Calculated</option>
              <option value="estimated">Estimated</option>
              <option value="shared">Shared</option>
              <option value="viewed">Viewed</option>
              <option value="negotiation">Negotiation</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="converted">Converted</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.customer_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Mobile</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.customer_mobile}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.customer_email}</p>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-500">Project Type</label>
            <p className="mt-1 text-sm text-gray-900">{projectTypeLabel}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Region</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.region_name || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Package</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.package_name || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Floors</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.floors}</p>
          </div>
        </div>
      </div>

      {/* Plot Information */}
      <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plot Information</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-500">Plot Width</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.plot_width} ft</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Plot Length</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.plot_length} ft</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Plot Area</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.plot_area} sq. ft.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Total Area</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.total_area} sq. ft.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Road Facing</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.road_facing || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Basement</label>
            <p className="mt-1 text-sm text-gray-900">{estimate.basement ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Construction Cost</span>
            <span className="font-medium text-gray-900">₹{estimate.construction_cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Material Cost</span>
            <span className="font-medium text-gray-900">₹{estimate.material_cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Labour Cost</span>
            <span className="font-medium text-gray-900">₹{estimate.labour_cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Wastage</span>
            <span className="font-medium text-gray-900">₹{estimate.wastage_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Contractor Margin</span>
            <span className="font-medium text-gray-900">₹{estimate.contractor_margin_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Customer Margin</span>
            <span className="font-medium text-gray-900">₹{estimate.customer_margin_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-red-600">-₹{estimate.discount_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST ({estimate.tax_rate}%)</span>
            <span className="font-medium text-gray-900">₹{estimate.gst_amount.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="text-base font-semibold text-gray-900">Grand Total</span>
            <span className="text-base font-bold text-indigo-600">₹{estimate.grand_total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      {items.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Item</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Brand</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Qty</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Rate</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-900">{item.item_name}</td>
                    <td className="px-4 py-3 text-gray-700">{item.category}</td>
                    <td className="px-4 py-3 text-gray-700">{item.brand || "N/A"}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{item.rate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {estimate.notes && (
        <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{estimate.notes}</p>
        </div>
      )}
    </div>
  );
}