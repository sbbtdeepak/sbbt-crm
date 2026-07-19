import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Hero() {
  const supabase = await createClient();

  // Try to get CMS homepage data first
  const { data: cmsHomepage } = await supabase
    .from("cms_homepage")
    .select("*")
    .eq("site_id", "00000000-0000-0000-0000-000000000001")
    .maybeSingle();

  // Fall back to hero_banner for backward compatibility
  const { data: heroBanner } = await supabase
    .from("hero_banner")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  // Use CMS data if available, otherwise fall back to hero_banner or hardcoded defaults
  const hero = {
    title: cmsHomepage?.hero_heading || heroBanner?.title || "Build Your Dream Home",
    subtitle: cmsHomepage?.hero_subheading || heroBanner?.subtitle || "Premium construction, turnkey delivery, and full-site supervision for modern homes.",
    cta_text: cmsHomepage?.hero_cta_text || heroBanner?.button_text || "Get Your Free Quote",
    cta_link: cmsHomepage?.hero_cta_link || heroBanner?.button_link || "/quote",
    image_url: cmsHomepage?.hero_background_url || heroBanner?.image_url || "https://images.pexels.com/photos/5843998/pexels-photo-5843998.jpeg?auto=compress&cs=tinysrgb&w=1200",
    stats: cmsHomepage?.stats || [],
  };

  const image =
    hero.image_url?.startsWith("http")
      ? hero.image_url
      : "https://images.pexels.com/photos/5843998/pexels-photo-5843998.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    // pt-14 for mobile header space compensation (transparent header on home)
    // Desktop uses standard pt-28
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-8">
          {/* Image → first on mobile with SBBT overlay */}
          <div className="order-first lg:order-last relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl shadow-slate-200/60 lg:rounded-[2rem]">
              <img
                src={image}
                alt="Luxury home construction"
                className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
              />
            </div>
            {/* SBBT logo overlay on image */}
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm px-3 py-1.5 shadow-sm">
              <span className="text-sm font-bold text-indigo-700">SBBT</span>
              <span className="text-[10px] text-slate-600 leading-tight">Shree Badree<br />Build Tech</span>
            </div>
          </div>

          {/* Content → compact */}
          <div className="pt-14 pb-2 lg:pt-0 lg:pb-0 space-y-2 lg:space-y-4">
            <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-100 sm:text-xs sm:px-4 sm:py-1.5">
              Luxury Residential Construction
            </span>

            <h1 className="max-w-3xl text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl lg:text-4xl xl:text-5xl">
              {hero.title}
            </h1>

            {hero.subtitle && (
              <p className="max-w-2xl text-sm text-slate-600 sm:text-base lg:text-lg">
                {hero.subtitle}
              </p>
            )}

            <div className="flex flex-row gap-2">
              <Link
                href={hero.cta_link || "/quote"}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 sm:text-sm sm:px-6 sm:py-3"
              >
                {hero.cta_text || "Get Free Quote"}
              </Link>

              <Link
                href="/packages"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50 sm:text-sm sm:px-6 sm:py-3"
              >
                View Packages
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {hero.stats.length > 0 ? (
                hero.stats.map((stat: { label: string; value: string }, index: number) => (
                  <div key={index} className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-indigo-700 sm:text-xl">
                      {stat.value}
                    </span>
                    <span className="text-[10px] text-slate-600 sm:text-xs">{stat.label}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-indigo-700 sm:text-xl">
                      500+
                    </span>
                    <span className="text-[10px] text-slate-600 sm:text-xs">Homes</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 sm:h-6" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-indigo-700 sm:text-xl">
                      13+
                    </span>
                    <span className="text-[10px] text-slate-600 sm:text-xs">Years</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 sm:h-6" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-indigo-700 sm:text-xl">
                      4.8★
                    </span>
                    <span className="text-[10px] text-slate-600 sm:text-xs">
                      Google Rating
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}