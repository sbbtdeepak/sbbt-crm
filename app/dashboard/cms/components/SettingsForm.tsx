"use client";

import { useActionState } from "react";
import { saveSettings } from "../actions";
import type { CMSSettingsRow } from "../types";

interface Props {
  settings: CMSSettingsRow | null;
}

export default function SettingsForm({ settings }: Props) {
  const [state, formAction, isPending] = useActionState(saveSettings, {
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

        {/* Footer */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Footer Settings</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="footer_text"
                className="block mb-2 font-medium text-gray-700"
              >
                Footer Text
              </label>
              <textarea
                id="footer_text"
                name="footer_text"
                defaultValue={settings?.footer_text || ""}
                rows={3}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="© 2024 SBBT Construction. All rights reserved."
              />
            </div>

            <div>
              <label
                htmlFor="copyright_text"
                className="block mb-2 font-medium text-gray-700"
              >
                Copyright Text
              </label>
              <input
                id="copyright_text"
                name="copyright_text"
                defaultValue={settings?.copyright_text || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="SBBT Construction"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Maintenance Mode</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="maintenance_mode"
                name="maintenance_mode"
                type="checkbox"
                defaultChecked={settings?.maintenance_mode || false}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="maintenance_mode"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Enable Maintenance Mode
              </label>
            </div>

            <div>
              <label
                htmlFor="maintenance_message"
                className="block mb-2 font-medium text-gray-700"
              >
                Maintenance Message
              </label>
              <textarea
                id="maintenance_message"
                name="maintenance_message"
                defaultValue={
                  settings?.maintenance_message ||
                  "We are currently under maintenance. Please check back soon."
                }
                rows={2}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="We are currently under maintenance..."
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Feature Toggles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                id="enable_blog"
                name="enable_blog"
                type="checkbox"
                defaultChecked={settings?.enable_blog ?? true}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="enable_blog"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Enable Blog
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="enable_quote"
                name="enable_quote"
                type="checkbox"
                defaultChecked={settings?.enable_quote ?? true}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="enable_quote"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Enable Quote Requests
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="enable_whatsapp"
                name="enable_whatsapp"
                type="checkbox"
                defaultChecked={settings?.enable_whatsapp ?? true}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="enable_whatsapp"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Enable WhatsApp Button
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="enable_chatbot"
                name="enable_chatbot"
                type="checkbox"
                defaultChecked={settings?.enable_chatbot ?? false}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="enable_chatbot"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Enable Chatbot
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="enable_call_button"
                name="enable_call_button"
                type="checkbox"
                defaultChecked={settings?.enable_call_button ?? true}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="enable_call_button"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Enable Call Button
              </label>
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
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}