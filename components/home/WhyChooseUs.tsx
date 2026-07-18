const FEATURES = [
  {
    title: "100% Transparent Pricing",
    description: "No hidden charges. Detailed BOQ. Complete cost transparency.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 21.75h16.5M3.75 3.75h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6a2.25 2.25 0 012.25-2.25z" />
      </svg>
    ),
  },
  {
    title: "Premium Quality Materials",
    description: "UltraTech, TATA Steel, Asian Paints, Kajaria & equivalent approved brands.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345h5.518c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "Dedicated Site Engineer",
    description: "Professional supervision. Daily monitoring. Weekly progress updates.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.93 17.93 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "On-Time Project Delivery",
    description: "Planned execution. Dedicated timeline. Regular milestone tracking.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Structural Safety",
    description: "Earthquake resistant design. Quality testing. IS standards compliance.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.128 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Warranty & Support",
    description: "Structural warranty. Post handover support. Dedicated customer assistance.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-4.88 4.88a1.5 1.5 0 01-2.12 0l-.88-.88a1.5 1.5 0 010-2.12l4.88-4.88m5.24 5.24l1.77 1.77a1.5 1.5 0 002.12 0l.88-.88a1.5 1.5 0 000-2.12l-4.88-4.88" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-6 sm:py-10 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-indigo-600 sm:text-sm">
            Why SBBT
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl">
            Why Choose Shree Badree Build Tech Pvt Ltd?
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">
            Building Trust, Quality and Transparency Since 2011.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="mt-4 hidden md:grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-200"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs leading-4 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Carousel */}
        <div className="mt-4 md:hidden">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group snap-start flex-shrink-0 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-4 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}