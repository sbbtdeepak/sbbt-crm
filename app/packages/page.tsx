'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';

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

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

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

  const toggleSection = (pkgSlug: string, sectionTitle: string) => {
    const key = `${pkgSlug}:${sectionTitle}`;
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-indigo-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Our Construction Packages</h1>
            <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
              Transparent pricing with detailed specifications. Choose the package that fits your needs.
            </p>
          </div>
        </section>

        {/* Package Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {packages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No packages available yet. Check back soon.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                id={pkg.slug}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  openSlug === pkg.slug ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:shadow-xl'
                }`}
                onClick={() => togglePackage(pkg.slug)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    ₹{(pkg.price).toLocaleString('en-IN')}
                    {pkg.price > 0 && <span className="text-sm font-normal text-gray-500"> /sq.ft</span>}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {pkg.description || 'Complete construction solution'}
                  </p>

                  {/* Section badges */}
                  <div className="flex flex-wrap gap-2">
                    {pkg.sections.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                        {s.title}
                      </span>
                    ))}
                    {pkg.sections.length > 4 && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        +{pkg.sections.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Accordion for selected package */}
          {openSlug && (() => {
            const pkg = packages.find(p => p.slug === openSlug);
            if (!pkg) return null;
            return (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>
                    <p className="text-gray-500 text-sm">Click on a section to expand specifications</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                      ₹{pkg.price.toLocaleString('en-IN')}
                      {pkg.price > 0 && <span className="text-sm font-normal text-gray-500"> /sq.ft</span>}
                    </div>
                    <a href="/quote" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                      Get Quote →
                    </a>
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                )}

                <div className="space-y-3">
                  {pkg.sections.map((section, si) => {
                    const isOpen = openSections[`${pkg.slug}:${section.title}`] || false;
                    return (
                      <div key={si} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleSection(pkg.slug, section.title)}
                          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-900">{section.title}</span>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="px-5 py-4">
                            {section.items.length === 0 && (
                              <p className="text-gray-400 text-sm">No specifications listed.</p>
                            )}
                            {section.items.length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Item</th>
                                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Brand</th>
                                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Specification</th>
                                      <th className="text-left py-2 font-medium text-gray-500">Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.items.map((item, ii) => (
                                      <tr key={ii} className="border-b border-gray-100 last:border-0">
                                        <td className="py-3 pr-4 text-gray-900">{item.item}</td>
                                        <td className="py-3 pr-4 text-gray-600">{item.brand}</td>
                                        <td className="py-3 pr-4 text-gray-600">{item.specification}</td>
                                        <td className="py-3 text-gray-600">{item.remarks}</td>
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
      <Footer />
    </>
  );
}