"use client";

import { useActionState, useState } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { saveCompany } from "../actions";
import type { CMSCompanyRow } from "../types";

interface Props {
  company: CMSCompanyRow | null;
}

export default function CompanyForm({ company }: Props) {
  const [state, formAction, isPending] = useActionState(saveCompany, {
    success: false,
    message: "",
  });

  // Local state for image URLs so preview updates immediately after upload
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || "");
  const [faviconUrl, setFaviconUrl] = useState(company?.favicon_url || "");
  // Local state for color pickers to sync with text inputs
  const [primaryColor, setPrimaryColor] = useState(company?.primary_color || "#4f46e5");
  const [secondaryColor, setSecondaryColor] = useState(company?.secondary_color || "#06b6d4");

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

        {/* Brand Identity */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Brand Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="brand_name"
                className="block mb-2 font-medium text-gray-700"
              >
                Brand Name
              </label>
              <input
                id="brand_name"
                name="brand_name"
                defaultValue={company?.brand_name || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="SBBT Construction"
                required
              />
            </div>

            <div>
              <label
                htmlFor="legal_name"
                className="block mb-2 font-medium text-gray-700"
              >
                Legal Name
              </label>
              <input
                id="legal_name"
                name="legal_name"
                defaultValue={company?.legal_name || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Shree Badree Build Tech Pvt. Ltd."
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="tagline"
                className="block mb-2 font-medium text-gray-700"
              >
                Tagline
              </label>
              <input
                id="tagline"
                name="tagline"
                defaultValue={company?.tagline || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Building Dreams Since 2010"
              />
            </div>
          </div>
        </div>

        {/* Visual Identity */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Visual Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUploader
                folder="logos"
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                label="Logo"
                disabled={isPending}
              />
              <input type="hidden" name="logo_url" value={logoUrl} />
            </div>

            <div>
              <ImageUploader
                folder="favicons"
                value={faviconUrl}
                onChange={(url) => setFaviconUrl(url)}
                label="Favicon"
                disabled={isPending}
              />
              <input type="hidden" name="favicon_url" value={faviconUrl} />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block mb-2 font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={company?.phone || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label
                htmlFor="whatsapp"
                className="block mb-2 font-medium text-gray-700"
              >
                WhatsApp
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                defaultValue={company?.whatsapp || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={company?.email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="info@sbbt.in"
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
                defaultValue={company?.support_email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="support@sbbt.in"
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
                defaultValue={company?.sales_email || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="sales@sbbt.in"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block mb-2 font-medium text-gray-700"
              >
                Website
              </label>
              <input
                id="website"
                name="website"
                defaultValue={company?.website || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://www.sbbt.in"
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="gst"
                className="block mb-2 font-medium text-gray-700"
              >
                GST Number
              </label>
              <input
                id="gst"
                name="gst"
                defaultValue={company?.gst || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="27AAEPM1234C1Z5"
              />
            </div>

            <div>
              <label
                htmlFor="pan"
                className="block mb-2 font-medium text-gray-700"
              >
                PAN Number
              </label>
              <input
                id="pan"
                name="pan"
                defaultValue={company?.pan || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="AAEPM1234C"
              />
            </div>

            <div>
              <label
                htmlFor="timezone"
                className="block mb-2 font-medium text-gray-700"
              >
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={company?.timezone || "Asia/Kolkata"}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block mb-2 font-medium text-gray-700"
              >
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={company?.currency || "INR"}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="language"
                className="block mb-2 font-medium text-gray-700"
              >
                Language
              </label>
              <select
                id="language"
                name="language"
                defaultValue={company?.language || "en"}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="primary_color"
                className="block mb-2 font-medium text-gray-700"
              >
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="#4f46e5"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="secondary_color"
                className="block mb-2 font-medium text-gray-700"
              >
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  id="secondary_color"
                  name="secondary_color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-16 h-10 rounded-lg border p-1 focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="#06b6d4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div>
            <label
              htmlFor="address"
              className="block mb-2 font-medium text-gray-700"
            >
              Physical Address
            </label>
            <textarea
              id="address"
              name="address"
              defaultValue={company?.address || ""}
              rows={3}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="123 Main Street, Mumbai, Maharashtra 400001"
            />
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Business Hours</h2>
          <div>
            <label
              htmlFor="business_hours"
              className="block mb-2 font-medium text-gray-700"
            >
              Hours Description
            </label>
            <textarea
              id="business_hours"
              name="business_hours"
              defaultValue={company?.business_hours || ""}
              rows={2}
              className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Mon-Sat: 9:00 AM - 6:00 PM"
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
            {isPending ? "Saving..." : "Save Company"}
          </button>
        </div>
      </form>
    </div>
  );
}