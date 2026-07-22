"use client";

const BRANDS = [
  { name: "UltraTech", category: "Cement" },
  { name: "ACC", category: "Cement" },
  { name: "Ambuja", category: "Cement" },
  { name: "Tata Steel", category: "Steel" },
  { name: "Rathi Steel", category: "Steel" },
  { name: "Kajaria", category: "Tiles" },
  { name: "Somany", category: "Tiles" },
  { name: "Asian Paints", category: "Paints" },
  { name: "Berger", category: "Paints" },
  { name: "Havells", category: "Electricals" },
  { name: "Polycab", category: "Electricals" },
  { name: "Astral", category: "Plumbing" },
  { name: "Prince", category: "Plumbing" },
  { name: "Jaquar", category: "Bath Fittings" },
  { name: "Hindware", category: "Bath Fittings" },
  { name: "Greenlam", category: "Laminates" },
  { name: "CenturyPly", category: "Plywood" },
  { name: "Action Tesa", category: "Hardware" },
  { name: "Anchor", category: "Switches" },
  { name: "Crompton", category: "Fans & Lighting" },
] as const;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBrandColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 40%, 92%)`;
}

export default function Brands() {
  return (
    <section className="bg-white py-8 sm:py-12 text-slate-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-6 sm:mb-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Our Partners
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
            Trusted Brands We Work With
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden">
            {/* Desktop: 2 rows, each row auto-scrolling */}
            {/* Row 1 */}
            <div className="hidden sm:flex animate-marquee gap-4 mb-4 hover:[animation-play-state:paused]">
              {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={`row1-${brand.name}-${idx}`}
                  className="flex-shrink-0 w-36 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl mx-auto"
                    style={{ backgroundColor: getBrandColor(brand.name) }}
                  >
                    <span className="text-xs font-bold text-slate-700">
                      {getInitials(brand.name)}
                    </span>
                  </div>
                  <p className="mt-2 text-center text-xs font-semibold text-slate-900 leading-tight">
                    {brand.name}
                  </p>
                  <p className="text-center text-[9px] text-slate-400 leading-tight">
                    {brand.category}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2 offset */}
            <div className="hidden sm:flex animate-marquee gap-4 [animation-delay:-4s] [animation-direction:reverse] hover:[animation-play-state:paused]">
              {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={`row2-${brand.name}-${idx}`}
                  className="flex-shrink-0 w-36 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl mx-auto"
                    style={{ backgroundColor: getBrandColor(brand.name) }}
                  >
                    <span className="text-xs font-bold text-slate-700">
                      {getInitials(brand.name)}
                    </span>
                  </div>
                  <p className="mt-2 text-center text-xs font-semibold text-slate-900 leading-tight">
                    {brand.name}
                  </p>
                  <p className="text-center text-[9px] text-slate-400 leading-tight">
                    {brand.category}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile: 2 rows, larger cards, auto-scroll */}
            {/* Row 1 mobile */}
            <div className="sm:hidden animate-marquee flex gap-3 mb-3">
              {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={`mob1-${brand.name}-${idx}`}
                  className="flex-shrink-0 w-32 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl mx-auto"
                    style={{ backgroundColor: getBrandColor(brand.name) }}
                  >
                    <span className="text-[10px] font-bold text-slate-700">
                      {getInitials(brand.name)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-center text-[10px] font-semibold text-slate-900 leading-tight">
                    {brand.name}
                  </p>
                  <p className="text-center text-[8px] text-slate-400 leading-tight">
                    {brand.category}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2 mobile */}
            <div className="sm:hidden animate-marquee flex gap-3 [animation-delay:-4s] [animation-direction:reverse]">
              {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={`mob2-${brand.name}-${idx}`}
                  className="flex-shrink-0 w-32 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl mx-auto"
                    style={{ backgroundColor: getBrandColor(brand.name) }}
                  >
                    <span className="text-[10px] font-bold text-slate-700">
                      {getInitials(brand.name)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-center text-[10px] font-semibold text-slate-900 leading-tight">
                    {brand.name}
                  </p>
                  <p className="text-center text-[8px] text-slate-400 leading-tight">
                    {brand.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] sm:text-xs text-slate-400">
          &hellip;and many more trusted names in the construction industry.
        </p>
      </div>
    </section>
  );
}