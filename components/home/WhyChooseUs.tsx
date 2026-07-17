const FEATURES = [
  {
    title: "100% Transparent Pricing",
    description: "No hidden charges. Detailed BOQ. Complete cost transparency.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 21.75h16.5M3.75 3.75h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6a2.25 2.25 0 012.25-2.25z" />
      </svg>
    ),
  },
  {
    title: "Premium Quality Materials",
    description: "UltraTech, TATA Steel, Asian Paints, Kajaria & equivalent approved brands.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: "Dedicated Site Engineer",
    description: "Professional supervision. Daily monitoring. Weekly progress updates.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "On-Time Project Delivery",
    description: "Planned execution. Dedicated timeline. Regular milestone tracking.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Structural Safety",
    description: "Earthquake resistant design. Quality testing. IS standards compliance.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Warranty & Support",
    description: "Structural warranty. Post handover support. Dedicated customer assistance.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-4.88 4.88a1.5 1.5 0 01-2.12 0l-.88-.88a1.5 1.5 0 010-2.12l4.88-4.88m5.24 5.24l1.77 1.77a1.5 1.5 0 002.12 0l.88-.88a1.5 1.5 0 000-2.12l-4.88-4.88" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Why SBBT
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Why Choose Shree Badree Build Tech Pvt Ltd?
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Building Trust, Quality and Transparency Since 2011.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-200"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}