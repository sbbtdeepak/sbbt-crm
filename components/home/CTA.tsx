export default function CTA() {
  return (
    <section className="bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-[80px]">
        <div className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl p-5 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/60 sm:p-8">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="text-center lg:text-left">
              <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
                Start your project
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Ready to turn your construction vision into reality?
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">
                Connect with our planning team for a fast quotation, site review, and project strategy tailored to your site.
              </p>
            </div>

            <div className="flex flex-row items-center justify-center gap-2 sm:justify-end">
              <a
                href="/quote"
                className="flex-1 max-w-[160px] inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:scale-105 active:scale-95"
              >
                Book a quote
              </a>
              <a
                href="#projects"
                className="flex-1 max-w-[160px] inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-900 transition hover:border-indigo-300 hover:bg-slate-50 hover:scale-105"
              >
                View projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}