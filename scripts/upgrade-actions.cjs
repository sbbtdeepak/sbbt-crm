const fs = require("fs");
const p = "App/dashboard/leads/actions.ts";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
const out = [];
let i = 0;
const is = (n, t) => (lines[n] || "").trim() === t;
while (i < lines.length) {
  const l = lines[i];
  // R1: import LEAD_STATUS_LABELS
  if (is(i, "LEAD_STATUSES,") && is(i + 1, "} from \"./types\";")) {
    out.push(l, l.includes("LEAD_STATUS_LABELS") ? "" : lines[i].replace("LEAD_STATUSES", "LEAD_STATUS_LABELS"));
    i += 2;
    continue;
  }
  // R2: assigned_to filter before order comment
  if (is(i, "query = query.lte(\"created_at\", params.date_to.trim());")) {
    out.push(l);
    while (i + 1 < lines.length && lines[i + 1].trim() === "") { i++; out.push(lines[i]); }
    out.push(lines[i + 1]); i++; // closing }
    out.push("", " // Filter by assigned_to (future-ready)");
    out.push(" if (params.assigned_to && params.assigned_to.trim()) {");
    out.push("  query = query.eq(\"assigned_to\", params.assigned_to.trim());");
    out.push(" }");
    i++;
    continue;
  }
  // R3: error return stage_counts
  if (is(i, "total_pages: 0,") && is(i + 1, "};")) {
    out.push(l, "  stage_counts: {},", lines[i + 1]);
    i += 2;
    continue;
  }
  // R4: success return stage_counts
  if (is(i, "return {") && is(i + 1, "data: (data || []) as LeadRow[],") &&
      is(i + 2, "count: total,") && is(i + 3, "page,") &&
      is(i + 4, "limit,") && is(i + 5, "total_pages: totalPages,") && is(i + 6, "};")) {
    out.push(" // Compute stage counts from the fetched page data.");
    out.push(" const stageCounts: Record<string, number> = {};");
    out.push(" for (const row of data || []) {");
    out.push("  const key = row.status || \"unknown\";");
    out.push("  stageCounts[key] = (stageCounts[key] || 0) + 1;");
    out.push(" }");
    out.push("");
    out.push(" return {");
    out.push("  data: (data || []) as LeadRow[],");
    out.push("  count: total,");
    out.push("  page,");
    out.push("  limit,");
    out.push("  total_pages: totalPages,");
    out.push("  stage_counts: stageCounts,");
    out.push(" };");
    i += 7;
    continue;
  }
  // R5: status change timeline entry in updateLeadStatus
  if (is(i, "// Fire status change notification asynchronously") && is(i + 1, "if (currentLead && oldStatus !== status) {")) {
    out.push(" // Append status change timeline entry to remarks");
    out.push(" if (oldStatus !== status) {");
    out.push("  const timestamp = new Date().toISOString();");
    out.push("  const statusLabel = LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS] || status;");
    out.push("  const statusEntry = `[${timestamp}] (${userId || \"admin\"}) Status changed to ${statusLabel}`;");
    out.push("  const currentRemarks = currentLead.remarks || \"\";");
    out.push("  const updatedRemarks = currentRemarks ? `${currentRemarks}\\n${statusEntry}` : statusEntry;");
    out.push("");
    out.push("  await supabase");
    out.push("   .from(\"contact_leads\")");
    out.push("   .update({ remarks: updatedRemarks })");
    out.push("   .eq(\"id\", id);");
    out.push(" }");
    out.push("");
    out.push(l);
    i++;
    continue;
  }
  out.push(l);
  i++;
}
fs.writeFileSync(p, out.join("\r\n"), "utf8");
console.log("actions.ts OK");