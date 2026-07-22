import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConstructionEstimator from "@/components/home/ConstructionEstimator";
import Brands from "@/components/home/Brands";
import ReferEarn from "@/components/home/ReferEarn";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PackageComparison from "@/components/home/PackageComparison";
import FAQ from "@/components/home/FAQ";

export default async function PackagesPage() {
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (!packages?.length) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="md:pt-24 max-w-7xl mx-auto px-4 py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl font-bold text-slate-950 sm:text-4xl">
            Our <span className="text-indigo-600">Packages</span>
          </h1>
          <p className="mt-1 text-slate-500 text-xs sm:text-base">
            Choose the construction package that fits your dream project.
          </p>
        </div>

        {/* Mobile: 2-column grid */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.slug}`}
              className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 hover:shadow-md transition block"
            >
              {/* Images hidden until fully supported */}
              <h2 className="text-base font-semibold text-slate-950">{pkg.name}</h2>
              {pkg.short_description && (
                <p className="mt-1 text-[10px] text-slate-500 line-clamp-2">{pkg.short_description}</p>
              )}
              <p className="mt-2 text-lg font-bold text-indigo-600">₹{Number(pkg.price).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">/ sqft</p>
              <button className="mt-2 w-full rounded-full bg-indigo-600 py-1.5 text-[10px] font-medium text-white hover:bg-indigo-700 transition">
                View Details
              </button>
            </Link>
          ))}
        </div>

        {/* Desktop: Auto-fit responsive grid */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.slug}`}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
            >
              {/* Images hidden until fully supported */}
              <h2 className="text-xl font-semibold text-slate-950">{pkg.name}</h2>
              {pkg.short_description && (
                <p className="mt-2 text-sm text-slate-500 line-clamp-3">{pkg.short_description}</p>
              )}
              <p className="mt-4 text-2xl font-bold text-indigo-600">₹{Number(pkg.price).toLocaleString()}/sqft</p>
              <button className="mt-4 w-full rounded-full bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                View Details
              </button>
            </Link>
          ))}
        </div>
      </div>

      <PackageComparison />
      <ConstructionEstimator />
      <WhyChooseUs />
      <Brands />
      <ReferEarn />
      <FAQ />
      <Footer />
    </div>
  );
}