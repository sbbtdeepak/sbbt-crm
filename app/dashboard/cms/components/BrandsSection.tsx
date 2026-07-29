"use client";

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