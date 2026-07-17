const STEPS = [
  {
    number: "01",
    title: "Refer Customer",
    description: "Share SBBT with your friends and family who are planning to build their dream home.",
    color: "bg-indigo-600",
  },
  {
    number: "02",
    title: "Free Consultation",
    description: "Your referral gets a free, no-obligation consultation with our expert team.",
    color: "bg-emerald-600",
  },
  {
    number: "03",
    title: "Project Starts",
    description: "Once they sign the agreement and construction begins, your reward is locked in.",
    color: "bg-indigo-600",
  },
  {
    number: "04",
    title: "Earn Reward",
    description: "Receive your reward — up to ₹25,000 per successful referral.",
    color: "bg-emerald-600",
  },
];

export default function ReferEarn() {
  return (
    <section className="bg-slate-50 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Refer & Earn
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Refer & Earn
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Refer your friends or family and earn exciting rewards when their
            construction project starts with SBBT.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Step number */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${step.color} transition-transform duration-300 group-hover:scale-110`}
              >
                {step.number}
              </div>

              {/* Arrow connector (desktop) */}
              {index < STEPS.length - 1 && (
                <div className="absolute right-0 top-8 hidden -mr-3 text-slate-300 lg:block">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </div>
              )}

              {/* Title */}
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Reward card */}
        <div className="mx-auto mt-12 max-w-xl rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 text-center text-white shadow-xl shadow-indigo-600/20">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-200">
            Reward
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight">
            Earn up to ₹25,000*
          </p>
          <p className="mt-2 text-sm text-indigo-200">
            per successful referral — no limit on referrals
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Refer Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Request Callback
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          * Terms and conditions apply. Reward is credited after the referred
          project reaches foundation completion.
        </p>
      </div>
    </section>
  );
}