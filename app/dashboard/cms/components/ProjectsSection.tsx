"use client";

import { useState, useCallback } from "react";
import ProjectList from "./ProjectList";
import ProjectForm from "./ProjectForm";
import type { CMSProjectFull } from "../types";

type View = "list" | "create" | "edit";

export default function ProjectsSection() {
  const [view, setView] = useState<View>("list");
  const [editingProject, setEditingProject] = useState<CMSProjectFull | null>(null);

  const handleCreate = useCallback(() => {
    setEditingProject(null);
    setView("create");
  }, []);

  const handleEdit = useCallback((project: CMSProjectFull) => {
    setEditingProject(project);
    setView("edit");
  }, []);

  const handleBack = useCallback(() => {
    setEditingProject(null);
    setView("list");
  }, []);

  if (view === "create") {
    return <ProjectForm project={null} onBack={handleBack} />;
  }

  if (view === "edit" && editingProject) {
    return <ProjectForm project={editingProject} onBack={handleBack} />;
  }

  return <ProjectList onEdit={handleEdit} onCreate={handleCreate} />;
}