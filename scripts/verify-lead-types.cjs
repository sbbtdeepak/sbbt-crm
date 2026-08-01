const fs = require("fs");
const types = fs.readFileSync("App/dashboard/leads/types.ts", "utf8");
const actions = fs.readFileSync("App/dashboard/leads/actions.ts", "utf8");

// Extract LeadRow interface body
const leadRowMatch = types.match(/interface LeadRow \{[\s\S]*?\n\}/);
if (!leadRowMatch) {
  console.log("FAIL: LeadRow interface not found");
  process.exit(1);
}
const leadRowBody = leadRowMatch[0];
console.log("LeadRow assigned_to:", /assigned_to/.test(leadRowBody));
console.log("LeadRow status:", /status/.test(leadRowBody));

// Signature checks
console.log("updateLeadStatus sig:", /export async function updateLeadStatus\(id: string, newStatus: string\)/.test(actions));
console.log("addLeadRemarks sig:", /export async function addLeadRemarks\([^)]*\)/.test(actions));
const addLeadRemarksMatch = actions.match(/export async function addLeadRemarks\(([^)]*)\)/);
if (addLeadRemarksMatch) console.log("addLeadRemarks params:", addLeadRemarksMatch[1]);