"use client";

import { useActionState, useState, useCallback } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { savePackage, deletePackage, togglePackageActive } from "../actions";
import type { CMSPackageFull, CMSPackageFeature, CMSPackageSpecification, CMSPackageGalleryItem } from "../types";

interface Props {
  pkg: CMSPackageFull | null;
  onBack: () => void;
}

export default function PackageForm({ pkg, onBack }: Props) {
  const [state, formAction, isPending] = useActionState(savePackage, {
    success: false,
    message: "",
    slug: undefined,
  });

  const [deleteState, deleteAction, isDeleting] = useActionState(deletePackage, {
    success: false,
    message: "",
  });

  const [toggleState, toggleAction, isToggling] = useActionState(togglePackageActive, {
    success: false,
    message: "",
  });

  const isEdit = Boolean(pkg);
  const pkgData = pkg?.package;

  // Image states
  const [thumbnailUrl, setThumbnailUrl] = useState(pkgData?.thumbnail_url || "");
  const [bannerUrl, setBannerUrl] = useState(pkgData?.banner_url || "");
  const [ogImageUrl, setOgImageUrl] = useState(pkgData?.og_image_url || "");

  // Features state
  const [features, setFeatures] = useState<CMSPackageFeature[]>(pkg?.features || []);

  // Specifications state
  const [specs, setSpecs] = useState<CMSPackageSpecification[]>(pkg?.specifications || []);

  // Gallery state
  const [gallery, setGallery] = useState<CMSPackageGalleryItem[]>(pkg?.gallery || []);

  // Add feature
  const addFeature = useCallback(() => {
    setFeatures((prev) => [...prev, { icon: "", title: "", description: "" }]);
  }, []);

  const updateFeature = useCallback((index: number, field: keyof CMSPackageFeature, value: string) => {
    setFeatures((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeFeature = useCallback((index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Add specification
  const addSpec = useCallback(() => {
    setSpecs((prev) => [...prev, { category: "", item: "", brand: "", remarks: "" }]);
  }, []);

  const updateSpec = useCallback((index: number, field: keyof CMSPackageSpecification, value: string) => {
    setSpecs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeSpec = useCallback((index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Add gallery item
  const addGalleryItem = useCallback(() => {
    setGallery((prev) => [...prev, { image_url: "", caption: "" }]);
  }, []);

  const updateGalleryItem = useCallback((index: number, field: keyof CMSPackageGalleryItem, value: string) => {
    setGallery((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const removeGalleryItem = useCallback((index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this package?")) {
      const form = new FormData();
      form.set("id", pkgData?.id?.toString() || "");
      deleteAction(form);
    }
  }, [pkgData, deleteAction]);

  // Handle toggle active
  const handleToggleActive = useCallback(() => {
    const form = new FormData();
    form.set("id", pkgData?.id?.toString() || "");
    form.set("is_active", pkgData?.is_active ? "on" : "off");
    toggleAction(form);
  }, [pkgData, toggleAction]);

  // Show success/redirect
  if (state.success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">{state.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  if (deleteState.success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">{deleteState.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-bold">
            {isEdit ? `Edit: ${pkgData?.name}` : "New Package"}
          </h2>
        </div>
        {isEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                pkgData?.is_active
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {isToggling ? "..." : pkgData?.is_active ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {((state as { success: boolean; message: string; errors?: Record<string, string[]> }).errors || state.message && !state.success) && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
          <p className="font-medium">{state.message}</p>
          {state.errors && (
            <ul className="mt-2 list-disc list-inside text-sm">
              {Object.entries(state.errors).map(([field, msgs]) => (
                <li key={field}>{field}: {msgs.join(", ")}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {toggleState.message && (
        <div className={`mb-6 p-4 rounded-md ${
          toggleState.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`} role="alert">
          {toggleState.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={pkgData?.id} />}

        {/* Basic Information */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">Package Name *</label>
              <input
                id="name"
                name="name"
                defaultValue={pkgData?.name || ""}
                required
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Gold Package"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block mb-2 font-medium text-gray-700">Slug</label>
              <input
                id="slug"
                name="slug"
                defaultValue={pkgData?.slug || state.slug || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="gold-package"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from name if empty</p>
            </div>
            <div>
              <label htmlFor="price" className="block mb-2 font-medium text-gray-700">Price (₹/sqft) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={pkgData?.price || ""}
                required
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="2500"
              />
            </div>
            <div>
              <label htmlFor="display_order" className="block mb-2 font-medium text-gray-700">Display Order</label>
              <input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                defaultValue={pkgData?.display_order || 0}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="short_description" className="block mb-2 font-medium text-gray-700">Short Description</label>
              <textarea
                id="short_description"
                name="short_description"
                defaultValue={pkgData?.short_description || ""}
                rows={2}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Premium construction package with all amenities..."
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block mb-2 font-medium text-gray-700">Full Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={pkgData?.description || ""}
                rows={4}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Detailed description of what this package includes..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={pkgData?.is_active ?? true}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-700">Active (published)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Hero Images */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Hero Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUploader
                folder="packages"
                value={thumbnailUrl}
                onChange={(url) => setThumbnailUrl(url)}
                label="Thumbnail Image"
                disabled={isPending}
              />
              <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
            </div>
            <div>
              <ImageUploader
                folder="packages"
                value={bannerUrl}
                onChange={(url) => setBannerUrl(url)}
                label="Banner Image"
                disabled={isPending}
              />
              <input type="hidden" name="banner_url" value={bannerUrl} />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              + Add Feature
            </button>
          </div>
          {features.length === 0 && (
            <p className="text-gray-500 text-sm">No features added yet.</p>
          )}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-gray-600">Feature {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, "icon", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Icon (e.g. shield-check)"
                  />
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, "title", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, "description", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="features" value={JSON.stringify(features)} />
        </div>

        {/* Specifications */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Specifications</h3>
            <button
              type="button"
              onClick={addSpec}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              + Add Specification
            </button>
          </div>
          {specs.length === 0 && (
            <p className="text-gray-500 text-sm">No specifications added yet.</p>
          )}
          <div className="space-y-3">
            {specs.map((spec, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-gray-600">Spec {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={spec.category}
                    onChange={(e) => updateSpec(index, "category", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Category"
                  />
                  <input
                    type="text"
                    value={spec.item}
                    onChange={(e) => updateSpec(index, "item", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Item"
                  />
                  <input
                    type="text"
                    value={spec.brand}
                    onChange={(e) => updateSpec(index, "brand", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brand"
                  />
                  <input
                    type="text"
                    value={spec.remarks}
                    onChange={(e) => updateSpec(index, "remarks", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="Remarks"
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="specifications" value={JSON.stringify(specs)} />
        </div>

        {/* Gallery */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Gallery</h3>
            <button
              type="button"
              onClick={addGalleryItem}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              + Add Image
            </button>
          </div>
          {gallery.length === 0 && (
            <p className="text-gray-500 text-sm">No gallery images added yet.</p>
          )}
          <div className="space-y-3">
            {gallery.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-gray-600">Image {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(index)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <ImageUploader
                      folder="packages"
                      value={item.image_url}
                      onChange={(url) => updateGalleryItem(index, "image_url", url)}
                      label={`Gallery Image ${index + 1}`}
                      disabled={isPending}
                    />
                  </div>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(e) => updateGalleryItem(index, "caption", e.target.value)}
                    className="rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500 mt-8"
                    placeholder="Caption"
                  />
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
        </div>

        {/* SEO */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="meta_title" className="block mb-2 font-medium text-gray-700">Meta Title</label>
              <input
                id="meta_title"
                name="meta_title"
                defaultValue={pkgData?.meta_title || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Premium Construction Packages | SBBT"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="meta_description" className="block mb-2 font-medium text-gray-700">Meta Description</label>
              <textarea
                id="meta_description"
                name="meta_description"
                defaultValue={pkgData?.meta_description || ""}
                rows={2}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Explore our premium construction packages..."
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploader
                folder="packages"
                value={ogImageUrl}
                onChange={(url) => setOgImageUrl(url)}
                label="OG Image"
                disabled={isPending}
              />
              <input type="hidden" name="og_image_url" value={ogImageUrl} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : isEdit ? "Update Package" : "Create Package"}
          </button>
        </div>
      </form>
    </div>
  );
}