import { createClient } from "@/lib/supabase/server";

export default async function Blogs() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .limit(3);

  if (!data?.length) return null;

  return (
    <section id="blogs" className="bg-[#f8fafc] py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Industry insights
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Latest thinking for smarter construction.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Explore practical advice, design guidance, and project strategies from our experts.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {data.map((blog: any) => (
            <article
              key={blog.id}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative overflow-hidden">
                <img
                  src={
                    blog.featured_image ||
                    "https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=900"
                  }
                  alt={blog.title}
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 to-transparent px-6 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white">
                    Construction guide
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-950">
                  {blog.title}
                </h3>
                <p className="mt-4 text-slate-600 leading-7">
                  {blog.excerpt}
                </p>
                <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-500">
                  <span>Read insight</span>
                  <a href="/blogs" className="font-semibold text-indigo-600 transition hover:text-indigo-500">
                    Explore
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
