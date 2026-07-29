"use client";

import { useActionState, useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveBrand } from "../actions";
import type { CMSBrandRow } from "../types";
import { BRANDS_FOLDER } from "@/lib/brands/image-utils";

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
  error?: string;
}

export default function BrandsForm({ brand, onClose, onSuccess }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  
  // Local state for form fields
  const [localBrandName, setLocalBrandName] = useState(brand?.name || "");
  const [localCategory, setLocalCategory] = useState(brand?.category || "");
  const [localWebsiteUrl, setLocalWebsiteUrl] = useState(brand?.website_url || "");
  const [localDisplayOrder, setLocalDisplayOrder] = useState(brand?.display_order || 0);
  const [localIsActive, setLocalIsActive] = useState(brand?.is_active ?? true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const isEditing = !!brand;

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
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploadProgress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-set brand name from first file name (strip extension)
    if (!isEditing && newFiles.length > 0) {
      setLocalBrandName(newFiles[0].file.name.replace(/\.[^.]+$/, ""));
    }
  }, [isEditing]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove("border-indigo-500", "bg-indigo-50");
    
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    const imageFiles = droppedFiles.filter(f => f.type.startsWith("image/"));
    
    if (imageFiles.length > 0) {
      handleFileSelectInternal(imageFiles);
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

  // Upload all files
  const uploadAllFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadMessage(null);

    const supabase = createClient();

    try {
      const uploadedUrls: string[] = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const fileEntry = files[i];
        setFiles(prev => {
          const updated = [...prev];
          if (updated[i]) {
            updated[i].uploadProgress = 10;
          }
          return updated;
        });

        const ext = fileEntry.file.name.split(".").pop()?.toLowerCase() || "png";
        const fileName = `${fileEntry.file.name.replace(/\.[^.]+$/, "")}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const storagePath = `${BRANDS_FOLDER}/${fileName}`;

        // Check if this is a replace operation
        if (isEditing && brand?.logo_url && i === 0) {
          // Delete old logo from storage
          const oldPath = brand.logo_url.split("/cms/")[1];
          if (oldPath) {
            await supabase.storage.from("cms").remove([oldPath]);
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("cms")
          .upload(storagePath, fileEntry.file, {
            cacheControl: "3600",
            upsert: false,
          });

        console.log("[BrandsForm][DEBUG] Storage upload result:", {
          storagePath,
          uploadError: uploadError ? { message: uploadError.message, name: uploadError.name } : null,
          file: fileEntry.file.name,
        });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("cms").getPublicUrl(storagePath);
        console.log("[BrandsForm][DEBUG] Public URL generated:", urlData.publicUrl);
         
        // Update file progress to 100%
        setFiles(prev => {
          const updated = [...prev];
          if (updated[i]) {
            updated[i].uploadProgress = 100;
            updated[i].uploadedUrl = urlData.publicUrl;
            updated[i].storagePath = storagePath;
          }
          return updated;
        });

        uploadedUrls.push(urlData.publicUrl);
      }

      // Use the upload response directly, not React state
      const uploadedUrl = uploadedUrls[0] || "";
      const uploadedName = files[0]?.file.name.replace(/\.[^.]+$/, "") || localBrandName;

      // Save brand(s)
      if (isEditing && brand?.id) {
        // Update existing brand
        const fd = new FormData();
        fd.set("id", String(brand.id));
        fd.set("name", uploadedName);
        fd.set("logo_url", uploadedUrl);
        fd.set("category", localCategory);
        fd.set("website_url", localWebsiteUrl);
        fd.set("display_order", String(localDisplayOrder));
        fd.set("is_active", localIsActive ? "on" : "off");

        console.log("[BrandsForm][DEBUG] Server action payload for UPDATE:", {
          id: brand.id,
          name: uploadedName,
          logo_url: uploadedUrl,
          category: localCategory,
          website_url: localWebsiteUrl,
          display_order: localDisplayOrder,
          is_active: localIsActive,
        });
        
        const result = await saveBrand({ success: false, message: "" }, fd);
        if (result.success) {
          setUploadMessage(result.message);
        } else {
          setUploadMessage(`Error: ${result.message}`);
        }
      } else {
        // Create new brand
        const fd = new FormData();
        fd.set("name", uploadedName);
        fd.set("logo_url", uploadedUrl);
        fd.set("category", localCategory);
        fd.set("website_url", localWebsiteUrl);
        fd.set("display_order", "0");
        fd.set("is_active", localIsActive ? "on" : "off");

        console.log("[BrandsForm][DEBUG] Server action payload for CREATE:", {
          name: uploadedName,
          logo_url: uploadedUrl,
          category: localCategory,
          website_url: localWebsiteUrl,
          is_active: localIsActive,
        });
        
        const result = await saveBrand({ success: false, message: "" }, fd);
        if (result.success) {
          setUploadMessage(result.message);
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

  const handleSubmit = async (prevState: { success: boolean; message: string }, formData: FormData) => {
    const result = await saveBrand({ success: false, message: "" }, formData);
    if (result.success) {
      onSuccess();
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, {
    success: false,
    message: "",
  });

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, []);

  // Cleanup when files change
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
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all
          ${uploading ? "opacity-75" : ""}
          ${isEditing ? "border-gray-300" : "border-indigo-300"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
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
              PNG, JPG, GIF, WebP (max 5MB each)
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{files.length} file(s) selected</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((fileEntry, index) => (
              <div key={index} className="relative bg-gray-50 rounded-lg p-2">
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
                </div>
                
                <div className="mt-2">
                  <p className="text-xs font-medium truncate">{fileEntry.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(fileEntry.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {!isEditing && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                <input
                  value={localBrandName}
                  onChange={(e) => setLocalBrandName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Brand name (auto-filled from file)"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single Brand Form (Create Mode or No Files Selected) */}
      {!isEditing && files.length === 0 && (
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <input
              name="name"
              defaultValue={localBrandName}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              name="category"
              type="text"
              defaultValue={localCategory}
              placeholder="e.g. Cement, Steel, Paint"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              name="website_url"
              type="url"
              defaultValue={localWebsiteUrl}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                name="display_order"
                type="number"
                defaultValue={localDisplayOrder}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
              <select
                name="is_active"
                defaultValue={localIsActive ? "on" : "off"}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="on">Active</option>
                <option value="off">Inactive</option>
              </select>
            </div>
          </div>

          {state?.message && (
            <p className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>
              {state.message}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Upload Button for Multiple Files */}
      {files.length > 0 && !isEditing && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={uploadAllFiles}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {uploading ? "Uploading..." : "Upload All"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
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