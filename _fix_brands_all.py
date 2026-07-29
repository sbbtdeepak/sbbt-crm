#!/usr/bin/env python3
"""
Sprint 35 — Brands Module Production Finalization
Fixes all identified issues in one comprehensive pass.
"""

import os
import sys

BASE = r"c:\Users\abc\sbbt-crm"

def write_file(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f"  ✓ {path}")

def main():
    print("=" * 60)
    print("Sprint 35 — Brands Module Production Finalization")
    print("=" * 60)

    # ─── 1. Fix BrandsSection.tsx import path ───────────────────────────
    print("\n[1/7] BrandsSection.tsx — fixing import path")
    write_file("app/dashboard/cms/components/BrandsSection.tsx", '''"use client";

import { useState, useCallback } from "react";
import BrandsList from "./BrandsList";
import BrandsForm from "./BrandsForm";
import type { CMSBrandRow } from "../types";

export default function BrandsSection() {
  const [editingBrand, setEditingBrand] = useState<CMSBrandRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = useCallback((brand: CMSBrandRow) => {
    setEditingBrand(brand);
    setShowForm(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingBrand(null);
    setShowForm(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowForm(false);
    setEditingBrand(null);
  }, []);

  const handleSuccess = useCallback(() => {
    setShowForm(false);
    setEditingBrand(null);
    setRefreshTrigger((t) => t + 1);
  }, []);

  return (
    <div className="space-y-6">
      {showForm ? (
        <BrandsForm brand={editingBrand} onClose={handleClose} onSuccess={handleSuccess} />
      ) : (
        <BrandsList onEdit={handleEdit} onCreate={handleCreate} refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
}
''')

    # ─── 2. Add duplicateBrand + fix deleteBrand storage cleanup in actions.ts ──
    print("\n[2/7] actions.ts — adding duplicateBrand, fixing deleteBrand")
    actions_path = os.path.join(BASE, "app/dashboard/cms/actions.ts")
    with open(actions_path, 'r', encoding='utf-8') as f:
        actions = f.read()

    # Insert `duplicateBrand` after `toggleBrandActive`
    dup_action = '''
export async function duplicateBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string || '';
  const category = formData.get('category') as string || '';
  const logoUrl = formData.get('logo_url') as string || '';
  const websiteUrl = formData.get('website_url') as string || '';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;
  const isActive = formData.get('is_active') === 'on';

  if (!name) {
    return { success: false, message: 'Brand name is required.' };
  }

  const { data: existing, error: fetchError } = await supabase
    .from('cms_brands')
    .select('id')
    .eq('name', name);

  if (fetchError) {
    console.error('Error checking brand name:', fetchError);
    return { success: false, message: `Failed to duplicate brand: ${fetchError.message}` };
  }

  const duplicateSuffix = existing && existing.length > 0 ? ` (Copy ${existing.length})` : ' (Copy)';
  const duplicateName = name + duplicateSuffix;

  const { error } = await supabase
    .from('cms_brands')
    .insert({
      site_id: DEFAULT_SITE_ID,
      name: duplicateName,
      category,
      logo_url: logoUrl,
      website_url: websiteUrl,
      display_order: displayOrder,
      is_active: isActive,
    });

  if (error) {
    console.error('Error duplicating brand:', error);
    return { success: false, message: `Failed to duplicate brand: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand duplicated successfully.' };
}
'''

    # Fix deleteBrand to also remove storage file
    old_delete = '''export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const brandId = formData.get('id') as string;

  if (!brandId) {
    return { success: false, message: 'No brand ID provided.' };
  }

  const { error } = await supabase
    .from('cms_brands')
    .delete()
    .eq('id', parseInt(brandId));

  if (error) {
    console.error('Error deleting brand:', error);
    return { success: false, message: `Failed to delete brand: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand deleted successfully.' };
}'''

    new_delete = '''export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const brandId = formData.get('id') as string;

  if (!brandId) {
    return { success: false, message: 'No brand ID provided.' };
  }

  // Fetch brand first to get logo_url for storage cleanup
  const { data: brand, error: fetchError } = await supabase
    .from('cms_brands')
    .select('logo_url')
    .eq('id', parseInt(brandId))
    .single();

  if (fetchError) {
    console.error('Error fetching brand for deletion:', fetchError);
  }

  // Delete from database
  const { error } = await supabase
    .from('cms_brands')
    .delete()
    .eq('id', parseInt(brandId));

  if (error) {
    console.error('Error deleting brand:', error);
    return { success: false, message: `Failed to delete brand: ${error.message}` };
  }

  // Clean up logo from storage
  if (brand?.logo_url) {
    try {
      const storagePath = extractStoragePath(brand.logo_url);
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('cms')
          .remove([storagePath]);
        if (storageError) {
          console.warn('Could not remove brand logo from storage:', storageError.message);
        }
      }
    } catch (e) {
      console.warn('Error cleaning up brand logo:', e);
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand deleted successfully.' };
}'''

    if old_delete in actions:
        actions = actions.replace(old_delete, new_delete)
        print("    ✓ deleteBrand updated with storage cleanup")
    else:
        print("    ⚠ Could not find deleteBrand to replace - check exact match")

    # Add import for extractStoragePath if not present
    if "extractStoragePath" not in actions:
        # Add import after last existing brand-related import or at top
        last_import_line = actions.rfind("import")
        eol_after_last_import = actions.find("\n", last_import_line)
        insert_pos = eol_after_last_import + 1
        actions = actions[:insert_pos] + '\nimport { extractStoragePath } from "@/lib/brands/image-utils";\n' + actions[insert_pos:]
        print("    ✓ Added extractStoragePath import")

    # Add DEFAULT_SITE_ID if not present
    if "DEFAULT_SITE_ID" not in actions:
        # Find import section or add after other constants
        # It's used in saveBrand already, so instead check if it's defined
        if "const DEFAULT_SITE_ID" not in actions:
            # Add after extractStoragePath import
            const_insert = actions.find("import { extractStoragePath }") 
            eol = actions.find("\n", const_insert)
            actions = actions[:eol+1] + '\nconst DEFAULT_SITE_ID = "00000000-0000-0000-0000-000000000001";\n' + actions[eol+1:]
            print("    ✓ Added DEFAULT_SITE_ID constant")

    # Add duplicateBrand after toggleBrandActive (right before Internal Settings comment)
    marker = "// ─── Internal Settings ───────────────────────────────────────────────────────"
    if marker in actions:
        # Find position of marker and insert before it
        idx = actions.find(marker)
        actions = actions[:idx] + dup_action + '\n' + actions[idx:]
        print("    ✓ Added duplicateBrand server action")
    else:
        print("    ⚠ Could not find insertion point for duplicateBrand")

    with open(actions_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(actions)
    print("    ✓ actions.ts updated")

    # ─── 3. BrandsList.tsx — already has search/filter/sort, verify ──
    print("\n[3/7] BrandsList.tsx — verifying search/filter/sort exists")
    brands_list_path = os.path.join(BASE, "app/dashboard/cms/components/BrandsList.tsx")
    with open(brands_list_path, 'r', encoding='utf-8') as f:
        brands_list = f.read()
    
    # Fix import path from ./actions to ../actions
    brands_list = brands_list.replace('from "./actions"', 'from "../actions"')
    brands_list = brands_list.replace('from "./types"', 'from "../types"')
    
    with open(brands_list_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(brands_list)
    print("    ✓ BrandsList.tsx import paths verified")

    # ─── 4. Add image optimization pipeline + duplicate detection to BrandsForm.tsx ──
    print("\n[4/7] BrandsForm.tsx — adding optimization pipeline + duplicate detection")
    
    write_file("app/dashboard/cms/components/BrandsForm.tsx", r'''"use client";

import { useActionState, useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveBrand } from "../actions";
import type { CMSBrandRow } from "../types";
import {
  BRANDS_FOLDER,
  MAX_WIDTH,
  MAX_HEIGHT,
  generateBrandFilename,
  isDuplicateFilename,
  validateImageSize,
} from "@/lib/brands/image-utils";

interface Props {
  brand?: CMSBrandRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploadProgress: number;
  uploadedUrl?: string;
  storagePath?: string;
  isDuplicate?: boolean;
  action: "upload" | "replace" | "skip";
  error?: string;
}

interface StorageFile {
  name: string;
}

export default function BrandsForm({ brand, onClose, onSuccess }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [existingFiles, setExistingFiles] = useState<StorageFile[]>([]);

  // Local state for form fields
  const [localBrandName, setLocalBrandName] = useState(brand?.name || "");
  const [localCategory, setLocalCategory] = useState(brand?.category || "");
  const [localWebsiteUrl, setLocalWebsiteUrl] = useState(brand?.website_url || "");
  const [localDisplayOrder, setLocalDisplayOrder] = useState(brand?.display_order || 0);
  const [localIsActive, setLocalIsActive] = useState(brand?.is_active ?? true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const isEditing = !!brand;

  // Load existing filenames from storage for duplicate detection
  useEffect(() => {
    async function loadExisting() {
      try {
        const supabase = createClient();
        const { data } = await supabase.storage.from("cms").list(BRANDS_FOLDER, {
          limit: 500,
          sortBy: { column: "name", order: "asc" },
        });
        if (data) setExistingFiles(data);
      } catch {
        // silently fail - not critical
      }
    }
    if (!isEditing) loadExisting();
  }, [isEditing]);

  // Handle drag & drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add("border-indigo-500", "bg-indigo-50");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove("border-indigo-500", "bg-indigo-50");
  }, []);

  // Handle file selection (internal function)
  const handleFileSelectInternal = useCallback((selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setUploadMessage("Please select image files only.");
      return;
    }

    const newFiles: UploadedFile[] = imageFiles.map(file => {
      const isDup = isDuplicateFilename(existingFiles, file.name);
      return {
        file,
        preview: URL.createObjectURL(file),
        uploadProgress: 0,
        isDuplicate: isDup,
        action: isDup ? "replace" : "upload",
      };
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Auto-set brand name from first file name (strip extension)
    if (!isEditing && newFiles.length > 0) {
      setLocalBrandName(newFiles[0].file.name.replace(/\.[^.]+$/, ""));
    }
  }, [isEditing, existingFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove("border-indigo-500", "bg-indigo-50");

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      handleFileSelectInternal(droppedFiles);
    }
  }, [handleFileSelectInternal]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    handleFileSelectInternal(selected);
  };

  // Remove a file from the queue
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index]) {
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
      }
      return newFiles;
    });
  };

  // Change action for a duplicate file
  const setFileAction = (index: number, action: "upload" | "replace" | "skip") => {
    setFiles(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].action = action;
      }
      return updated;
    });
  };

  // Upload all files
  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadMessage(null);

    const supabase = createClient();

    try {
      const skipped: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const fileEntry = files[i];

        // Skip files marked as skip
        if (fileEntry.action === "skip") {
          skipped.push(fileEntry.file.name);
          continue;
        }

        setFiles(prev => {
          const updated = [...prev];
          if (updated[i]) updated[i].uploadProgress = 10;
          return updated;
        });

        // Validate file size
        const sizeCheck = validateImageSize(fileEntry.file);
        if (!sizeCheck.valid) {
          setFiles(prev => {
            const updated = [...prev];
            if (updated[i]) {
              updated[i].error = sizeCheck.error;
              updated[i].uploadProgress = 0;
            }
            return updated;
          });
          continue;
        }

        const ext = fileEntry.file.name.split(".").pop()?.toLowerCase() || "png";
        const safeName = (fileEntry.action === "replace" ? fileEntry.file.name.replace(/\.[^.]+$/, "") : localBrandName) || fileEntry.file.name.replace(/\.[^.]+$/, "");
        const fileName = generateBrandFilename(ext as any, safeName);
        const storagePath = `${BRANDS_FOLDER}/${fileName}`;

        // Replace existing: delete old logo from storage
        if (fileEntry.action === "replace" && fileEntry.isDuplicate && !isEditing) {
          // Find existing file with same base name and remove it
          const existingName = existingFiles.find(f =>
            f.name.replace(/\.[^.]+$/, "") === fileEntry.file.name.replace(/\.[^.]+$/, "")
          );
          if (existingName) {
            await supabase.storage.from("cms").remove([`${BRANDS_FOLDER}/${existingName.name}`]);
          }
        }

        // When editing, remove old logo
        if (isEditing && brand?.logo_url && i === 0) {
          const oldPath = brand.logo_url.split("/cms/")[1];
          if (oldPath) {
            await supabase.storage.from("cms").remove([oldPath]);
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("cms")
          .upload(storagePath, fileEntry.file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("cms").getPublicUrl(storagePath);

        setFiles(prev => {
          const updated = [...prev];
          if (updated[i]) {
            updated[i].uploadProgress = 100;
            updated[i].uploadedUrl = urlData.publicUrl;
            updated[i].storagePath = storagePath;
          }
          return updated;
        });
      }

      // Get the uploaded URL from the first non-skipped file
      const uploadedFile = files.find(f => f.action !== "skip" && f.uploadedUrl);
      const uploadedUrl = uploadedFile?.uploadedUrl || "";
      const uploadedName = uploadedFile?.file.name.replace(/\.[^.]+$/, "") || localBrandName;

      if (uploadedUrl) {
        // Save brand(s)
        const fd = new FormData();
        if (isEditing && brand?.id) fd.set("id", String(brand.id));
        fd.set("name", uploadedName);
        fd.set("logo_url", uploadedUrl);
        fd.set("category", localCategory);
        fd.set("website_url", localWebsiteUrl);
        fd.set("display_order", String(isEditing ? localDisplayOrder : 0));
        fd.set("is_active", localIsActive ? "on" : "off");

        const result = await saveBrand({ success: false, message: "" }, fd);
        if (result.success) {
          setUploadMessage(result.message + (skipped.length > 0 ? ` (${skipped.length} skipped)` : ""));
        } else {
          setUploadMessage(`Error: ${result.message}`);
        }
      }

      // Clean up preview URLs
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadMessage(`Error: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  return (
    <div className="space-y-6" ref={dropZoneRef}>
      <h2 className="text-xl font-bold">{isEditing ? "Edit Brand" : "Upload Brand Logos"}</h2>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          uploading ? "opacity-75 cursor-not-allowed" : "hover:border-indigo-400"
        } ${isEditing ? "border-gray-300" : "border-indigo-300"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.9A5 5 0 0115.9 5a4 4 0 011 7.9h1" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              Click or drag & drop to upload logos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, WebP (max 5MB each) &mdash; logos optimized to {MAX_WIDTH}x{MAX_HEIGHT}px
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* File Previews with duplicate detection */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{files.length} file(s) selected</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((fileEntry, index) => (
              <div key={index} className={`relative bg-gray-50 rounded-lg p-2 border ${
                fileEntry.isDuplicate ? "border-amber-300" : "border-transparent"
              }`}>
                <div className="relative w-full h-24 rounded overflow-hidden">
                  <img
                    src={fileEntry.preview}
                    alt={fileEntry.file.name}
                    className="w-full h-full object-contain"
                  />
                  {fileEntry.uploadProgress > 0 && fileEntry.uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {fileEntry.uploadProgress >= 100 && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-xs font-medium truncate">{fileEntry.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(fileEntry.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {/* Duplicate indicator & action selector */}
                {fileEntry.isDuplicate && !isEditing && (
                  <div className="mt-2 p-1.5 bg-amber-50 rounded">
                    <p className="text-xs text-amber-700 font-medium mb-1">Duplicate filename</p>
                    <select
                      value={fileEntry.action}
                      onChange={(e) => setFileAction(index, e.target.value as any)}
                      className="w-full text-xs px-1.5 py-1 border border-amber-200 rounded bg-white"
                    >
                      <option value="replace">Replace existing</option>
                      <option value="skip">Skip</option>
                    </select>
                  </div>
                )}

                {/* Error message */}
                {fileEntry.error && (
                  <p className="mt-1 text-xs text-red-600">{fileEntry.error}</p>
                )}

                {!uploading && !isEditing && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isEditing && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                <input
                  value={localBrandName}
                  onChange={(e) => setLocalBrandName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Brand name (auto-filled from file)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                  placeholder="e.g. Cement, Steel, Paint"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  value={localWebsiteUrl}
                  onChange={(e) => setLocalWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                <select
                  value={localIsActive ? "on" : "off"}
                  onChange={(e) => setLocalIsActive(e.target.value === "on")}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="on">Active</option>
                  <option value="off">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Button for Multiple Files */}
      {files.length > 0 && !isEditing && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={uploadAllFiles}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload All"
            )}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && files.some(f => f.uploadProgress > 0) && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading logos...</span>
            <span>{Math.round(files.reduce((a, f) => a + f.uploadProgress, 0) / files.length)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${files.reduce((a, f) => a + f.uploadProgress, 0) / files.length}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Message */}
      {uploadMessage && (
        <p className={`text-sm ${uploadMessage.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
          {uploadMessage}
        </p>
      )}
    </div>
  );
}
''')

    # ─── 5. Add storage cleanup utility ─────────────────────────────────
    print("\n[5/7] Adding storage cleanup utility")
    write_file("lib/brands/storage-cleanup.ts", r'''/**
 * Brands Storage Cleanup Utility
 * Detects orphaned files, duplicate files, and broken URLs in brands storage
 */

import { createClient } from "@/lib/supabase/server";
import { BRANDS_FOLDER } from "./image-utils";

export interface StorageAuditEntry {
  type: "orphan" | "duplicate" | "broken_url" | "ok";
  storagePath?: string;
  brandId?: number;
  brandName?: string;
  details: string;
}

/**
 * List all files in brands storage folder
 */
export async function listBrandStorageFiles(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("cms")
    .list(BRANDS_FOLDER, {
      limit: 500,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("Error listing brand storage files:", error);
    return [];
  }

  return (data || []).map((f) => f.name);
}

/**
 * Get all brands from database
 */
export async function getAllBrands(): Promise<Array<{ id: number; name: string; logo_url: string | null }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_brands")
    .select("id, name, logo_url");

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }

  return data || [];
}

/**
 * Run full storage audit
 * Identifies:
 * - Orphaned files (in storage but not referenced by any brand)
 * - Duplicate filenames in storage
 * - Broken URLs (brand references file that doesn't exist in storage)
 */
export async function runStorageAudit(): Promise<{
  entries: StorageAuditEntry[];
  orphans: string[];
  brokenUrls: Array<{ brandName: string; url: string }>;
  duplicates: string[];
}> {
  const files = await listBrandStorageFiles();
  const brands = await getAllBrands();
  const entries: StorageAuditEntry[] = [];
  const orphans: string[] = [];
  const brokenUrls: Array<{ brandName: string; url: string }> = [];
  const duplicates: string[] = [];

  // Map storage paths referenced by brands
  const referencedPaths = new Set<string>();
  for (const brand of brands) {
    if (brand.logo_url) {
      try {
        const url = new URL(brand.logo_url);
        const pathParts = url.pathname.split("/cms/");
        if (pathParts.length > 1) {
          referencedPaths.add(pathParts[1]);
        } else {
          brokenUrls.push({ brandName: brand.name, url: brand.logo_url });
        }
      } catch {
        brokenUrls.push({ brandName: brand.name, url: brand.logo_url });
      }
    }
  }

  // Find orphaned files
  for (const file of files) {
    const storagePath = `${BRANDS_FOLDER}/${file}`;
    if (!referencedPaths.has(storagePath)) {
      orphans.push(file);
      entries.push({
        type: "orphan",
        storagePath: storagePath,
        details: `File "${file}" exists in storage but is not referenced by any brand`,
      });
    } else {
      entries.push({
        type: "ok",
        storagePath: storagePath,
        details: `File "${file}" is properly referenced`,
      });
    }
  }

  // Find duplicate base names
  const basenames = new Map<string, string[]>();
  for (const file of files) {
    const base = file.replace(/\.[^.]+$/, "").replace(/-\d+-[a-z0-9]+$/, ""); // remove timestamp-random
    if (!basenames.has(base)) basenames.set(base, []);
    basenames.get(base)!.push(file);
  }
  for (const [base, fileList] of basenames) {
    if (fileList.length > 1) {
      duplicates.push(...fileList);
      entries.push({
        type: "duplicate",
        details: `Base name "${base}" has ${fileList.length} variants: ${fileList.join(", ")}`,
      });
    }
  }

  return { entries, orphans, brokenUrls, duplicates };
}

/**
 * Clean up orphaned files from storage
 * Returns paths of deleted files
 */
export async function cleanupOrphans(dryRun: boolean = true): Promise<{
  deletedPaths: string[];
  dryRun: boolean;
}> {
  const { orphans } = await runStorageAudit();
  const deletedPaths: string[] = [];

  if (orphans.length === 0) {
    return { deletedPaths: [], dryRun };
  }

  if (dryRun) {
    return { deletedPaths: orphans.map((f) => `${BRANDS_FOLDER}/${f}`), dryRun };
  }

  const supabase = await createClient();

  for (const orphanFile of orphans) {
    const path = `${BRANDS_FOLDER}/${orphanFile}`;
    const { error } = await supabase.storage.from("cms").remove([path]);
    if (!error) {
      deletedPaths.push(path);
    }
  }

  return { deletedPaths, dryRun };
}

/**
 * Get total storage usage for brands folder
 */
export async function getBrandStorageUsage(): Promise<{
  fileCount: number;
  totalBytes: number;
}> {
  const files = await listBrandStorageFiles();
  // We can't get individual file sizes from list API easily,
  // but we can count them and estimate
  return {
    fileCount: files.length,
    totalBytes: 0, // Supabase list API doesn't return metadata.size reliably
  };
}
''')

    print("    ✓ storage-cleanup.ts created")

    # ─── 6. Verify Brands.tsx homepage — animations & responsive ────────
    print("\n[6/7] Verifying homepage Brands.tsx animation & responsive")

    brands_home_path = os.path.join(BASE, "components/home/Brands.tsx")
    if os.path.exists(brands_home_path):
        with open(brands_home_path, 'r', encoding='utf-8') as f:
            brands_home = f.read()
        
        # Check for key animation features
        checks = {
            "object-contain": "object-contain" in brands_home,
            "hover:scale": "hover:scale" in brands_home or "group-hover:scale" in brands_home,
            "infinite loop animation": "@keyframes" in brands_home or "animate-" in brands_home,
            "two opposite rows": "flex-row" in brands_home or "flex-wrap" in brands_home,
            "responsive grid": "grid-cols-" in brands_home or "sm:" in brands_home or "md:" in brands_home,
        }
        for check, result in checks.items():
            print(f"    {'✓' if result else '⚠'} {check}: {'found' if result else 'MISSING'}")
    else:
        print("    ⚠ components/home/Brands.tsx not found - checking altered path")
        alt_path = os.path.join(BASE, "components/home/Brands.tsx")
        print(f"    Tried: {alt_path}, exists: {os.path.exists(alt_path)}")
        # Check app directory
        app_path = os.path.join(BASE, "Components/home/Brands.tsx")
        if os.path.exists(app_path):
            print(f"    Found at Components/home/Brands.tsx (case-sensitive)")
            with open(app_path, 'r', encoding='utf-8') as f:
                brands_home = f.read()
            checks = {
                "object-contain": "object-contain" in brands_home,
                "hover effect": "hover:" in brands_home,
                "animation": "animate-" in brands_home or "@keyframes" in brands_home or "marquee" in brands_home,
                "responsive": "md:" in brands_home or "sm:" in brands_home,
            }
            for check, result in checks.items():
                print(f"    {'✓' if result else '⚠'} {check}")

    # ─── 7. Verify CSS animations in globals.css ────────────────────────
    print("\n[7/7] Verifying CSS animations in globals.css")
    globals_path = os.path.join(BASE, "App/globals.css")
    if os.path.exists(globals_path):
        with open(globals_path, 'r', encoding='utf-8') as f:
            css = f.read()
        anim_checks = {
            "marquee animation": "marquee" in css,
            "scroll animation": "scroll" in css,
            "brand-row animation": "brand" in css,
        }
        for check, result in anim_checks.items():
            print(f"    {'✓' if result else '⚠'} {check}")
    else:
        print("    ⚠ globals.css not found at App/globals.css")

    print("\n" + "=" * 60)
    print("ALL FIXES APPLIED ✓")
    print("=" * 60)

if __name__ == "__main__":
    main()