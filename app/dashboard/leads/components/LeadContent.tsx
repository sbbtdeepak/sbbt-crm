"use client";

import { Lead } from "../types";
import LeadTable from "./LeadTable";

interface Props {
  leads: Lead[];
  error?: string;
}

export default function LeadContent({
  leads,
  error,
}: Props) {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Contact Leads
        </h1>

        <p className="text-gray-500 mt-1">
          Manage all customer enquiries.
        </p>

      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      ) : (
        <LeadTable leads={leads} />
      )}

    </div>
  );
}