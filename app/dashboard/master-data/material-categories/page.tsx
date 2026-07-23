import MasterDataClient from "../components/MasterDataClient";
import {
  listMasterData,
  createMasterData,
  updateMasterData,
  toggleMasterDataActive,
  deleteMasterData,
} from "../actions";
import type { MasterDataFormState } from "../types";

export default async function MaterialCategoriesPage() {
  const data = await listMasterData("material_categories");

  const columns = [
    { key: "name", label: "Category Name" },
    { key: "description", label: "Description" },
    { key: "display_order", label: "Order" },
    {
      key: "is_active",
      label: "Status",
      render: (v: unknown) => (v ? "Active" : "Inactive"),
    },
  ];

  const formFields = [
    { name: "name", label: "Category Name", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "display_order", label: "Display Order", type: "number" as const },
    { name: "is_active", label: "Active", type: "checkbox" as const },
  ];

  return (
    <MasterDataClient
      title="Material Categories"
      description="Manage material categories for construction"
      columns={columns}
      data={data}
      formFields={formFields}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("material_categories", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("material_categories", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("material_categories", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("material_categories", p as MasterDataFormState, fd)}
    />
  );
}