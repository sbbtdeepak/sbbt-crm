import MasterDataClient from "../components/MasterDataClient";
import { listMasterData, createMasterData, updateMasterData, toggleMasterDataActive, deleteMasterData, getReferenceData } from "../actions";
import type { MasterDataFormState } from "../types";

const unitTypes = [
  { value: "sqft", label: "Per sqft" },
  { value: "flat", label: "Flat" },
  { value: "per_item", label: "Per Item" },
];

export default async function AddOnsPage() {
  const [data, refs] = await Promise.all([listMasterData("add_ons"), getReferenceData()]);
  return (
    <MasterDataClient title="Add-ons" description="Manage optional add-on items for quotations" columns={[
      { key: "name", label: "Add-on Name" },
      { key: "price", label: "Price", render: (v: unknown) => `₹${Number(v).toLocaleString()}` },
      { key: "unit_type", label: "Unit Type" },
      { key: "material_category_id", label: "Category", render: (v: unknown) => refs.categories.find((c) => c.id === v)?.name || "-" },
      { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
    ]} data={data} formFields={[
      { name: "name", label: "Add-on Name", type: "text" as const, required: true },
      { name: "description", label: "Description", type: "textarea" as const },
      { name: "price", label: "Price", type: "number" as const },
      { name: "unit_type", label: "Unit Type", type: "select" as const, options: unitTypes },
      { name: "material_category_id", label: "Category", type: "select" as const, options: refs.categories.map((c) => ({ value: c.id, label: c.name })) },
      { name: "unit_id", label: "Unit", type: "select" as const, options: refs.units.map((u) => ({ value: u.id, label: u.short_name })) },
      { name: "display_order", label: "Display Order", type: "number" as const },
      { name: "is_active", label: "Active", type: "checkbox" as const },
    ]}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("add_ons", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("add_ons", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("add_ons", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("add_ons", p as MasterDataFormState, fd)}
    />
  );
}