'use client';

import { useState, useActionState, useCallback } from 'react';
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

export default function PackagesSection({ initialPackages }: PackagesSectionProps) {
  const [packages, setPackages] = useState<CMSPackageFull[]>(initialPackages);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveState, saveFormAction, isSaving] = useActionState(savePackage, { success: false, message: '' });
  const [deleteState, deleteFormAction, isDeleting] = useActionState(deletePackage, { success: false, message: '' });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Construction Packages</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + Add Package
        </button>
      </div>

      {saveState.message && (
        <div className={`p-3 rounded-lg text-sm ${saveState.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveState.message}
        </div>
      )}

      {showForm && (
        <form action={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold">{editingId ? 'Edit Package' : 'New Package'}</h3>

          {/* Basic Info */}
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

          {/* Sections */}
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

      {/* Package List */}
      <div className="space-y-3">
        {packages.length === 0 && (
          <p className="text-gray-500 text-sm">No packages created yet.</p>
        )}
        {packages.map((pkg) => (
          <div key={pkg.package.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{pkg.package.name}</h4>
              <p className="text-sm text-gray-500">
                ₹{pkg.package.price.toLocaleString('en-IN')} · {pkg.sections.length} sections ·{' '}
                {pkg.sections.reduce((sum, s) => sum + s.items.length, 0)} items
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
    </div>
  );
}