"use client";

import { useEffect, useState } from "react";

interface CompanyData {
  brand_name: string;
  logo_url: string;
  tagline: string;
}

export default function MobileBrandHeader() {
  const [company, setCompany] = useState<CompanyData>({
    brand_name: "SBBT",
    logo_url: "",
    tagline: "",
  });

  useEffect(() => {
    fetch("/api/public/company")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCompany({
            brand_name: data.brand_name || "SBBT",
            logo_url: data.logo_url || "",
            tagline: data.tagline || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white pt-2 pb-1 px-3">
      <div className="flex items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 px-3.5 py-2" style={{ minHeight: "62px", maxHeight: "68px" }}>
        {/* Logo */}
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.brand_name}
            className="h-9 w-9 rounded-xl object-cover ring-2 ring-slate-100 flex-shrink-0"
          />
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-base">{company.brand_name?.charAt(0) || "S"}</span>
          </div>
        )}

        {/* Name + Tagline */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-950 truncate leading-tight">{company.brand_name}</p>
          <p className="text-[10px] text-slate-500 truncate leading-tight">{company.tagline || "Premium Construction Services Since 2011"}</p>
        </div>

        {/* Google Rating - Green theme */}
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 flex-shrink-0">
          <span className="text-emerald-600 text-[10px] leading-none">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span className="text-[9px] font-semibold text-emerald-700 leading-none whitespace-nowrap">4.9 Google</span>
        </div>
      </div>
    </div>
  );
}