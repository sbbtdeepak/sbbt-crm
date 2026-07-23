import MasterDataClient from "../components/MasterDataClient";
import { listMasterData, createMasterData, updateMasterData, toggleMasterDataActive, deleteMasterData, getReferenceData } from "../actions";
import type { MasterDataFormState } from "../types";

export default async function RateMasterPage() {
  const [data, refs] = await Promise.all([listMasterData("rate_master"), getReferenceData()]);
  return (
    <MasterDataClient title="Rate Master" description="Central rates repository for all materials and labour" columns={[
      { key: "item_name", label: "Item Name" },
      { key: "material_category_id", label: "Category", render: (v: unknown) => refs.categories.find((c) => c.id === v)?.name || "-" },
      { key: "brand_id", label: "Brand", render: (v: unknown) => refs.brands.find((b) => b.id === v)?.name || "-" },
      { key: "material_rate", label: "Material Rate", render: (v: unknown) => `₹${Number(v).toLocaleString()}` },
      { key: "labour_rate", label: "Labour Rate", render: (v: unknown) => `₹${Number(v).toLocaleString()}` },
      { key: "gst_percent", label: "GST %", render: (v: unknown) => `${v}%` },
      { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
    ]} data={data} formFields={[
      { name: "item_name", label: "Item Name", type: "text" as const, required: true },
      { name: "hsn_code", label: "HSN Code", type: "text" as const },
      { name: "material_category_id", label: "Category", type: "select" as const, options: refs.categories.map((c) => ({ value: c.id, label: c.name })) },
      { name: "brand_id", label: "Brand", type: "select" as const, options: refs.brands.map((b) => ({ value: b.id, label: b.name })) },
      { name: "unit_id", label: "Unit", type: "select" as const, options: refs.units.map((u) => ({ value: u.id, label: u.short_name })) },
      { name: "vendor_id", label: "Vendor", type: "select" as const, options: refs.vendors.map((v) => ({ value: v.id, label: v.name })) },
      { name: "pricing_region_id", label: "Pricing Region", type: "select" as const, options: refs.regions.map((r) => ({ value: r.id, label: r.region_name })) },
      { name: "material_rate", label: "Material Rate", type: "number" as const },
      { name: "labour_rate", label: "Labour Rate", type: "number" as const },
      { name: "wastage_percent", label: "Wastage %", type: "number" as const },
      { name: "contractor_margin_percent", label: "Contractor Margin %", type: "number" as const },
      { name: "customer_margin_percent", label: "Customer Margin %", type: "number" as const },
      { name: "gst_percent", label: "GST %", type: "number" as const },
      { name: "currency", label: "Currency", type: "text" as const },
      { name: "is_active", label: "Active", type: "checkbox" as const },
    ]}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("rate_master", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("rate_master", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("rate_master", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("rate_master", p as MasterDataFormState, fd)}
    />
  );
}