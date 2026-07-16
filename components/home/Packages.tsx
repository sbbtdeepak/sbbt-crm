import { createClient } from "@/lib/supabase/server";

export default async function Packages() {
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("price");

  if (!packages || packages.length === 0) return null;

  return (
    <section className="bg-[#f8fafc] py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Premium Packages
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            End-to-end construction plans for exceptional homes.
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Choose the package that brings luxury finishes, transparent costs, and skilled execution.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg: any) => (
            <article
              key={pkg.id}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="overflow-hidden rounded-[1.75rem]">
                {pkg.image_url ? (
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-400">
                    No image available
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-indigo-600">
                    Package
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                    {pkg.name}
                  </h3>
                </div>
                <p className="text-right text-2xl font-semibold text-emerald-600">
                  ₹{Number(pkg.price).toLocaleString()}
                  <span className="block text-sm font-medium text-slate-500">/ sqft</span>
                </p>
              </div>

              <p className="mt-5 text-slate-600 leading-7">
                {pkg.short_description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1">
                  Fixed timelines
                </span>
                <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1">
                  Quality assurance
                </span>
                <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1">
                  Transparent billing
                </span>
              </div>

              <a
                href="/quote"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Request a quote
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
