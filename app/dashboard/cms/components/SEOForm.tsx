"use client";

import { useActionState } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { saveSEO } from "../actions";
import type { CMSSEORow } from "../types";

interface Props {
  seo: CMSSEORow | null;
}

export default function SEOForm({ seo }: Props) {
  const [state, formAction, isPending] = useActionState(saveSEO, {
    success: false,
    message: "",
  });

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

        {/* Basic SEO */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Basic SEO</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="meta_title"
                className="block mb-2 font-medium text-gray-700"
              >
                Meta Title
              </label>
              <input
                id="meta_title"
                name="meta_title"
                defaultValue={seo?.meta_title || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="SBBT Construction - Building Excellence"
              />
            </div>

            <div>
              <label
                htmlFor="meta_description"
                className="block mb-2 font-medium text-gray-700"
              >
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                defaultValue={seo?.meta_description || ""}
                rows={3}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Leading construction company..."
              />
            </div>

            <div>
              <label
                htmlFor="meta_keywords"
                className="block mb-2 font-medium text-gray-700"
              >
                Meta Keywords
              </label>
              <input
                id="meta_keywords"
                name="meta_keywords"
                defaultValue={seo?.meta_keywords || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="construction, residential, commercial"
              />
            </div>

            <div>
              <label
                htmlFor="canonical_url"
                className="block mb-2 font-medium text-gray-700"
              >
                Canonical URL
              </label>
              <input
                id="canonical_url"
                name="canonical_url"
                defaultValue={seo?.canonical_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://www.sbbt.in"
              />
            </div>

            <div>
              <label
                htmlFor="robots"
                className="block mb-2 font-medium text-gray-700"
              >
                Robots
              </label>
              <select
                id="robots"
                name="robots"
                defaultValue={seo?.robots || "index, follow"}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="index, follow">Index, Follow</option>
                <option value="noindex, follow">Noindex, Follow</option>
                <option value="index, nofollow">Index, Nofollow</option>
                <option value="noindex, nofollow">Noindex, Nofollow</option>
              </select>
            </div>

            {/* OG Image */}
            <div>
              <ImageUploader
                folder="og-images"
                value={seo?.og_image_url || ""}
                onChange={(url) => {
                  const input = document.createElement("input");
                  input.type = "hidden";
                  input.name = "og_image_url";
                  input.value = url;
                  document.querySelector("form")?.appendChild(input);
                }}
                label="Open Graph Image"
                disabled={isPending}
              />
              <input
                type="hidden"
                name="og_image_url"
                defaultValue={seo?.og_image_url || ""}
              />
            </div>

            <div>
              <label
                htmlFor="twitter_card"
                className="block mb-2 font-medium text-gray-700"
              >
                Twitter Card
              </label>
              <select
                id="twitter_card"
                name="twitter_card"
                defaultValue={seo?.twitter_card || "summary_large_image"}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="summary_large_image">Summary Large Image</option>
                <option value="summary">Summary</option>
                <option value="photo">Photo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Verification</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="google_verification"
                className="block mb-2 font-medium text-gray-700"
              >
                Google Search Console
              </label>
              <input
                id="google_verification"
                name="google_verification"
                defaultValue={seo?.google_verification || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Verification code"
              />
            </div>

            <div>
              <label
                htmlFor="bing_verification"
                className="block mb-2 font-medium text-gray-700"
              >
                Bing Webmaster Tools
              </label>
              <input
                id="bing_verification"
                name="bing_verification"
                defaultValue={seo?.bing_verification || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Verification code"
              />
            </div>

            <div>
              <label
                htmlFor="facebook_app_id"
                className="block mb-2 font-medium text-gray-700"
              >
                Facebook App ID
              </label>
              <input
                id="facebook_app_id"
                name="facebook_app_id"
                defaultValue={seo?.facebook_app_id || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="123456789012345"
              />
            </div>
          </div>
        </div>

        {/* Schema JSON */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Structured Data</h2>
          <div>
            <label
              htmlFor="schema_json"
              className="block mb-2 font-medium text-gray-700"
            >
              JSON-LD Schema
            </label>
            <textarea
              id="schema_json"
              name="schema_json"
              defaultValue={seo?.schema_json ? JSON.stringify(seo.schema_json, null, 2) : ""}
              rows={6}
              className="w-full rounded-lg border p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder='{"@context": "https://schema.org", ...}'
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
            {isPending ? "Saving..." : "Save SEO"}
          </button>
        </div>
      </form>
    </div>
  );
}