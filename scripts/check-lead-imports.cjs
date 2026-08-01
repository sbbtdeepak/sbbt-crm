const fs = require("fs");

const content = fs.readFileSync("App/dashboard/leads/components/LeadContent.tsx", "utf8");
const modal = fs.readFileSync("App/dashboard/leads/components/LeadDetailsModal.tsx", "utf8");

// Split into lines and show import lines exactly
const contentLines = content.split(/\r?\n/).slice(0, 8);
const modalLines = modal.split(/\r?\n/).slice(0, 8);

console.log("=== LeadContent.tsx first 8 lines ===");
contentLines.forEach((l, i) => console.log(i + 1 + ": " + JSON.stringify(l)));

console.log("=== LeadDetailsModal.tsx first 8 lines ===");
modalLines.forEach((l, i) => console.log(i + 1 + ": " + JSON.stringify(l)));

// Checks
console.log("content uses ../types:", content.includes('from "../types"'));
console.log("content uses ./types:", content.includes('from "./types"'));
console.log("modal uses ../types:", modal.includes('from "../types"'));
console.log("modal uses ../actions:", modal.includes('from "../actions"'));
console.log("modal uses ./types:", modal.includes('from "./types"'));
console.log("modal uses ./actions:", modal.includes('from "./actions"'));