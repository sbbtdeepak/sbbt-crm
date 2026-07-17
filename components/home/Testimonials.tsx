import { createClient } from "@/lib/supabase/server";

export default async function Testimonials() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_featured", true);

  if (!data?.length) return null;

  return (
    <section id="testimonials" className="bg-white py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Customer confidence
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            What clients say about our craftsmanship.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Featured stories from clients who trusted us with their most important construction projects.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="mt-16 hidden md:grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item: any) => (
            <blockquote
              key={item.id}
              className="group rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 text-indigo-600">
                <span className="text-3xl">"</span>
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-600">
                  Featured testimonial
                </p>
              </div>

              <p className="mt-6 text-lg leading-8 text-slate-700 italic">
                &ldquo;{item.content}&rdquo;
              </p>

              <footer className="mt-8 border-t border-slate-200 pt-5">
                <p className="font-semibold text-slate-950">{item.client_name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.project_name}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Mobile Swipe Carousel */}
        <div className="mt-16 md:hidden">
          {/* Padding container for partial card visibility */}
          <div className="px-4">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
              {data.map((item: any) => (
                <blockquote
                  key={item.id}
                  className="snap-start flex-shrink-0 w-[calc(100vw-32px-80px)] max-w-sm rounded-[2rem] border border-slate-200 bg-[#f8fafc] p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 text-indigo-600">
                    <span className="text-2xl">"</span>
                    <p className="text-xs uppercase tracking-[0.24em] text-indigo-600">
                      Testimonial
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-700 italic">
                    &ldquo;{item.content}&rdquo;
                  </p>

                  <footer className="mt-4 border-t border-slate-200 pt-3">
                    <p className="font-semibold text-slate-950 text-sm">{item.client_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.project_name}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}