"use client";

import { useState, useCallback } from "react";
import PackageList from "./PackageList";
import PackageForm from "./PackageForm";
import type { CMSPackageFull } from "../types";

type View = "list" | "create" | "edit";

export default function PackagesSection() {
  const [view, setView] = useState<View>("list");
  const [editingPkg, setEditingPkg] = useState<CMSPackageFull | null>(null);

  const handleCreate = useCallback(() => {
    setEditingPkg(null);
    setView("create");
  }, []);

  const handleEdit = useCallback((pkg: CMSPackageFull) => {
    setEditingPkg(pkg);
    setView("edit");
  }, []);

  const handleBack = useCallback(() => {
    setEditingPkg(null);
    setView("list");
  }, []);

  if (view === "create") {
    return <PackageForm pkg={null} onBack={handleBack} />;
  }

  if (view === "edit" && editingPkg) {
    return <PackageForm pkg={editingPkg} onBack={handleBack} />;
  }

  return <PackageList onEdit={handleEdit} onCreate={handleCreate} />;
}