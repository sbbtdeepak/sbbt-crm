const fs = require('fs');

const content = `"use client";

import { useState, useEffect, useMemo } from "react";
import { getBrands, deleteBrand, toggleBrandActive, duplicateBrand } from "../actions";
import type { CMSBrandRow } from "../types";
import { formatDate } from "@/lib/utils";

interface Props {
  onEdit: (brand: CMSBrandRow) => void;
  onCreate: () => void;
  refreshTrigger?: number;
}

type SortField = "display_order" | "name" | "created_at" | "updated_at";
type SortDirection = "asc" | "desc";

export default function BrandsList({ onEdit, onCreate, refreshTrigger }: Props) {
  const [brands, setBrands] = useState<CMSBrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("display_order");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    let cancelled = false;
    async function fetchBrands() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBrands();
        if (!cancelled) setBrands(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load brands");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBrands();
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  const categories = useMemo(() => {
    const cats = [...new Set(brands.filter(b => b.category).map(b => b.category))];
    return cats.sort();
  }, [brands]);

  const filteredBrands = useMemo(() => {
    let result = [...brands];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(term) ||
        (b.category || "").toLowerCase().includes(term) ||
        (b.website_url || "").toLowerCase().includes(term)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter(b => b.category === categoryFilter);
    }
    if (activeFilter !== "all") {
      result = result.filter(b => b.is_active === (activeFilter === "active"));
    }
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "created_at":
          aVal = new Date(a.created_at || "").getTime();
          bVal = new Date(b.created_at || "").getTime();
          break;
        case "updated_at":
          aVal = new Date(a.updated_at || "").getTime();
          bVal = new Date(b.updated_at || "").getTime();
          break;
        default:
          aVal = a.display_order;
          bVal = b.display_order;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [brands, searchTerm, categoryFilter, activeFilter, sortField, sortDirection]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    const formData = new FormData();
    formData.set("id", String(id));
    const result = await deleteBrand({ success: false, message: "" }, formData);
    if (result.success) setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleActive = async (id: number, current: boolean) => {
    const formData = new FormData();
    formData.set("id", String(id));
    formData.set("is_active", current ? "off" : "on");
    await toggleBrandActive({ success: false, message: "" }, formData);
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: !current } : b)));
  };

  const handleDuplicate = async (brand: CMSBrandRow) => {
    const formData = new FormData();
    formData.set("name", brand.name);
    formData.set("logo_url", brand.logo_url);
    formData.set("category", brand.category || "");
    formData.set("website_url", brand.website_url || "");
    formData.set("display_order", String((brand.display_order || 0) + 1));
    formData.set("is_active", brand.is_active ? "on" : "off");
    const result = await duplicateBrand({ success: false, message: "" }, formData);
    if (result.success) {
      const data = await getBrands();
      setBrands(data);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Brands</h2>
        <button onClick={onCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
          + Upload Logos
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <input type="text" placeholder="Search brands..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[200px]" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
            <option value="all">All Categories</option>
            {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Sort:</span>
          {(["display_order","name","created_at","updated_at"] as const).map(f => (
            <button key={f} onClick={() => handleSort(f)}
              className={\`px-3 py-1 rounded-lg text-xs font-medium transition \${sortField === f ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}\`}>
              {f === "display_order" ? "Order" : f.charAt(0).toUpperCase() + f.slice(1).replace("_"," ")} {getSortIcon(f)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">{filteredBrands.length} of {brands.length} brands</p>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No brands found</p>
          <p className="mt-1">{searchTerm || categoryFilter !== "all" || activeFilter !== "all" ? "Try adjusting your search or filters." : "Upload brand logos to get started."}</p>
        </div>
      )}

      {filteredBrands.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                {["Logo","Brand Name","Category","Website","Status","Display Order","Created Date","Last Updated","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {brand.logo_url ? (
                      <img src={brand.logo_url} alt={brand.name} className="h-10 w-10 object-contain rounded" loading="lazy" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{brand.category || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {brand.website_url ? (
                      <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate block max-w-[200px]" title={brand.website_url}>
                        {brand.website_url.replace(/^https?:\\/\\//, "")}
                      </a>
                    ) : (<span className="text-sm text-gray-400">-</span>)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={"inline-flex px-2 py-0.5 rounded-full text-xs font-medium " + (brand.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500")}>
                      {brand.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{brand.display_order}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(brand.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(brand.updated_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleToggleActive(brand.id, brand.is_active)}
                        className={"px-2 py-1 rounded text-xs font-medium transition " + (brand.is_active ? "bg-gray-50 text-gray-700 hover:bg-gray-100" : "bg-green-50 text-green-700 hover:bg-green-100")}
                        title={brand.is_active ? "Disable" : "Enable"}>{brand.is_active ? "Disable" : "Enable"}</button>
                      <button onClick={() => onEdit(brand)} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100 transition" title="Edit">Edit</button>
                      <button onClick={() => handleDuplicate(brand)} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition" title="Duplicate">Duplicate</button>
                      <button onClick={() => handleDelete(brand.id)} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 transition" title="Delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('app/dashboard/cms/components/BrandsList.tsx', content, 'utf8');
console.log('BrandsList.tsx written successfully');