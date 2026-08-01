const fs = require("fs");
const path = "App/dashboard/leads/components/LeadDetailsModal.tsx";

let s = fs.readFileSync(path, "utf8");
const before = s;

s = s.split('from "./types"').join('from "../types"');
s = s.split('from "./actions"').join('from "../actions"');

fs.writeFileSync(path, s);

// Verify on actual saved bytes
const check = fs.readFileSync(path, "utf8");
console.log("changed:", before !== check);
console.log("has ../types:", check.includes('from "../types"'));
console.log("has ../actions:", check.includes('from "../actions"'));
console.log("has ./types:", check.includes('from "./types"'));
console.log("has ./actions:", check.includes('from "./actions"'));