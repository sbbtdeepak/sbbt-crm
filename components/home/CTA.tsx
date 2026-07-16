export default function CTA() {
  return (
    <section className="bg-slate-50 py-24 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-white p-10 shadow-xl shadow-slate-200 ring-1 ring-slate-200/60 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5 text-center lg:text-left">
              <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
                Start your project
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Ready to turn your construction vision into reality?
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Connect with our planning team for a fast quotation, site review, and project strategy tailored to your site.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-end">
              <a
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
              >
                Book a quote
              </a>
              <a
                href="#projects"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
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
