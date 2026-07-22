"use client";

import { useActionState, useState } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { saveHomepage } from "../actions";
import type { CMSHomepageRow, CMSStat } from "../types";

interface Props {
  homepage: CMSHomepageRow | null;
}

export default function HomepageForm({ homepage }: Props) {
  const [state, formAction, isPending] = useActionState(saveHomepage, {
    success: false,
    message: "",
  });

  // Local state for hero background image URL
  const [heroBackgroundUrl, setHeroBackgroundUrl] = useState(homepage?.hero_background_url || "");

  // Local state for stats with controlled inputs
  const [stats, setStats] = useState<CMSStat[]>(homepage?.stats || [
    { label: "Years Experience", value: "15+" },
    { label: "Projects Completed", value: "500+" },
    { label: "Happy Clients", value: "1000+" },
  ]);

  // Update stat label or value
  const updateStat = (index: number, field: "label" | "value", value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form action={formAction} className="space-y-6">
        {/* Success/Error Message */}
        {state.message && (
          <div
            className={`p-4 rounded-md ${
              state.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            role="alert"
          >
            {state.message}
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="hero_heading"
                className="block mb-2 font-medium text-gray-700"
              >
                Hero Heading
              </label>
              <input
                id="hero_heading"
                name="hero_heading"
                defaultValue={homepage?.hero_heading || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Build Your Dream Home"
              />
            </div>

            <div>
              <label
                htmlFor="hero_subheading"
                className="block mb-2 font-medium text-gray-700"
              >
                Hero Subheading
              </label>
              <textarea
                id="hero_subheading"
                name="hero_subheading"
                defaultValue={homepage?.hero_subheading || ""}
                rows={3}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Expert construction services for residential and commercial projects"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hero_cta_text"
                  className="block mb-2 font-medium text-gray-700"
                >
                  CTA Button Text
                </label>
                <input
                  id="hero_cta_text"
                  name="hero_cta_text"
                  defaultValue={homepage?.hero_cta_text || ""}
                  className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Get Quote"
                />
              </div>

              <div>
                <label
                  htmlFor="hero_cta_link"
                  className="block mb-2 font-medium text-gray-700"
                >
                  CTA Button Link
                </label>
                <input
                  id="hero_cta_link"
                  name="hero_cta_link"
                  defaultValue={homepage?.hero_cta_link || ""}
                  className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="/quote"
                />
              </div>
            </div>

            {/* Hero Background Image */}
            <div>
              <ImageUploader
                folder="hero"
                value={heroBackgroundUrl}
                onChange={(url) => setHeroBackgroundUrl(url)}
                label="Hero Background"
                disabled={isPending}
              />
              <input
                type="hidden"
                name="hero_background_url"
                value={heroBackgroundUrl}
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Statistics</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="stats_heading"
                className="block mb-2 font-medium text-gray-700"
              >
                Stats Section Heading
              </label>
              <input
                id="stats_heading"
                name="stats_heading"
                defaultValue={homepage?.stats_heading || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Our Achievements"
              />
            </div>

            <div className="space-y-3">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-lg"
                >
                  <div className="md:col-span-3">
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Stat {index + 1}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(index, "label", e.target.value)}
                        className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(index, "value", e.target.value)}
                        className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Value"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden stats JSON for form submission */}
            <input
              type="hidden"
              name="stats"
              value={JSON.stringify(stats)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : "Save Homepage"}
          </button>
        </div>
      </form>
    </div>
  );
}