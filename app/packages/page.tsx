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

      <div className="pt-24 max-w-7xl mx-auto px-4 py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl font-bold text-slate-950 sm:text-4xl">
            Our <span className="text-indigo-600">Packages</span>
          </h1>
          <p className="mt-1 text-slate-500 text-xs sm:text-base">
            Choose the construction package that fits your dream project.
          </p>
        </div>

        {/* Mobile: 2-column for first two, full width for third */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {packages.slice(0, 2).map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.slug}`}
              className="rounded-xl bg-white p-4 shadow-md border border-slate-100 hover:shadow-lg transition block"
            >
              {pkg.image_url ? (
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 flex items-center justify-center text-slate-400 text-[10px]">
                  No Image
                </div>
              )}
              <h2 className="text-base font-semibold text-slate-950">{pkg.name}</h2>
              <p className="mt-1 text-lg font-bold text-indigo-600">₹{Number(pkg.price).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">/ sqft</p>
              <button className="mt-2 w-full rounded-lg bg-indigo-600 py-1.5 text-[10px] font-medium text-white hover:bg-indigo-700 transition">
                View Details
              </button>
            </Link>
          ))}
          {/* Third package full width */}
          {packages[2] && (
            <Link
              key={packages[2].id}
              href={`/packages/${packages[2].slug}`}
              className="col-span-2 rounded-xl bg-white p-4 shadow-md border border-slate-100 hover:shadow-lg transition block"
            >
              {packages[2].image_url ? (
                <img
                  src={packages[2].image_url}
                  alt={packages[2].name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 flex items-center justify-center text-slate-400 text-[10px]">
                  No Image
                </div>
              )}
              <h2 className="text-base font-semibold text-slate-950">{packages[2].name}</h2>
              <p className="mt-1 text-lg font-bold text-indigo-600">₹{Number(packages[2].price).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">/ sqft</p>
              <button className="mt-2 w-full rounded-lg bg-indigo-600 py-1.5 text-[10px] font-medium text-white hover:bg-indigo-700 transition">
                View Details
              </button>
            </Link>
          )}
        </div>

        {/* Desktop: Full grid */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.slug}`}
              className="rounded-2xl bg-white p-8 shadow-md border border-slate-100 hover:shadow-xl transition block"
            >
              {pkg.image_url ? (
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
              <h2 className="text-2xl font-semibold text-slate-950">{pkg.name}</h2>
              <p className="mt-2 text-3xl font-bold text-indigo-600">₹{Number(pkg.price).toLocaleString()}/sqft</p>
              <p className="mt-3 text-slate-500">{pkg.short_description}</p>
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