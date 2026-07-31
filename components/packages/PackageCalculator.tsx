"use client";

import { useState, useMemo } from "react";
import { trackGetQuoteClick } from "@/lib/analytics";

interface PackageOption {
  id: number;
  name: string;
  slug: string;
  price: number;
}

interface PackageCalculatorProps {
  packages: PackageOption[];
}

const GST_RATE = 0.18;

export default function PackageCalculator({ packages }: PackageCalculatorProps) {
  const [plotArea, setPlotArea] = useState<string>("");
  const [floors, setFloors] = useState<string>("1");
  const [packageId, setPackageId] = useState<string>("");
  const [builtUpPct, setBuiltUpPct] = useState<string>("80");

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id.toString() === packageId),
    [packages, packageId]
  );

  const calculation = useMemo(() => {
    const area = parseFloat(plotArea) || 0;
    const numFloors = parseInt(floors, 10) || 1;
    const pct = parseFloat(builtUpPct) || 0;
    const rate = selectedPackage?.price || 0;

    if (area <= 0 || rate <= 0) return null;

    const builtUpArea = (area * pct) / 100 * numFloors;
    const estimatedCost = builtUpArea * rate;
    const gst = estimatedCost * GST_RATE;
    const total = estimatedCost + gst;

    return {
      builtUpArea: Math.round(builtUpArea),
      rate,
      estimatedCost: Math.round(estimatedCost),
      gst: Math.round(gst),
      total: Math.round(total),
    };
  }, [plotArea, floors, builtUpPct, selectedPackage]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900">Construction Cost Calculator</h3>
      </div>
      <p className="text-gray-500 text-xs mb-4">Estimate your project cost based on plot area and package selection.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Plot Area */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Plot Area (sq.ft)</label>
          <input
            type="number"
            value={plotArea}
            onChange={(e) => setPlotArea(e.target.value)}
            placeholder="e.g. 200"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
          />
        </div>

        {/* Floors */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Number of Floors</label>
          <select
            value={floors}
            onChange={(e) => setFloors(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition bg-white"
          >
            {[1, 2, 3, 4].map((f) => (
              <option key={f} value={f}>{f} Floor{f > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        {/* Package */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Package</label>
          <select
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition bg-white"
          >
            <option value="">Select Package</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.price > 0 ? `(₹${p.price}/sq.ft)` : "(Custom)"}
              </option>
            ))}
          </select>
        </div>

        {/* Built-up % */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Built-up Area (%)</label>
          <input
            type="number"
            value={builtUpPct}
            onChange={(e) => setBuiltUpPct(e.target.value)}
            placeholder="80"
            min="50"
            max="100"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
          />
        </div>
      </div>

      {/* Results */}
      {calculation && (
        <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Built-up Area</span>
            <span className="font-semibold text-gray-900">{formatCurrency(calculation.builtUpArea)} sq.ft</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Rate</span>
            <span className="font-semibold text-gray-900">₹{calculation.rate}/sq.ft</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Cost</span>
            <span className="font-semibold text-gray-900">₹{formatCurrency(calculation.estimatedCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST (18%)</span>
            <span className="font-semibold text-gray-900">₹{formatCurrency(calculation.gst)}</span>
          </div>
          <div className="border-t border-indigo-200 pt-2 flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-indigo-600 text-lg">₹{formatCurrency(calculation.total)}</span>
          </div>
          <a
            href="/quote"
            onClick={() => trackGetQuoteClick()}
            className="block w-full text-center mt-3 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Get Detailed Quote →
          </a>
        </div>
      )}

      {!calculation && (
        <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
          Enter plot area and select a package to see estimated cost.
        </div>
      )}
    </div>
  );
}