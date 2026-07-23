import MasterDataClient from "../components/MasterDataClient";
import { listMasterData, createMasterData, updateMasterData, toggleMasterDataActive, deleteMasterData, getReferenceData } from "../actions";
import type { MasterDataFormState } from "../types";

export default async function ConstructionActivitiesPage() {
  const [data, refs] = await Promise.all([listMasterData("construction_activities"), getReferenceData()]);
  return (
    <MasterDataClient title="Construction Activities" description="Manage construction activity types" columns={[
      { key: "name", label: "Activity Name" },
      { key: "description", label: "Description" },
      { key: "material_category_id", label: "Category", render: (v: unknown) => refs.categories.find((c) => c.id === v)?.name || "-" },
      { key: "unit_id", label: "Unit", render: (v: unknown) => refs.units.find((u) => u.id === v)?.short_name || "-" },
      { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
    ]} data={data} formFields={[
      { name: "name", label: "Activity Name", type: "text" as const, required: true },
      { name: "description", label: "Description", type: "textarea" as const },
      { name: "material_category_id", label: "Category", type: "select" as const, options: refs.categories.map((c) => ({ value: c.id, label: c.name })) },
      { name: "unit_id", label: "Unit", type: "select" as const, options: refs.units.map((u) => ({ value: u.id, label: u.short_name })) },
      { name: "display_order", label: "Display Order", type: "number" as const },
      { name: "is_active", label: "Active", type: "checkbox" as const },
    ]}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("construction_activities", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("construction_activities", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("construction_activities", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("construction_activities", p as MasterDataFormState, fd)}
    />
  );
}