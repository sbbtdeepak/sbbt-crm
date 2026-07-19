/**
 * Image validation utility for client-side use.
 * Does not require Supabase - safe to use in client components.
 */

/**
 * Supported image MIME types
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
 * Validates an image file against allowed types and size constraints.
 * Safe for client-side use.
 */
export function validateImage(
  file: File,
  maxSizeMB: number = 5
): ImageValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid file type: "${file.type}". Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
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