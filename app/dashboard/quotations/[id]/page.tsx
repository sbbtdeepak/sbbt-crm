import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEstimateById } from "@/app/dashboard/estimate-engine/actions";
import QuotationDetailsClient from "./QuotationDetailsClient";

export const metadata: Metadata = {
  title: "Quotation Details | SBBT CRM",
  description: "View quotation details and download PDF",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const estimateId = parseInt(id, 10);

  if (isNaN(estimateId)) {
    notFound();
  }

  const supabase = await createClient();
  const estimateData = await getEstimateById(estimateId);

  if (!estimateData) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <QuotationDetailsClient estimate={estimateData.estimate} items={estimateData.items} />
    </Suspense>
  );
}