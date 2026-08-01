const fs = require("fs");
const types = fs.readFileSync("App/dashboard/leads/types.ts", "utf8");
const actions = fs.readFileSync("App/dashboard/leads/actions.ts", "utf8");

console.log("=== types.ts interface declarations ===");
const ifaces = types.match(/export interface \w+/g) || [];
console.log(ifaces);

console.log("=== LeadRow declaration line ===");
const leadRowLine = types.split(/\r?\n/).findIndex((l) => l.includes("LeadRow"));
console.log("index:", leadRowLine);
if (leadRowLine >= 0) {
  const lines = types.split(/\r?\n/);
  console.log(lines.slice(leadRowLine, leadRowLine + 5).join("\n"));
}

console.log("=== LeadRow regex with optional export ===");
const r = types.match(/export interface LeadRow \{[\s\S]*?\n\}/);
console.log("matched:", !!r);
if (r) console.log(r[0].slice(0, 300));

console.log("=== actions signatures ===");
console.log("updateLeadStatus:", /export async function updateLeadStatus/.test(actions));
console.log("addLeadRemarks:", /export async function addLeadRemarks/.test(actions));
const m = actions.match(/export async function addLeadRemarks\(([^)]*)\)/);
console.log("addLeadRemarks params:", m ? m[1] : "N/A");