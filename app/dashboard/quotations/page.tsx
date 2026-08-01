"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  EstimateRow,
  ESTIMATE_STATUS_LABELS,
  ESTIMATE_STATUS_COLORS,
  PROJECT_TYPE_LABELS,
  ESTIMATE_STATUSES,
  PROJECT_TYPES,
} from "@/app/dashboard/estimate-engine/types";
import { getEstimates } from "@/app/dashboard/estimate-engine/actions";

// Reuse the EstimateTable component
import EstimateTable from "@/app/dashboard/estimate-engine/components/EstimateTable";

function QuotationsList() {
  const searchParams = useSearchParams();
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [projectTypeFilter, setProjectTypeFilter] = useState(searchParams.get("project_type") || "");

  const limit = 20;

  useEffect(() => {
    loadEstimates();
  }, [currentPage, searchParams]);

  async function loadEstimates() {
    setLoading(true);
    try {
      const params: {
        search?: string;
        status?: string;
        project_type?: string;
        page: number;
        limit: number;
      } = {
        page: currentPage,
        limit,
      };

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (projectTypeFilter) params.project_type = projectTypeFilter;

      const result = await getEstimates(params);
      setEstimates(result.data);
      setTotalCount(result.count);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error("Failed to load quotations:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    loadEstimates();
  }

  function handleViewDetails(estimate: EstimateRow) {
    window.location.href = `/dashboard/quotations/${estimate.id}`;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Search Input */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by estimate #, customer name, mobile, or email..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                {ESTIMATE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ESTIMATE_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type
              </label>
              <select
                value={projectTypeFilter}
                onChange={(e) => {
                  setProjectTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PROJECT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Quotations ({totalCount})
        </h2>
        <Link
          href="/dashboard/estimate-engine/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Quotation
        </Link>
      </div>

      {/* Estimates Table */}
      {loading ? (
        <div className="rounded-xl bg-white p-8 shadow border border-gray-100 text-center">
          <div className="text-gray-500">Loading quotations...</div>
        </div>
      ) : (
        <>
          <EstimateTable estimates={estimates} onViewDetails={handleViewDetails} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <QuotationsList />
    </Suspense>
  );
}