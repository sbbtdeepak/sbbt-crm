"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LeadForm from "@/components/shared/LeadForm";

function QuotePageContent() {
  const searchParams = useSearchParams();

  return (
    <LeadForm
      variant="page"
      source="website"
      currentPage="/quote"
      showPlotArea
      initialPlotArea={searchParams.get("plotSize") || ""}
      initialBudget={searchParams.get("estimatedCost") || ""}
    />
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <QuotePageContent />
    </Suspense>
  );
}