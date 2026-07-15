"use client";

import { Lead } from "../types";
import { deleteLead, updateLeadStatus } from "../actions";

interface Props {
  leads: Lead[];
}

export default function LeadTable({ leads }: Props) {
  if (!leads.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">No Leads Found</h2>
        <p className="mt-2 text-gray-500">
          Website leads will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t hover:bg-gray-50">

                <td className="px-4 py-4">
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {lead.message}
                  </div>
                </td>

                <td className="px-4 py-4">{lead.phone}</td>

                <td className="px-4 py-4">{lead.email}</td>

                <td className="px-4 py-4">
                  <select
                    defaultValue={lead.status}
                    className="rounded border p-2"
                    onChange={async (e) => {
                      await updateLeadStatus(
                        lead.id,
                        e.target.value
                      );
                      window.location.reload();
                    }}
                  >
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Follow Up</option>
                    <option>Won</option>
                    <option>Lost</option>
                  </select>
                </td>

                <td className="px-4 py-4">
                  {new Date(
                    lead.created_at
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-4">
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          "Delete this lead?"
                        )
                      ) {
                        await deleteLead(lead.id);
                        window.location.reload();
                      }
                    }}
                    className="rounded bg-red-600 px-3 py-2 text-white"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}