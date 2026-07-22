"use client";

import { useState } from "react";
import { LeadRow, LeadQueryParams, LeadQueryResult, LEAD_STATUS_LABELS } from "../types";
import LeadTable from "./LeadTable";
import LeadDetailsModal from "./LeadDetailsModal";

interface Props {
  leads: LeadRow[];
  error?: string;
  query: LeadQueryParams;
  result: LeadQueryResult;
}

export default function LeadContent({ leads, error, query, result }: Props) {
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (lead: LeadRow) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // Build query string for pagination/filter links
  const buildQueryString = (params: Partial<LeadQueryParams>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    return searchParams.toString();
  };

  const currentPage = result.page;
  const totalPages = result.total_pages;

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const prevPageQuery = buildQueryString({ ...query, page: currentPage - 1 });
  const nextPageQuery = buildQueryString({ ...query, page: currentPage + 1 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lead Management</h1>
        <p className="text-gray-500 mt-1">
          Manage all customer enquiries. {result.count} total leads.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
        <form method="GET" action="/dashboard/leads" className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              name="search"
              defaultValue={query.search || ""}
              placeholder="Search by name, phone, or email..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              name="status"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              defaultValue={query.status || ""}
            >
              <option value="">All Statuses</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              name="date_from"
              defaultValue={query.date_from || ""}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Clear Filters */}
        {(query.search || query.status || query.date_from) && (
          <div className="mt-3">
            <a
              href="/dashboard/leads"
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Clear all filters
            </a>
          </div>
        )}
      </div>

      {/* Lead Table */}
      <LeadTable leads={leads} onViewDetails={handleViewDetails} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow border border-gray-100">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({result.count} leads)
          </div>
          <div className="flex gap-2">
            {hasPrevPage && (
              <a
                href={`/dashboard/leads?${prevPageQuery}`}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                Previous
              </a>
            )}
            {hasNextPage && (
              <a
                href={`/dashboard/leads?${nextPageQuery}`}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
