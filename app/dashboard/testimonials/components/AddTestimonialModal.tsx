"use client";

import { useState } from "react";
import { createTestimonial } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddTestimonialModal({
  open,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    try {
      await createTestimonial(formData);

      onClose();

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Unable to save testimonial.");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Add Testimonial
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>

        </div>

        <form
          action={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="mb-2 block font-medium">
              Client Name *
            </label>

            <input
              required
              name="client_name"
              className="w-full rounded-lg border p-3"
              placeholder="Deepak Sharma"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Project Name *
            </label>

            <input
              required
              name="project_name"
              className="w-full rounded-lg border p-3"
              placeholder="3 Floor House Construction"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Review *
            </label>

            <textarea
              required
              rows={6}
              name="content"
              className="w-full rounded-lg border p-3"
              placeholder="Write customer review..."
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Rating
            </label>

            <select
              name="rating"
              defaultValue="5"
              className="w-full rounded-lg border p-3"
            >

              <option value="5">⭐⭐⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="2">⭐⭐</option>
              <option value="1">⭐</option>

            </select>

          </div>

          <div className="flex items-center gap-3">

            <input
              id="featured"
              type="checkbox"
              name="is_featured"
            />

            <label htmlFor="featured">
              Show on Homepage
            </label>

          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
            >
              {loading ? "Saving..." : "Save Testimonial"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}