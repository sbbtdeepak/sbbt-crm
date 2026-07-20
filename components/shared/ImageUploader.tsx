"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useActionState, startTransition } from "react";
import { uploadImageAction, deleteImageAction } from "@/app/dashboard/cms/actions";
import { validateImage, ImageValidationResult } from "./image-utils";
import type { CMSStorageFolder } from "@/app/dashboard/cms/types";

// ============================================================
// Types
// ============================================================

export interface ImageUploaderProps {
  /** Current image URL value */
  value?: string;
  /** Callback when image URL changes */
  onChange: (url: string) => void;
  /** Folder in CMS storage bucket */
  folder: CMSStorageFolder;
  /** Label for the uploader */
  label?: string;
  /** Disable the uploader */
  disabled?: boolean;
  /** Mark as required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type UploaderState = "idle" | "uploading" | "error";

// ============================================================
// ImageUploader Component
// ============================================================

export function ImageUploader({
  value = "",
  onChange,
  folder,
  label = "Image",
  disabled = false,
  required = false,
  className = "",
}: ImageUploaderProps) {
  const [uploadState, uploadFormAction] = useActionState(uploadImageAction, {
    success: false,
    url: undefined as string | undefined,
    error: undefined as string | undefined,
  });

  const [deleteState, deleteFormAction] = useActionState(deleteImageAction, {
    success: false,
  });

  const [state, setState] = useState<UploaderState>("idle");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notifiedUploadUrl = useRef<string | null>(null);
  const notifiedUploadError = useRef<string | null>(null);

  // Determine if we have an existing image
  const hasImage = Boolean(value && value.trim() !== "");

  // Extract storage path from public URL
  function extractStoragePath(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/cms/");
      return pathParts.length > 1 ? pathParts[1] : null;
    } catch {
      return null;
    }
  }

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File | null) => {
      if (!file) return;

      // Validate file
      const validation: ImageValidationResult = validateImage(file, 5);
      if (!validation.valid) {
        setState("error");
        setError(validation.error ?? "Invalid file");
        return;
      }

      // Start upload
      setState("uploading");
      setError("");

      // Reset notified refs on new upload
      notifiedUploadUrl.current = null;
      notifiedUploadError.current = null;

      // Create form data and submit to server action within transition
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      
      startTransition(() => {
        uploadFormAction(formData);
      });
    },
    [folder, uploadFormAction]
  );

  // Handle upload state changes in useEffect to prevent render loop
  useEffect(() => {
    if (uploadState.success && uploadState.url && uploadState.url !== notifiedUploadUrl.current) {
      notifiedUploadUrl.current = uploadState.url;
      setState("idle");
      onChange(uploadState.url);
    } else if (!uploadState.success && uploadState.error && uploadState.error !== notifiedUploadError.current) {
      notifiedUploadError.current = uploadState.error;
      setState("error");
      setError(uploadState.error);
    }
  }, [uploadState.success, uploadState.url, uploadState.error, onChange]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (value && value.trim() !== "") {
      const storagePath = extractStoragePath(value);
      if (storagePath) {
        const formData = new FormData();
        formData.append("path", storagePath);
        startTransition(() => {
          deleteFormAction(formData);
        });
      }
    }
    onChange("");
  }, [onChange, value, deleteFormAction]);

  // Handle drag events
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [disabled, handleFileSelect]
  );

  // Handle click
  const handleClick = useCallback(() => {
    if (!disabled && !hasImage) {
      fileInputRef.current?.click();
    }
  }, [disabled, hasImage]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label */}
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area / Preview */}
      <div
        className={`
          relative w-full
          ${state === "uploading" ? "opacity-75" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {hasImage ? (
          // Image Preview Mode
          <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-48 object-cover"
              onError={() => {
                setState("error");
                setError("Failed to load image");
              }}
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={disabled}
                  className="px-3 py-1.5 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={disabled}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Drop Zone
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={`
              w-full h-48 rounded-lg border-2 border-dashed
              border-gray-300 hover:border-gray-400
              flex flex-col items-center justify-center
              transition-colors disabled:cursor-not-allowed
              ${state === "error" ? "border-red-300 hover:border-red-400" : ""}
            `}
          >
            <div className="text-center p-4">
              {state === "uploading" ? (
                <>
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <svg
                    className="w-8 h-8 mx-auto mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 5a4 4 0 011 7.9h1"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP, SVG (max 5MB)
                  </p>
                </>
              )}
            </div>
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          disabled={disabled}
          className="hidden"
          aria-label={`Upload ${label}`}
        />
      </div>

      {/* Error Message */}
      {state === "error" && error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}