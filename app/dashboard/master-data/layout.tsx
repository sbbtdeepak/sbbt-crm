// ============================================================
// Master Data Layout
// SBBT CRM Next.js Project
// ============================================================

import Link from "next/link";
import { MASTER_DATA_MODULES } from "./types";

export default function MasterDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto gap-1 -mb-px">
          <Link
            href="/dashboard/master-data"
            className="inline-flex items-center px-4 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 whitespace-nowrap transition"
          >
            Overview
          </Link>
          {MASTER_DATA_MODULES.map((module) => (
            <Link
              key={module.slug}
              href={`/dashboard/master-data/${module.slug}`}
              className="inline-flex items-center px-4 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 whitespace-nowrap transition"
            >
              {module.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}