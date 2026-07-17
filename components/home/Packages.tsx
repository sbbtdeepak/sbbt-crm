"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { PACKAGE_RATES } from "@/lib/pricing";

const PACKAGE_RATE_MAP = PACKAGE_RATES;

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

  if (packages.length === 0) return null;

  return (
    <section className="bg-[#f8fafc] py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Premium Packages
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            End-to-end construction plans for exceptional homes.
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Choose the package that brings luxury finishes, transparent costs, and skilled execution.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="mt-16 hidden md:grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg: any) => (
            <article
              key={pkg.id}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="overflow-hidden rounded-[1.75rem]">
                {pkg.image_url ? (
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-400">
                    No image available
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-indigo-600">
                    Package
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                    {pkg.name}
                  </h3>
                </div>
                <p className="text-right text-2xl font-semibold text-emerald-600">
                  ₹{Number(pkg.price).toLocaleString()}
                  <span className="block text-sm font-medium text-slate-500">/ sqft</span>
                </p>
              </div>

              <p className="mt-5 text-slate-600 leading-7">
                {pkg.short_description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1">
                  Fixed timelines
                </span>
                <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1">
                  Quality assurance
                </span>
                <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1">
                  Transparent billing
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => handleEstimate(pkg.name)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Estimate with this Package
                </button>
                <a
                  href="/quote"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Request a quote
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile Swipe Carousel */}
        <div className="mt-16 md:hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {packages.map((pkg: any) => (
              <article
                key={pkg.id}
                className="group snap-start flex-shrink-0 w-80 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="overflow-hidden rounded-[1.75rem]">
                  {pkg.image_url ? (
                    <img
                      src={pkg.image_url}
                      alt={pkg.name}
                      className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-400">
                      No image available
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-indigo-600">
                      Package
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                      {pkg.name}
                    </h3>
                  </div>
                  <p className="text-right text-xl font-semibold text-emerald-600">
                    ₹{Number(pkg.price).toLocaleString()}
                    <span className="block text-xs font-medium text-slate-500">/ sqft</span>
                  </p>
                </div>

                <p className="mt-3 text-sm text-slate-600 leading-6">
                  {pkg.short_description}
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleEstimate(pkg.name)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Estimate
                  </button>
                  <a
                    href="/quote"
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Quote
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}