import Link from "next/link";
import { getEstimates, getEstimateStats } from "./actions";
import { EstimateQueryParams } from "./types";
import EstimateTable from "./components/EstimateTable";

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    project_type?: string;
    region_id?: string;
    package_id?: string;
    customer?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function EstimateEnginePage({ searchParams }: Props) {
  const params = await searchParams;

  const queryParams: EstimateQueryParams = {
    search: params.search || undefined,
    status: params.status || undefined,
    project_type: params.project_type || undefined,
    region_id: params.region_id || undefined,
    package_id: params.package_id || undefined,
    customer: params.customer || undefined,
    date_from: params.date_from || undefined,
    date_to: params.date_to || undefined,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
  };

  const [result, stats] = await Promise.all([
    getEstimates(queryParams),
    getEstimateStats(),
  ]);

  const buildQueryString = (p: Partial<EstimateQueryParams>): string => {
    const sp = new URLSearchParams();
    Object.entries(p).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        sp.set(key, String(value));
      }
    });
    return sp.toString();
  };

  const currentPage = result.page;
  const totalPages = result.total_pages;
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const prevPageQuery = buildQueryString({ ...queryParams, page: currentPage - 1 });
  const nextPageQuery = buildQueryString({ ...queryParams, page: currentPage + 1 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estimate Engine</h1>
          <p className="text-gray-500 mt-1">
            Generate professional construction estimates. {result.count} total estimates.
          </p>
        </div>
        <Link
          href="/dashboard/estimate-engine/new"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Estimate
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">Total Estimates</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
          <div className="text-2xl font-bold text-emerald-600">
            {stats.by_status["approved"] || 0}
          </div>
          <div className="text-xs text-gray-500">Approved</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
          <div className="text-2xl font-bold text-amber-600">
            {stats.by_status["negotiation"] || 0}
          </div>
          <div className="text-xs text-gray-500">In Negotiation</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">
            {stats.recent_count}
          </div>
          <div className="text-xs text-gray-500">Created Today</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
        <form method="GET" action="/dashboard/estimate-engine" className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              name="search"
              defaultValue={queryParams.search || ""}
              placeholder="Search by estimate #, customer, or mobile..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              name="status"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              defaultValue={queryParams.status || ""}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="calculated">Calculated</option>
              <option value="estimated">Estimated</option>
              <option value="shared">Shared</option>
              <option value="viewed">Viewed</option>
              <option value="negotiation">Negotiation</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          {/* Project Type Filter */}
          <div>
            <select
              name="project_type"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              defaultValue={queryParams.project_type || ""}
            >
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
              <option value="independent_house">Independent House</option>
              <option value="office">Office</option>
              <option value="warehouse">Warehouse</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              name="date_from"
              defaultValue={queryParams.date_from || ""}
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
        {(queryParams.search || queryParams.status || queryParams.project_type || queryParams.date_from) && (
          <div className="mt-3">
            <Link
              href="/dashboard/estimate-engine"
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </div>

      {/* Estimate Table */}
      <EstimateTable
        estimates={result.data}
        onViewDetails={(e) => {
          // Client-side view — redirect to details page
          window.location.href = `/dashboard/estimate-engine/${e.id}`;
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow border border-gray-100">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({result.count} estimates)
          </div>
          <div className="flex gap-2">
            {hasPrevPage && (
              <Link
                href={`/dashboard/estimate-engine?${prevPageQuery}`}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                Previous
              </Link>
            )}
            {hasNextPage && (
              <Link
                href={`/dashboard/estimate-engine?${nextPageQuery}`}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
