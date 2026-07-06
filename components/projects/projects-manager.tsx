"use client";

import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/dashboard/actions";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { ProjectsTable } from "@/components/projects/projects-table";
import type { Project, ProjectInput } from "@/types/project";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectsManagerProps {
  projects: Project[];
}

export function ProjectsManager({ projects }: ProjectsManagerProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const openCreateModal = () => {
    setSelectedProject(null);
    setModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  const handleSubmit = async (
    input: ProjectInput,
    newFiles: File[],
    removedImageIds: string[]
  ) => {
    setIsPending(true);

    try {
      if (selectedProject) {
        await updateProject(
          selectedProject.id,
          input,
          newFiles,
          removedImageIds
        );
      } else {
        await createProject(input, newFiles);
      }

      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `"${project.name}" delete karna hai? Ye action undo nahi ho sakta.`
    );

    if (!confirmed) {
      return;
    }

    setIsPending(true);

    try {
      await deleteProject(project.id);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Projects
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Saare projects yahan manage karein.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add Project
        </button>
      </div>

      <ProjectsTable
        projects={projects}
        onEdit={openEditModal}
        onDelete={handleDelete}
        isPending={isPending}
      />

      <ProjectFormModal
        open={modalOpen}
        project={selectedProject}
        isPending={isPending}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
