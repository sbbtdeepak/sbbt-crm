"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  WIZARD_STEPS,
  PROJECT_TYPE_LABELS,
  FLOOR_OPTION_LABELS,
  type EstimateFormState,
} from "../types";
import {
  getPricingRegions,
  getPackages,
  getAddOns,
  createEstimate,
} from "../actions";
import { calculatePricing, formatEstimateSummary } from "../lib/pricing-engine";
import type { PricingItem } from "../types";

interface PricingRegion {
  id: number;
  region_name: string;
  city: string;
  state: string;
  base_rate_per_sqft: number;
  labour_rate_per_sqft: number;
  currency: string;
}

interface Package {
  id: number;
  name: string;
  slug: string;
  price: number;
  short_description: string;
  target_segment: string;
  thumbnail_url: string;
}

interface AddOn {
  id: number;
  name: string;
  description: string;
  price: number;
  unit_type: string;
}

interface WizardData {
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  lead_id: string;
  project_type: string;
  pricing_region_id: string;
  region_name: string;
  base_rate_per_sqft: string;
  labour_rate_per_sqft: string;
  currency: string;
  plot_width: string;
  plot_length: string;
  plot_area: string;
  road_facing: string;
  basement: boolean;
  stilt: boolean;
  floors: string;
  custom_floors: string;
  package_id: string;
  package_name: string;
  package_price: string;
  add_on_ids: string;
  discount_amount: string;
  tax_rate: string;
  notes: string;
}

const initialData: WizardData = {
  customer_name: "",
  customer_mobile: "",
  customer_email: "",
  lead_id: "",
  project_type: "residential",
  pricing_region_id: "",
  region_name: "",
  base_rate_per_sqft: "",
  labour_rate_per_sqft: "",
  currency: "INR",
  plot_width: "",
  plot_length: "",
  plot_area: "",
  road_facing: "",
  basement: false,
  stilt: false,
  floors: "ground",
  custom_floors: "",
  package_id: "",
  package_name: "",
  package_price: "",
  add_on_ids: "",
  discount_amount: "0",
  tax_rate: "18",
  notes: "",
};

const STORAGE_KEY = "estimate_wizard_data";

export default function EstimateWizard() {
  const router = useRouter();
  const [state, setState] = useState<EstimateFormState | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return { ...initialData, ...JSON.parse(saved) }; } catch { return initialData; }
    }
    return initialData;
  });
  const [regions, setRegions] = useState<PricingRegion[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.add_on_ids) return parsed.add_on_ids.split(",").map(Number).filter(Boolean);
      } catch { /* ignore */ }
    }
    return [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchMasterData() {
      const [regionsData, packagesData, addOnsData] = await Promise.all([
        getPricingRegions(),
        getPackages(),
        getAddOns(),
      ]);
      setRegions(regionsData as PricingRegion[]);
      setPackages(packagesData as Package[]);
      setAddOns(addOnsData as AddOn[]);
    }
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    autoSaveTimeout.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        add_on_ids: selectedAddOns.join(","),
      }));
      setTimeout(() => setAutoSaveStatus("saved"), 500);
    }, 1000);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [data, selectedAddOns]);

  const updateField = (field: keyof WizardData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegionChange = (regionId: string) => {
    const region = regions.find((r) => r.id === parseInt(regionId, 10));
    if (region) {
      setData((prev) => ({
        ...prev,
        pricing_region_id: regionId,
        region_name: region.region_name,
        base_rate_per_sqft: String(region.base_rate_per_sqft),
        labour_rate_per_sqft: String(region.labour_rate_per_sqft),
        currency: region.currency,
      }));
    }
  };

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find((p) => p.id === parseInt(packageId, 10));
    if (pkg) {
      setData((prev) => ({
        ...prev,
        package_id: packageId,
        package_name: pkg.name,
        package_price: String(pkg.price),
      }));
    }
  };

  const toggleAddOn = (id: number) => {
    setSelectedAddOns((prev) => {
      const exists = prev.includes(id);
      const updated = exists
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      updateField("add_on_ids", updated.join(","));
      return updated;
    });
  };

  const calculatePlotArea = () => {
    const width = parseFloat(data.plot_width);
    const length = parseFloat(data.plot_length);
    if (width > 0 && length > 0) {
      const area = width * length;
      updateField("plot_area", String(area));
    }
  };

  const calculatePricingPreview = () => {
    const plotArea = parseFloat(data.plot_area) || 0;
    const totalArea = plotArea;
    const baseRate = parseFloat(data.base_rate_per_sqft) || 0;
    const labourRate = parseFloat(data.labour_rate_per_sqft) || 0;
    const discount = parseFloat(data.discount_amount) || 0;
    const taxRate = parseFloat(data.tax_rate) || 18;

    const packageItems: PricingItem[] = [];
    if (data.package_id) {
      const pkg = packages.find((p) => p.id === parseInt(data.package_id, 10));
      if (pkg) {
        packageItems.push({
          item_name: pkg.name,
          category: "Package",
          brand: "",
          quantity: 1,
          unit: "project",
          material_rate: pkg.price,
          labour_rate: 0,
          wastage_percent: 0,
          contractor_margin_percent: 10,
          customer_margin_percent: 0,
          gst_percent: taxRate,
        });
      }
    }

    const addOnItems: PricingItem[] = selectedAddOns.map((id) => {
      const addon = addOns.find((a) => a.id === id);
      return {
        item_name: addon?.name || "Add-on",
        category: "Add-on",
        brand: "",
        quantity: 1,
        unit: addon?.unit_type || "flat",
        material_rate: addon?.price || 0,
        labour_rate: 0,
        wastage_percent: 0,
        contractor_margin_percent: 10,
        customer_margin_percent: 0,
        gst_percent: taxRate,
      };
    });

    return calculatePricing({
      plot_area: plotArea,
      total_area: totalArea,
      base_rate_per_sqft: baseRate,
      labour_rate_per_sqft: labourRate,
      packageItems,
      addOnItems,
      discount_amount: discount,
      tax_rate: taxRate,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        formData.set(key, value ? "on" : "off");
      } else {
        formData.set(key, value);
      }
    });
    formData.set("add_on_ids", selectedAddOns.join(","));

    const result = await createEstimate({} as EstimateFormState, formData);
    setState(result);
    if (result?.success) {
      localStorage.removeItem(STORAGE_KEY);
      router.push("/dashboard/estimate-engine");
    }
    setIsSubmitting(false);
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const step = WIZARD_STEPS[currentStep];
  const pricing = calculatePricingPreview();
  const summaryLines = formatEstimateSummary(pricing);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {autoSaveStatus === "saving" && "Saving..." || autoSaveStatus === "saved" && "Saved"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {WIZARD_STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToStep(idx)}
              disabled={idx > currentStep}
              className={`text-center ${
                idx === currentStep
                  ? "text-indigo-600 font-semibold"
                  : idx < currentStep
                  ? "text-gray-700 hover:text-indigo-600"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <div className="text-xs">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {state?.message && !state.success && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-600">
          {state.message}
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-xl bg-white p-6 shadow border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{step.label}</h2>
        <p className="text-sm text-gray-500 mb-6">{step.description}</p>

        {step.id === "customer" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={data.customer_name}
                onChange={(e) => updateField("customer_name", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={data.customer_mobile}
                onChange={(e) => updateField("customer_mobile", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={data.customer_email}
                onChange={(e) => updateField("customer_email", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead ID (optional)
              </label>
              <input
                type="number"
                value={data.lead_id}
                onChange={(e) => updateField("lead_id", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="Link to existing lead"
              />
              <p className="text-xs text-gray-500 mt-1">
                If left blank, a new lead will be created automatically.
              </p>
            </div>
          </div>
        )}

        {step.id === "project" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField("project_type", value)}
                    className={`p-3 text-sm font-medium rounded-lg border transition ${
                      data.project_type === value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step.id === "location" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pricing Region *
              </label>
              <select
                value={data.pricing_region_id}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              >
                <option value="">Select a pricing region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.region_name} — {region.city}, {region.state}
                  </option>
                ))}
              </select>
            </div>
            {data.pricing_region_id && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Rate per Sq.Ft (₹)
                  </label>
                  <input
                    type="number"
                    value={data.base_rate_per_sqft}
                    onChange={(e) => updateField("base_rate_per_sqft", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labour Rate per Sq.Ft (₹)
                  </label>
                  <input
                    type="number"
                    value={data.labour_rate_per_sqft}
                    onChange={(e) => updateField("labour_rate_per_sqft", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step.id === "plot" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Width (ft)
                </label>
                <input
                  type="number"
                  value={data.plot_width}
                  onChange={(e) => updateField("plot_width", e.target.value)}
                  onBlur={calculatePlotArea}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  placeholder="e.g. 40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plot Length (ft)
                </label>
                <input
                  type="number"
                  value={data.plot_length}
                  onChange={(e) => updateField("plot_length", e.target.value)}
                  onBlur={calculatePlotArea}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  placeholder="e.g. 60"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plot Area (Sq.Ft)
              </label>
              <input
                type="number"
                value={data.plot_area}
                onChange={(e) => updateField("plot_area", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="Auto-calculated from width × length"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Road Facing
              </label>
              <input
                type="text"
                value={data.road_facing}
                onChange={(e) => updateField("road_facing", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="e.g. North, East"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.basement}
                  onChange={(e) => updateField("basement", e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Basement</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.stilt}
                  onChange={(e) => updateField("stilt", e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Stilt</span>
              </label>
            </div>
          </div>
        )}

        {step.id === "floors" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Floors *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(FLOOR_OPTION_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField("floors", value)}
                    className={`p-3 text-sm font-medium rounded-lg border transition ${
                      data.floors === value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {data.floors === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Floor Count
                </label>
                <input
                  type="number"
                  value={data.custom_floors}
                  onChange={(e) => updateField("custom_floors", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  placeholder="e.g. 3"
                />
              </div>
            )}
          </div>
        )}

        {step.id === "package" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Package *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handlePackageChange(String(pkg.id))}
                    className={`p-4 text-left rounded-lg border transition ${
                      data.package_id === String(pkg.id)
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{pkg.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {pkg.short_description}
                    </div>
                    <div className="text-lg font-bold text-indigo-600 mt-2">
                      ₹{pkg.price.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step.id === "addons" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Add-ons (Multiple selection allowed)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addOns.map((addon) => {
                  const isSelected = selectedAddOns.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-3 text-left rounded-lg border transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {addon.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {addon.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600">
                            ₹{addon.price.toLocaleString()}
                          </div>
                          {isSelected && (
                            <span className="text-xs text-indigo-600">Selected</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step.id === "calculation" && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Auto-Calculated Pricing
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plot Area</span>
                  <span className="font-medium">
                    {parseFloat(data.plot_area || "0").toLocaleString()} Sq.Ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Rate</span>
                  <span className="font-medium">
                    ₹{parseFloat(data.base_rate_per_sqft || "0").toLocaleString()}/Sq.Ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labour Rate</span>
                  <span className="font-medium">
                    ₹{parseFloat(data.labour_rate_per_sqft || "0").toLocaleString()}/Sq.Ft
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount (₹)
              </label>
              <input
                type="number"
                value={data.discount_amount}
                onChange={(e) => updateField("discount_amount", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={data.tax_rate}
                onChange={(e) => updateField("tax_rate", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                placeholder="18"
              />
            </div>
          </div>
        )}

        {step.id === "summary" && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Estimate Summary
              </h3>
              <div className="space-y-2">
                {summaryLines.map((line) => (
                  <div
                    key={line.label}
                    className="flex justify-between text-sm"
                  >
                    <span
                      className={
                        line.type === "total"
                          ? "font-bold text-gray-900"
                          : "text-gray-600"
                      }
                    >
                      {line.label}
                    </span>
                    <span
                      className={
                        line.type === "total"
                          ? "font-bold text-indigo-600 text-lg"
                          : line.type === "negative"
                          ? "text-red-600"
                          : line.type === "positive"
                          ? "text-emerald-600"
                          : "font-medium text-gray-900"
                      }
                    >
                      {line.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={data.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                rows={4}
                placeholder="Add any notes for this estimate..."
              />
            </div>
          </div>
        )}

        {step.id === "save" && (
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Ready to Save Estimate
              </h3>
              <p className="text-sm text-gray-600">
                An estimate number will be auto-generated (e.g. EST-2026-000001).
                Version 1 will be saved automatically.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Customer:</div>
                <div className="font-medium">{data.customer_name}</div>
                <div className="text-gray-600">Project:</div>
                <div className="font-medium">
                  {PROJECT_TYPE_LABELS[data.project_type as keyof typeof PROJECT_TYPE_LABELS] || data.project_type}
                </div>
                <div className="text-gray-600">Region:</div>
                <div className="font-medium">{data.region_name || "—"}</div>
                <div className="text-gray-600">Package:</div>
                <div className="font-medium">{data.package_name || "—"}</div>
                <div className="text-gray-600">Add-ons:</div>
                <div className="font-medium">
                  {selectedAddOns.length} selected
                </div>
                <div className="text-gray-600">Grand Total:</div>
                <div className="font-bold text-indigo-600">
                  ₹{pricing.grand_total.toLocaleString()}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Saving..." : "Save Estimate"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step.id !== "save" && (
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          {step.id === "calculation" && (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Review Summary
            </button>
          )}
          {step.id !== "calculation" && (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
