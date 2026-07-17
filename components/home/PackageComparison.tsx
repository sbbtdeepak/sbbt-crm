"use client";

import { useState } from "react";
import { PACKAGE_RATES } from "@/lib/pricing";

const CATEGORIES = [
  {
    category: "Structure",
    items: [
      { label: "Foundation", basic: "Standard", premium: "Reinforced", luxury: "Deep reinforced" },
      { label: "Steel", basic: "TATA / JSW", premium: "TATA / JSW", luxury: "TATA / JSW (higher grade)" },
      { label: "Cement", basic: "UltraTech / ACC", premium: "UltraTech / ACC", luxury: "UltraTech / ACC (53 grade)" },
      { label: "Brickwork", basic: "Standard red bricks", premium: "Standard red bricks", luxury: "AAC blocks" },
    ],
  },
  {
    category: "Electrical & Plumbing",
    items: [
      { label: "Electrical", basic: "Anchor / Havells", premium: "Havells / Polycab", luxury: "Premium Havells / Polycab" },
      { label: "Plumbing", basic: "Astral / Prince", premium: "Astral / Prince", luxury: "Premium Astral / Jaquar" },
    ],
  },
  {
    category: "Flooring & Bathroom",
    items: [
      { label: "Floor Tiles", basic: "Vitrified (upto ₹40/sqft)", premium: "Vitrified (upto ₹60/sqft)", luxury: "Premium vitrified (upto ₹100/sqft)" },
      { label: "Wall Tiles", basic: "Glazed (upto ₹35/sqft)", premium: "Glazed (upto ₹50/sqft)", luxury: "Designer (upto ₹80/sqft)" },
      { label: "Bathroom Fittings", basic: "Standard", premium: "Premium (Jaquar / Hindware)", luxury: "Luxury (Jaquar / Hindware)" },
    ],
  },
  {
    category: "Interior",
    items: [
      { label: "Kitchen", basic: "Basic platform + sink", premium: "Modular kitchen (standard)", luxury: "Premium modular kitchen" },
      { label: "Doors & Windows", basic: "Flush doors + Aluminium windows", premium: "Flush doors + UPVC windows", luxury: "Premium teak wood doors + UPVC" },
      { label: "Painting", basic: "Berger / Asian (interior)", premium: "Asian Paints (interior + exterior)", luxury: "Premium Asian Paints (full range)" },
    ],
  },
  {
    category: "Finishes & Warranty",
    items: [
      { label: "Waterproofing", basic: "Standard", premium: "Premium", luxury: "Advanced" },
      { label: "Warranty", basic: "5 years", premium: "7 years", luxury: "10 years" },
      { label: "Exclusions", basic: "Interior design, wardrobes", premium: "Premium wardrobes", luxury: "None — fully inclusive" },
    ],
  },
];

export default function PackageComparison() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggle = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const handleChoose = (pkgName: string) => {
    const rate = PACKAGE_RATES[pkgName];
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

  return (
    <section className="bg-slate-50 py-24 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Comparison
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Compare Construction Packages
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Choose the package that best suits your dream home.
          </p>
        </div>

        {/* Package header cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">Basic</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">₹1,699</p>
            <p className="text-xs text-slate-400">/ sqft</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center shadow-sm ring-2 ring-indigo-500/20">
            <p className="text-xs uppercase tracking-wider text-indigo-600">Premium</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">₹1,899</p>
            <p className="text-xs text-indigo-400">/ sqft</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">Luxury</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">₹2,499</p>
            <p className="text-xs text-slate-400">/ sqft</p>
          </div>
        </div>

        {/* Accordion */}
        <div className="mt-8 space-y-3">
          {CATEGORIES.map((cat) => {
            const isOpen = openCategory === cat.category;

            return (
              <div
                key={cat.category}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300"
              >
                <button
                  onClick={() => toggle(cat.category)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-50"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                    {cat.category}
                  </span>
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
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
                  <div className="border-t border-slate-100 px-6 py-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {cat.items.map((item) => (
                        <div key={item.label} className="col-span-3 grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-3 text-sm">
                          <div>
                            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                            <p className="mt-1 text-slate-700">{item.basic}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-indigo-600">Premium</p>
                            <p className="mt-1 font-medium text-indigo-700">{item.premium}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500">Luxury</p>
                            <p className="mt-1 text-slate-700">{item.luxury}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => handleChoose("Basic")}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 hover:shadow"
          >
            Choose Basic — ₹1,699/sqft
          </button>
          <button
            onClick={() => handleChoose("Premium")}
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Choose Premium — ₹1,899/sqft
          </button>
          <button
            onClick={() => handleChoose("Luxury")}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 hover:shadow"
          >
            Choose Luxury — ₹2,499/sqft
          </button>
        </div>
      </div>
    </section>
  );
}