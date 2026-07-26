'use client';

import Link from 'next/link';
import type { CMSPackageFull } from '@/app/dashboard/cms/types';

interface HomePackagesProps {
  packages: CMSPackageFull[];
}

export default function HomePackages({ packages }: HomePackagesProps) {
  if (packages.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Our Construction Packages</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Choose from our carefully designed packages tailored to your construction needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.package.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.package.name}</h3>
              <div className="text-2xl font-bold text-indigo-600 mb-3">
                ₹{pkg.package.price.toLocaleString('en-IN')}
                {pkg.package.price > 0 && <span className="text-sm font-normal text-gray-500"> /sq.ft</span>}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {pkg.package.description || 'Complete construction solution with premium specifications.'}
              </p>

              {/* Section count badges */}
              {pkg.sections.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {pkg.sections.slice(0, 5).map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {s.title}
                    </span>
                  ))}
                  {pkg.sections.length > 5 && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      +{pkg.sections.length - 5} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto flex gap-3">
                <Link
                  href={`/packages#${pkg.package.slug}`}
                  className="flex-1 text-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href="/quote"
                  className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                >
                  Get Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}