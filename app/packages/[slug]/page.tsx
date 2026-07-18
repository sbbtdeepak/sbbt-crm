import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConstructionEstimator from "@/components/home/ConstructionEstimator";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";

const SECTIONS = ["STRUCTURE", "ELECTRICAL", "DOORS & WINDOWS", "KITCHEN", "BATHROOM", "FLOORING", "CEILING", "EXTERIOR", "SITE MANAGEMENT", "COMMERCIAL"];

interface PackageFeature {
  id: string;
  section: string;
  feature: string;
  solid_structure: string | null;
  essential: string | null;
  premium: string | null;
  custom: string | null;
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch package by slug
  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!pkg) notFound();

  // Fetch all features
  const { data: features } = await supabase
    .from("package_features")
    .select("*")
    .order("sort_order", { ascending: true });

  // Determine which column to display based on package slug
  const getPackageColumn = (pkgSlug: string): keyof PackageFeature => {
    if (pkgSlug === "solid-structure") return "solid_structure";
    if (pkgSlug === "essential") return "essential";
    if (pkgSlug === "premium") return "premium";
    if (pkgSlug === "custom") return "custom";
    return "essential"; // default
  };

  const packageColumn = getPackageColumn(slug);
  const packageName = pkg.name;

  const getDisplayValue = (value: string | null) => {
    if (!value || value === "NA") return null;
    return value;
  };

  // Group features by section
  const featuresBySection = SECTIONS.map(section => ({
    section,
    items: features?.filter((f: PackageFeature) => f.section === section) ?? []
  })).filter(s => s.items.length > 0);

  return (
    <>
      <Header />

      <main className="pt-24 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Package Header */}
          <div className="rounded-2xl bg-white p-8 shadow-md mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {pkg.image_url ? (
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    No Image
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-4xl font-bold text-slate-950">{pkg.name}</h1>
                <p className="text-2xl font-semibold text-indigo-600 mt-2">
                  ₹{Number(pkg.price).toLocaleString()}/sqft
                </p>
                <p className="text-slate-600 mt-4">{pkg.short_description}</p>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase">Highlights</h3>
                  <ul className="mt-2 space-y-1">
                    {(pkg.brands || "").split("\n").filter(Boolean).map((brand: string) => (
                      <li key={brand} className="flex items-center text-slate-700">
                        <span className="mr-2 text-emerald-600">✓</span>
                        {brand}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Accordion - Single Package View */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-950 mb-4">{packageName} Features</h2>

            {featuresBySection.map(({ section, items }) => (
              <div
                key={section}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="px-5 py-3">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                    {section}
                  </span>
                </div>

                <div className="border-t border-slate-100 px-5 py-3">
                  <div className="grid gap-1">
                    {items.map((item) => {
                      const value = getDisplayValue(item[packageColumn]);
                      if (!value) return null;
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                          <div className="font-medium text-slate-700">{item.feature}</div>
                          <div className="text-indigo-700 font-semibold">{value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ConstructionEstimator />
      <WhyChooseUs />
      <FAQ />
      <Footer />
    </>
  );
}