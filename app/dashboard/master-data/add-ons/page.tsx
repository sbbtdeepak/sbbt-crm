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

  const columns = [
    { key: "name", label: "Add-on Name" },
    { key: "price", label: "Price", render: (v: unknown) => `₹${Number(v).toLocaleString()}` },
    { key: "unit_type", label: "Unit Type" },
    { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
  ];

  const formFields = [
    { name: "name", label: "Add-on Name", type: "text" as const, required: true },
    { name: "price", label: "Price", type: "number" as const },
    {
      name: "unit_type",
      label: "Unit Type",
      type: "select" as const,
      options: unitTypes.map((u) => ({ value: u.value, label: u.label })),
    },
    { name: "is_active", label: "Active", type: "checkbox" as const },
  ];

  return (
    <MasterDataClient
      title="Add-ons"
      description="Manage optional add-on items for quotations"
      columns={columns}
      data={data}
      formFields={formFields}
      onCreate={async (p, fd) => createMasterData("add_ons", p as MasterDataFormState, fd)}
      onUpdate={async (p, fd) => updateMasterData("add_ons", p as MasterDataFormState, fd)}
      onToggle={async (p, fd) => toggleMasterDataActive("add_ons", p as MasterDataFormState, fd)}
      onDelete={async (p, fd) => deleteMasterData("add_ons", p as MasterDataFormState, fd)}
    />
  );
}
