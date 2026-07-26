"use client";

import { useActionState, useState, useCallback } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { saveTestimonial, deleteTestimonial, toggleTestimonialFeatured } from "../actions";
import type { CMSTestimonialRow } from "../types";

interface Props {
  testimonial: CMSTestimonialRow | null;
  onBack: () => void;
}

export default function TestimonialsForm({ testimonial, onBack }: Props) {
  const [state, formAction, isPending] = useActionState(saveTestimonial, {
    success: false,
    message: "",
  });

  const [deleteState, deleteAction, isDeleting] = useActionState(deleteTestimonial, {
    success: false,
    message: "",
  });

  const [toggleState, toggleAction, isToggling] = useActionState(toggleTestimonialFeatured, {
    success: false,
    message: "",
  });

  const isEdit = Boolean(testimonial);

  // Image states
  const [imageUrl, setImageUrl] = useState(testimonial?.image_url || "");

  // Handle delete
  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      const form = new FormData();
      form.set("id", testimonial?.id?.toString() || "");
      deleteAction(form);
    }
  }, [testimonial, deleteAction]);

  // Handle toggle featured
  const handleToggleFeatured = useCallback(() => {
    const form = new FormData();
    form.set("id", testimonial?.id?.toString() || "");
    form.set("is_featured", !testimonial?.is_featured ? "on" : "off");
    toggleAction(form);
  }, [testimonial, toggleAction]);

  // Show success/redirect
  if (state.success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">{state.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Testimonials
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
          Back to Testimonials
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
            {isEdit ? `Edit: ${testimonial?.client_name}` : "New Testimonial"}
          </h2>
        </div>
        {isEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggleFeatured}
              disabled={isToggling}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                testimonial?.is_featured
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              }`}
            >
              {isToggling ? "..." : testimonial?.is_featured ? "Unfeature" : "Feature"}
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
      {state.message && !state.success && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
          {state.message}
        </div>
      )}
      {toggleState.message && (
        <div className={`mb-6 p-4 rounded-md ${
          toggleState.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`} role="alert">
          {toggleState.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={testimonial?.id} />}

        {/* Basic Information */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="client_name" className="block mb-2 font-medium text-gray-700">Client Name *</label>
              <input
                id="client_name"
                name="client_name"
                defaultValue={testimonial?.client_name || ""}
                required
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="designation" className="block mb-2 font-medium text-gray-700">Designation</label>
              <input
                id="designation"
                name="designation"
                defaultValue={testimonial?.designation || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Homeowner, CEO, etc."
              />
            </div>
            <div>
              <label htmlFor="project_name" className="block mb-2 font-medium text-gray-700">Project Name</label>
              <input
                id="project_name"
                name="project_name"
                defaultValue={testimonial?.project_name || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Dream Home Project"
              />
            </div>
            <div>
              <label htmlFor="location" className="block mb-2 font-medium text-gray-700">Location</label>
              <input
                id="location"
                name="location"
                defaultValue={testimonial?.location || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Delhi NCR"
              />
            </div>
            <div>
              <label htmlFor="rating" className="block mb-2 font-medium text-gray-700">Rating</label>
              <select
                id="rating"
                name="rating"
                defaultValue={testimonial?.rating || 5}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="display_order" className="block mb-2 font-medium text-gray-700">Display Order</label>
              <input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                defaultValue={testimonial?.display_order || 0}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="testimonial" className="block mb-2 font-medium text-gray-700">Testimonial Content *</label>
              <textarea
                id="testimonial"
                name="testimonial"
                defaultValue={testimonial?.testimonial || ""}
                required
                rows={4}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Write the client's testimonial here..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={testimonial?.is_featured ?? false}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-700">Featured (shown on homepage)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Client Image */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Client Image</h3>
          <ImageUploader
            folder="testimonials"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            label="Client Photo"
            disabled={isPending}
          />
          <input type="hidden" name="image_url" value={imageUrl} />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : isEdit ? "Update Testimonial" : "Create Testimonial"}
          </button>
        </div>
      </form>
    </div>
  );
}