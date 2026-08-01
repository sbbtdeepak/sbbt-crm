const fs = require("fs");
const p = "App/dashboard/leads/page.tsx";
let s = fs.readFileSync(p, "utf8");
const EOL = s.includes("\r\n") ? "\r\n" : "\n";
const NL = EOL;

if (!s.includes("assigned_to?: string;")) {
  const a = "  date_to?: string;" + NL;
  const b = "  date_to?: string;" + NL + "  assigned_to?: string;" + NL;
  if (s.includes(a)) {
    s = s.replace(a, b);
  } else {
    throw new Error("date_to prop block not found");
  }
} else {
  console.log("props block already has assigned_to");
}

if (!s.includes("assigned_to: params.assigned_to || undefined,")) {
  const c = "  date_to: params.date_to || undefined," + NL;
  const d = "  date_to: params.date_to || undefined," + NL + "  assigned_to: params.assigned_to || undefined," + NL;
  if (s.includes(c)) {
    s = s.replace(c, d);
  } else {
    throw new Error("date_to query line not found");
  }
} else {
  console.log("query block already has assigned_to");
}

fs.writeFileSync(p, s, "utf8");
console.log("page.tsx OK");