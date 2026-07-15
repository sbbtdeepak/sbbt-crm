"use client";

import { useState } from "react";
import ProjectsTable from "./ProjectsTable";
import AddProjectModal from "./AddProjectModal";

interface Props {
  projects: any[];
  error?: string;
}

export default function ProjectsContent({
  projects,
  error,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Projects
          </h1>

          <p className="mt-1 text-gray-500">
            Manage all construction projects.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
        >
          + Add Project
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : (
        <ProjectsTable projects={projects} />
      )}

      <AddProjectModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}