"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PACKAGES_CONFIG } from "@/lib/pricing";

const PACKAGES = PACKAGES_CONFIG;

const FLOOR_OPTIONS = [
  { value: "gf", label: "Ground Floor (1 Floor)", multiplier: 1 },
  { value: "g1", label: "G+1 (2 Floors)", multiplier: 2 },
  { value: "g2", label: "G+2 (3 Floors)", multiplier: 3 },
  { value: "g3", label: "G+3 (4 Floors)", multiplier: 4 },
  { value: "g4", label: "G+4 (5 Floors)", multiplier: 5 },
  { value: "custom", label: "Custom Floors", multiplier: 0 },
] as const;

function getConstructionTime(builtUpArea: number): string {
  if (builtUpArea >= 1000 && builtUpArea <= 2000) return "6–9 Months";
  if (builtUpArea >= 2001 && builtUpArea <= 5000) return "8–10 Months";
  if (builtUpArea >= 5001 && builtUpArea <= 10000) return "9–15 Months";
  if (builtUpArea > 10000) return "Custom Timeline";
  return "—";
}

function useAnimatedValue(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    if (target === 0) {
      return;
    }

    const start = performance.now();
    let rafId: number | null = null;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * (2 - progress);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [target, duration]);

  return value;
}

export default function ConstructionEstimator() {
  const [plotSize, setPlotSize] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("basic");
  const [floors, setFloors] = useState<string>("gf");
  const [showResult, setShowResult] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const isCustomPackage = selectedPackage === "custom";
  const isCustomFloors = floors === "custom";

  const floorMultiplier =
    FLOOR_OPTIONS.find((f) => f.value === floors)?.multiplier ?? 1;
  const packageRate =
    PACKAGES.find((p) => p.value === selectedPackage)?.rate ?? 0;
  const packageLabel =
    PACKAGES.find((p) => p.value === selectedPackage)?.label ?? "";
  const floorLabel =
    FLOOR_OPTIONS.find((f) => f.value === floors)?.label ?? "";

  const plotSqft = parseFloat(plotSize) || 0;
  const builtUpArea = plotSqft * (isCustomFloors ? 1 : floorMultiplier);
  const estimatedCost = builtUpArea * packageRate;

  const animatedCost = useAnimatedValue(estimatedCost);

  const handleCalculate = useCallback(() => {
    if (!plotSqft || plotSqft <= 0) return;
    if (isCustomPackage || isCustomFloors) {
      setShowResult(true);
      return;
    }
    setShowResult(true);
  }, [plotSqft, isCustomPackage, isCustomFloors]);

  const handleReset = () => {
    setPlotSize("");
    setSelectedPackage("basic");
    setFloors("gf");
    setShowResult(false);
  };

  const handleGetDetailedQuote = () => {
    const params = new URLSearchParams({
      plotSize: plotSqft.toString(),
      floors,
      builtUpArea: builtUpArea.toString(),
      package: selectedPackage,
      rate: packageRate.toString(),
      estimatedCost: estimatedCost.toString(),
    });
    window.location.href = `/quote?${params.toString()}`;
  };

  // Listen for package selection from Packages section
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        rate: number;
        label: string;
      };
      const match = PACKAGES.find((p) => p.rate === detail.rate);
      if (match) {
        setSelectedPackage(match.value);
        setShowResult(false);
      }
    };
    window.addEventListener("select-package", handler);
    return () => window.removeEventListener("select-package", handler);
  }, []);

  const isCustomResult = isCustomPackage || isCustomFloors;

  return (
    <section
      id="construction-estimator"
      ref={sectionRef}
      className="bg-slate-50 py-6 sm:py-10 text-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-xl bg-white p-5 shadow-lg shadow-slate-200 ring-1 ring-slate-200/60 sm:p-8">
          {/* Section header */}
          <div className="mb-4 text-center">
            <p className="mb-1 text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
              Cost calculator
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Construction cost estimator
            </h2>
            <p className="mt-1.5 mx-auto max-w-xl text-xs leading-5 text-slate-600 sm:text-sm">
              Get a ballpark estimate for your project. Enter your details below
              for an instant rough calculation.
            </p>
          </div>

          {/* Form */}
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Plot size */}
              <div>
                <label
                  htmlFor="plotSize"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  Plot size (sq. ft.)
                </label>
                <input
                  id="plotSize"
                  type="number"
                  min="1"
                  placeholder="e.g. 2500"
                  value={plotSize}
                  onChange={(e) => {
                    setPlotSize(e.target.value);
                    setShowResult(false);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Construction package */}
              <div>
                <label
                  htmlFor="package"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  Construction package
                </label>
                <select
                  id="package"
                  value={selectedPackage}
                  onChange={(e) => {
                    setSelectedPackage(e.target.value);
                    setShowResult(false);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {PACKAGES.map((pkg) => (
                    <option key={pkg.value} value={pkg.value}>
                      {pkg.label}{" "}
                      {pkg.rate > 0 ? `(₹${pkg.rate}/sqft)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of floors */}
              <div>
                <label
                  htmlFor="floors"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  Number of floors
                </label>
                <select
                  id="floors"
                  value={floors}
                  onChange={(e) => {
                    setFloors(e.target.value);
                    setShowResult(false);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {FLOOR_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calculate button */}
              <div className="flex items-end">
                <button
                  onClick={handleCalculate}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500"
                >
                  Calculate estimate
                </button>
              </div>
            </div>

            {/* Result */}
            {showResult && plotSqft > 0 && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                {isCustomResult ? (
                  <>
                    <h3 className="mb-2 text-xs font-semibold text-slate-900">
                      Custom requirement
                    </h3>
                    <p className="text-xs text-slate-600">
                      {isCustomPackage && isCustomFloors
                        ? "You've selected a custom package and custom floor plan."
                        : isCustomPackage
                          ? "You've selected a custom package."
                          : "You've selected a custom floor plan."}{" "}
                      Contact our team for a personalized quote tailored to your
                      needs.
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Timeline will be shared after consultation.
                    </p>
                    <div className="mt-3 flex flex-row gap-1.5">
                      <a
                        href="/quote"
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500"
                      >
                        Get Detailed Quote
                      </a>
                      <a
                        href="/contact"
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        Talk to Engineer
                      </a>
                      <button
                        onClick={handleReset}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        Reset
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mb-2 text-xs font-semibold text-slate-900">
                      Your estimate
                    </h3>

                    <div className="mb-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200/60">
                        <p className="text-[8px] uppercase tracking-wider text-slate-500">
                          Plot size
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-950">
                          {plotSqft.toLocaleString("en-IN")} sq. ft.
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200/60">
                        <p className="text-[8px] uppercase tracking-wider text-slate-500">
                          Floors
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-950">
                          {floorLabel}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200/60">
                        <p className="text-[8px] uppercase tracking-wider text-slate-500">
                          Built-up area
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-950">
                          {builtUpArea.toLocaleString("en-IN")} sq. ft.
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200/60">
                        <p className="text-[8px] uppercase tracking-wider text-slate-500">
                          Package
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-950">
                          {packageLabel}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200/60">
                        <p className="text-[8px] uppercase tracking-wider text-slate-500">
                          Rate / sqft
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-950">
                          ₹{packageRate.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200/60">
                        <p className="text-[8px] uppercase tracking-wider text-slate-500">
                          Est. time
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-950">
                          {getConstructionTime(builtUpArea)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-indigo-50 p-2 ring-1 ring-indigo-200/60">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-indigo-700">
                          Estimated construction cost
                        </p>
                        <p className="text-lg font-bold text-indigo-700">
                          ₹{animatedCost.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-row gap-1.5">
                      <button
                        onClick={handleGetDetailedQuote}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500"
                      >
                        Get Detailed Quote
                      </button>
                      <a
                        href="/contact"
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        Talk to Engineer
                      </a>
                      <button
                        onClick={handleReset}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        Reset
                      </button>
                    </div>

                    <p className="mt-2 text-[8px] text-slate-400">
                      This is an approximate construction estimate. Actual cost
                      may vary depending on structural design, soil condition,
                      material selection, location, government approvals and
                      client requirements.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}