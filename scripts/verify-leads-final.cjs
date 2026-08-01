const fs = require("fs");

const modal = fs.readFileSync("App/dashboard/leads/components/LeadDetailsModal.tsx", "utf8");
const content = fs.readFileSync("App/dashboard/leads/components/LeadContent.tsx", "utf8");
const actions = fs.readFileSync("App/dashboard/leads/actions.ts", "utf8");
const types = fs.readFileSync("App/dashboard/leads/types.ts", "utf8");
const page = fs.readFileSync("App/dashboard/leads/page.tsx", "utf8");

const checks = {
  // LeadDetailsModal
  "modal lowercase import useState": modal.includes('import { useState } from "react"'),
  "modal lowercase import LeadRow": modal.includes('import { LeadRow'),
  "modal lowercase import actions": modal.includes('import { updateLeadStatus, addLeadRemarks }'),
  "modal Assigned To field": modal.includes("Assigned To"),
  "modal Activity Timeline": modal.includes("Activity Timeline"),
  "modal parseTimeline": modal.includes("parseTimeline"),
  // LeadContent
  "content LEAD_SOURCES import": content.includes("LEAD_SOURCES"),
  "content Stage Summary": content.includes("Stage Summary"),
  "content source filter": content.includes('name="source"'),
  "content date_to filter": content.includes('name="date_to"'),
  "content assigned_to filter": content.includes('name="assigned_to"'),
  "content clear filters": content.includes("query.assigned_to) &&"),
  // actions
  "actions updateLeadStatus export": /export async function updateLeadStatus/.test(actions),
  "actions addLeadRemarks export": /export async function addLeadRemarks/.test(actions),
  "actions assigned_to filter": actions.includes("assigned_to"),
  "actions stage_counts": actions.includes("stage_counts"),
  "actions status timeline marker": actions.includes("Status changed to"),
  // types
  "types LEAD_SOURCES": types.includes("LEAD_SOURCES"),
  "types LEAD_SOURCE_LABELS": types.includes("LEAD_SOURCE_LABELS"),
  "types stage_counts": types.includes("stage_counts: Record<string, number>"),
  "types LEAD_STATUS_COLORS": types.includes("LEAD_STATUS_COLORS"),
  "types LeadRow assigned_to": types.includes("assigned_to"),
  // page
  "page assigned_to prop": page.includes("assigned_to?: string;"),
  "page assigned_to passthrough": page.includes("assigned_to: params.assigned_to || undefined,"),
};

let failed = false;
for (const [name, ok] of Object.entries(checks)) {
  if (!ok) {
    console.log("FAIL: " + name);
    failed = true;
  }
}
if (failed) {
  console.log("VERIFICATION FAILED");
  process.exit(1);
}
console.log("ALL CHECKS PASSED");