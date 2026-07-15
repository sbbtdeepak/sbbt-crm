"use client";

import { useState } from "react";
import PackagesTable from "./PackagesTable";
import AddPackageModal from "./AddPackageModal";

interface Props {
  packages: any[];
  error?: string;
}

export default function PackagesContent({
  packages,
  error,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Packages
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all construction packages.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
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
        <PackagesTable packages={packages} />
      )}

      <AddPackageModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}