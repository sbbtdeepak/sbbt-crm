"use client";

// ============================================================
// Master Data Table — Reusable CRUD Component
// SBBT CRM Next.js Project
//
// A shared data table component for all master data modules.
// Supports:
//   - View list of items
//   - Inline add/edit modal
//   - Toggle active/inactive
//   - Delete with confirmation
//
// Usage:
//   <MasterDataTable
//     columns={[...]}
//     data={items}
//     onCreate={createAction}
//     onUpdate={updateAction}
//     onToggle={toggleAction}
//     onDelete={deleteAction}
//     formFields={[...]}
//   />
// ============================================================

import { useState } from "react";
import { useActionState } from "react";

// ============================================================
// Types
// ============================================================

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox" | "email" | "tel" | "url";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  width?: string;
}

export interface MasterDataTableProps {
  title: string;
  description: string;
  columns: Column[];
  data: unknown[];
  formFields: FormField[];
  onCreate: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
  onUpdate: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
  onToggle: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
  onDelete: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
  referenceData?: Record<string, { id: number; name: string; [key: string]: unknown }[]>;
}

// ============================================================
// Master Data Table
// ============================================================

export default function MasterDataTable({
  title,
  description,
  columns,
  data,
  formFields,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
  referenceData,
}: MasterDataTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [createState, createAction, isCreating] = useActionState(
    async (_prev: unknown, formData: FormData) => onCreate(_prev, formData),
    { success: false, message: "" }
  );

  const [updateState, updateAction, isUpdating] = useActionState(
    async (_prev: unknown, formData: FormData) => onUpdate(_prev, formData),
    { success: false, message: "" }
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Record<string, unknown>) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: number) => {
    const formData = new FormData();
    formData.set("id", String(id));
    const result = await onDelete(null, formData);
    if (result.success) {
      setDeleteConfirm(null);
    }
  };

  const handleToggle = async (id: number, currentActive: boolean) => {
    const formData = new FormData();
    formData.set("id", String(id));
    formData.set("is_active", String(!currentActive));
    await onToggle(null, formData);
  };

  const renderFormField = (field: FormField, item: Record<string, unknown> | null) => {
    const defaultValue = item ? String(item[field.name] ?? "") : "";

    switch (field.type) {
      case "select":
        return (
          <select
            id={field.name}
            name={field.name}
            defaultValue={defaultValue}
            required={field.required}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            id={field.name}
            name={field.name}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            id={field.name}
            name={field.name}
            defaultChecked={item ? Boolean(item[field.name]) : false}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        );

      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
        >
          Add New
        </button>
      </div>

      {/* Status Messages */}
      {(createState.message || updateState.message) && (
        <div
          className={`p-3 rounded-lg text-sm ${
            createState.success || updateState.success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {createState.message || updateState.message}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">No records found.</p>
            <button
              onClick={openCreateModal}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Add the first record
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                      col.width || ""
                    }`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, idx) => {
                const item = row as Record<string, unknown>;
                return (
                  <tr key={(item.id as number) || idx} className="hover:bg-gray-50 transition">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {col.render
                          ? col.render(item[col.key], item)
                          : String(item[col.key] ?? "-")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Toggle Active */}
                        <button
                          onClick={() =>
                            handleToggle(item.id as number, item.is_active as boolean)
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                            item.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title={item.is_active ? "Active" : "Inactive"}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition"
                        >
                          Edit
                        </button>

                        {/* Delete */}
                        {deleteConfirm === item.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id as number)}
                              className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id as number)}
                            className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form action={editingItem ? updateAction : createAction}>
                <input type="hidden" name="id" value={editingItem ? String(editingItem.id) : ""} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formFields.map((field) => (
                    <div key={field.name} className={field.width || "md:col-span-1"}>
                      <label
                        htmlFor={field.name}
                        className="block mb-1 text-xs font-medium text-gray-600"
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      {renderFormField(field, editingItem)}
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editingItem
                      ? "Update"
                      : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}