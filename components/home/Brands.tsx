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

type Brand = (typeof BRANDS)[number];

export default function Brands() {
  // Create 2x2 grid rows for mobile - 4 items per "slide"
  const brandChunks: Brand[][] = [];
  for (let i = 0; i < BRANDS.length; i += 2) {
    brandChunks.push(BRANDS.slice(i, i + 2));
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
            <div className="animate-marquee flex gap-2 sm:hidden">
              {/* Duplicate chunks for infinite loop */}
              {[...brandChunks, ...brandChunks].map((chunk, chunkIdx) => (
                <div key={chunkIdx} className="flex flex-shrink-0 gap-2 w-[calc(100%+2rem)]">
                  {/* First row of 2 */}
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {chunk.map((brand) => (
                      <div
                        key={`${brand.name}-r1`}
                        className="flex-shrink-0 rounded-lg border border-slate-100 bg-white p-1.5 shadow-sm"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-md transition-transform duration-300"
                            style={{ backgroundColor: getBrandColor(brand.name) }}
                          >
                            <span className="text-[6px] font-bold text-slate-700">
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
                  {/* Second row of 2 (duplicate) */}
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {chunk.map((brand) => (
                      <div
                        key={`${brand.name}-r2`}
                        className="flex-shrink-0 rounded-lg border border-slate-100 bg-white p-1.5 shadow-sm"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-md transition-transform duration-300"
                            style={{ backgroundColor: getBrandColor(brand.name) }}
                          >
                            <span className="text-[6px] font-bold text-slate-700">
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
                </div>
              ))}
            </div>
            
            {/* Desktop: Single row marquee */}
            <div className="animate-marquee hidden sm:flex gap-3">
              {[...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={`${brand.name}-${idx}-desktop`}
                  className="flex-shrink-0 w-28 rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-md mx-auto transition-transform duration-300"
                    style={{ backgroundColor: getBrandColor(brand.name) }}
                  >
                    <span className="text-[10px] font-bold text-slate-700">
                      {getInitials(brand.name)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-center text-xs font-semibold text-slate-900 leading-tight">
                    {brand.name}
                  </p>
                  <p className="text-center text-[10px] text-slate-400 leading-tight">
                    {brand.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[9px] sm:text-xs text-slate-400">
          &hellip;and many more trusted names in the construction industry.
        </p>
      </div>
    </section>
  );
}