"use client";

import { useState } from "react";
import { createBlog } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddBlogModal({
  open,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    try {
      await createBlog(formData);

      onClose();

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Unable to save blog.");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Add Blog
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
              Blog Title *
            </label>

            <input
              required
              name="title"
              className="w-full rounded-lg border p-3"
              placeholder="Top 10 House Construction Tips"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Slug
            </label>

            <input
              name="slug"
              className="w-full rounded-lg border p-3"
              placeholder="top-10-house-construction-tips"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Short Description
            </label>

            <textarea
              rows={3}
              name="excerpt"
              className="w-full rounded-lg border p-3"
              placeholder="Short summary of blog..."
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Blog Content
            </label>

            <textarea
              rows={12}
              name="content"
              className="w-full rounded-lg border p-3"
              placeholder="Write complete blog..."
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Featured Image URL
            </label>

            <input
              name="featured_image"
              className="w-full rounded-lg border p-3"
              placeholder="https://..."
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Author
            </label>

            <input
              defaultValue="SBBT"
              name="author"
              className="w-full rounded-lg border p-3"
            />

          </div>

          <div className="flex items-center gap-3">

            <input
              id="published"
              type="checkbox"
              name="published"
            />

            <label htmlFor="published">
              Publish Immediately
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
              {loading ? "Saving..." : "Save Blog"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}