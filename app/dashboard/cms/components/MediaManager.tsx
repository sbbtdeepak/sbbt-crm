"use client";

import { useState } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { getMediaItems, deleteMediaItem } from "../actions";
import type { CMSMediaItem, CMSStorageFolder } from "../types";
import { ImageUploader } from "@/components/shared/ImageUploader";

interface Props {
  initialItems: CMSMediaItem[];
  activeFolder: string;
}

const FOLDER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All Folders" },
  { value: "logos", label: "Logos" },
  { value: "favicons", label: "Favicons" },
  { value: "hero", label: "Hero" },
  { value: "og-images", label: "OG Images" },
  { value: "general", label: "General" },
  { value: "packages", label: "Packages" },
  { value: "projects", label: "Projects" },
  { value: "blogs", label: "Blogs" },
  { value: "testimonials", label: "Testimonials" },
  { value: "brands", label: "Brands" },
];

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

function isImageFile(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext !== undefined && IMAGE_EXTENSIONS.includes(ext);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (ext === "svg") return "🎨";
  if (IMAGE_EXTENSIONS.includes(ext || "")) return "🖼️";
  return "📎";
}

export default function MediaManager({ initialItems, activeFolder }: Props) {
  const [items, setItems] = useState<CMSMediaItem[]>(initialItems);
  const [selectedFolder, setSelectedFolder] = useState<string>(activeFolder);
  const [state, formAction, isPending] = useActionState(deleteMediaItem, {
    success: false,
    message: "",
  });

  // Filter items by selected folder
  const filteredItems = selectedFolder
    ? items.filter((item) => item.name.startsWith(selectedFolder + "/"))
    : items;

  // Handle folder change
  function handleFolderChange(folder: string) {
    setSelectedFolder(folder);
  }

  // Handle delete
  function handleDelete(item: CMSMediaItem) {
    if (!confirm(`Delete "${item.name}"? This action cannot be undone.`)) return;

    const formData = new FormData();
    formData.append("path", item.name);
    formAction(formData);

    // Optimistically remove from UI
    setItems(items.filter((i) => i.name !== item.name));
  }

  // Extract folder from file path
  function getFileFolder(name: string): string {
    const parts = name.split("/");
    return parts.length > 1 ? parts[0] : "root";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Media Library</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredItems.length} file(s) in{" "}
            {selectedFolder ? `"${selectedFolder}"` : "all folders"}
          </p>
        </div>

        {/* Folder Filter */}
        <select
          value={selectedFolder}
          onChange={(e) => handleFolderChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {FOLDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Message */}
      {state.message && (
        <div
          className={`p-3 rounded-md text-sm ${
            state.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
          role="alert"
        >
          {state.message}
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Upload New Image</h3>
        <ImageUploader
          folder={(selectedFolder as CMSStorageFolder) || "general"}
          value=""
          onChange={(url) => {
            if (url) {
              // Refresh the list after upload
              getMediaItems(selectedFolder || undefined).then((newItems) => {
                setItems(newItems);
              });
            }
          }}
          label="Upload Image"
          disabled={isPending}
        />
      </div>

      {/* Files Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586A2 2 0 0112.914 10H16a2 2 0 012 2v6M4 16l4.586-4.586A2 2 0 0112.914 10H16a2 2 0 012 2v6"
            />
          </svg>
          <p className="text-gray-500">No files found in this folder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.name}
              className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Preview */}
              <div className="relative h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                {isImageFile(item.name) ? (
                  <Image
                    src={item.public_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    width={200}
                    height={128}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/window.svg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {getFileIcon(item.name)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name.split("/").pop()}
                </p>
                <p className="text-xs text-gray-500">
                  Folder: {getFileFolder(item.name)}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {formatFileSize(item.size)}
                </p>
                <p className="text-xs text-gray-500">
                  Updated:{" "}
                  {new Date(item.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <a
                  href={item.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
