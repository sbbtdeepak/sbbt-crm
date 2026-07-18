const STEPS = [
  {
    number: "01",
    title: "Refer Customer",
    description: "Share SBBT with friends planning to build their dream home.",
    color: "bg-indigo-600",
  },
  {
    number: "02",
    title: "Free Consultation",
    description: "Your referral gets a free, no-obligation consultation.",
    color: "bg-emerald-600",
  },
  {
    number: "03",
    title: "Project Starts",
    description: "Once they sign, construction begins.",
    color: "bg-indigo-600",
  },
  {
    number: "04",
    title: "Earn Reward",
    description: "Receive up to ₹25,000 per successful referral.",
    color: "bg-emerald-600",
  },
];

export default function ReferEarn() {
  return (
    <section className="bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-indigo-600 sm:text-sm">
            Refer & Earn
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl">
            Refer & Earn
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">
            Refer friends and earn rewards when their construction project starts.
          </p>
        </div>

        {/* Desktop Steps Grid */}
        <div className="mt-4 hidden lg:grid gap-3 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white ${step.color} transition-transform duration-300 group-hover:scale-110`}
              >
                {step.number}
              </div>
              {index < STEPS.length - 1 && (
                <div className="absolute right-0 top-4 hidden -mr-2 text-slate-300 lg:block">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </div>
              )}
              <h3 className="mt-2.5 text-sm font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1 text-xs leading-4 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Steps - 2x2 Grid */}
        <div className="mt-4 lg:hidden">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md">
            <div className="grid grid-cols-2 gap-2">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white ${step.color}`}
                  >
                    {step.number}
                  </div>
                  <h3 className="mt-1 text-xs font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-0 text-[9px] leading-3 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reward card */}
        <div className="mx-auto mt-4 max-w-xl rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-center text-white shadow-lg shadow-indigo-600/20 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-200">
            Reward
          </p>
          <p className="mt-1.5 text-lg font-bold tracking-tight">
            Earn up to ₹25,000*
          </p>
          <p className="mt-0.5 text-xs text-indigo-200">
            per successful referral
          </p>

          <div className="mt-3 flex flex-row gap-1.5 justify-center">
            <a
              href="/quote"
              className="flex-1 max-w-[140px] rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-400"
            >
              Refer Now
            </a>
            <a
              href="/contact"
              className="flex-1 max-w-[140px] rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Callback
            </a>
          </div>
        </div>

        <p className="mt-2 text-center text-[9px] text-slate-400">
          * Terms apply. Reward credited after foundation completion.
        </p>
      </div>
    </section>
  );
}