import MasterDataClient from "../components/MasterDataClient";
import {
  listMasterData,
  createMasterData,
  updateMasterData,
  toggleMasterDataActive,
  deleteMasterData,
  getReferenceData,
} from "../actions";
import type { MasterDataFormState } from "../types";

export default async function BrandsPage() {
  const [data, refs] = await Promise.all([
    listMasterData("brands"),
    getReferenceData(),
  ]);

  const columns = [
    { key: "name", label: "Brand Name" },
    {
      key: "material_category_id",
      label: "Category",
      render: (v: unknown) => {
        const cat = refs.categories.find((c) => c.id === v);
        return cat?.name || "-";
      },
    },
    { key: "display_order", label: "Order" },
    { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
  ];

  const formFields = [
    { name: "name", label: "Brand Name", type: "text" as const, required: true },
    {
      name: "material_category_id",
      label: "Category",
      type: "select" as const,
      options: refs.categories.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "display_order", label: "Display Order", type: "number" as const },
    { name: "is_active", label: "Active", type: "checkbox" as const },
  ];

  return (
    <MasterDataClient
      title="Brands"
      description="Manage brands linked to material categories"
      columns={columns}
      data={data}
      formFields={formFields}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("brands", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("brands", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("brands", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("brands", p as MasterDataFormState, fd)}
    />
  );
}