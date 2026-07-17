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
    <section className="bg-white py-24 text-slate-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Our Partners
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Trusted Brands We Work With
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            We use only trusted and premium construction brands to deliver
            durable, high-quality homes.
          </p>
        </div>

        {/* Auto Marquee - Desktop pauses on hover, mobile continuous */}
        <div className="mt-16 relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-hidden">
            <div className="flex animate-marquee gap-4 hover:[animation-play-state:paused] pl-4">
              {/* Duplicate brands for continuous loop */}
              {[...BRANDS, ...BRANDS].map((brand, idx) => (
                <div
                  key={`${brand.name}-${idx}`}
                  className="group flex-shrink-0 w-48 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-200"
                >
                  {/* Logo placeholder */}
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: getBrandColor(brand.name) }}
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {getInitials(brand.name)}
                    </span>
                  </div>

                  {/* Brand name */}
                  <p className="mt-4 text-center text-sm font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
                    {brand.name}
                  </p>

                  {/* Category */}
                  <p className="mt-0.5 text-center text-xs text-slate-400">
                    {brand.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trusted by note */}
        <p className="mt-12 text-center text-sm text-slate-400">
          …and many more trusted names in the construction industry.
        </p>
      </div>
    </section>
  );
}