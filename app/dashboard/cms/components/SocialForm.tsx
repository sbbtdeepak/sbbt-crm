"use client";

import { useActionState } from "react";
import { saveSocial } from "../actions";
import type { CMSSocialRow } from "../types";

interface Props {
  social: CMSSocialRow | null;
}

export default function SocialForm({ social }: Props) {
  const [state, formAction, isPending] = useActionState(saveSocial, {
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

        {/* Social Links */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Social Media Links</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="facebook_url"
                className="block mb-2 font-medium text-gray-700"
              >
                Facebook
              </label>
              <input
                id="facebook_url"
                name="facebook_url"
                defaultValue={social?.facebook_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://facebook.com/sbbtconstruction"
              />
            </div>

            <div>
              <label
                htmlFor="instagram_url"
                className="block mb-2 font-medium text-gray-700"
              >
                Instagram
              </label>
              <input
                id="instagram_url"
                name="instagram_url"
                defaultValue={social?.instagram_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://instagram.com/sbbtconstruction"
              />
            </div>

            <div>
              <label
                htmlFor="linkedin_url"
                className="block mb-2 font-medium text-gray-700"
              >
                LinkedIn
              </label>
              <input
                id="linkedin_url"
                name="linkedin_url"
                defaultValue={social?.linkedin_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://linkedin.com/company/sbbt"
              />
            </div>

            <div>
              <label
                htmlFor="youtube_url"
                className="block mb-2 font-medium text-gray-700"
              >
                YouTube
              </label>
              <input
                id="youtube_url"
                name="youtube_url"
                defaultValue={social?.youtube_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://youtube.com/@sbbtconstruction"
              />
            </div>

            <div>
              <label
                htmlFor="twitter_url"
                className="block mb-2 font-medium text-gray-700"
              >
                Twitter/X
              </label>
              <input
                id="twitter_url"
                name="twitter_url"
                defaultValue={social?.twitter_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://twitter.com/sbbtconstruction"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : "Save Social Links"}
          </button>
        </div>
      </form>
    </div>
  );
}