"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { PACKAGE_RATES } from "@/lib/pricing";

const PACKAGE_RATE_MAP = PACKAGE_RATES;

export default function Packages() {
  const router = useRouter();
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

  const handleEstimate = (pkgName: string) => {
    const rate = PACKAGE_RATE_MAP[pkgName];
    if (!rate) return;

    window.dispatchEvent(
      new CustomEvent("select-package", {
        detail: { rate, label: pkgName },
      })
    );

    const estimator = document.getElementById("construction-estimator");
    if (estimator) {
      estimator.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleGetQuote = () => {
    router.push("/quote");
  };

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
                    className="h-24 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-32"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-slate-100 text-slate-400 text-xs sm:h-32">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col px-2 pb-2 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2.5">
                <div className="flex items-start justify-between gap-1 sm:gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.24em] text-indigo-600 sm:text-xs">
                      Package
                    </p>
                    <h3 className="mt-0.5 text-xs font-semibold text-slate-950 sm:text-sm">
                      {pkg.name}
                    </h3>
                  </div>
                  <p className="shrink-0 text-right text-xs font-semibold text-emerald-600 sm:text-sm">
                    ₹{Number(pkg.price).toLocaleString()}
                    <span className="hidden sm:block text-[10px] font-medium text-slate-500">/ sqft</span>
                  </p>
                </div>

                <p className="mt-1.5 text-[8px] leading-4 text-slate-600 line-clamp-2 sm:text-xs sm:leading-5 sm:mt-2">
                  {pkg.short_description}
                </p>

                <div className="mt-auto flex gap-1.5 pt-2 sm:pt-3">
                  <button
                    onClick={() => handleEstimate(pkg.name)}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-600 px-2 py-1 text-[9px] font-semibold text-white transition hover:bg-indigo-500 sm:text-[10px] sm:px-3 sm:py-1.5"
                  >
                    Estimate
                  </button>

                  <button
                    onClick={handleGetQuote}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-semibold text-slate-900 transition hover:border-indigo-300 hover:bg-slate-50 sm:text-[10px] sm:px-3 sm:py-1.5"
                  >
                    Quote
                  </button>
                </div>

                <Link
                  href={`/packages/${pkg.slug}`}
                  className="mt-1 inline-flex w-full items-center justify-center text-[9px] text-indigo-600 hover:underline sm:text-[10px]"
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