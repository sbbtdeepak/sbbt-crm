"use client";

import { useState } from "react";
import { createProject } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddProjectModal({
  open,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    try {
      await createProject(formData);
      onClose();
      window.location.reload();
    } catch (err) {
      alert("Unable to save project");
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Add Project
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="grid grid-cols-2 gap-4">

          <input
            name="name"
            placeholder="Project Name"
            required
            className="rounded border p-3"
          />

          <input
            name="client_name"
            placeholder="Client Name"
            required
            className="rounded border p-3"
          />

          <input
            name="cid"
            placeholder="CID"
            className="rounded border p-3"
          />

          <select
            name="package"
            className="rounded border p-3"
          >
            <option>Essential</option>
            <option>Solid Structure</option>
            <option>Premium Luxury</option>
            <option>Custom</option>
          </select>

          <input
            type="number"
            name="project_value"
            placeholder="Project Value"
            className="rounded border p-3"
          />

          <input
            name="plot_area"
            placeholder="Plot Area"
            className="rounded border p-3"
          />

          <input
            name="road_facing"
            placeholder="Road Facing"
            className="rounded border p-3"
          />

          <input
            type="number"
            name="floors"
            placeholder="Floors"
            defaultValue={1}
            className="rounded border p-3"
          />

          <input
            name="location"
            placeholder="Location"
            className="rounded border p-3"
          />

          <input
            name="timeline"
            placeholder="Timeline"
            className="rounded border p-3"
          />

          <input
            name="features"
            placeholder="Features (comma separated)"
            className="col-span-2 rounded border p-3"
          />

          <select
            name="status"
            className="rounded border p-3"
          >
            <option value="planning">
              Planning
            </option>

            <option value="ongoing">
              Ongoing
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

          <input
            type="number"
            name="rating"
            defaultValue={5}
            className="rounded border p-3"
          />

          <div className="col-span-2 mt-4 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded border px-5 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded bg-indigo-600 px-6 py-2 text-white"
            >
              {loading ? "Saving..." : "Save Project"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}