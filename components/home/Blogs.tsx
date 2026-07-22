import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface Blog {
  id: string;
  title: string;
  slug: string;
  featured_image?: string | null;
  excerpt?: string | null;
  published: boolean;
}

export default async function Blogs() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .limit(3);

  const blogs = (data || []) as Blog[];

  if (blogs.length === 0) return null;

  return (
    <section id="blogs" className="bg-[#f8fafc] py-6 sm:py-10 text-slate-900" aria-label="Industry insights">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-4 sm:mb-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Industry insights
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Latest thinking for smarter construction.
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">
            Explore practical advice, design guidance, and project strategies from our experts.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-cols-fr">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md h-full"
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={
                    blog.featured_image ||
                    "https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=900"
                  }
                  alt={blog.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 to-transparent px-3 py-2 sm:px-4 sm:py-3">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-white sm:text-[10px]">
                    Construction guide
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-slate-950 sm:text-base">
                  {blog.title}
                </h3>
                {blog.excerpt && (
                  <p className="mt-1.5 text-xs text-slate-600 leading-5 line-clamp-2 flex-1">
                    {blog.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500">
                  <span>Read insight</span>
                  <Link href="/blogs" className="font-semibold text-indigo-600 transition hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Explore →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}