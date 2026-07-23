// ============================================================
// Master Data — Overview Dashboard
// SBBT CRM Next.js Project
// ============================================================

import Link from "next/link";
import { MASTER_DATA_MODULES } from "./types";
import { listMasterData, type TableName } from "./actions";

export default async function MasterDataOverviewPage() {
  // Fetch counts for each module
  const moduleCounts: Record<string, number> = {};

  for (const mod of MASTER_DATA_MODULES) {
    const data = await listMasterData(mod.tableName as TableName);
    moduleCounts[mod.slug] = data.length;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
        <p className="text-gray-500 mt-1">
          Central repository for all ERP business data. Every future quotation reads from these records.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MASTER_DATA_MODULES.map((module) => (
          <Link
            key={module.slug}
            href={`/dashboard/master-data/${module.slug}`}
            className="block p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={module.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{module.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                </div>
              </div>
              <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {moduleCounts[module.slug] || 0}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Card */}
      <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
        <h3 className="text-sm font-semibold text-amber-800">How Master Data Works</h3>
        <ul className="mt-2 text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>Material Categories organize all items and brands</li>
          <li>Brands are linked to categories</li>
          <li>Rate Master stores all material + labour rates with margins and tax</li>
          <li>Pricing Regions define city/state-specific base rates</li>
          <li>Add-ons are optional upgrades for quotations</li>
          <li>Packages reference Rate Master for specification pricing</li>
          <li>All data is versioned with effective dates</li>
        </ul>
      </div>
    </div>
  );
}