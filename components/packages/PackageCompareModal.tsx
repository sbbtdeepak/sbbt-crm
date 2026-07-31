"use client";

import React, { useEffect, useRef } from "react";

interface PackageItem {
  item: string;
  brand: string;
  specification: string;
  remarks: string;
}

interface PackageSection {
  title: string;
  items: PackageItem[];
}

interface PackageData {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  sections: PackageSection[];
}

interface PackageCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PackageData[];
}

export default function PackageCompareModal({
  isOpen,
  onClose,
  packages,
}: PackageCompareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || packages.length < 2) return null;

  // Build a unified list of all sections across selected packages
  const allSectionTitles: string[] = [];
  const seenSections = new Set<string>();
  for (const pkg of packages) {
    for (const section of pkg.sections) {
      if (!seenSections.has(section.title)) {
        seenSections.add(section.title);
        allSectionTitles.push(section.title);
      }
    }
  }

  // Helper: get items for a section in a package
  const getSectionItems = (pkg: PackageData, sectionTitle: string): PackageItem[] => {
    const section = pkg.sections.find((s) => s.title === sectionTitle);
    return section?.items || [];
  };

  // Helper: find matching item across packages by item name
  const getAllItemsForSection = (sectionTitle: string): string[] => {
    const itemNames: string[] = [];
    const seenItems = new Set<string>();
    for (const pkg of packages) {
      const items = getSectionItems(pkg, sectionTitle);
      for (const item of items) {
        if (!seenItems.has(item.item)) {
          seenItems.add(item.item);
          itemNames.push(item.item);
        }
      }
    }
    return itemNames;
  };

  // Helper: get a specific item's value from a package
  const getItemValue = (pkg: PackageData, sectionTitle: string, itemName: string): string => {
    const items = getSectionItems(pkg, sectionTitle);
    const found = items.find((i) => i.item === itemName);
    if (!found) return "—";
    // Combine brand + specification + remarks into a readable value
    const parts = [found.brand, found.specification, found.remarks].filter(
      (p) => p && p !== "NA" && p !== "na"
    );
    return parts.length > 0 ? parts.join(" • ") : "—";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-4 overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Package Comparison</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Comparing {packages.length} packages
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            aria-label="Close comparison"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            {/* Package header row */}
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="sticky left-0 bg-white z-10 text-left px-3 sm:px-4 py-3 font-bold text-gray-900 min-w-[120px] sm:min-w-[160px]">
                  Feature
                </th>
                {packages.map((pkg) => (
                  <th
                    key={pkg.id}
                    className="text-left px-3 sm:px-4 py-3 font-bold text-gray-900 min-w-[140px] sm:min-w-[180px] border-l border-gray-100"
                  >
                    <div className="text-indigo-600">{pkg.name}</div>
                    <div className="text-xs font-normal text-gray-500 mt-0.5">
                      {pkg.price > 0 ? `₹${pkg.price.toLocaleString("en-IN")}/sq.ft` : "Custom Quote"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {allSectionTitles.map((sectionTitle, sIdx) => {
                const allItems = getAllItemsForSection(sectionTitle);
                return (
                  <React.Fragment key={sIdx}>
                    {/* Section header row */}
                    <tr className="bg-indigo-50 border-b border-indigo-100">
                      <td
                        colSpan={packages.length + 1}
                        className="px-3 sm:px-4 py-2 font-bold text-indigo-900 text-xs sm:text-sm uppercase tracking-wide"
                      >
                        {sectionTitle}
                      </td>
                    </tr>
                    {/* Item rows */}
                    {allItems.map((itemName, iIdx) => (
                      <tr
                        key={iIdx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="sticky left-0 bg-white z-10 px-3 sm:px-4 py-2.5 text-gray-700 font-medium">
                          {itemName}
                        </td>
                        {packages.map((pkg) => (
                          <td
                            key={pkg.id}
                            className="px-3 sm:px-4 py-2.5 text-gray-600 border-l border-gray-100"
                          >
                            {getItemValue(pkg, sectionTitle, itemName)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {allItems.length === 0 && (
                      <tr className="border-b border-gray-100">
                        <td className="px-3 sm:px-4 py-2 text-gray-400 italic">No items</td>
                        {packages.map((pkg) => (
                          <td key={pkg.id} className="px-3 sm:px-4 py-2 text-gray-400 border-l border-gray-100">—</td>
                        ))}
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-gray-50 flex flex-wrap gap-2 justify-end">
          {packages.map((pkg) => (
            <a
              key={pkg.id}
              href="/quote"
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Get {pkg.name} Quote
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
