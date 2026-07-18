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
  // Create pairs of brands for 2x2 mobile display
  const brandPairs: (typeof BRANDS[number])[] = [];
  for (let i = 0; i < BRANDS.length; i += 2) {
    brandPairs.push(BRANDS[i], BRANDS[i + 1]);
  }

  return (
    <section className="bg-white py-4 sm:py-8 text-slate-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Our Partners
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Trusted Brands We Work With
          </h2>
        </div>

        {/* Mobile: 2x2 grid marquee showing 4 logos at once */}
        <div className="mt-3 sm:mt-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="overflow-hidden">
            {/* Mobile: 2x2 grid scrolling marquee */}
            <div className="animate-marquee flex gap-2 sm:hidden">
              {[...brandPairs, ...brandPairs].map((brand, idx) => (
                <div
                  key={`${brand.name}-${idx}-mobile`}
                  className="flex-shrink-0 w-[calc(50%-0.25rem)] rounded-lg border border-slate-100 bg-white p-1.5 shadow-sm"
                >
                  <div className="flex items-center gap-1">
                    <div
                      className="flex h-4 w-4 items-center justify-center rounded"
                      style={{ backgroundColor: getBrandColor(brand.name) }}
                    >
                      <span className="text-[5px] font-bold text-slate-700">
                        {getInitials(brand.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[7px] font-semibold text-slate-900 leading-tight">
                        {brand.name}
                      </p>
                      <p className="text-[6px] text-slate-400 leading-tight">
                        {brand.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Single row marquee (4+ logos visible) */}
            <div className="animate-marquee hidden sm:flex gap-3">
              {[...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={`${brand.name}-${idx}-desktop`}
                  className="flex-shrink-0 w-24 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-md mx-auto transition-transform duration-300"
                    style={{ backgroundColor: getBrandColor(brand.name) }}
                  >
                    <span className="text-[8px] font-bold text-slate-700">
                      {getInitials(brand.name)}
                    </span>
                  </div>
                  <p className="mt-1 text-center text-[9px] font-semibold text-slate-900 leading-tight">
                    {brand.name}
                  </p>
                  <p className="text-center text-[7px] text-slate-400 leading-tight">
                    {brand.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[9px] sm:text-[10px] text-slate-400">
          &hellip;and many more trusted names in the construction industry.
        </p>
      </div>
    </section>
  );
}