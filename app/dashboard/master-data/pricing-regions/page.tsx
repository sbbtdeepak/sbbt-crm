import MasterDataClient from "../components/MasterDataClient";
import { listMasterData, createMasterData, updateMasterData, toggleMasterDataActive, deleteMasterData } from "../actions";
import type { MasterDataFormState } from "../types";

export default async function PricingRegionsPage() {
  const data = await listMasterData("pricing_regions");
  const columns = [
    { key: "region_name", label: "Region Name" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "base_rate_per_sqft", label: "Base Rate/sqft", render: (v: unknown) => `₹${Number(v).toLocaleString()}` },
    { key: "labour_rate_per_sqft", label: "Labour Rate/sqft", render: (v: unknown) => `₹${Number(v).toLocaleString()}` },
    { key: "currency", label: "Currency" },
    { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
  ];
  const formFields = [
    { name: "region_name", label: "Region Name", type: "text" as const, required: true },
    { name: "city", label: "City", type: "text" as const },
    { name: "state", label: "State", type: "text" as const },
    { name: "base_rate_per_sqft", label: "Base Rate per sqft", type: "number" as const },
    { name: "labour_rate_per_sqft", label: "Labour Rate per sqft", type: "number" as const },
    { name: "currency", label: "Currency", type: "text" as const },
    { name: "is_active", label: "Active", type: "checkbox" as const },
  ];
  return (
    <MasterDataClient title="Pricing Regions" description="Manage city/state pricing zones" columns={columns} data={data} formFields={formFields}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("pricing_regions", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("pricing_regions", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("pricing_regions", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("pricing_regions", p as MasterDataFormState, fd)}
    />
  );
}