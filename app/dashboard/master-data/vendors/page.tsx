import MasterDataClient from "../components/MasterDataClient";
import { listMasterData, createMasterData, updateMasterData, toggleMasterDataActive, deleteMasterData } from "../actions";
import type { MasterDataFormState } from "../types";

export default async function VendorsPage() {
  const data = await listMasterData("vendors");
  return (
    <MasterDataClient title="Vendors" description="Manage vendor/supplier information" columns={[
      { key: "name", label: "Vendor Name" },
      { key: "company", label: "Company" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "gst", label: "GST" },
      { key: "is_active", label: "Status", render: (v: unknown) => (v ? "Active" : "Inactive") },
    ]} data={data} formFields={[
      { name: "name", label: "Vendor Name", type: "text" as const, required: true },
      { name: "company", label: "Company", type: "text" as const },
      { name: "contact_person", label: "Contact Person", type: "text" as const },
      { name: "phone", label: "Phone", type: "tel" as const },
      { name: "email", label: "Email", type: "email" as const },
      { name: "address", label: "Address", type: "textarea" as const, width: "md:col-span-2" },
      { name: "gst", label: "GST", type: "text" as const },
      { name: "payment_terms", label: "Payment Terms", type: "text" as const },
      { name: "is_active", label: "Active", type: "checkbox" as const },
    ]}
      onCreate={async (p: unknown, fd: FormData) => createMasterData("vendors", p as MasterDataFormState, fd)}
      onUpdate={async (p: unknown, fd: FormData) => updateMasterData("vendors", p as MasterDataFormState, fd)}
      onToggle={async (p: unknown, fd: FormData) => toggleMasterDataActive("vendors", p as MasterDataFormState, fd)}
      onDelete={async (p: unknown, fd: FormData) => deleteMasterData("vendors", p as MasterDataFormState, fd)}
    />
  );
}