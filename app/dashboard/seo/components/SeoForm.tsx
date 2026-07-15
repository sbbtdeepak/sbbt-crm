"use client";

import { useState } from "react";
import { saveSeo } from "../actions";
import { SeoSetting } from "../types";

interface Props {
  seo?: SeoSetting | null;
}

export default function SeoForm({ seo }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    try {
      await saveSeo(formData);
      alert("SEO Saved Successfully");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Unable to save SEO");
    }

    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-6">

      <div>

        <label className="mb-2 block font-medium">
          Page
        </label>

        <input
          name="page"
          defaultValue={seo?.page ?? "home"}
          className="w-full rounded-lg border p-3"
        />

      </div>

      <div>

        <label className="mb-2 block font-medium">
          Meta Title
        </label>

        <input
          name="meta_title"
          defaultValue={seo?.meta_title}
          className="w-full rounded-lg border p-3"
        />

      </div>

      <div>

        <label className="mb-2 block font-medium">
          Meta Description
        </label>

        <textarea
          rows={4}
          name="meta_description"
          defaultValue={seo?.meta_description}
          className="w-full rounded-lg border p-3"
        />

      </div>

      <div>

        <label className="mb-2 block font-medium">
          Meta Keywords
        </label>

        <textarea
          rows={3}
          name="meta_keywords"
          defaultValue={seo?.meta_keywords}
          className="w-full rounded-lg border p-3"
          placeholder="house construction, builder, turnkey, Delhi NCR"
        />

      </div>

      <div>

        <label className="mb-2 block font-medium">
          Canonical URL
        </label>

        <input
          name="canonical_url"
          defaultValue={seo?.canonical_url}
          className="w-full rounded-lg border p-3"
        />

      </div>

      <div>

        <label className="mb-2 block font-medium">
          Open Graph Image
        </label>

        <input
          name="og_image"
          defaultValue={seo?.og_image}
          className="w-full rounded-lg border p-3"
          placeholder="https://..."
        />

      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
      >
        {loading ? "Saving..." : "Save SEO"}
      </button>

    </form>
  );
}