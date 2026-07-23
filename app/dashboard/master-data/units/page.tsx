import MasterDataClient from "../components/MasterDataClient";
import { listMasterData, createMasterData, updateMasterData, toggleMasterDataActive, deleteMasterData } from "../actions";
import type { MasterDataFormState } from "../types";

const unitCategories = [
  { value: "area", label: "Area" },
  { value: "count", label: "Count" },
  { value: "length", label: "Length" },
  { value: "weight", label: "Weight" },
  { value: "volume", label: "Volume" },
  { value: "general", label: "General" },
];

export default async function UnitsPage() {
  const data = await listMasterData("units");
  return (
    <MasterDataClient title="Units" description="Manage measurement units with conversion factors" columns={[
      { key: "name", label: "Unit Name" },
      { key: "short_name", label: "Short Name" },
      { key: "category", label: "Category" },
      { key: "conversion_factor", label: "Conversion Factor" },
      { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
    ]} data={data}
      formFields={[
        { name: "name", label: "Unit Name", type: "text" as const, required: true },
        { name: "short_name", label: "Short Name", type: "text" as const },
        { name: "category", label: "Category", type: "select" as const, options: unitCategories },
        { name: "conversion_factor", label: "Conversion Factor", type: "number" as const },
        { name: "is_active", label: "Active", type: "checkbox" as const },
      ]}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("units", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("units", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("units", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("units", p as MasterDataFormState, fd)}
    />
  );
}