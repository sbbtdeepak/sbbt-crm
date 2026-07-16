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
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">
            Construction Packages
          </h2>

          <p className="mt-3 text-gray-600">
            Choose the package that suits your budget.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {packages.map((pkg: any) => (

            <div
              key={pkg.id}
              className="rounded-2xl border bg-white p-6 shadow hover:shadow-xl transition"
            >

              {pkg.image_url ? (
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="mb-5 h-52 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="mb-5 flex h-52 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  No Image
                </div>
              )}

              <h3 className="text-2xl font-bold">
                {pkg.name}
              </h3>

              <div className="mt-2 text-3xl font-bold text-green-600">
                ₹ {Number(pkg.price).toLocaleString()}
                <span className="text-base text-gray-500">
                  {" "}
                  /sqft
                </span>
              </div>

              <p className="mt-4 text-gray-600">
                {pkg.short_description}
              </p>

              <a
                href="/quote"
                className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
              >
                Get Quote
              </a>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}