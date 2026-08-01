const fs = require("fs");
const p = "App/dashboard/leads/actions.ts";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
const out = [];
let i = 0;
while (i < lines.length) {
  const t = lines[i].trim();
  if (t === "LEAD_STATUS_LABELS," && (lines[i + 1] || "").trim() === "import {") {
    out.push(lines[i]);
    out.push("} from \"./types\";");
    i++;
    continue;
  }
  out.push(lines[i]);
  i++;
}
fs.writeFileSync(p, out.join("\r\n"), "utf8");
console.log("import fixed");