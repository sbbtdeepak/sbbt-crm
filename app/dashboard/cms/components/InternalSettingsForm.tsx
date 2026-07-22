"use client";

import { useActionState } from "react";
import { saveInternalSettings } from "../actions";
import type { CMSInternalSettingsRow } from "../types";

interface Props {
  settings: CMSInternalSettingsRow | null;
}

export default function InternalSettingsForm({ settings }: Props) {
  const [state, formAction, isPending] = useActionState(saveInternalSettings, {
    success: false,
    message: "",
  });

  return (
    <div className="max-w-4xl mx-auto">
      <form action={formAction} className="space-y-6">
        {/* Section Notice */}
        <div className="p-4 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
          <p className="text-sm font-medium">
            ⚠️ These settings are visible in Admin only and are NOT exposed on the public website.
          </p>
        </div>

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

        {/* Email Notifications */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lead_notification_email"
                className="block mb-2 font-medium text-gray-700"
              >
                Lead Notification Email
              </label>
              <input
                id="lead_notification_email"
                name="lead_notification_email"
                type="email"
                defaultValue={settings?.lead_notification_email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="leads@sbbt.in"
              />
            </div>

            <div>
              <label
                htmlFor="sales_email"
                className="block mb-2 font-medium text-gray-700"
              >
                Sales Email
              </label>
              <input
                id="sales_email"
                name="sales_email"
                type="email"
                defaultValue={settings?.sales_email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="sales@sbbt.in"
              />
            </div>

            <div>
              <label
                htmlFor="quotation_email"
                className="block mb-2 font-medium text-gray-700"
              >
                Quotation Email
              </label>
              <input
                id="quotation_email"
                name="quotation_email"
                type="email"
                defaultValue={settings?.quotation_email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="quotes@sbbt.in"
              />
            </div>

            <div>
              <label
                htmlFor="support_email"
                className="block mb-2 font-medium text-gray-700"
              >
                Support Email
              </label>
              <input
                id="support_email"
                name="support_email"
                type="email"
                defaultValue={settings?.support_email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="support@sbbt.in"
              />
            </div>

            <div>
              <label
                htmlFor="accounts_email"
                className="block mb-2 font-medium text-gray-700"
              >
                Accounts Email
              </label>
              <input
                id="accounts_email"
                name="accounts_email"
                type="email"
                defaultValue={settings?.accounts_email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="accounts@sbbt.in"
              />
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="google_sheet_url"
                className="block mb-2 font-medium text-gray-700"
              >
                Google Sheet URL
              </label>
              <input
                id="google_sheet_url"
                name="google_sheet_url"
                type="url"
                defaultValue={settings?.google_sheet_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            <div>
              <label
                htmlFor="webhook_url"
                className="block mb-2 font-medium text-gray-700"
              >
                Webhook URL
              </label>
              <input
                id="webhook_url"
                name="webhook_url"
                type="url"
                defaultValue={settings?.webhook_url || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://hooks.example.com/..."
              />
            </div>
          </div>
        </div>

        {/* Service Readiness */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Service Readiness</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                id="smtp_ready"
                name="smtp_ready"
                type="checkbox"
                defaultChecked={settings?.smtp_ready || false}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="smtp_ready"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                SMTP Ready
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="resend_ready"
                name="resend_ready"
                type="checkbox"
                defaultChecked={settings?.resend_ready || false}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="resend_ready"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Resend Ready
              </label>
            </div>

            <div>
              <label
                htmlFor="whatsapp_api_number"
                className="block mb-2 font-medium text-gray-700"
              >
                WhatsApp API Number
              </label>
              <input
                id="whatsapp_api_number"
                name="whatsapp_api_number"
                type="tel"
                defaultValue={settings?.whatsapp_api_number || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Future API Keys (JSONB placeholder) */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Future API Keys (Placeholder)</h2>
          <p className="text-sm text-gray-500 mb-3">
            These keys will be used by future integrations. Configure as needed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-500 text-sm">
                Google Maps API Key
              </label>
              <input
                disabled
                className="w-full rounded-lg border p-3 bg-gray-50 text-gray-400 cursor-not-allowed"
                placeholder="Coming soon..."
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-500 text-sm">
                WhatsApp Cloud API Token
              </label>
              <input
                disabled
                className="w-full rounded-lg border p-3 bg-gray-50 text-gray-400 cursor-not-allowed"
                placeholder="Coming soon..."
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
            {isPending ? "Saving..." : "Save Internal Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}