"use client";

import { useState } from "react";
import PackagesTable from "./PackagesTable";
import AddPackageModal from "./AddPackageModal";
import EditPackageModal from "./EditPackageModal";

interface PackageFeature {
  id: string;
  section: string;
  feature: string;
  solid_structure: string | null;
  essential: string | null;
  premium: string | null;
  custom: string | null;
}

interface Props {
  packages: any[];
  features: PackageFeature[];
  error?: string;
}

export default function PackagesContent({
  packages,
  features,
  error,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<any | null>(null);

  const handleEdit = (pkg: any) => {
    setEditPkg(pkg);
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Packages
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all construction packages. Features loaded from Excel MASTER SOURCE.
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
        >
          + Add Package
        </button>

      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      ) : (
        <PackagesTable packages={packages} onEdit={handleEdit} />
      )}

      <AddPackageModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditPackageModal
        open={!!editPkg}
        onClose={() => setEditPkg(null)}
        pkg={editPkg}
        features={features}
      />
    </>
  );
}