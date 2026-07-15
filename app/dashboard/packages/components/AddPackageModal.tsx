"use client";

import { useState } from "react";
import { createPackage } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddPackageModal({
  open,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    try {
      await createPackage(formData);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Unable to save package.");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Add Package
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
              Package Name *
            </label>

            <input
              required
              name="name"
              className="w-full rounded-lg border p-3"
              placeholder="Premium Luxury"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Price (₹ / sqft) *
            </label>

            <input
              required
              type="number"
              name="price"
              className="w-full rounded-lg border p-3"
              placeholder="2499"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Short Description *
            </label>

            <textarea
              required
              rows={3}
              name="short_description"
              className="w-full rounded-lg border p-3"
              placeholder="Shown on homepage package cards."
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Full Description *
            </label>

            <textarea
              required
              rows={8}
              name="description"
              className="w-full rounded-lg border p-3"
              placeholder="Complete package specification..."
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Brands We Use
            </label>

            <textarea
              rows={8}
              name="brands"
              className="w-full rounded-lg border p-3"
              placeholder={`Cement : UltraTech
Steel : Tata Tiscon
Paint : Asian Paints
Tiles : Kajaria
Wire : Havells`}
            />

          </div>

          <div>

            <label className="mb-2 block font-medium">
              Status
            </label>

            <select
              name="status"
              defaultValue="active"
              className="w-full rounded-lg border p-3"
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

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
              {loading ? "Saving..." : "Save Package"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}