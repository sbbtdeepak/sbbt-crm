import MasterDataClient from "../components/MasterDataClient";
import { listMasterData, createMasterData, updateMasterData, toggleMasterDataActive, deleteMasterData } from "../actions";
import type { MasterDataFormState } from "../types";

const taxTypes = [
  { value: "gst", label: "GST" },
  { value: "cess", label: "Cess" },
  { value: "tds", label: "TDS" },
  { value: "other", label: "Other" },
];

const applicableOn = [
  { value: "materials", label: "Materials" },
  { value: "labour", label: "Labour" },
  { value: "both", label: "Both" },
];

export default async function TaxMasterPage() {
  const data = await listMasterData("tax_master");
  return (
    <MasterDataClient title="Tax Master" description="Manage GST and other tax rates" columns={[
      { key: "name", label: "Tax Name" },
      { key: "rate", label: "Rate (%)", render: (v: unknown) => `${v}%` },
      { key: "type", label: "Type" },
      { key: "hsn_sac_code", label: "HSN/SAC" },
      { key: "applicable_on", label: "Applicable On" },
      { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
    ]} data={data} formFields={[
      { name: "name", label: "Tax Name", type: "text" as const, required: true },
      { name: "rate", label: "Rate (%)", type: "number" as const },
      { name: "type", label: "Type", type: "select" as const, options: taxTypes },
      { name: "hsn_sac_code", label: "HSN/SAC Code", type: "text" as const },
      { name: "applicable_on", label: "Applicable On", type: "select" as const, options: applicableOn },
      { name: "is_active", label: "Active", type: "checkbox" as const },
    ]}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("tax_master", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("tax_master", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("tax_master", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("tax_master", p as MasterDataFormState, fd)}
    />
  );
}