const fs = require("fs");

const modal = "App/dashboard/leads/components/LeadDetailsModal.tsx";
const content = "App/dashboard/leads/components/LeadContent.tsx";

function fix(path, replacements) {
  let s = fs.readFileSync(path, "utf8");
  for (const [from, to] of replacements) {
    if (!s.includes(from)) {
      console.log("WARN: " + path + " does not contain '" + from + "'");
      continue;
    }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(path, s);
  console.log("Fixed: " + path);
}

// Modal: types and actions are in the parent leads/ directory
fix(modal, [
  ['from "./types"', 'from "../types"'],
  ['from "./actions"', 'from "../actions"'],
]);

// Content: types is in the parent leads/ directory
fix(content, [
  ['from "./types"', 'from "../types"'],
]);

// Verify
const m = fs.readFileSync(modal, "utf8");
const c = fs.readFileSync(content, "utf8");
console.log("modal ../types:", m.includes('from "../types"'));
console.log("modal ../actions:", m.includes('from "../actions"'));
console.log("modal still ./types:", m.includes('from "./types"'));
console.log("modal still ./actions:", m.includes('from "./actions"'));
console.log("content ../types:", c.includes('from "../types"'));
console.log("content still ./types:", c.includes('from "./types"'));
console.log("content LeadTable local:", c.includes('from "./LeadTable"'));
console.log("content Modal local:", c.includes('from "./LeadDetailsModal"'));