"use client";

import type {
  Project,
  ProjectImage,
  ProjectInput,
  ProjectPackage,
  ProjectStatus,
} from "@/types/project";
import {
  PROJECT_PACKAGES,
  PROJECT_STATUSES,
} from "@/types/project";
import { useEffect, useMemo, useState } from "react";

interface ProjectFormModalProps {
  open: boolean;
  project: Project | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (
    input: ProjectInput,
    newFiles: File[],
    removedImageIds: string[]
  ) => Promise<void>;
}

const emptyForm: ProjectInput = {
  name: "",
  client_name: "",
  cid: "",
  package: "Essential",
  project_value: null,
  plot_area: "",
  road_facing: "",
  floors: null,
  status: "planning",
  rating: null,
  location: "",
  features: [],
  timeline: "",
};

function projectToForm(project: Project): ProjectInput {
  return {
    name: project.name,
    client_name: project.client_name,
    cid: project.cid ?? "",
    package: project.package ?? "Essential",
    project_value: project.project_value,
    plot_area: project.plot_area ?? "",
    road_facing: project.road_facing ?? "",
    floors: project.floors,
    status: project.status,
    rating: project.rating,
    location: project.location ?? "",
    features: project.features ?? [],
    timeline: project.timeline ?? "",
  };
}

function parseFeatures(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function featuresToText(features: string[] | null): string {
  return (features ?? []).join("\n");
}

function sortImages(images: ProjectImage[]) {
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

export function ProjectFormModal({
  open,
  project,
  isPending,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const [form, setForm] = useState<ProjectInput>(emptyForm);
  const [featuresText, setFeaturesText] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const newFilePreviews = useMemo(
    () => newFiles.map((file) => URL.createObjectURL(file)),
    [newFiles]
  );

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [newFilePreviews]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (project) {
      const nextForm = projectToForm(project);
      setForm(nextForm);
      setFeaturesText(featuresToText(nextForm.features));
      setExistingImages(sortImages(project.project_images ?? []));
    } else {
      setForm(emptyForm);
      setFeaturesText("");
      setExistingImages([]);
    }

    setNewFiles([]);
    setRemovedImageIds([]);
    setError(null);
  }, [open, project]);

  if (!open) {
    return null;
  }

  const updateField = <K extends keyof ProjectInput>(
    key: K,
    value: ProjectInput[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setNewFiles((current) => [...current, ...selectedFiles]);
    event.target.value = "";
  };

  const removeNewFile = (index: number) => {
    setNewFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };

  const removeExistingImage = (image: ProjectImage) => {
    setExistingImages((current) =>
      current.filter((existingImage) => existingImage.id !== image.id)
    );
    setRemovedImageIds((current) => [...current, image.id]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.client_name.trim()) {
      setError("Project name aur client name required hain.");
      return;
    }

    try {
      await onSubmit(
        {
          ...form,
          name: form.name.trim(),
          client_name: form.client_name.trim(),
          cid: form.cid?.trim() || null,
          plot_area: form.plot_area?.trim() || null,
          road_facing: form.road_facing?.trim() || null,
          location: form.location?.trim() || null,
          timeline: form.timeline?.trim() || null,
          features: parseFeatures(featuresText),
        },
        newFiles,
        removedImageIds
      );
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Project save nahi ho paya."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {project ? "Edit Project" : "Add Project"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project Name *">
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Client Name *">
              <input
                required
                value={form.client_name}
                onChange={(event) =>
                  updateField("client_name", event.target.value)
                }
                className={inputClassName}
              />
            </Field>

            <Field label="CID">
              <input
                value={form.cid ?? ""}
                onChange={(event) => updateField("cid", event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Package">
              <select
                value={form.package ?? "Essential"}
                onChange={(event) =>
                  updateField("package", event.target.value as ProjectPackage)
                }
                className={inputClassName}
              >
                {PROJECT_PACKAGES.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {pkg}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Project Value">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.project_value ?? ""}
                onChange={(event) =>
                  updateField(
                    "project_value",
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Plot Area">
              <input
                value={form.plot_area ?? ""}
                onChange={(event) =>
                  updateField("plot_area", event.target.value)
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Road Facing">
              <input
                value={form.road_facing ?? ""}
                onChange={(event) =>
                  updateField("road_facing", event.target.value)
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Floors">
              <input
                type="number"
                min="0"
                value={form.floors ?? ""}
                onChange={(event) =>
                  updateField(
                    "floors",
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as ProjectStatus)
                }
                className={inputClassName}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Rating (0-5)">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating ?? ""}
                onChange={(event) =>
                  updateField(
                    "rating",
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Location" className="sm:col-span-2">
              <input
                value={form.location ?? ""}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Timeline" className="sm:col-span-2">
              <input
                value={form.timeline ?? ""}
                onChange={(event) =>
                  updateField("timeline", event.target.value)
                }
                className={inputClassName}
                placeholder="e.g. Jan 2026 - Jun 2026"
              />
            </Field>

            <Field
              label="Features (ek feature per line)"
              className="sm:col-span-2"
            >
              <textarea
                rows={4}
                value={featuresText}
                onChange={(event) => setFeaturesText(event.target.value)}
                className={inputClassName}
                placeholder={"Swimming Pool\nLandscaping\nSmart Home"}
              />
            </Field>

            <Field label="Project Images" className="sm:col-span-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-300"
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Multiple images select kar sakte hain. Pehli image dashboard
                thumbnail banegi.
              </p>
            </Field>
          </div>

          {existingImages.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Existing Images
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <img
                      src={image.image_url}
                      alt="Project image"
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                      className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {newFiles.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                New Images
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {newFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <img
                      src={newFilePreviews[index]}
                      alt={file.name}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isPending
                ? "Saving..."
                : project
                  ? "Update Project"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
