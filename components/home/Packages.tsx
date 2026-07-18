"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Packages() {
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price")
      .then(({ data }) => {
        if (data) setPackages(data);
      });
  }, []);

  if (packages.length === 0) return null;

  return (
    <section className="bg-[#f8fafc] text-slate-900 py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Premium Packages
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Construction packages designed for your needs.
          </h2>
        </div>

        {/* Mobile: 2-column grid, Desktop: standard responsive */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
          {packages.map((pkg: any) => (
            <div
              key={pkg.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="overflow-hidden">
                {pkg.image_url ? (
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="h-20 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-32"
                  />
                ) : (
                  <div className="flex h-20 w-full items-center justify-center bg-slate-100 text-slate-400 text-[10px] sm:h-32">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col px-2 pb-2 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2.5">
                <p className="text-[9px] uppercase tracking-[0.24em] text-indigo-600 sm:text-xs">
                  Package
                </p>
                <h3 className="mt-0.5 text-xs font-semibold text-slate-950 sm:text-sm">
                  {pkg.name}
                </h3>
                <p className="mt-1 text-[10px] font-semibold text-emerald-600 sm:text-sm">
                  ₹{Number(pkg.price).toLocaleString()}/sqft
                </p>

                {/* View Details button only - no Estimate/Quote on Home page */}
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="mt-auto inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-2 py-1 text-[9px] font-semibold text-white transition hover:bg-indigo-500 sm:py-1.5"
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