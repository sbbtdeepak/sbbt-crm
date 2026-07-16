import { createClient } from "@/lib/supabase/server";

export default async function Projects() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("is_active", true)
    .limit(6);

  if (!projects?.length) return null;

  return (
    <section id="projects" className="bg-[#f8fafc] py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Featured Work
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Recent projects built for modern living.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Discover quality craftsmanship and turnkey delivery across our flagship builds.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project: any) => (
            <article
              key={project.id}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative overflow-hidden">
                <img
                  src={
                    project.cover_image ||
                    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=900"
                  }
                  alt={project.title}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-6 py-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-white">
                    Project showcase
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-950">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm uppercase tracking-[0.24em] text-slate-500">
                    {project.location}
                  </p>
                </div>
                <p className="text-slate-600 leading-7">
                  Experience a premium blend of style, structure, and site execution in every project.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
