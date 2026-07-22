import { createClient } from "@/lib/supabase/server";

interface Project {
  id: string;
  title: string;
  location: string;
  cover_image?: string | null;
  is_active?: boolean;
}

export default async function Projects() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("is_active", true)
    .limit(6);

  if (!projects?.length) return null;

  return (
    <section id="projects" className="bg-[#f8fafc] text-slate-900 py-6 sm:py-10" aria-label="Featured projects">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-4 sm:mb-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Featured Work
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Recent projects built for modern living.
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-cols-fr">
          {projects.map((project: Project) => (
            <article
              key={project.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md h-full"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={
                    project.cover_image ||
                    "https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=900"
                  }
                  alt={project.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-2 py-1.5 sm:px-3 sm:py-2">
                  <p className="text-[8px] uppercase tracking-[0.24em] text-white sm:text-[10px]">
                    Project
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                <h3 className="text-[11px] font-semibold text-slate-950 sm:text-sm">
                  {project.title}
                </h3>
                <p className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500 sm:text-[10px]">
                  {project.location}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}