"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  short_description?: string | null;
}

export default function Packages() {
  const [packages, setPackages] = useState<PackageItem[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price")
      .then(({ data }) => {
        if (data) setPackages(data as PackageItem[]);
      });
  }, []);

  if (packages.length === 0) return null;

  return (
    <section className="bg-[#f8fafc] text-slate-900 py-6 sm:py-10" aria-label="Construction packages">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-[80px]">
        <div className="mx-auto max-w-3xl text-center mb-4 sm:mb-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Premium Packages
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Construction packages designed for your needs.
          </h2>
        </div>

        {/* Auto-fit grid with equal height cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 auto-cols-fr">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md h-full"
            >
              <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
                <p className="text-[9px] uppercase tracking-[0.24em] text-indigo-600 sm:text-xs">
                  Package
                </p>
                <h3 className="mt-0.5 text-xs font-semibold text-slate-950 sm:text-sm">
                  {pkg.name}
                </h3>
                {pkg.short_description && (
                  <p className="mt-1 text-[10px] text-slate-500 leading-tight line-clamp-2 sm:text-xs flex-1">
                    {pkg.short_description}
                  </p>
                )}
                <p className="mt-2 pt-2 text-[11px] font-semibold text-emerald-600 sm:text-sm">
                  ₹{Number(pkg.price).toLocaleString()}/sqft
                </p>

                <Link
                  href={`/packages/${pkg.slug}`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-2 py-1.5 text-[9px] font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:py-2 sm:text-xs"
                  aria-label={`View details for ${pkg.name} package`}
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}