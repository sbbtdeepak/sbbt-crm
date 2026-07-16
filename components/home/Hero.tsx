import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Hero() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("hero_banner")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const hero = data ?? {
    title: "Build Your Dream Home",
    subtitle: "Premium Construction Services Across Delhi NCR",
    cta_text: "Get Quote Now",
    cta_link: "/quote",
    image_url:
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=900",
  };

  const image =
    hero.image_url?.startsWith("http")
      ? hero.image_url
      : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=900";

  return (
    <section className="bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 pt-36 pb-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          <div>

            <span className="inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              Since 2011 • Trusted Construction Company
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-tight text-gray-900 lg:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              {hero.subtitle}
            </p>

            <div className="mt-8 grid gap-3 text-gray-700">

              <div>✅ Transparent Pricing</div>

              <div>✅ Premium Quality Materials</div>

              <div>✅ On Time Delivery</div>

              <div>✅ Dedicated Site Engineer</div>

            </div>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href={hero.cta_link || "/quote"}
                className="rounded-xl bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-green-700"
              >
                {hero.cta_text || "Get Quote Now"}
              </Link>

              <Link
                href="#projects"
                className="rounded-xl border border-gray-300 bg-white px-8 py-4 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                View Projects
              </Link>

            </div>

          </div>

          <div className="relative">

            <img
              src={image}
              alt={hero.title}
              className="h-[560px] w-full rounded-3xl object-cover shadow-2xl"
            />

            <div className="absolute -left-6 bottom-8 rounded-2xl bg-white p-5 shadow-xl">
              <div className="text-3xl font-bold text-indigo-700">
                500+
              </div>

              <div className="text-sm text-gray-500">
                Projects Completed
              </div>
            </div>

            <div className="absolute -right-6 top-8 rounded-2xl bg-white p-5 shadow-xl">
              <div className="text-3xl font-bold text-green-600">
                13+
              </div>

              <div className="text-sm text-gray-500">
                Years Experience
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}