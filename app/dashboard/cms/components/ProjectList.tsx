"use client";

import { useState, useEffect } from "react";
import { getAllProjects } from "../actions";
import type { CMSProjectFull } from "../types";

interface Props {
  onEdit: (project: CMSProjectFull) => void;
  onCreate: () => void;
}

export default function ProjectList({ onEdit, onCreate }: Props) {
  const [projects, setProjects] = useState<CMSProjectFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProjects();
        if (!cancelled) {
          setProjects(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load projects");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Projects</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          + New Project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="mt-1">Create your first project to get started.</p>
        </div>
      )}

      {/* Project cards */}
      <div className="grid gap-4">
        {projects.map((full) => {
          const project = full.project;
          return (
            <div
              key={project.id}
              className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onEdit(full)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {project.is_active ? "Active" : "Draft"}
                    </span>
                    {project.is_featured && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.short_description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{project.location || "No location"}</span>
                    <span>Status: {project.status || "ongoing"}</span>
                    <span>Order: {project.display_order}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>{full.gallery.length} gallery images</span>
                    <span>{full.beforeImages.length} before images</span>
                    <span>{full.afterImages.length} after images</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}