"use client";

import { useState } from "react";
import { updatePackage } from "../actions";

interface PackageFeature {
  id: string;
  section: string;
  feature: string;
  solid_structure: string | null;
  essential: string | null;
  premium: string | null;
  custom: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  pkg: {
    id: string;
    slug: string;
    name: string;
    price: number;
    short_description: string;
    description: string;
    brands: string;
    image_url: string;
    is_active: boolean;
  } | null;
  features: PackageFeature[];
}

const SECTIONS = ["STRUCTURE", "ELECTRICAL", "DOORS & WINDOWS", "KITCHEN", "BATHROOM", "FLOORING", "CEILING", "EXTERIOR", "SITE MANAGEMENT", "COMMERCIAL"];

export default function EditPackageModal({ open, onClose, pkg, features }: Props) {
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!open || !pkg) return null;

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleUpdate = async (formData: FormData) => {
    setLoading(true);

    try {
      await updatePackage(pkg!.id, formData);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Unable to update package.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Edit Package: {pkg.name}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        <form
          action={handleUpdate}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block font-medium">
              Package Name *
            </label>

            <input
              required
              name="name"
              defaultValue={pkg.name}
              className="w-full rounded-lg border p-3"
              placeholder="e.g., Premium"
            />

          </div>

          <div>
            <label className="mb-2 block font-medium">
              Price (₹ / sqft) *
            </label>

            <input
              required
              type="number"
              name="price"
              defaultValue={pkg.price}
              className="w-full rounded-lg border p-3"
              placeholder="e.g., 1899"
            />

          </div>

          <div>
            <label className="mb-2 block font-medium">
              Short Description
            </label>

            <textarea
              rows={3}
              name="short_description"
              defaultValue={pkg.short_description}
              className="w-full rounded-lg border p-3"
              placeholder="Brief package description."
            />

          </div>

          {/* Excel Feature Matrix Accordion - Editable */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-3">Package Features (Excel MASTER SOURCE)</h3>

            {SECTIONS.map((section) => {
              const sectionFeatures = features.filter(f => f.section === section);
              if (sectionFeatures.length === 0) return null;

              const isOpen = openSection === section;

              return (
                <div
                  key={section}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                      {section}
                    </span>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform ${
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
                    <div className="border-t border-slate-100 px-4 py-3">
                      <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-500 border-b pb-2 mb-2">
                        <div>Feature</div>
                        <div>Solid Structure</div>
                        <div>Essential</div>
                        <div>Premium</div>
                      </div>

                      <div className="grid gap-2">
                        {sectionFeatures.map((item) => (
                          <div key={item.id} className="grid grid-cols-4 gap-2 text-sm py-1 border-b last:border-0 items-center">
                            <div className="font-medium text-slate-700 text-xs">{item.feature}</div>
                            <input
                              name={`feature_${item.id}_solid_structure`}
                              defaultValue={item.solid_structure || ""}
                              className="w-full rounded border p-1 text-xs"
                              placeholder="Solid Structure"
                            />
                            <input
                              name={`feature_${item.id}_essential`}
                              defaultValue={item.essential || ""}
                              className="w-full rounded border p-1 text-xs"
                              placeholder="Essential"
                            />
                            <input
                              name={`feature_${item.id}_premium`}
                              defaultValue={item.premium || ""}
                              className="w-full rounded border p-1 text-xs"
                              placeholder="Premium"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Status
            </label>

            <select
              name="status"
              defaultValue={pkg.is_active ? "active" : "inactive"}
              className="w-full rounded-lg border p-3"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
            >
              {loading ? "Saving..." : "Save Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}