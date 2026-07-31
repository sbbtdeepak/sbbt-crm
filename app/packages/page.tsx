'use client';

import { breadcrumbSchema } from '@/lib/seo/schema';

const breadcrumbs = breadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Packages', path: '/packages' },
]);

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';
import PackageCalculator from '@/components/packages/PackageCalculator';
import PackageCompareModal from '@/components/packages/PackageCompareModal';

// BreadcrumbList JSON-LD is injected once via the script below
const jsonLd = breadcrumbs;

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

const MAX_COMPARE = 3;

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    async function loadPackages() {
      const supabase = createClient();
      const { data: pkgData } = await supabase
        .from('cms_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!pkgData || pkgData.length === 0) return;

      const pkgIds = pkgData.map((p: Record<string, unknown>) => p.id as number);

      const { data: sectionsData } = await supabase
        .from('cms_package_sections')
        .select('*')
        .in('package_id', pkgIds)
        .order('display_order', { ascending: true });

      const sectionIds = (sectionsData || []).map((s: Record<string, unknown>) => s.id as number);

      const { data: itemsData } = await supabase
        .from('cms_package_items')
        .select('*')
        .in('section_id', sectionIds.length > 0 ? sectionIds : [0])
        .order('display_order', { ascending: true });

      const itemsBySection: Record<number, PackageItem[]> = {};
      for (const item of itemsData || []) {
        const secId = item.section_id as number;
        if (!itemsBySection[secId]) itemsBySection[secId] = [];
        itemsBySection[secId].push({
          item: item.item as string,
          brand: item.brand as string,
          specification: item.specification as string,
          remarks: item.remarks as string,
        });
      }

      const sectionsByPackage: Record<number, PackageSection[]> = {};
      for (const section of sectionsData || []) {
        const pkgId = section.package_id as number;
        if (!sectionsByPackage[pkgId]) sectionsByPackage[pkgId] = [];
        sectionsByPackage[pkgId].push({
          title: section.title as string,
          items: itemsBySection[section.id as number] || [],
        });
      }

      const result = pkgData.map((pkg: Record<string, unknown>) => ({
        id: pkg.id as number,
        name: pkg.name as string,
        slug: pkg.slug as string,
        price: pkg.price as number,
        description: pkg.description as string,
        sections: sectionsByPackage[pkg.id as number] || [],
      }));

      setPackages(result);

      // Set hash-based initial open state
      const hash = window.location.hash?.replace('#', '');
      if (hash) {
        const found = result.find(p => p.slug === hash);
        if (found) {
          setOpenSlug(found.slug);
        }
      }
    }

    loadPackages();
  }, []);

  const togglePackage = (slug: string) => {
    setOpenSlug(prev => prev === slug ? null : slug);
    setOpenSections({});
  };

  // Accordion toggle with scroll fix - keeps clicked header visible
  const toggleSection = useCallback((pkgSlug: string, sectionTitle: string, headerEl: HTMLElement | null) => {
    const key = `${pkgSlug}:${sectionTitle}`;
    const wasOpen = openSections[key];

    // Toggle the section
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

    // If opening, scroll the header into view after animation starts
    if (!wasOpen && headerEl) {
      requestAnimationFrame(() => {
        headerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [openSections]);

  // Compare functionality
  const toggleCompare = (pkgId: number) => {
    setCompareIds(prev => {
      if (prev.includes(pkgId)) {
        return prev.filter(id => id !== pkgId);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev; // Don't add more than max
      }
      return [...prev, pkgId];
    });
  };

  const comparedPackages = packages.filter(p => compareIds.includes(p.id));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero - Compact */}
        <section className="bg-indigo-900 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">Our Construction Packages</h1>
            <p className="text-indigo-200 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Transparent pricing with detailed specifications. Choose the package that fits your needs.
            </p>
          </div>
        </section>

        {/* Package Cards + Calculator */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          {packages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No packages available yet. Check back soon.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                id={pkg.slug}
                className={`bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden border-2 transition-all ${
                  openSlug === pkg.slug ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:shadow-xl'
                }`}
              >
                {/* Card Header - Clickable */}
                <div
                  className="p-4 sm:p-5 cursor-pointer"
                  onClick={() => togglePackage(pkg.slug)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{pkg.name}</h3>
                    {/* Compare Checkbox */}
                    <label
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={compareIds.includes(pkg.id)}
                        onChange={() => toggleCompare(pkg.id)}
                        disabled={!compareIds.includes(pkg.id) && compareIds.length >= MAX_COMPARE}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Compare</span>
                    </label>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600 mb-1.5">
                    {pkg.price > 0 ? (
                      <>₹{pkg.price.toLocaleString('en-IN')}<span className="text-xs sm:text-sm font-normal text-gray-500"> /sq.ft</span></>
                    ) : (
                      <span className="text-base sm:text-lg">Custom Quote</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                    {pkg.description || 'Complete construction solution'}
                  </p>

                  {/* Section badges - Compact */}
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.sections.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                        {s.title}
                      </span>
                    ))}
                    {pkg.sections.length > 4 && (
                      <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        +{pkg.sections.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => togglePackage(pkg.slug)}
                  className="w-full py-2.5 text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition border-t border-gray-100"
                >
                  {openSlug === pkg.slug ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            ))}
          </div>

          {/* Cost Calculator */}
          {packages.length > 0 && (
            <div className="mb-8">
              <PackageCalculator packages={packages} />
            </div>
          )}

          {/* Accordion for selected package */}
          {openSlug && (() => {
            const pkg = packages.find(p => p.slug === openSlug);
            if (!pkg) return null;
            return (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{pkg.name}</h2>
                    <p className="text-gray-500 text-xs sm:text-sm">Click on a section to expand specifications</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                      {pkg.price > 0 ? (
                        <>₹{pkg.price.toLocaleString('en-IN')}<span className="text-xs sm:text-sm font-normal text-gray-500"> /sq.ft</span></>
                      ) : (
                        <span className="text-base sm:text-lg">Custom Quote</span>
                      )}
                    </div>
                    <a href="/quote" className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                      Get Quote →
                    </a>
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                )}

                <div className="space-y-2">
                  {pkg.sections.map((section, si) => {
                    const key = `${pkg.slug}:${section.title}`;
                    const isOpen = openSections[key] || false;
                    return (
                      <div key={si} className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                        <button
                          onClick={(e) => toggleSection(pkg.slug, section.title, e.currentTarget)}
                          className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">{section.title}</span>
                          <svg
                            className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="px-3 sm:px-5 py-3 sm:py-4 animate-[fadeIn_0.2s_ease-in-out]">
                            {section.items.length === 0 && (
                              <p className="text-gray-400 text-sm">No specifications listed.</p>
                            )}
                            {section.items.length > 0 && (
                              <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <table className="w-full text-xs sm:text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 pr-3 sm:pr-4 font-medium text-gray-500">Item</th>
                                      <th className="text-left py-2 pr-3 sm:pr-4 font-medium text-gray-500">Brand</th>
                                      <th className="text-left py-2 pr-3 sm:pr-4 font-medium text-gray-500">Specification</th>
                                      <th className="text-left py-2 font-medium text-gray-500">Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.items.map((item, ii) => (
                                      <tr key={ii} className="border-b border-gray-100 last:border-0">
                                        <td className="py-2 sm:py-3 pr-3 sm:pr-4 text-gray-900 font-medium">{item.item}</td>
                                        <td className="py-2 sm:py-3 pr-3 sm:pr-4 text-gray-600">{item.brand}</td>
                                        <td className="py-2 sm:py-3 pr-3 sm:pr-4 text-gray-600">{item.specification}</td>
                                        <td className="py-2 sm:py-3 text-gray-600">{item.remarks}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </section>
      </main>

      {/* Floating Compare Button */}
      {compareIds.length >= 2 && (
        <button
          onClick={() => setShowCompare(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-indigo-600 text-white px-4 sm:px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Compare ({compareIds.length})
        </button>
      )}

      {/* Compare Modal */}
      <PackageCompareModal
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        packages={comparedPackages}
      />

      <Footer />
    </>
  );
}