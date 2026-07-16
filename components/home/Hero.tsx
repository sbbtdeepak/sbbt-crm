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
    subtitle: "Premium construction, turnkey delivery, and full-site supervision for modern homes.",
    cta_text: "Get Your Free Quote",
    cta_link: "/quote",
    image_url:
      "https://images.pexels.com/photos/5843998/pexels-photo-5843998.jpeg?auto=compress&cs=tinysrgb&w=1200",
  };

  const image =
    hero.image_url?.startsWith("http")
      ? hero.image_url
      : "https://images.pexels.com/photos/5843998/pexels-photo-5843998.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100">
              Luxury residential construction
            </span>

            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                {hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href={hero.cta_link || "/quote"}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
              >
                {hero.cta_text || "Get Quote Now"}
              </Link>

              <Link
                href="#projects"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50"
              >
                View Featured Work
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-[#f8fafc] p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-3xl font-semibold text-indigo-700">500+</p>
                <p className="mt-2 text-sm text-slate-600">Projects delivered</p>
              </div>
              <div className="rounded-[2rem] bg-[#f8fafc] p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-3xl font-semibold text-indigo-700">13+</p>
                <p className="mt-2 text-sm text-slate-600">Years of construction experience</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-[#f8fafc] p-4 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 sm:p-6">
            <img
              src={image}
              alt={hero.title}
              className="aspect-[4/5] w-full rounded-[2rem] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}