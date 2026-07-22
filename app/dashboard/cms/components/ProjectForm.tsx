"use client";

import { useActionState, useState, useCallback } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { saveProject, deleteProject, toggleProjectActive, toggleProjectFeatured } from "../actions";
import type { CMSProjectFull, CMSProjectGalleryItem, CMSProjectBeforeAfterItem } from "../types";

interface Props {
  project: CMSProjectFull | null;
  onBack: () => void;
}

export default function ProjectForm({ project, onBack }: Props) {
  const [state, formAction, isPending] = useActionState(saveProject, {
    success: false,
    message: "",
  });

  const [deleteState, deleteAction, isDeleting] = useActionState(deleteProject, {
    success: false,
    message: "",
  });

  const [toggleState, toggleAction, isToggling] = useActionState(toggleProjectActive, {
    success: false,
    message: "",
  });

  const [featuredState, featuredAction, isFeaturing] = useActionState(toggleProjectFeatured, {
    success: false,
    message: "",
  });

  const isEdit = Boolean(project);
  const projectData = project?.project;

  // Image states
  const [coverImageUrl, setCoverImageUrl] = useState(projectData?.cover_image_url || "");
  const [ogImageUrl, setOgImageUrl] = useState(projectData?.og_image_url || "");

  // Gallery state
  const [gallery, setGallery] = useState<CMSProjectGalleryItem[]>(project?.gallery || []);

  // Before images state
  const [beforeImages, setBeforeImages] = useState<CMSProjectBeforeAfterItem[]>(project?.beforeImages || []);

  // After images state
  const [afterImages, setAfterImages] = useState<CMSProjectBeforeAfterItem[]>(project?.afterImages || []);

  // Add gallery item
  const addGalleryItem = useCallback(() => {
    setGallery((prev) => [...prev, { image_url: "", caption: "" }]);
  }, []);

  const updateGalleryItem = useCallback((index: number, field: keyof CMSProjectGalleryItem, value: string) => {
    setGallery((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeGalleryItem = useCallback((index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Add before image
  const addBeforeImage = useCallback(() => {
    setBeforeImages((prev) => [...prev, { image_url: "", caption: "" }]);
  }, []);

  const updateBeforeImage = useCallback((index: number, field: keyof CMSProjectBeforeAfterItem, value: string) => {
    setBeforeImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeBeforeImage = useCallback((index: number) => {
    setBeforeImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Add after image
  const addAfterImage = useCallback(() => {
    setAfterImages((prev) => [...prev, { image_url: "", caption: "" }]);
  }, []);

  const updateAfterImage = useCallback((index: number, field: keyof CMSProjectBeforeAfterItem, value: string) => {
    setAfterImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeAfterImage = useCallback((index: number) => {
    setAfterImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this project?")) {
      const form = new FormData();
      form.set("id", projectData?.id?.toString() || "");
      deleteAction(form);
    }
  }, [projectData, deleteAction]);

  // Handle toggle active
  const handleToggleActive = useCallback(() => {
    const form = new FormData();
    form.set("id", projectData?.id?.toString() || "");
    form.set("is_active", projectData?.is_active ? "on" : "off");
    toggleAction(form);
  }, [projectData, toggleAction]);

  // Handle toggle featured
  const handleToggleFeatured = useCallback(() => {
    const form = new FormData();
    form.set("id", projectData?.id?.toString() || "");
    form.set("is_featured", projectData?.is_featured ? "on" : "off");
    featuredAction(form);
  }, [projectData, featuredAction]);

  // Show success/redirect
  if (state.success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">{state.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (deleteState.success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">{deleteState.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-bold">
            {isEdit ? `Edit: ${projectData?.name}` : "New Project"}
          </h2>
        </div>
        {isEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                projectData?.is_active
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {isToggling ? "..." : projectData?.is_active ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={handleToggleFeatured}
              disabled={isFeaturing}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                projectData?.is_featured
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              {isFeaturing ? "..." : projectData?.is_featured ? "Unfeature" : "Feature"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {((state as { success: boolean; message: string; errors?: Record<string, string[]> }).errors || state.message && !state.success) && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
          <p className="font-medium">{state.message}</p>
          {(state as { success: boolean; message: string; errors?: Record<string, string[]> }).errors && (
            <ul className="mt-2 list-disc list-inside text-sm">
              {Object.entries((state as { success: boolean; message: string; errors?: Record<string, string[]> }).errors || {}).map(([field, msgs]) => (
                <li key={field}>{field}: {(msgs as string[]).join(", ")}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {toggleState.message && (
        <div className={`mb-6 p-4 rounded-md ${
          toggleState.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`} role="alert">
          {toggleState.message}
        </div>
      )}
      {featuredState.message && (
        <div className={`mb-6 p-4 rounded-md ${
          featuredState.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`} role="alert">
          {featuredState.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={projectData?.id} />}

        {/* Basic Information */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">Project Name *</label>
              <input
                id="name"
                name="name"
                defaultValue={projectData?.name || ""}
                required
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Luxury Villa Project"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block mb-2 font-medium text-gray-700">Slug</label>
              <input
                id="slug"
                name="slug"
                defaultValue={projectData?.slug || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="luxury-villa-project"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from name if empty</p>
            </div>
            <div>
              <label htmlFor="client_name" className="block mb-2 font-medium text-gray-700">Client Name</label>
              <input
                id="client_name"
                name="client_name"
                defaultValue={projectData?.client_name || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="location" className="block mb-2 font-medium text-gray-700">Location *</label>
              <input
                id="location"
                name="location"
                defaultValue={projectData?.location || ""}
                required
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Delhi, India"
              />
            </div>
            <div>
              <label htmlFor="project_type" className="block mb-2 font-medium text-gray-700">Project Type</label>
              <select
                id="project_type"
                name="project_type"
                defaultValue={projectData?.project_type || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="renovation">Renovation</option>
                <option value="interior">Interior Design</option>
              </select>
            </div>
            <div>
              <label htmlFor="package_used" className="block mb-2 font-medium text-gray-700">Package Used</label>
              <input
                id="package_used"
                name="package_used"
                defaultValue={projectData?.package_used || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Gold Package"
              />
            </div>
            <div>
              <label htmlFor="plot_area" className="block mb-2 font-medium text-gray-700">Plot Area</label>
              <input
                id="plot_area"
                name="plot_area"
                defaultValue={projectData?.plot_area || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="2000 sq ft"
              />
            </div>
            <div>
              <label htmlFor="built_up_area" className="block mb-2 font-medium text-gray-700">Built-up Area</label>
              <input
                id="built_up_area"
                name="built_up_area"
                defaultValue={projectData?.built_up_area || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="3500 sq ft"
              />
            </div>
            <div>
              <label htmlFor="floors" className="block mb-2 font-medium text-gray-700">Floors</label>
              <input
                id="floors"
                name="floors"
                defaultValue={projectData?.floors || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="G+2"
              />
            </div>
            <div>
              <label htmlFor="completion_date" className="block mb-2 font-medium text-gray-700">Completion Date</label>
              <input
                id="completion_date"
                name="completion_date"
                type="date"
                defaultValue={projectData?.completion_date || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="status" className="block mb-2 font-medium text-gray-700">Status *</label>
              <select
                id="status"
                name="status"
                defaultValue={projectData?.status || "ongoing"}
                required
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="display_order" className="block mb-2 font-medium text-gray-700">Display Order</label>
              <input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                defaultValue={projectData?.display_order || 0}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="short_description" className="block mb-2 font-medium text-gray-700">Short Description</label>
              <textarea
                id="short_description"
                name="short_description"
                defaultValue={projectData?.short_description || ""}
                rows={2}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Brief overview of the project..."
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block mb-2 font-medium text-gray-700">Full Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={projectData?.description || ""}
                rows={4}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Detailed description of the project, challenges, solutions..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={projectData?.is_active ?? true}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-700">Active (published)</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={projectData?.is_featured ?? false}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-700">Featured Project</span>
              </label>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUploader
                folder="projects"
                value={coverImageUrl}
                onChange={(url) => setCoverImageUrl(url)}
                label="Cover Image"
                disabled={isPending}
              />
              <input type="hidden" name="cover_image_url" value={coverImageUrl} />
            </div>
            <div>
              <label htmlFor="video_url" className="block mb-2 font-medium text-gray-700">Video URL (YouTube)</label>
              <input
                id="video_url"
                name="video_url"
                type="url"
                defaultValue={projectData?.video_url || ""}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="project_value" className="block mb-2 font-medium text-gray-700">Project Value</label>
              <input
                id="project_value"
                name="project_value"
                defaultValue={projectData?.project_value || ""}
                placeholder="₹50 Lakhs"
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="duration" className="block mb-2 font-medium text-gray-700">Duration</label>
              <input
                id="duration"
                name="duration"
                defaultValue={projectData?.duration || ""}
                placeholder="6 months"
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="team_size" className="block mb-2 font-medium text-gray-700">Team Size</label>
              <input
                id="team_size"
                name="team_size"
                type="text"
                defaultValue={projectData?.team_size || ""}
                placeholder="10 members"
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="customer_rating" className="block mb-2 font-medium text-gray-700">Customer Rating</label>
              <input
                id="customer_rating"
                name="customer_rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={projectData?.customer_rating || "0"}
                placeholder="4.5"
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Gallery Images</h3>
            <button
              type="button"
              onClick={addGalleryItem}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              + Add Image
            </button>
          </div>
          {gallery.length === 0 && (
            <p className="text-gray-500 text-sm">No gallery images added yet.</p>
          )}
          <div className="space-y-3">
            {gallery.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-gray-600">Image {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <ImageUploader
                      folder="projects"
                      value={item.image_url}
                      onChange={(url) => updateGalleryItem(index, "image_url", url)}
                      label={`Gallery Image ${index + 1}`}
                      disabled={isPending}
                    />
                  </div>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateGalleryItem(index, "caption", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500 mt-8"
                    placeholder="Caption"
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
        </div>

        {/* Before Images */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Before Images</h3>
            <button
              type="button"
              onClick={addBeforeImage}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              + Add Before Image
            </button>
          </div>
          {beforeImages.length === 0 && (
            <p className="text-gray-500 text-sm">No before images added yet.</p>
          )}
          <div className="space-y-3">
            {beforeImages.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-gray-600">Before Image {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeBeforeImage(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <ImageUploader
                      folder="projects"
                      value={item.image_url}
                      onChange={(url) => updateBeforeImage(index, "image_url", url)}
                      label={`Before Image ${index + 1}`}
                      disabled={isPending}
                    />
                  </div>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateBeforeImage(index, "caption", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500 mt-8"
                    placeholder="Caption"
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="before_images" value={JSON.stringify(beforeImages)} />
        </div>

        {/* After Images */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">After Images</h3>
            <button
              type="button"
              onClick={addAfterImage}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              + Add After Image
            </button>
          </div>
          {afterImages.length === 0 && (
            <p className="text-gray-500 text-sm">No after images added yet.</p>
          )}
          <div className="space-y-3">
            {afterImages.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-gray-600">After Image {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAfterImage(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <ImageUploader
                      folder="projects"
                      value={item.image_url}
                      onChange={(url) => updateAfterImage(index, "image_url", url)}
                      label={`After Image ${index + 1}`}
                      disabled={isPending}
                    />
                  </div>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateAfterImage(index, "caption", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500 mt-8"
                    placeholder="Caption"
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="after_images" value={JSON.stringify(afterImages)} />
        </div>

        {/* SEO */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="meta_title" className="block mb-2 font-medium text-gray-700">Meta Title</label>
              <input
                id="meta_title"
                name="meta_title"
                defaultValue={projectData?.meta_title || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Luxury Villa Project | SBBT"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="meta_description" className="block mb-2 font-medium text-gray-700">Meta Description</label>
              <textarea
                id="meta_description"
                name="meta_description"
                defaultValue={projectData?.meta_description || ""}
                rows={2}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Explore our luxury villa construction project..."
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploader
                folder="projects"
                value={ogImageUrl}
                onChange={(url) => setOgImageUrl(url)}
                label="OG Image"
                disabled={isPending}
              />
              <input type="hidden" name="og_image_url" value={ogImageUrl} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}