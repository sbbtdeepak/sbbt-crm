"use client";

// ============================================================
// Master Data Client Wrapper
// SBBT CRM Next.js Project
//
// Wraps MasterDataTable for use with server-side data fetching.
// This is the client component boundary.
// ============================================================

import MasterDataTable, {
  type Column,
  type FormField,
} from "@/components/shared/MasterDataTable";

interface Props {
  title: string;
  description: string;
  columns: Column[];
  data: unknown[];
  formFields: FormField[];
  onCreate: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
  onUpdate: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
  onToggle: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
  onDelete: (prevState: unknown, formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export default function MasterDataClient(props: Props) {
  return <MasterDataTable {...props} />;
}