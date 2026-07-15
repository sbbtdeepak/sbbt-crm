import { createClient } from "@/lib/supabase/server";
import ProjectsTable from "./components/ProjectsTable";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Projects
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all construction projects.
          </p>
        </div>

        <button className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700">
          + Add Project
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-600">
          {error.message}
        </div>
      ) : (
        <ProjectsTable
          projects={projects ?? []}
        />
      )}
    </div>
  );
}