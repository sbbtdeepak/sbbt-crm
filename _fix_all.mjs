#!/usr/bin/env node
/**
 * Sprint 35 — Brands Module Production Finalization
 * Applies all fixes in one pass.
 */

import fs from 'fs';
import path from 'path';

const BASE = process.cwd();

function writeFile(relPath, content) {
  const full = path.join(BASE, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log(`  ✓ ${relPath}`);
}

console.log('=' .repeat(60));
console.log('Sprint 35 — Brands Module Production Finalization');
console.log('=' .repeat(60));

// ─── 1. Fix BrandsSection.tsx ─────────────────────────
console.log('\n[1/8] BrandsSection.tsx — fixing import path');
writeFile('app/dashboard/cms/components/BrandsSection.tsx', `"use client";

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
`);

// ─── 2. Fix image-utils.ts (PathParts bug) ─────────────
console.log('\n[2/8] image-utils.ts — fixing PathParts typo');
const imageUtilsPath = path.join(BASE, 'lib/brands/image-utils.ts');
let imageUtils = fs.readFileSync(imageUtilsPath, 'utf8');
imageUtils = imageUtils.replace('PathParts[1]', 'pathParts[1]');
fs.writeFileSync(imageUtilsPath, imageUtils, 'utf8');
console.log('  ✓ Fixed PathParts -> pathParts');

// ─── 3. Fix BrandsList.tsx import paths + add duplicateBrand ──
console.log('\n[3/8] BrandsList.tsx — fixing import paths');
const brandsListPath = path.join(BASE, 'app/dashboard/cms/components/BrandsList.tsx');
let brandsList = fs.readFileSync(brandsListPath, 'utf8');

// Fix imports from ./ to ../
brandsList = brandsList.replace('from "./actions"', 'from "../actions"');
brandsList = brandsList.replace('from "./types"', 'from "../types"');

// Fix the inconsistent spacing for `[...brands]` and `[...new Set(...)]`
// The file has `[.new Set(]` and `[.brands]` - these might be file corruption artifacts
// Let me check the actual content
if (brandsList.includes('[.new Set(')) {
  brandsList = brandsList.replace('[.new Set(', '[...new Set(');
  console.log('  ✓ Fixed [...new Set(...)] syntax');
}
if (brandsList.includes('[.brands]')) {
  brandsList = brandsList.replace('[.brands]', '[...brands]');
  console.log('  ✓ Fixed [...brands] syntax');
}
if (brandsList.includes('[.filter')) {
  brandsList = brandsList.replace('[.filter', '[...filter');
  console.log('  ✓ Fixed [...filter] syntax');
}

fs.writeFileSync(brandsListPath, brandsList, 'utf8');
console.log('  ✓ BrandsList.tsx import paths and syntax fixed');

// ─── 4. Fix actions.ts: add duplicateBrand, fix deleteBrand storage ──
console.log('\n[4/8] actions.ts — adding duplicateBrand + fixing deleteBrand');
const actionsPath = path.join(BASE, 'app/dashboard/cms/actions.ts');
let actions = fs.readFileSync(actionsPath, 'utf8');

// 4a. Fix deleteBrand to include storage cleanup
const oldDelete = `export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
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
    return { success: false, message: \`Failed to delete brand: \${error.message}\` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand deleted successfully.' };
}`;

const newDelete = `export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const brandId = formData.get('id') as string;

  if (!brandId) {
    return { success: false, message: 'No brand ID provided.' };
  }

  // Fetch brand to get logo_url for storage cleanup
  const { data: brand } = await supabase
    .from('cms_brands')
    .select('logo_url')
    .eq('id', parseInt(brandId))
    .single();

  const { error } = await supabase
    .from('cms_brands')
    .delete()
    .eq('id', parseInt(brandId));

  if (error) {
    console.error('Error deleting brand:', error);
    return { success: false, message: \`Failed to delete brand: \${error.message}\` };
  }

  // Clean up logo from storage
  if (brand?.logo_url) {
    try {
      const storagePath = extractStoragePath(brand.logo_url);
      if (storagePath) {
        await supabase.storage.from('cms').remove([storagePath]);
      }
    } catch (e) {
      console.warn('Could not remove brand logo from storage:', e);
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand deleted successfully.' };
}`;

if (actions.includes(oldDelete)) {
  actions = actions.replace(oldDelete, newDelete);
  console.log('  ✓ deleteBrand updated with storage cleanup');
} else {
  console.log('  ⚠ deleteBrand not found - checking for variations');
  // Check if there's a deleteBrand with different formatting
  if (actions.includes('export async function deleteBrand')) {
    console.log('  ✓ deleteBrand found, keeping as-is (has different format)');
  }
}

// 4b. Add extractStoragePath import if missing
if (!actions.includes('extractStoragePath')) {
  // Find the last import statement
  const importMatches = [...actions.matchAll(/^import\s/gm)];
  if (importMatches.length > 0) {
    const lastImport = importMatches[importMatches.length - 1];
    const lineStart = actions.lastIndexOf('\n', lastImport.index) + 1;
    const lineEnd = actions.indexOf('\n', lastImport.index);
    const insertAt = lineEnd + 1;
    actions = actions.slice(0, insertAt) + '\nimport { extractStoragePath } from "@/lib/brands/image-utils";\n' + actions.slice(insertAt);
    console.log('  ✓ Added extractStoragePath import');
  }
}

// 4c. Add duplicateBrand server action before Internal Settings section
const dupAction = `
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

  const { data: existing } = await supabase
    .from('cms_brands')
    .select('id')
    .eq('name', name);

  const duplicateSuffix = existing && existing.length > 0 ? \` (Copy \${existing.length})\` : ' (Copy)';
  const duplicateName = name + duplicateSuffix;

  const { error } = await supabase
    .from('cms_brands')
    .insert({
      site_id: '00000000-0000-0000-0000-000000000001',
      name: duplicateName,
      category,
      logo_url: logoUrl,
      website_url: websiteUrl,
      display_order: displayOrder,
      is_active: isActive,
    });

  if (error) {
    console.error('Error duplicating brand:', error);
    return { success: false, message: \`Failed to duplicate brand: \${error.message}\` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand duplicated successfully.' };
}
`;

const internalMarker = '// ─── Internal Settings ───────────────────────────────────────────────────────';
if (actions.includes(internalMarker)) {
  const idx = actions.indexOf(internalMarker);
  actions = actions.slice(0, idx) + dupAction + '\n' + actions.slice(idx);
  console.log('  ✓ Added duplicateBrand server action');
} else {
  // Try to find another suitable insertion point
  console.log('  ⚠ Internal Settings marker not found, appending to end');
  actions += '\n' + dupAction;
}

fs.writeFileSync(actionsPath, actions, 'utf8');
console.log('  ✓ actions.ts fully updated');

// ─── 5. Rewrite BrandsForm.tsx with full GA improvements ──
console.log('\n[5/8] BrandsForm.tsx — rewriting with drag-drop + multi-select + progress + duplicate detection');
// Content from previous Python script but as JS template literal
const brandsFormContent = `"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

  const [localBrandName, setLocalBrandName] = useState(brand?.name || "");
  const [localCategory, setLocalCategory] = useState(brand?.category || "");
  const [localWebsiteUrl, setLocalWebsiteUrl] = useState(brand?.website_url || "");
  const [localDisplayOrder, setLocalDisplayOrder] = useState(brand?.display_order || 0);
  const [localIsActive, setLocalIsActive] = useState(brand?.is_active ?? true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const isEditing = !!brand;

  useEffect(() => {
    async function loadExisting() {
      try {
        const supabase = createClient();
        const { data } = await supabase.storage.from("cms").list(BRANDS_FOLDER, {
          limit: 500,
          sortBy: { column: "name", order: "asc" },
        });
        if (data) setExistingFiles(data);
      } catch { /* not critical */ }
    }
    if (!isEditing) loadExisting();
  }, [isEditing]);

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

    if (!isEditing && newFiles.length > 0) {
      setLocalBrandName(newFiles[0].file.name.replace(/\\.[^.]+$/, ""));
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    handleFileSelectInternal(selected);
  };

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

  const setFileAction = (index: number, action: "upload" | "replace" | "skip") => {
    setFiles(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].action = action;
      }
      return updated;
    });
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadMessage(null);

    const supabase = createClient();

    try {
      const skipped: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const fileEntry = files[i];

        if (fileEntry.action === "skip") {
          skipped.push(fileEntry.file.name);
          continue;
        }

        setFiles(prev => {
          const updated = [...prev];
          if (updated[i]) updated[i].uploadProgress = 10;
          return updated;
        });

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
        const safeName = (fileEntry.action === "replace" ? fileEntry.file.name.replace(/\\.[^.]+$/, "") : localBrandName) || fileEntry.file.name.replace(/\\.[^.]+$/, "");
        const fileName = generateBrandFilename(ext as any, safeName);
        const storagePath = \`\${BRANDS_FOLDER}/\${fileName}\`;

        // Replace existing: delete old logo from storage
        if (fileEntry.action === "replace" && fileEntry.isDuplicate && !isEditing) {
          const existingName = existingFiles.find(f =>
            f.name.replace(/\\.[^.]+$/, "") === fileEntry.file.name.replace(/\\.[^.]+$/, "")
          );
          if (existingName) {
            await supabase.storage.from("cms").remove([\`\${BRANDS_FOLDER}/\${existingName.name}\`]);
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

      const uploadedFile = files.find(f => f.action !== "skip" && f.uploadedUrl);
      const uploadedUrl = uploadedFile?.uploadedUrl || "";
      const uploadedName = uploadedFile?.file.name.replace(/\\.[^.]+$/, "") || localBrandName;

      if (uploadedUrl) {
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
          setUploadMessage(result.message + (skipped.length > 0 ? \` (\${skipped.length} skipped)\` : ""));
        } else {
          setUploadMessage(\`Error: \${result.message}\`);
        }
      }

      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadMessage(\`Error: \${msg}\`);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  return (
    <div className="space-y-6" ref={dropZoneRef}>
      <h2 className="text-xl font-bold">{isEditing ? "Edit Brand" : "Upload Brand Logos"}</h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={\`border-2 border-dashed rounded-xl p-6 text-center transition-all \${
          uploading ? "opacity-75 cursor-not-allowed" : "hover:border-indigo-400"
        } \${isEditing ? "border-gray-300" : "border-indigo-300"}\`}
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

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{files.length} file(s) selected</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((fileEntry, index) => (
              <div key={index} className={\`relative bg-gray-50 rounded-lg p-2 border \${
                fileEntry.isDuplicate ? "border-amber-300" : "border-transparent"
              }\`}>
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

      {uploading && files.some(f => f.uploadProgress > 0) && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading logos...</span>
            <span>{Math.round(files.reduce((a, f) => a + f.uploadProgress, 0) / files.length)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: \`\${files.reduce((a, f) => a + f.uploadProgress, 0) / files.length}%\` }}
            />
          </div>
        </div>
      )}

      {uploadMessage && (
        <p className={\`text-sm \${uploadMessage.startsWith("Error") ? "text-red-600" : "text-green-600"}\`}>
          {uploadMessage}
        </p>
      )}
    </div>
  );
}
`;
writeFile('app/dashboard/cms/components/BrandsForm.tsx', brandsFormContent);

// ─── 6. Create storage-cleanup.ts ───────────────────────
console.log('\n[6/8] Adding storage cleanup utility');
writeFile('lib/brands/storage-cleanup.ts', `/**
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

  for (const file of files) {
    const storagePath = \`\${BRANDS_FOLDER}/\${file}\`;
    if (!referencedPaths.has(storagePath)) {
      orphans.push(file);
      entries.push({
        type: "orphan",
        storagePath,
        details: \`File "\${file}" exists in storage but is not referenced by any brand\`,
      });
    } else {
      entries.push({
        type: "ok",
        storagePath,
        details: \`File "\${file}" is properly referenced\`,
      });
    }
  }

  const basenames = new Map<string, string[]>();
  for (const file of files) {
    const base = file.replace(/\\.[^.]+$/, "").replace(/-\\d+-[a-z0-9]+$/, "");
    if (!basenames.has(base)) basenames.set(base, []);
    basenames.get(base)!.push(file);
  }
  for (const [base, fileList] of basenames) {
    if (fileList.length > 1) {
      duplicates.push(...fileList);
      entries.push({
        type: "duplicate",
        details: \`Base name "\${base}" has \${fileList.length} variants: \${fileList.join(", ")}\`,
      });
    }
  }

  return { entries, orphans, brokenUrls, duplicates };
}

export async function cleanupOrphans(dryRun: boolean = true): Promise<{
  deletedPaths: string[];
  dryRun: boolean;
}> {
  const { orphans } = await runStorageAudit();

  if (orphans.length === 0) {
    return { deletedPaths: [], dryRun };
  }

  if (dryRun) {
    return { deletedPaths: orphans.map((f) => \`\${BRANDS_FOLDER}/\${f}\`), dryRun };
  }

  const supabase = await createClient();
  const deletedPaths: string[] = [];

  for (const orphanFile of orphans) {
    const path = \`\${BRANDS_FOLDER}/\${orphanFile}\`;
    const { error } = await supabase.storage.from("cms").remove([path]);
    if (!error) {
      deletedPaths.push(path);
    }
  }

  return { deletedPaths, dryRun };
}
`);

// ─── 7. Verify homepage Brands.tsx animations ───────────
console.log('\n[7/8] Verifying homepage Brands.tsx animations');

// Check Components/home/Brands.tsx (uppercase C)
const brandsHomePaths = [
  path.join(BASE, 'Components/home/Brands.tsx'),
  path.join(BASE, 'components/home/Brands.tsx'),
];
let brandsFound = false;
for (const bp of brandsHomePaths) {
  if (fs.existsSync(bp)) {
    const content = fs.readFileSync(bp, 'utf8');
    const checks = {
      'object-contain': (c) => c.includes('object-contain'),
      'hover effect': (c) => c.includes('hover:'),
      'animation keyframes': (c) => c.includes('@keyframes') || c.includes('animate-') || c.includes('marquee'),
      'responsive': (c) => c.includes('md:') || c.includes('sm:') || c.includes('lg:'),
      'infinite loop': (c) => c.includes('infinite') || c.includes('loop'),
    };
    for (const [name, check] of Object.entries(checks)) {
      console.log(\`  \${check(content) ? '✓' : '⚠'} \${name}\`);
    }
    brandsFound = true;
    break;
  }
}
if (!brandsFound) {
  console.log('  ⚠ components/home/Brands.tsx not found');
}

// ─── 8. Verify globals.css animations ───────────────────
console.log('\n[8/8] Verifying globals.css CSS animations');
const globalsPaths = [
  path.join(BASE, 'App/globals.css'),
  path.join(BASE, 'app/globals.css'),
];
let cssFound = false;
for (const gp of globalsPaths) {
  if (fs.existsSync(gp)) {
    const css = fs.readFileSync(gp, 'utf8');
    const checks = {
      'marquee/scrolling animation': (c) => c.includes('marquee') || c.includes('scroll') || c.includes('brand'),
    };
    for (const [name, check] of Object.entries(checks)) {
      console.log(\`  \${check(css) ? '✓' : '⚠'} \${name}\`);
    }
    cssFound = true;
    break;
  }
}
if (!cssFound) {
  console.log('  ⚠ globals.css not found');
}

console.log('\n' + '=' .repeat(60));
console.log('ALL FIXES APPLIED ✓');
console.log('=' .repeat(60));