'use client';

import { useState, useActionState, useCallback, useMemo } from 'react';
import { savePackage, deletePackage } from '../actions';
import type { CMSPackageFull, CMSPackageSection, CMSPackageItem } from '../types';

const EMPTY_SECTION: CMSPackageSection = {
  title: '',
  items: [{ item: '', brand: '', specification: '', remarks: '' }],
  display_order: 0,
};

interface PackagesSectionProps {
  initialPackages: CMSPackageFull[];
}

interface ImportLogEntry {
  id: number;
  module: string;
  filename: string;
  import_mode: string;
  status: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  skipped_rows: number;
  inserted_rows: number;
  updated_rows: number;
  failed_rows: number;
  errors: unknown[];
  warnings: unknown[];
  dry_run_result: unknown;
  duration_ms: number;
  created_at: string;
  completed_at: string | null;
}

interface PreviewPackage {
  name: string;
  slug: string;
  price: number;
  action: "insert" | "update" | "skip";
  reason: string;
  sectionCount: number;
  itemCount: number;
  sections: Array<{
    title: string;
    itemCount: number;
    duplicateItems: string[];
  }>;
  errors: Array<{ row: number; column: string; message: string }>;
}

interface PreviewResult {
  filename: string;
  totalPackages: number;
  newPackages: number;
  updatedPackages: number;
  skippedPackages: number;
  totalSections: number;
  totalItems: number;
  packages: PreviewPackage[];
  errors: Array<{ row: number; column: string; message: string; severity: string }>;
  warnings: Array<{ row: number; message: string; severity: string }>;
}

type SortField = "display_order" | "name" | "created_at" | "updated_at";
type SortDirection = "asc" | "desc";

export default function PackagesSection({ initialPackages }: PackagesSectionProps) {
  const [packages, setPackages] = useState<CMSPackageFull[]>(initialPackages);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveState, saveFormAction, isSaving] = useActionState(savePackage, { success: false, message: '' });
  const [deleteState, deleteFormAction, isDeleting] = useActionState(deletePackage, { success: false, message: '' });

  const [showImportModal, setShowImportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; filename: string } | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number; updated: number; skipped: number; errors: string[]; warnings: string[] } | null>(null);
  const [historyLogs, setHistoryLogs] = useState<ImportLogEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'select' | 'preview'>('select');
  const [isDragActive, setIsDragActive] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("display_order");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [sections, setSections] = useState<CMSPackageSection[]>([{ ...EMPTY_SECTION }]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setShowForm(false);
    setName('');
    setSlug('');
    setPrice('');
    setDescription('');
    setDisplayOrder('0');
    setIsActive(true);
    setSections([{ ...EMPTY_SECTION }]);
  }, []);

  const handleEdit = (pkg: CMSPackageFull) => {
    setEditingId(pkg.package.id);
    setShowForm(true);
    setName(pkg.package.name);
    setSlug(pkg.package.slug);
    setPrice(String(pkg.package.price || ''));
    setDescription(pkg.package.description);
    setDisplayOrder(String(pkg.package.display_order));
    setIsActive(pkg.package.is_active);
    setSections(pkg.sections.length > 0 ? pkg.sections.map(s => ({
      id: s.id,
      title: s.title,
      display_order: s.display_order,
      items: s.items.length > 0 ? s.items : [{ item: '', brand: '', specification: '', remarks: '' }],
    })) : [{ ...EMPTY_SECTION }]);
  };

  const addSection = () => {
    setSections(prev => [...prev, { ...EMPTY_SECTION, display_order: prev.length }]);
  };

  const removeSection = (si: number) => {
    setSections(prev => prev.filter((_, i) => i !== si));
  };

  const updateSectionTitle = (si: number, title: string) => {
    setSections(prev => prev.map((s, i) => i === si ? { ...s, title } : s));
  };

  const addItem = (si: number) => {
    setSections(prev => prev.map((s, i) => i === si ? {
      ...s,
      items: [...s.items, { item: '', brand: '', specification: '', remarks: '' }],
    } : s));
  };

  const removeItem = (si: number, ii: number) => {
    setSections(prev => prev.map((s, i) => i === si ? {
      ...s,
      items: s.items.filter((_, j) => j !== ii),
    } : s));
  };

  const updateItem = (si: number, ii: number, field: keyof CMSPackageItem, value: string) => {
    setSections(prev => prev.map((s, i) => i === si ? {
      ...s,
      items: s.items.map((item, j) => j === ii ? { ...item, [field]: value } : item),
    } : s));
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set('sections', JSON.stringify(sections));
    if (editingId) formData.set('package_id', String(editingId));
    saveFormAction(formData);
  };

  const handleDownloadTemplate = () => {
    window.open('/api/cms/packages/template', '_blank');
  };

  const handleExportExcel = () => {
    window.open('/api/cms/packages/export', '_blank');
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    );

    if (files.length > 0) {
      setImportFiles(prev => [...prev, ...files].slice(0, 10));
      setPreviewResult(null);
      setImportResult(null);
      setActiveTab('select');
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImportFiles(prev => [...prev, ...files].slice(0, 10));
      setPreviewResult(null);
      setImportResult(null);
      setActiveTab('select');
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setImportFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setImportFiles([]);
    setPreviewResult(null);
    setImportResult(null);
    setActiveTab('select');
  };

  const handlePreview = async () => {
    if (importFiles.length === 0) return;

    setIsPreviewing(true);
    const formData = new FormData();
    importFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/cms/packages/preview', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setPreviewResult(result.preview);
        setActiveTab('preview');
      } else {
        setPreviewResult(null);
        setImportResult({
          success: false,
          imported: 0,
          updated: 0,
          skipped: 0,
          errors: [result.error || 'Preview failed'],
          warnings: [],
        });
        setActiveTab('preview');
      }
    } catch (err) {
      setImportResult({
        success: false,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [err instanceof Error ? err.message : 'Network error'],
        warnings: [],
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (importFiles.length === 0) return;

    setIsImporting(true);
    const totalFiles = importFiles.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = importFiles[i];
        setImportProgress({
          current: i + 1,
          total: totalFiles,
          filename: file.name,
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('importMode', 'upsert');

        const response = await fetch('/api/cms/packages/import', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        if (!result.success) {
          setImportResult({
            success: false,
            imported: result.inserted || 0,
            updated: result.updated || 0,
            skipped: result.skipped || 0,
            errors: result.errors || [`Failed to import ${file.name}`],
            warnings: result.warnings || [],
          });
          break;
        }
      }

      const { getAllPackages } = await import('../actions');
      const fresh = await getAllPackages() as unknown as CMSPackageFull[];
      setPackages(fresh);

      setImportResult({
        success: true,
        imported: importFiles.length,
        updated: 0,
        skipped: 0,
        errors: [],
        warnings: [],
      });

      setShowImportModal(false);
      setImportFiles([]);
      setPreviewResult(null);
      setImportResult(null);
      setImportProgress(null);
      setActiveTab('select');
    } catch (err) {
      setImportResult({
        success: false,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [err instanceof Error ? err.message : 'Network error'],
        warnings: [],
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  const handleViewHistory = async () => {
    setShowHistoryModal(true);
    setIsLoadingHistory(true);

    try {
      const response = await fetch('/api/cms/packages/history');
      const result = await response.json();

      if (result.success) {
        setHistoryLogs(result.logs || []);
      } else {
        setHistoryLogs([]);
      }
    } catch {
      setHistoryLogs([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const resetImport = () => {
    setImportFiles([]);
    setPreviewResult(null);
    setImportResult(null);
    setImportProgress(null);
    setActiveTab('select');
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredPackages = useMemo(() => {
    let result = [...packages];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(pkg =>
        pkg.package.name.toLowerCase().includes(term) ||
        (pkg.package.description || '').toLowerCase().includes(term)
      );
    }
    
    if (activeFilter !== "all") {
      result = result.filter(pkg => activeFilter === "active" ? pkg.package.is_active : !pkg.package.is_active);
    }
    
    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      
      switch (sortField) {
        case "name":
          aVal = a.package.name.toLowerCase();
          bVal = b.package.name.toLowerCase();
          break;
        case "created_at":
          aVal = new Date(a.package.created_at || "").getTime();
          bVal = new Date(b.package.created_at || "").getTime();
          break;
        case "updated_at":
          aVal = new Date(a.package.updated_at || "").getTime();
          bVal = new Date(b.package.updated_at || "").getTime();
          break;
        default:
          aVal = a.package.display_order;
          bVal = b.package.display_order;
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [packages, searchTerm, activeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Construction Packages</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M12 20V10" />
            </svg>
            Download Template
          </button>
          <button
            onClick={() => { setShowImportModal(true); resetImport(); }}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4h10v16m-6-6h6" />
            </svg>
            Import Excel
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7-7 7M12 20V7" />
            </svg>
            Export Excel
          </button>
          <button
            onClick={handleViewHistory}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M12 8V4m0 0l-3 3m3-3v8" />
            </svg>
            View Import History
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            + Add Package
          </button>
        </div>
      </div>

      {saveState.message && (
        <div className={`p-3 rounded-lg text-sm ${saveState.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveState.message}
        </div>
      )}

      {showForm && (
        <form action={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold">{editingId ? 'Edit Package' : 'New Package'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
              <input name="name" value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input name="slug" value={slug} onChange={e => setSlug(e.target.value)}
                placeholder="auto-generated"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input name="price" type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input name="display_order" type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-gray-300" />
                Active
              </label>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Specification Sections</h4>
              <button type="button" onClick={addSection}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                + Add Section
              </button>
            </div>

            {sections.map((section, si) => (
              <div key={si} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Section Title (e.g. Structure, Kitchen)"
                    value={section.title}
                    onChange={e => updateSectionTitle(si, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                  />
                  <button type="button" onClick={() => removeSection(si)}
                    className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>

                <div className="grid grid-cols-5 gap-1 text-xs font-medium text-gray-500 px-1">
                  <span>Item</span><span>Brand</span><span>Specification</span><span>Remarks</span><span></span>
                </div>

                {section.items.map((item, ii) => (
                  <div key={ii} className="grid grid-cols-5 gap-1">
                    <input placeholder="Item" value={item.item} onChange={e => updateItem(si, ii, 'item', e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs" />
                    <input placeholder="Brand" value={item.brand} onChange={e => updateItem(si, ii, 'brand', e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs" />
                    <input placeholder="Spec" value={item.specification} onChange={e => updateItem(si, ii, 'specification', e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs" />
                    <input placeholder="Remarks" value={item.remarks} onChange={e => updateItem(si, ii, 'remarks', e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs" />
                    <button type="button" onClick={() => removeItem(si, ii)}
                      className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))}

                <button type="button" onClick={() => addItem(si)}
                  className="text-blue-600 hover:text-blue-800 text-xs">+ Add Item</button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50">
              {isSaving ? 'Saving...' : editingId ? 'Update Package' : 'Create Package'}
            </button>
            <button type="button" onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Admin UX: Search / Filter / Sort */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm flex-1"
          />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Sort:</span>
          {(["display_order","name","created_at","updated_at"] as const).map(field => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${sortField === field ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {field === "display_order" ? "Order" : field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
              {" "}{getSortIcon(field)}
            </button>
          ))}
        </div>
      </div>

      {/* Package List */}
      <div className="space-y-3">
        {filteredPackages.length === 0 && (
          <p className="text-gray-500 text-sm">No packages found.</p>
        )}
        {filteredPackages.map((pkg) => (
          <div key={pkg.package.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{pkg.package.name}</h4>
              <p className="text-sm text-gray-500">
                ₹{pkg.package.price.toLocaleString('en-IN')} · {pkg.sections.length} sections ·{' '}
                {pkg.sections.reduce((sum, s) => sum + s.items.length, 0)} items
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Created: {formatDate(pkg.package.created_at)} · Updated: {formatDate(pkg.package.updated_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${pkg.package.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {pkg.package.is_active ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => handleEdit(pkg)} className="text-indigo-600 hover:text-indigo-800 text-sm">Edit</button>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const { togglePackageActive } = await import('../actions');
                  const fd = new FormData();
                  fd.set('package_id', String(pkg.package.id));
                  fd.set('is_active', pkg.package.is_active ? '' : 'on');
                  await togglePackageActive(null, fd);
                  const { getAllPackages: refetchPkgs } = await import('../actions');
                  const fresh = await refetchPkgs() as unknown as CMSPackageFull[];
                  setPackages(fresh);
                }}
              >
                <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                  {pkg.package.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </form>
              <form
                action={async (fd: FormData) => {
                  fd.set('package_id', String(pkg.package.id));
                  deleteFormAction(fd);
                  setTimeout(() => {
                    setPackages(prev => prev.filter(p => p.package.id !== pkg.package.id));
                  }, 500);
                }}
              >
                <button type="submit" className="text-sm text-red-500 hover:text-red-700">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Import Packages from Excel</h3>
                <button
                  onClick={() => { setShowImportModal(false); resetImport(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'select' && (
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      multiple
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v12m0 0v4m0-4H36m-4 4h8m-8-4v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium text-indigo-600">Upload Excel files</span>
                      {' '}or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      .xlsx or .xls • Max 10 files
                    </p>
                  </div>

                  {importFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                          Selected Files ({importFiles.length})
                        </p>
                        <button onClick={clearAllFiles} className="text-xs text-red-600 hover:text-red-700">
                          Clear All
                        </button>
                      </div>
                      {importFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a2 2 0 00-2 2v6H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H9z"/>
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {importResult && !importResult.success && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">Import failed:</p>
                      {importResult.errors.map((err, i) => (
                        <p key={i} className="text-sm text-red-600 mt-1">• {err}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePreview}
                      disabled={importFiles.length === 0 || isPreviewing}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isPreviewing ? 'Previewing...' : 'Preview Import'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && previewResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{previewResult.totalPackages}</div>
                      <div className="text-xs text-gray-600">Total Packages</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{previewResult.newPackages}</div>
                      <div className="text-xs text-gray-600">New</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{previewResult.updatedPackages}</div>
                      <div className="text-xs text-gray-600">Updated</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{previewResult.skippedPackages}</div>
                      <div className="text-xs text-gray-600">Skipped</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{previewResult.totalItems}</div>
                      <div className="text-xs text-gray-600">Total Items</div>
                    </div>
                  </div>

                  {previewResult.packages.some(p => p.action === 'update') && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Duplicate Detection</p>
                      <div className="space-y-1">
                        {previewResult.packages
                          .filter(p => p.action === 'update')
                          .map((pkg, i) => (
                            <p key={i} className="text-xs text-yellow-700">
                              • <span className="font-medium">{pkg.name}</span> will be updated (exists in database)
                            </p>
                          ))}
                      </div>
                    </div>
                  )}

                  {previewResult.errors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg max-h-40 overflow-y-auto">
                      <p className="text-sm font-medium text-red-700 mb-2">Validation Errors ({previewResult.errors.length}):</p>
                      {previewResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600">
                          Row {err.row} [{err.column}]: {err.message}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium">Package</th>
                          <th className="text-left py-2 px-3 font-medium">Slug</th>
                          <th className="text-left py-2 px-3 font-medium">Action</th>
                          <th className="text-left py-2 px-3 font-medium">Sections</th>
                          <th className="text-left py-2 px-3 font-medium">Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewResult.packages.map((pkg, i) => (
                          <tr key={i} className="border-t">
                            <td className="py-2 px-3">{pkg.name}</td>
                            <td className="py-2 px-3 text-gray-500">{pkg.slug}</td>
                            <td className="py-2 px-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                pkg.action === 'insert' ? 'bg-green-100 text-green-700' :
                                pkg.action === 'update' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {pkg.action}
                              </span>
                            </td>
                            <td className="py-2 px-3">{pkg.sectionCount}</td>
                            <td className="py-2 px-3">{pkg.itemCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {isImporting && importProgress && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-indigo-900">Importing...</p>
                        <span className="text-xs text-indigo-700">
                          {importProgress.current} / {importProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-indigo-700 mt-2 truncate">
                        {importProgress.filename}
                      </p>
                    </div>
                  )}

                  {importResult && !importResult.success && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-700">Import failed:</p>
                      {importResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600 mt-1">• {err}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setActiveTab('select'); }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={isImporting || !previewResult}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isImporting ? 'Importing...' : `Confirm Import (${previewResult?.totalPackages || 0} packages)`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Import History</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading history...</p>
                </div>
              ) : historyLogs.length === 0 ? (
                <p className="text-gray-500 text-sm">No import history found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium">Date</th>
                        <th className="text-left py-2 px-3 font-medium">File</th>
                        <th className="text-left py-2 px-3 font-medium">Status</th>
                        <th className="text-left py-2 px-3 font-medium">Inserted</th>
                        <th className="text-left py-2 px-3 font-medium">Updated</th>
                        <th className="text-left py-2 px-3 font-medium">Skipped</th>
                        <th className="text-left py-2 px-3 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyLogs.map((log) => (
                        <tr key={log.id} className="border-t">
                          <td className="py-2 px-3 text-gray-600">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 px-3">{log.filename}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              log.status === 'completed' ? 'bg-green-100 text-green-700' :
                              log.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">{log.inserted_rows}</td>
                          <td className="py-2 px-3">{log.updated_rows}</td>
                          <td className="py-2 px-3">{log.skipped_rows}</td>
                          <td className="py-2 px-3 text-gray-600">{log.duration_ms}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}