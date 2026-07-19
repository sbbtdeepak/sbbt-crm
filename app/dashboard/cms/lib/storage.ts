// ============================================================
// CMS Storage Utility
// SBBT CRM Next.js Project
//
// Reusable Supabase Storage helpers for the CMS module.
// Supports: logos/, favicons/, hero/, og-images/, general/
// Future-ready for Projects, Blogs, Packages and Testimonials.
// ============================================================

import { createClient } from "@/lib/supabase/server";
import {
  CMS_STORAGE_BUCKET,
  CMSStorageFolder,
  CMSUploadResult,
  CMSMediaItem,
} from "../types";

// ============================================================
// Types
// ============================================================

/**
 * Supported MIME types for image validation
 */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

/**
 * Result of image validation
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Options for upload operations
 */
export interface UploadOptions {
  /** Target folder in the CMS bucket */
  folder: CMSStorageFolder;
  /** Custom filename (optional, auto-generated if not provided) */
  filename?: string;
  /** Maximum file size in MB (default: 5MB) */
  maxSizeMB?: number;
}

/**
 * Result of upload operation with error handling
 */
export type UploadResult =
  | { success: true; data: CMSUploadResult }
  | { success: false; error: string };

/**
 * Result of delete operation with error handling
 */
export type DeleteResult =
  | { success: true }
  | { success: false; error: string };

// ============================================================
// File Utilities
// ============================================================

/**
 * Extracts the file extension from a filename.
 * Returns lowercase extension without the dot, defaults to 'jpg'.
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  const extension = parts.length > 1 ? parts.at(-1) : "jpg";
  return (extension?.toLowerCase() ?? "jpg") as string;
}

/**
 * Generates a unique filename using timestamp and random string.
 */
function generateUniqueFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename);
  const timestamp = Date.now();
  const randomSuffix = crypto.randomUUID().split("-")[0];
  return `${timestamp}_${randomSuffix}.${extension}`;
}

// ============================================================
// Validation
// ============================================================

/**
 * Validates an image file against allowed types and size constraints.
 */
export function validateImage(
  file: File,
  maxSizeMB: number = 5
): ImageValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    const allowedTypes = ALLOWED_IMAGE_TYPES.join(", ");
    return {
      valid: false,
      error: `Invalid file type: "${file.type}". Allowed types: ${allowedTypes}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Actual size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

// ============================================================
// Storage Operations
// ============================================================

/**
 * Uploads an image to the CMS storage bucket.
 * Returns the public URL and storage path on success.
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  // Validate the file first
  const validation = validateImage(file, options.maxSizeMB);
  if (!validation.valid) {
    return { success: false, error: validation.error ?? "Validation failed" };
  }

  const supabase = await createClient();

  // Generate filename
  const filename = options.filename ?? generateUniqueFilename(file.name);

  // Build storage path
  const storagePath = `${options.folder}/${filename}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return {
      success: false,
      error: uploadError.message,
    };
  }

  // Get public URL
  const { data } = supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  if (!data.publicUrl) {
    // Clean up the uploaded file if we can't get a URL
    await supabase.storage.from(CMS_STORAGE_BUCKET).remove([storagePath]);
    return {
      success: false,
      error: "Failed to generate public URL",
    };
  }

  return {
    success: true,
    data: {
      url: data.publicUrl,
      path: storagePath,
    },
  };
}

/**
 * Deletes an image from the CMS storage bucket.
 */
export async function deleteImage(storagePath: string): Promise<DeleteResult> {
  if (!storagePath || storagePath.trim() === "") {
    return {
      success: false,
      error: "Storage path is required",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/**
 * Gets the public URL for a storage path.
 * Does not check if the file exists - returns URL optimistically.
 */
export async function getPublicUrl(storagePath: string): Promise<string | null> {
  if (!storagePath || storagePath.trim() === "") {
    return null;
  }

  const supabase = await createClient();

  const { data } = supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl ?? null;
}

/**
 * Lists all files in a specific folder within the CMS bucket.
 */
export async function listFiles(
  folder: CMSStorageFolder
): Promise<CMSMediaItem[]> {
  const supabase = await createClient();

  const { data: files, error } = await supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .list(folder);

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  // Transform storage list result to CMSMediaItem format
  return (files ?? [])
    .filter((file): file is NonNullable<typeof file> => file !== null)
    .map((file) => {
      const path = `${folder}/${file.name}`;
      const publicUrl = supabase.storage
        .from(CMS_STORAGE_BUCKET)
        .getPublicUrl(path).data.publicUrl;

      return {
        name: path,
        public_url: publicUrl ?? "",
        size: file.metadata?.size ?? 0,
        mimetype: file.metadata?.mimetype ?? "application/octet-stream",
        updated_at: file.updated_at ?? new Date().toISOString(),
      };
    });
}

/**
 * Lists all files across all CMS storage folders.
 */
export async function listAllFiles(): Promise<CMSMediaItem[]> {
  const supabase = await createClient();
  const allItems: CMSMediaItem[] = [];

  // List each folder
  const folders = [
    "logos",
    "favicons",
    "hero",
    "og-images",
    "general",
  ] as const;

  for (const folder of folders) {
    try {
      const items = await listFiles(folder as CMSStorageFolder);
      allItems.push(...items);
    } catch {
      // Skip folders that don't exist or have errors
    }
  }

  // Sort by updated_at descending (newest first)
  return allItems.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

// ============================================================
// Path Utilities
// ============================================================

/**
 * Extracts the filename from a full storage path.
 * e.g., "logos/123456_abc.png" -> "123456_abc.png"
 */
export function getFilenameFromPath(storagePath: string): string {
  const parts = storagePath.split("/");
  return parts.length > 1 ? parts.slice(1).join("/") : storagePath;
}

/**
 * Extracts the folder from a full storage path.
 * e.g., "logos/123456_abc.png" -> "logos"
 */
export function getFolderFromPath(storagePath: string): string {
  const parts = storagePath.split("/");
  return parts.length > 1 ? parts[0] : "";
}