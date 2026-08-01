const fs = require("fs");
const p = "App/dashboard/leads/components/LeadContent.tsx";
let s = fs.readFileSync(p, "utf8");
const EOL = s.includes("\r\n") ? "\r\n" : "\n";
const L = (arr) => arr.join(EOL);

// 1. Add LEAD_SOURCES / LEAD_SOURCE_LABELS import
const impOld = 'import { LeadRow, LeadQueryParams, LeadQueryResult, LEAD_STATUS_LABELS } from "./types";';
const impNew = 'import { LeadRow, LeadQueryParams, LeadQueryResult, LEAD_STATUS_LABELS, LEAD_SOURCES, LEAD_SOURCE_LABELS } from "./types";';
if (!s.includes("LEAD_SOURCES")) {
  if (!s.includes(impOld)) throw new Error("import not found");
  s = s.replace(impOld, impNew);
}

// 2. Insert stage summary cards after header
const headerAnchor = L([
  '      <p className="text-gray-500 mt-1">',
  '        Manage all customer enquiries. {result.count} total leads.',
  "      </p>",
  "    </div>",
  "",
  "    {/* Error */}",
]);
const headerNew = L([
  '      <p className="text-gray-500 mt-1">',
  '        Manage all customer enquiries. {result.count} total leads.',
  "      </p>",
  "    </div>",
  "",
  "    {/* Stage Summary */}",
  '    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">',
  "      {Object.entries(LEAD_STATUS_LABELS).map(([status, label]) => {",
  "        const count = result.stage_counts[status] || 0;",
  "        return (",
  '          <div key={status} className="rounded-xl bg-white p-3 shadow border border-gray-100">',
  '            <div className="text-xs font-medium text-gray-500">{label}</div>',
  '            <div className="text-xl font-bold text-gray-800 mt-1">{count}</div>',
  "          </div>",
  "        );",
  "      })}",
  "    </div>",
  "",
  "    {/* Error */}",
]);
if (!s.includes("Stage Summary")) {
  if (!s.includes(headerAnchor)) throw new Error("header anchor not found");
  s = s.replace(headerAnchor, headerNew);
}

// 3. Change form grid to 6 columns
const gridOld = 'className="grid grid-cols-1 md:grid-cols-5 gap-3"';
const gridNew = 'className="grid grid-cols-1 md:grid-cols-6 gap-3"';
if (s.includes(gridOld)) {
  s = s.replace(gridOld, gridNew);
}

// 4. Insert Source filter after Status filter select block
const statusEnd = L([
  "        </select>",
  "      </div>",
  "",
  "      {/* Date Filter */}",
]);
const statusNew = L([
  "        </select>",
  "      </div>",
  "",
  "      {/* Source Filter */}",
  "      <div>",
  "        <select",
  '          name="source"',
  '          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"',
  '          defaultValue={query.source || ""}',
  "        >",
  '          <option value="">All Sources</option>',
  "          {LEAD_SOURCES.map((source) => (",
  "            <option key={source} value={source}>",
  "              {LEAD_SOURCE_LABELS[source]}",
  "            </option>",
  "          ))}",
  "        </select>",
  "      </div>",
  "",
  "      {/* Date Filter */}",
]);
if (!s.includes('name="source"')) {
  if (!s.includes(statusEnd)) throw new Error("status end anchor not found");
  s = s.replace(statusEnd, statusNew);
}

// 5. Insert date_to and assigned_to after date_from block
const dateAnchor = L([
  '          type="date"',
  '          name="date_from"',
  '          defaultValue={query.date_from || ""}',
  '          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"',
  "        />",
  "      </div>",
  "",
  "      {/* Submit */}",
]);
const dateNew = L([
  '          type="date"',
  '          name="date_from"',
  '          defaultValue={query.date_from || ""}',
  '          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"',
  "        />",
  "      </div>",
  "",
  "      {/* Date To Filter */}",
  "      <div>",
  "        <input",
  '          type="date"',
  '          name="date_to"',
  '          defaultValue={query.date_to || ""}',
  '          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"',
  "        />",
  "      </div>",
  "",
  "      {/* Assigned To Filter */}",
  "      <div>",
  "        <input",
  '          type="text"',
  '          name="assigned_to"',
  '          defaultValue={query.assigned_to || ""}',
  '          placeholder="Assigned to (user id)"',
  '          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"',
  "        />",
  "      </div>",
  "",
  "      {/* Submit */}",
]);
if (!s.includes('name="date_to"')) {
  if (!s.includes(dateAnchor)) throw new Error("date_from anchor not found");
  s = s.replace(dateAnchor, dateNew);
}

// 6. Update clear filters condition
const clearOld = "{(query.search || query.status || query.date_from) && (";
const clearNew = "{(query.search || query.status || query.source || query.date_from || query.date_to || query.assigned_to) && (";
if (s.includes(clearOld)) {
  s = s.replace(clearOld, clearNew);
} else if (!s.includes("query.source ||")) {
  throw new Error("clear filters condition not found/updated");
}

fs.writeFileSync(p, s, "utf8");
console.log("LeadContent.tsx OK");