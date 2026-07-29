/**
 * Image utility functions for Brands module
 * Handles image optimization, WebP generation, and resizing
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// Constants
export const BRANDS_FOLDER = "brands";
export const MAX_WIDTH = 600;
export const MAX_HEIGHT = 300;

// File extension types
export type ImageExtension = "png" | "jpg" | "jpeg" | "webp" | "gif";

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): ImageExtension {
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts.at(-1)?.toLowerCase() : "png";
  return (ext as ImageExtension) || "png";
}

/**
 * Generate unique filename for brand logo
 */
export function generateBrandFilename(extension: ImageExtension, brandName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).slice(2, 8);
  const safeName = brandName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+$/, "")
    .slice(0, 30);
  return `${safeName}-${timestamp}-${randomStr}.${extension}`;
}

/**
 * Check if image needs optimization
 * Returns true if image is larger than max dimensions
 */
export function needsOptimization(width: number, height: number): boolean {
  return width > MAX_WIDTH || height > MAX_HEIGHT;
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  
  if (ratio >= 1) {
    // Image is already within bounds
    return { width: originalWidth, height: originalHeight };
  }
  
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

/**
 * Check if two images are duplicates by comparing filenames
 * Returns true if same base name exists
 */
export function isDuplicateFilename(
  existingFiles: Array<{ name: string }>,
  newFilename: string
): boolean {
  const newBasename = newFilename.replace(/\.[^.]+$/, "");
  return existingFiles.some((file) => {
    const existingBasename = file.name.replace(/\.[^.]+$/, "");
    return existingBasename === newBasename;
  });
}

/**
 * Extract storage path from public URL
 */
export function extractStoragePath(publicUrl: string, bucketName: string = "cms"): string | null {
  try {
    const urlObj = new URL(publicUrl);
    const pathParts = urlObj.pathname.split(`/${bucketName}/`);
    return pathParts.length > 1 ? pathParts[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
}

/**
 * Validate image file size
 */
export function validateImageSize(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File size (${sizeMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)` };
  }
  return { valid: true };
}

/**
 * Get image MIME type from file
 */
export function getImageMimeType(file: File): string {
  return file.type || "image/jpeg";
}

/**
 * Normalize image URL to ensure proper caching
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return "";
  // Ensure URL has proper format
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Check if logo URL is valid and accessible
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Generate WebP filename from original
 */
export function generateWebPFilename(originalFilename: string): string {
  const basename = originalFilename.replace(/\.[^.]+$/, "");
  return `${basename}.webp`;
}

/**
 * Get logo dimensions from URL (for responsive design)
 * Returns default dimensions if unable to determine
 */
export function getLogoDimensions(): { width: number; height: number } {
  // Default dimensions for brand logos
  return { width: 150, height: 80 };
}