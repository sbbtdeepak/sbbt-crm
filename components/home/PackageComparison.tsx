"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PackageFeature {
  id: string;
  section: string;
  feature: string;
  solid_structure: string | null;
  essential: string | null;
  premium: string | null;
  custom: string | null;
}

const SECTIONS = ["STRUCTURE", "ELECTRICAL", "DOORS & WINDOWS", "KITCHEN", "BATHROOM", "FLOORING", "CEILING", "EXTERIOR", "SITE MANAGEMENT", "COMMERCIAL"];

export default function PackageComparison() {
  const [packages, setPackages] = useState<any[]>([]);
  const [features, setFeatures] = useState<PackageFeature[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    Promise.all([
      supabase.from("packages").select("*").eq("is_active", true).order("price", { ascending: true }),
      supabase.from("package_features").select("*").order("sort_order", { ascending: true }),
    ]).then(([{ data: pkgs }, { data: feats }]) => {
      setPackages(pkgs ?? []);
      setFeatures(feats ?? []);
    });
  }, []);

  if (packages.length === 0) return null;

  const getDisplayValue = (value: string | null) => {
    if (!value || value === "NA") return "—";
    return value;
  };

  const featuresBySection = SECTIONS.map(section => ({
    section,
    items: features.filter((f) => f.section === section)
  })).filter(s => s.items.length > 0);

  return (
    <section className="bg-slate-50 py-6 sm:py-16 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Mobile: Collapsible button */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between"
          >
            <div>
              <h3 className="text-base font-semibold text-slate-950">Compare Packages</h3>
              <p className="text-xs text-slate-500 mt-0.5">Compare all package specifications</p>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${showComparison ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Desktop or when comparison is open on mobile */}
        <div className={`${showComparison ? "block" : "hidden"} sm:block mt-3 sm:mt-0`}>
          <div className="mx-auto max-w-3xl text-center mb-4 sm:mb-6">
            <p className="text-xs uppercase tracking-[0.32em] text-indigo-600 sm:text-sm">
              Comparison
            </p>
            <h2 className="mt-2 sm:mt-3 text-lg sm:text-4xl font-semibold tracking-tight text-slate-950">
              Compare Construction Packages
            </h2>
          </div>

          {/* Compact selector cards */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3 mb-3 sm:mb-5">
            {packages.map((pkg: any) => (
              <div key={pkg.id} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 text-center shadow-sm">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">{pkg.name}</p>
                <p className="mt-0.5 sm:mt-1 text-sm sm:text-xl font-bold text-slate-900">₹{Number(pkg.price).toLocaleString()}</p>
                <p className="text-[8px] sm:text-xs text-slate-400">/ sqft</p>
              </div>
            ))}
          </div>

          {/* Accordion sections - one open at a time */}
          <div className="space-y-2">
            {featuresBySection.map(({ section, items }) => {
              const isOpen = openSection === section;
              
              return (
                <div
                  key={section}
                  className="overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : section)}
                    className="flex w-full items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 text-left hover:bg-slate-50"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-700">
                      {section}
                    </span>
                    <svg
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-slate-100 px-4 sm:px-5 py-2.5 sm:py-3">
                      {/* Table header - NO extra section heading */}
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-[8px] sm:text-xs font-semibold text-slate-500 border-b pb-1.5 sm:pb-2 mb-1.5 sm:mb-2">
                        <div>Feature</div>
                        <div>Solid</div>
                        <div>Essential</div>
                        <div>Premium</div>
                      </div>

                      {/* Table rows */}
                      <div className="grid gap-1 sm:gap-2">
                        {items.map((item) => (
                          <div key={item.id} className="grid grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-sm py-0.5 sm:py-1 border-b last:border-0">
                            <div className="font-medium text-slate-700">{item.feature}</div>
                            <div className="text-slate-600">{getDisplayValue(item.solid_structure)}</div>
                            <div className="text-indigo-700 font-medium">{getDisplayValue(item.essential)}</div>
                            <div className="text-slate-600">{getDisplayValue(item.premium)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}