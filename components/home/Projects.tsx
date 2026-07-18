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
    <section id="projects" className="bg-[#f8fafc] text-slate-900 py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Featured Work
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Recent projects built for modern living.
          </h2>
        </div>

        {/* Mobile: 2-column grid, Desktop: standard grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-2.5 lg:gap-3">
          {projects.map((project: Project) => (
            <article
              key={project.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative overflow-hidden">
                <img
                  src={
                    project.cover_image ||
                    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=900"
                  }
                  alt={project.title}
                  className="h-[90px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-36"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-1.5 py-1 sm:px-2.5 sm:py-1.5">
                  <p className="text-[7px] uppercase tracking-[0.24em] text-white sm:text-[8px]">
                    Project
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-2.5">
                <h3 className="text-[10px] font-semibold text-slate-950 sm:text-xs">
                  {project.title}
                </h3>
                <p className="mt-0.5 text-[9px] uppercase text-slate-500 sm:text-[9px]">
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