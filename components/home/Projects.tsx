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
    <section id="projects" className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">
            Recent Projects
          </h2>

          <p className="mt-3 text-gray-600">
            Some of our recently completed work.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {projects.map((project: any) => (

            <div
              key={project.id}
              className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
            >

              <img
                src={
                  project.cover_image ||
                  "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=900"
                }
                className="h-64 w-full object-cover"
                alt={project.title}
              />

              <div className="p-6">

                <h3 className="text-xl font-bold">
                  {project.title}
                </h3>

                <p className="mt-3 text-gray-600">
                  {project.location}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}