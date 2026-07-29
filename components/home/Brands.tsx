"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Brands – Premium two-row infinite auto-scroller (CMS-ready)        */
/* ------------------------------------------------------------------ */

export interface Brand {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBrandColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 40%, 92%)`;
}

/* ------------------------------------------------------------------ */
/*  Single brand card — premium look                                    */
/* ------------------------------------------------------------------ */

function BrandCard({ brand }: { brand: Brand }) {
  if (brand.logoUrl) {
    return (
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1
                   w-[140px] h-[100px] sm:w-[160px] sm:h-[110px] lg:w-[180px] lg:h-[120px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logoUrl}
          alt={brand.name}
          loading="lazy"
          className="max-h-[52px] sm:max-h-[60px] lg:max-h-[72px] w-auto object-contain object-center transition-transform duration-300 ease-out"
        />
      </div>
    );
  }

  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1
                 w-[140px] h-[100px] sm:w-[160px] sm:h-[110px] lg:w-[180px] lg:h-[120px]"
    >
      <div
        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-110"
        style={{ backgroundColor: getBrandColor(brand.name) }}
      >
        <span className="text-sm sm:text-base font-bold text-slate-700">
          {getInitials(brand.name)}
        </span>
      </div>
      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight text-center truncate max-w-[120px]">
        {brand.name}
      </p>
      <p className="text-[10px] sm:text-xs text-slate-400 leading-tight text-center">
        {brand.category}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scrolling row                                                      */
/* ------------------------------------------------------------------ */

function ScrollingRow({
  brands,
  reverse,
  className,
}: {
  brands: Brand[];
  reverse?: boolean;
  className?: string;
}) {
  const doubled = [...brands, ...brands];

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div
        className={`flex w-max gap-4 sm:gap-5 lg:gap-6 will-change-transform ${
          reverse ? "animate-brands-scroll-reverse" : "animate-brands-scroll"
        }`}
      >
        {doubled.map((brand, idx) => (
          <BrandCard
            key={`${reverse ? "r" : "l"}-${brand.id}-${idx}`}
            brand={brand}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("cms_brands")
      .select("id, name, category, logo_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBrands(
            data.map((b: Record<string, unknown>) => ({
              id: String(b.id),
              name: (b.name as string) || "",
              category: (b.category as string) || "",
              logoUrl: (b.logo_url as string) || undefined,
            }))
          );
        }
      });
  }, []);

  if (brands.length === 0) return null;

  const mid = Math.ceil(brands.length / 2);
  const rowA = brands.slice(0, mid);
  const rowB = brands.slice(mid);

  return (
    <section className="bg-white py-12 sm:py-16 text-slate-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-12">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Our Partners
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
            Trusted Brands We Work With
          </h2>
        </div>

        {/* Scroller */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <ScrollingRow brands={rowA} className="mb-4 sm:mb-5" />
          <ScrollingRow brands={rowB} reverse />
        </div>

        <p className="mt-8 text-center text-[10px] sm:text-xs text-slate-400">
          &hellip;and many more trusted names in construction industry.
        </p>
      </div>
    </section>
  );
}