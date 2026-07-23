"use client";

import Link from "next/link";
import {
  EstimateRow,
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_STATUS_COLORS,
  PROJECT_TYPE_LABELS,
} from "../types";

interface Props {
  estimates: EstimateRow[];
  onViewDetails: (estimate: EstimateRow) => void;
}

export default function EstimateTable({ estimates, onViewDetails }: Props) {
  if (estimates.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 shadow border border-gray-100 text-center">
        <p className="text-gray-500">No estimates found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Estimate #
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Customer
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Project Type
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Region
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Package
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Grand Total
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Version
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((estimate) => {
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
                <tr
                  key={estimate.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/estimate-engine/${estimate.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {estimate.estimate_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-gray-900">
                        {estimate.customer_name}
                      </span>
                      <div className="text-xs text-gray-500">
                        {estimate.customer_mobile}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{projectTypeLabel}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {estimate.region_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {estimate.package_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ₹{estimate.grand_total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    v{estimate.version}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewDetails(estimate)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View
                    </button>
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
