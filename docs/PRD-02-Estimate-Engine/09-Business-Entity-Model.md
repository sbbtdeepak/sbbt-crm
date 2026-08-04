# PRD-02 — Phase 9

## Business Entity Model

---

## Purpose

This document defines the **Business Entity Model** for the SBBT Estimate Engine. It describes the core business entities that the Estimate Engine operates on, their business meaning, responsibilities, lifecycles, and relationships.

This is a **business documentation** document only.

It is **not**:
- A database document.
- An ER diagram.
- A schema.
- An API specification.

No SQL, tables, columns, keys, foreign keys, data types, APIs, UI, or code are included.

Each entity in this document explains:

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Why the entity exists |
| **Business Meaning** | What the entity represents in business terms |
| **Responsibilities** | What the entity is responsible for |
| **Lifecycle** | The states the entity moves through |
| **Relationships** | How the entity relates to other entities (business only) |
| **Dependencies** | What the entity depends on |
| **Ownership** | Who owns and edits the entity |
| **Visibility** | Who can see the entity |
| **Versioning Behaviour** | How changes to the entity are tracked |
| **Audit Behaviour** | What events on the entity are recorded |
| **Future Expansion** | How the entity will grow in future phases |

---

## 1. Estimate

| Attribute | Description |
|-----------|-------------|
| **Purpose** | The Estimate is the primary business document. It captures a priced proposal for construction or service work offered to a customer. |
| **Business Meaning** | The Estimate represents a formal offer: what work will be done, at what quantity, at what price, under what terms, and for which customer and project. |
| **Responsibilities** | Holds the commercial agreement scope; captures customer intent; references the package, BOQ, pricing rules, formulas, and approvals that produced it; is the basis for customer decisions and project conversion. |
| **Lifecycle** | Draft → Pending Approval → Approved → Shared → Customer Decision → Accepted / Declined / Expired → Converted to Project → Archived |
| **Relationships** | Belongs to a Customer; references a Project (optional); uses a Package; contains one or more BOQ documents; has many Estimate Versions; has many Shares; generates Notifications; is linked to Approvals; carries Comments, Tags, and Attachments. |
| **Dependencies** | Depends on Customer, Project (optional), Package, BOQ, Pricing Rules, Formulas, and Permission Engine. |
| **Ownership** | Owned by the internal user who created it (typically Sales or Estimator). Editable by the Owner and authorized roles. Archivable by lifecycle-permission holders. |
| **Visibility** | Internal by default; visible to the Customer only when Shared; visible to other internal roles per Permission Engine. |
| **Versioning Behaviour** | Every approved change creates a new Estimate Version. Revisions track minor iterations. |
| **Audit Behaviour** | Every creation, edit, approval, share, decline, acceptance, expiry, and archive is audited. |
| **Future Expansion** | Will support multi-company estimates, tenant-scoped estimates, and AI-assisted estimate creation. |

---

## 2. Estimate Version

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Retains a snapshotted state of the Estimate when it reaches an important milestone, such as approval or customer sharing. |
| **Business Meaning** | A Version is a formal chapter of the estimate's life. It preserves what was offered at a specific point in time. |
| **Responsibilities** | Preserves the complete estimate state; enables comparison between versions; supports rollback; records the customer-facing offer. |
| **Lifecycle** | Created → Active → Superseded → Archived |
| **Relationships** | Belongs to an Estimate; may be shared to a Customer; contains BOQ snapshots; references Approvals. |
| **Dependencies** | Depends on Estimate, BOQ, and Approval. |
| **Ownership** | Owned by the Estimate Owner. Editable only through controlled version creation. |
| **Visibility** | Internal by default; a shared version becomes visible to the Customer. |
| **Versioning Behaviour** | Versions themselves are immutable once created; new versions are created from the current state. |
| **Audit Behaviour** | Version creation, comparison, and rollback events are audited. |
| **Future Expansion** | Will support multi-company visibility of versions and customer-visible version history. |

---

## 3. Estimate Revision

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Tracks small, incremental changes made between formal versions. |
| **Business Meaning** | A Revision is an iteration of the estimate while it is still being worked on. |
| **Responsibilities** | Records minor changes (e.g., quantity updates, price corrections) without creating a formal Version; enables change history for the current working state. |
| **Lifecycle** | Open → Applied → Incorporated into Version → Archived |
| **Relationships** | Belongs to an Estimate; is part of an Estimate Version when formally captured. |
| **Dependencies** | Depends on Estimate. |
| **Ownership** | Owned by the user making the revision. Editable by the Estimate Owner and authorized editors. |
| **Visibility** | Internal only. Never visible to Customers directly. |
| **Versioning Behaviour** | Revisions accumulate; when a Version is created, the latest revision state rolls into it. |
| **Audit Behaviour** | Every revision application is audited with the user, reason, and changed values. |
| **Future Expansion** | Will support AI-suggested revisions. |

---

## 4. Estimate Template

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Provides a reusable starting point for common estimate types. |
| **Business Meaning** | A Template captures best-practice estimate structures (e.g., Standard Residential Construction, Interior Fit-Out, Solar Installation) that can be instantiated as new Estimates. |
| **Responsibilities** | Defines the default structure, sections, suggested items, default pricing rules, and formatting for an estimate type. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | References Package Templates, Work Components, Pricing Components, Formulas, and Rules; is instantiated into Estimates. |
| **Dependencies** | Depends on Package Template, Work Component, Pricing Component, and Rule configurations. |
| **Ownership** | Owned by the configurational role that created it (typically Estimator Lead or Admin). |
| **Visibility** | Internal; visible to authorized estimator roles. |
| **Versioning Behaviour** | Template changes are versioned so existing estimates based on a template retain their own snapshots. |
| **Audit Behaviour** | Template creation, publishing, and deprecation are audited. |
| **Future Expansion** | Will support customer-branded templates and AI-generated templates. |

---

## 5. Package

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents a productized offering that bundles work components, pricing components, quantities, and services into a sellable package. |
| **Business Meaning** | A Package is a defined scope of work offered to customers (e.g., Premium Turnkey Package, Basic Interior Package). |
| **Responsibilities** | Defines the bundle of work components, default quantities, inclusion rules, and base pricing for a saleable offering. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | References Work Components and Work Component Categories; is used by Estimates; may derive from a Package Template; is priced through Pricing Rules. |
| **Dependencies** | Depends on Work Component, Work Component Category, Pricing Rule, and Formula. |
| **Ownership** | Owned by the role that creates it (typically Admin, Sales, or Estimator per permission). |
| **Visibility** | Internal for pricing; customer-visible when published to the public website or customer portal. |
| **Versioning Behaviour** | Package changes are versioned; estimates using a package retain the package version snapshot. |
| **Audit Behaviour** | Package creation, edits, publishing, and deprecation are audited. |
| **Future Expansion** | Will support package comparison, AI package generation, and multi-tenant package libraries. |

---

## 6. Package Template

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Defines a reusable structural blueprint for creating Packages. |
| **Business Meaning** | A Package Template is a pattern (e.g., Turnkey Packages, Interior Packages) that standardizes how packages within a family are structured. |
| **Responsibilities** | Defines default sections, work component groups, and configurations for creating consistent packages. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Is instantiated into Packages; references Work Components, Pricing Components, and Formulas. |
| **Dependencies** | Depends on Work Component, Pricing Component, and Formula configurations. |
| **Ownership** | Owned by configurational roles. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Versioned like Estimate Templates; existing packages keep their template snapshot. |
| **Audit Behaviour** | All template lifecycle changes are audited. |
| **Future Expansion** | Will support drag-and-drop template composition. |

---

## 7. Work Component

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents a distinct unit of construction or service work that can be included in a package or estimate. |
| **Business Meaning** | A Work Component is a construction building block used to compose estimates (e.g., Foundation Work, Wall Plastering, Modular Kitchen, Solar Panel Installation). |
| **Responsibilities** | Defines what the work component is, how it is measured, and how it participates in pricing. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Belongs to a Work Component Category; is referenced by Packages, BOQ Items, and Formulas. |
| **Dependencies** | Depends on Work Component Category; may depend on other Work Components (e.g., foundation requires excavation). |
| **Ownership** | Owned by the estimator or configurational role that creates it. |
| **Visibility** | Internal; work components and their costs are never exposed to Customers directly. |
| **Versioning Behaviour** | Work Component changes are versioned; published estimates retain work component snapshots. |
| **Audit Behaviour** | Work Component creation, edits, and deprecation are audited. |
| **Future Expansion** | Will support vendor-linked work components, dynamic work component catalogs, and AI work component suggestions. |

---

## 8. Work Component Category

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Groups work components into logical business categories for organization and selection. |
| **Business Meaning** | Categories represent how the business thinks about work types (e.g., Civil, Electrical, Plumbing, Interior, Finishing). |
| **Responsibilities** | Classifies work components; enables category-level pricing, reporting, and filtering; provides structure for the work component catalog. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Contains Work Components; is referenced in BOQ grouping; may map to category-level Pricing Rules. |
| **Dependencies** | Depends on Work Component definitions. |
| **Ownership** | Owned by configurational roles. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Category structure changes are versioned; historical estimates retain their category snapshots. |
| **Audit Behaviour** | Category creation and restructuring are audited. |
| **Future Expansion** | Will support category-level margin rules and AI category suggestion. |

---

## 9. Pricing Rule

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Defines a business rule that determines how prices are calculated, adjusted, or applied. |
| **Business Meaning** | A Pricing Rule encodes pricing behaviour (e.g., bulk discount, region adjustment, GST applicability, margin percentage, transport surcharge). |
| **Responsibilities** | Controls how base prices become final prices; defines applicability conditions; determines calculation order. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Applies to Work Components, Pricing Components, Packages, BOQ Items, or Estimates; uses Formulas; is governed by Rule Groups. |
| **Dependencies** | Depends on Formula, Rule Group, and Calculation Context. |
| **Ownership** | Owned by pricing configurators (Admin, Account, Estimator Lead). |
| **Visibility** | Internal only. Cost and pricing rule details are never customer-visible. |
| **Versioning Behaviour** | Pricing Rule changes are versioned; running estimates retain their pricing rule snapshot. |
| **Audit Behaviour** | Every pricing rule activation, modification, and override is audited. |
| **Future Expansion** | Will support AI-optimized pricing rules and market-based pricing suggestions. |

---

## 10. Formula

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Defines a reusable calculation that the Formula Engine evaluates during pricing. |
| **Business Meaning** | A Formula is a configurable calculation (e.g., area-based pricing, slab-rate pricing, composite material+labour pricing) expressed as metadata, not code. |
| **Responsibilities** | Computes values from inputs; participates in pricing and BOQ calculations; is versioned and testable. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Is used by Pricing Rules, BOQ Items, Work Components, and Pricing Components; has Formula Versions; references Calculation Context. |
| **Dependencies** | Depends on Calculation Context and the Formula Engine. |
| **Ownership** | Owned by configurational roles (Formula Builders). |
| **Visibility** | Internal only. |
| **Versioning Behaviour** | Formula has its own version lineage; active formulas are immutable until a new version is validated. |
| **Audit Behaviour** | Formula creation, validation, activation, and use in estimates are audited. |
| **Future Expansion** | Will support AI formula suggestions and no-code formula building. |

---

## 11. Formula Version

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Preserves the historical state of a Formula at each validated milestone. |
| **Business Meaning** | A Formula Version is a frozen snapshot of a formula's definition and test results. |
| **Responsibilities** | Retains formula definition history; ensures estimates using a formula can be traced to the exact version used; enables rollback. |
| **Lifecycle** | Created → Current → Superseded → Archived |
| **Relationships** | Belongs to a Formula; is referenced by Pricing Rules and estimates at calculation time. |
| **Dependencies** | Depends on Formula. |
| **Ownership** | Owned by the Formula Builder. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Formula Versions are immutable once created. |
| **Audit Behaviour** | Version creation and rollback are audited. |
| **Future Expansion** | Will support formula version comparison and AI regression testing. |

---

## 12. Rule

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents a single business rule that governs behaviour within the Estimate Engine. |
| **Business Meaning** | A Rule is a declarative statement of business policy (e.g., "estimates below ₹5 lakh require one approval", "GST applies to all retail customers"). |
| **Responsibilities** | Enforces business policy; validates inputs and outputs; triggers actions; controls estimate and BOQ behaviour. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Belongs to a Rule Group; uses Formulas; applies to Estimates, BOQ Items, Pricing Rules, and Approvals. |
| **Dependencies** | Depends on Rule Group and Calculation Context. |
| **Ownership** | Owned by rule configurators (Admin, Estimator Lead). |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Rule changes are versioned; running estimates retain their rule snapshot. |
| **Audit Behaviour** | Rule activation, invocation, and violations are audited. |
| **Future Expansion** | Will support AI rule suggestions and natural-language rule authoring. |

---

## 13. Rule Group

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Groups related rules into a named policy set. |
| **Business Meaning** | A Rule Group represents a policy domain (e.g., "Estimate Approval Policy", "Discount Policy", "Pricing Policy"). |
| **Responsibilities** | Organizes rules; controls rule precedence; allows groups of rules to be activated or suspended together; supports scoped enforcement. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Contains Rules; is referenced by Estimates, Calculation Contexts, and Simulation runs. |
| **Dependencies** | Depends on Rules. |
| **Ownership** | Owned by rule configurators. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Rule Group membership changes are versioned. |
| **Audit Behaviour** | Rule Group activation and membership changes are audited. |
| **Future Expansion** | Will support customer-specific rule groups. |

---

## 14. BOQ

| Attribute | Description |
|-----------|-------------|
| **Purpose** | The Bill of Quantities is the detailed breakdown of items, quantities, and rates that underpin an Estimate. |
| **Business Meaning** | The BOQ is the technical backbone of the estimate: it lists every item of work, its quantity, unit, rate, and derived amount. |
| **Responsibilities** | Defines the scope of work in measurable terms; is the source of cost calculation; supports versioning and comparison; integrates with packages and work components. |
| **Lifecycle** | Draft → Validated → Approved → Snapshot → Superseded → Archived |
| **Relationships** | Belongs to an Estimate; contains BOQ Items; references Work Components; is evaluated using Pricing Rules and Formulas; is part of Estimate Versions. |
| **Dependencies** | Depends on Estimate, Work Component, Pricing Rule, and Formula. |
| **Ownership** | Owned by the Estimator who prepared it; editable by Estimator and Engineer roles. |
| **Visibility** | Internal; customer-safe BOQ may be visible when shared. |
| **Versioning Behaviour** | BOQ changes are tracked with every estimate version; alternate BOQs can exist for comparison. |
| **Audit Behaviour** | BOQ creation, item changes, and approvals are audited. |
| **Future Expansion** | Will support drawing-import BOQ generation and AI quantity takeoff. |

---

## 15. BOQ Item

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents a single line item in the Bill of Quantities. |
| **Business Meaning** | A BOQ Item is one measurable piece of work (e.g., "Provide and lay 100 sq.ft of vitrified tile flooring"). |
| **Responsibilities** | Captures description, quantity, unit, rate, and amount; references a Work Component when applicable; supports optional/mandatory flags; enables item-level overrides. |
| **Lifecycle** | Added → Priced → Validated → Approved → Locked (in snapshot) |
| **Relationships** | Belongs to a BOQ; references a Work Component; applies Pricing Rules and Formulas. |
| **Dependencies** | Depends on BOQ and Work Component. |
| **Ownership** | Owned by the Estimator; editable within the BOQ lifecycle. |
| **Visibility** | Internal; customer-safe portions visible when BOQ is shared. |
| **Versioning Behaviour** | Item changes roll into BOQ versions; item-level history is retained. |
| **Audit Behaviour** | Item additions, changes, and overrides are audited. |
| **Future Expansion** | Will support item-level linking to vendor quotes and AI item suggestions. |

---

## 16. Approval

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents the formal approval of an Estimate or significant change. |
| **Business Meaning** | An Approval is the recorded business decision that authorizes an estimate to proceed to sharing, conversion, or archival. |
| **Responsibilities** | Captures the approver, decision, reason, and timestamp; enforces separation of duties; triggers downstream actions on approval or rejection. |
| **Lifecycle** | Requested → In Review → Approved / Rejected → (Approved → Completed / Voided) |
| **Relationships** | Applies to an Estimate; contains Approval Stages; references Estimate Versions; is governed by Approval Permissions. |
| **Dependencies** | Depends on Estimate and Approval Stage. |
| **Ownership** | Requested by the Estimate Owner; decided by authorized Approvers. |
| **Visibility** | Internal. Approval decisions are never customer-visible. |
| **Versioning Behaviour** | Approval history is retained per estimate and version. |
| **Audit Behaviour** | Every approval request, decision, and reason is audited. |
| **Future Expansion** | Will support multi-company approvers and AI approval risk scoring. |

---

## 17. Approval Stage

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents one step in a multi-stage approval chain. |
| **Business Meaning** | A Stage defines who must approve in what order (e.g., Estimator Lead → Account → Director for high-value estimates). |
| **Responsibilities** | Defines stage order, required approvers, and value thresholds; tracks stage completion. |
| **Lifecycle** | Pending → In Progress → Completed → Skipped → Cancelled |
| **Relationships** | Belongs to an Approval; recognizes Approver roles; references value thresholds. |
| **Dependencies** | Depends on Approval and the Permission Engine. |
| **Ownership** | Administered by Admin/Account roles. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Approval chain configuration is versioned. |
| **Audit Behaviour** | Stage transitions are audited. |
| **Future Expansion** | Will support dynamic stage assignment. |

---

## 18. Customer

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents the external party for whom estimates are created. |
| **Business Meaning** | A Customer is the recipient of estimates and the counterparty to the commercial offer. |
| **Responsibilities** | Stores business identity and contact information; is the recipient of shared estimates; holds the decision rights on accept/decline. |
| **Lifecycle** | Prospect → Active → Shared With → Customer Decision → Repeat Customer → Inactive |
| **Relationships** | Owns Estimates; is associated with Projects; receives Shares; generates Notifications. |
| **Dependencies** | Depends on the Permission Engine for access. |
| **Ownership** | Created and managed by Sales/Admin. |
| **Visibility** | Internal by default; the customer sees only their own shared estimates. |
| **Versioning Behaviour** | Customer record changes are logged; estimate cost history is never exposed. |
| **Audit Behaviour** | Customer creation, edits, and data access are audited. |
| **Future Expansion** | Will support customer portals, self-service, and tenant-scoped customers. |

---

## 19. Project

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents the physical or business undertaking an estimate may convert into. |
| **Business Meaning** | A Project is the actual construction or service job linked to an accepted estimate. |
| **Responsibilities** | Tracks project identity, location, stage, and status; links estimates to execution; organizes project-level shared data. |
| **Lifecycle** | Identified → Quoted → Won → In Progress → Completed → Closed / Cancelled |
| **Relationships** | Is referenced by Estimates; is associated with a Customer; may group BOQs, Attachments, and Reports. |
| **Dependencies** | Depends on Customer and Estimate (on conversion). |
| **Ownership** | Owned by the responsible Sales/Project role. |
| **Visibility** | Internal; customer-visible during execution per sharing rules. |
| **Versioning Behaviour** | Project state history is tracked; estimates retain their own history. |
| **Audit Behaviour** | Project creation, conversions, and stage changes are audited. |
| **Future Expansion** | Will support full project management, progress tracking, and site docs. |

---

## 20. Share

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents the act and state of sharing an Estimate (or its customer-safe view) with an external party or internal user. |
| **Business Meaning** | A Share is a deliberate, time-bound, revocable exposure of estimate content to a recipient. |
| **Responsibilities** | Controls what is shared, with whom, for how long; tracks access state; enables revocation. |
| **Lifecycle** | Created → Active → Expired / Revoked |
| **Relationships** | Belongs to an Estimate; targets a Customer or Vendor; may generate a public link; produces Notifications. |
| **Dependencies** | Depends on Estimate and the Permission Engine. |
| **Ownership** | Created by the Estimate Owner or sharing-permitted roles. |
| **Visibility** | Shared visibility — only the recipient sees the shared content. |
| **Versioning Behaviour** | Shared content is tied to an Estimate Version snapshot. |
| **Audit Behaviour** | Share creation, access, expiry, and revocation are audited. |
| **Future Expansion** | Will support granular share channels (email, WhatsApp, portal, link). |

---

## 21. Notification

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Communicates business events to users. |
| **Business Meaning** | Notifications keep stakeholders informed (e.g., "Estimate approved", "Customer accepted quote", "Approval is pending on you"). |
| **Responsibilities** | Delivers event information; tracks read/unread state; routes to the right audience via the right channel. |
| **Lifecycle** | Created → Delivered → Read → Dismissed / Expired |
| **Relationships** | Is generated by Estimates, Approvals, Shares, and System Events; is addressed to Users/Roles. |
| **Dependencies** | Depends on the entity that triggered it. |
| **Ownership** | Generated by the system; owned by the recipient. |
| **Visibility** | Recipient-only. |
| **Versioning Behaviour** | Notifications are not versioned; their event source is traceable. |
| **Audit Behaviour** | Notification generation and delivery are logged. |
| **Future Expansion** | Will support SMS, WhatsApp, and email notification channels. |

---

## 22. Attachment

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Stores supporting files linked to estimates, projects, or customers. |
| **Business Meaning** | Attachments carry documentation such as drawings, site photos, client requirements, and signed documents. |
| **Responsibilities** | Preserves supporting evidence; organizes files by entity; controls access per permission. |
| **Lifecycle** | Uploaded → Active → Replaced → Archived |
| **Relationships** | Attaches to Estimates, Projects, Customers, or BOQs. |
| **Dependencies** | Depends on the owning entity. |
| **Ownership** | Uploaded by authorized users; managed by the entity Owner. |
| **Visibility** | Internal; customer-safe attachments may be shared. |
| **Versioning Behaviour** | Attachment revisions are tracked. |
| **Audit Behaviour** | Upload, download, and removal are audited. |
| **Future Expansion** | Will support virus scanning, preview, and AI document extraction. |

---

## 23. Audit Entry

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Records a single auditable event for traceability and compliance. |
| **Business Meaning** | An Audit Entry is the immutable record of "who did what, when, and why". |
| **Responsibilities** | Captures actor, action, entity, timestamp, reason, and before/after values; enables audit trails, compliance, and dispute resolution. |
| **Lifecycle** | Recorded → Retained → Archived (never deleted) |
| **Relationships** | Relates to any business entity (Estimate, Share, Approval, Permission, etc.). |
| **Dependencies** | Depends on the audited entity and the Permission Engine (for read access). |
| **Ownership** | Created by the system; readable by audit-permitted roles. |
| **Visibility** | Audit-only roles (Owner, Admin, Audit). |
| **Versioning Behaviour** | Audit Entries are immutable. |
| **Audit Behaviour** | Audit access itself is audited. |
| **Future Expansion** | Will support audit export, retention policies, and compliance integrations. |

---

## 24. Tag

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Labels entities for classification, search, and reporting. |
| **Business Meaning** | Tags provide flexible, user-defined categorization (e.g., "High Value", "Site Visit Done", "Follow-up Needed"). |
| **Responsibilities** | Enables filtering and search; supports operational reporting; allows flexible grouping. |
| **Lifecycle** | Created → Applied → Removed → Retired |
| **Relationships** | Applies to Estimates, Customers, Projects, Packages, and BOQs. |
| **Dependencies** | Depends on the tagged entity. |
| **Ownership** | Created by any authorized user; managed by Admins. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Tag application history is traceable. |
| **Audit Behaviour** | Tag creation and application are audited. |
| **Future Expansion** | Will support tag-based automation and AI tag suggestions. |

---

## 25. Comment

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Captures conversational notes and discussions attached to business entities. |
| **Business Meaning** | Comments record team discussions, customer feedback, and internal notes. |
| **Responsibilities** | Preserves context around decisions; enables collaboration; supports internal-only vs customer-visible comments. |
| **Lifecycle** | Created → Resolved (optional) → Archived |
| **Relationships** | Attaches to Estimates, Approvals, Customers, and BOQs. |
| **Dependencies** | Depends on the commented entity. |
| **Ownership** | Created by the author; editable by the author; manageable by Admins. |
| **Visibility** | Internal by default; customer-visible only when explicitly marked. |
| **Versioning Behaviour** | Comment edits are traceable. |
| **Audit Behaviour** | Comment creation, edits, and deletion are audited. |
| **Future Expansion** | Will support mentions, threading, and AI summaries. |

---

## 26. History

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Provides a chronological narrative of all changes to an entity. |
| **Business Meaning** | History answers "what happened to this estimate/package/template over time?" in a readable, business-friendly form. |
| **Responsibilities** | Aggregates changes into a timeline; supports user-facing change logs; complements the raw Audit Entry trail. |
| **Lifecycle** | Recorded → Retained → Archived |
| **Relationships** | Relates to any versioned entity. |
| **Dependencies** | Depends on the entity's change events. |
| **Ownership** | System-generated. |
| **Visibility** | Visible to entity viewers per permission. |
| **Versioning Behaviour** | History itself is append-only. |
| **Audit Behaviour** | History generation is derived from audit events. |
| **Future Expansion** | Will support entity timeline visualizations. |

---

## 27. Calculation Context

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Captures the set of inputs and conditions under which a calculation (formula, pricing, BOQ) runs. |
| **Business Meaning** | A Calculation Context is the "world state" at calculation time: customer type, region, date, applicable rules, and input values. |
| **Responsibilities** | Provides inputs to Formulas; ensures calculations are reproducible; captures the environment for audit. |
| **Lifecycle** | Prepared → Evaluated → Completed → Stored (for re-evaluation) |
| **Relationships** | Is consumed by Formulas and Pricing Rules; is produced for Estimates and Simulations. |
| **Dependencies** | Depends on the entity being calculated and the active Rule Groups. |
| **Ownership** | System-generated on demand. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Contexts are retained for reproducibility and comparison. |
| **Audit Behaviour** | Calculation runs and their contexts are audited. |
| **Future Expansion** | Will support AI explanation of calculation results. |

---

## 28. Simulation

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents a what-if run of the Estimate Engine without committing changes. |
| **Business Meaning** | A Simulation lets users test pricing changes, rule changes, or formula changes before applying them (e.g., "what if GST changes to 18%?"). |
| **Responsibilities** | Executes calculations in sandbox mode; produces comparison results; enables safe experimentation. |
| **Lifecycle** | Created → Running → Completed → Compared → Archived |
| **Relationships** | References an Estimate, Formula, Pricing Rule, or BOQ; reuses Calculation Contexts. |
| **Dependencies** | Depends on Formula Engine, Calculation Context, and Rules. |
| **Ownership** | Created by the user running the simulation. |
| **Visibility** | Internal; simulation results are never customer-visible. |
| **Versioning Behaviour** | Simulations are snapshotted; they do not alter the source entity. |
| **Audit Behaviour** | Simulation runs are audited. |
| **Future Expansion** | Will support AI-recommended simulation scenarios. |

---

## 29. Custom Attribute

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Allows businesses to extend entities with their own fields without code changes. |
| **Business Meaning** | Custom Attributes capture business-specific data not predefined by the system (e.g., "Site Difficulty", "Payment Terms Preference"). |
| **Responsibilities** | Extends entities with configurable fields; supports validation, visibility, and optionality per configuration. |
| **Lifecycle** | Defined → Active → Deprecated → Retired |
| **Relationships** | Applies to Estimates, Customers, Projects, Packages, and BOQ Items. |
| **Dependencies** | Depends on the extended entity. |
| **Ownership** | Configured by Admin roles. |
| **Visibility** | Configured per attribute (internal or shared). |
| **Versioning Behaviour** | Attribute definitions and values are versioned. |
| **Audit Behaviour** | Attribute configuration and value changes are audited. |
| **Future Expansion** | Will support attribute-level permissions and AI attribute suggestions. |

---

## 30. Future Extension Entity

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Represents the placeholder scope for entities that will be introduced in future phases. |
| **Business Meaning** | Future Extension Entities anticipate growth areas such as multi-company structures, SaaS tenancy, vendor catalogs, and integrated project management. |
| **Responsibilities** | Ensures the entity model is extensible; defines the rules for introducing new entities without refactoring existing ones. |
| **Lifecycle** | Planned → Defined → Introduced → Active |
| **Relationships** | Will relate to estimates, customers, projects, and permissions as they are introduced. |
| **Dependencies** | Depends on the Permission Engine and Business Entity Model. |
| **Ownership** | Governed by the platform/owner roles. |
| **Visibility** | Determined at introduction time per permission configuration. |
| **Versioning Behaviour** | New entities will follow the versioning patterns defined in Phase 6. |
| **Audit Behaviour** | New entities will be auditable from day one. |
| **Future Expansion** | Enables multi-company, multi-tenant, vendor portals, and AI features without breaking the model. |

---

## 31. Business Domain

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Defines the industry or business domain in which the Estimate Engine operates (e.g., Construction, Interior, Architecture, Renovation, Solar, Furniture, Consultancy, Service Industry). |
| **Business Meaning** | A Business Domain represents the operational context that determines which pricing components, formulas, rules, and templates are relevant. |
| **Responsibilities** | Scopes configuration; selects applicable formulas and rules; defines domain-specific defaults for packages and estimates; ensures the engine remains industry-agnostic. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Scopes Work Components, Pricing Components, Formulas, Rules, Packages, and Estimate Templates. |
| **Dependencies** | Depends on the Business Entity Model and Rule/Formula configurations. |
| **Ownership** | Owned by platform/configurational roles. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Domain configuration changes are versioned; historical estimates retain their domain snapshot. |
| **Audit Behaviour** | Domain creation, activation, and deprecation are audited. |
| **Future Expansion** | Will support multi-domain tenancy and AI domain configuration. |

---

## 32. Rate Card

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Defines the base rates used for pricing work components, materials, or services. |
| **Business Meaning** | A Rate Card is a business-controlled schedule of rates (e.g., per sq.ft plastering rate, per unit labour rate) used by formulas during calculation. |
| **Responsibilities** | Stores base rates; supports regional and time-bound variations; feeds pricing calculations without changing formulas. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Applies to Work Components and Pricing Components; is consumed by Formulas and Pricing Rules; may be scoped to a Business Domain. |
| **Dependencies** | Depends on Work Component / Pricing Component definitions and Formula configuration. |
| **Ownership** | Owned by pricing configurators (Admin, Account, Estimator Lead). |
| **Visibility** | Internal only. |
| **Versioning Behaviour** | Rate Card changes are versioned; running estimates retain rate snapshots. |
| **Audit Behaviour** | Rate creation, edits, and activation are audited. |
| **Future Expansion** | Will support market rate intelligence and vendor-linked rate cards. |

---

## 33. Unit Library

| Attribute | Description |
|-----------|-------------|
| **Purpose** | Provides the standard set of units of measurement used across estimates, BOQ items, and work components. |
| **Business Meaning** | The Unit Library ensures consistent measurement (sq.ft, sq.m, nos, lumpsum, per hour, per day) across the entire engine. |
| **Responsibilities** | Defines standard units; controls unit conversion behaviour; ensures BOQ items and formulas measure consistently. |
| **Lifecycle** | Draft → Validated → Approved → Active → Deprecated → Archived |
| **Relationships** | Is referenced by Work Components, BOQ Items, and Formulas. |
| **Dependencies** | Depends on the entities that use units. |
| **Ownership** | Owned by configurational roles. |
| **Visibility** | Internal. |
| **Versioning Behaviour** | Unit definitions are versioned; historical estimates retain their unit snapshot. |
| **Audit Behaviour** | Unit creation and changes are audited. |
| **Future Expansion** | Will support unit conversion automation and industry-specific unit sets. |

---

## Business Relationships

This section describes the business relationships between entities. These are business relationships, not database relationships.

### Core Estimate Chain

```
Package Template → Package
Estimate Template → Estimate
Estimate → Estimate Version → Estimate Revision
Estimate → BOQ → BOQ Item
Estimate → Approval → Approval Stage
Estimate → Project → Customer
```

### Detailed Business Relationships

| From | Relationship | To | Business Meaning |
|------|--------------|----|------------------|
| **Estimate** | belongs to | **Customer** | An estimate is always created for a customer. |
| **Estimate** | may convert to | **Project** | An accepted estimate becomes a project. |
| **Estimate** | uses | **Package** | An estimate is built from a package offering. |
| **Estimate** | contains | **BOQ** | An estimate is backed by one or more BOQs. |
| **Estimate** | has many | **Estimate Version** | Milestones are snapshotted as versions. |
| **Estimate** | requires | **Approval** | Estimates go through formal approval. |
| **Estimate** | is shared via | **Share** | Estimates reach customers through shares. |
| **Estimate** | generates | **Notification** | Estimate events notify stakeholders. |
| **Estimate** | carries | **Attachment** | Supporting documents attach to estimates. |
| **Estimate** | carries | **Tag** | Estimates are labeled for search. |
| **Estimate** | hosts | **Comment** | Discussions happen on estimates. |
| **Estimate Version** | is created from | **Estimate Revision** | Revisions accumulate into versions. |
| **Estimate Template** | instantiates | **Estimate** | Templates create consistent estimates. |
| **Package** | derives from | **Package Template** | Packages follow a family structure. |
| **Package** | contains | **Work Component** | Packages bundle work components. |
| **Work Component** | belongs to | **Work Component Category** | Work components are organized by category. |
| **Package** | is priced by | **Pricing Rule** | Pricing rules determine package prices. |
| **Pricing Rule** | uses | **Formula** | Rules execute via formulas. |
| **Formula** | has | **Formula Version** | Formulas evolve through versions. |
| **Rule** | belongs to | **Rule Group** | Rules are grouped into policies. |
| **BOQ** | contains | **BOQ Item** | BOQs list measurable items. |
| **BOQ Item** | references | **Work Component** | Items may map to catalog work components. |
| **BOQ Item** | applies | **Pricing Rule** | Items are priced through rules. |
| **Project** | belongs to | **Customer** | Projects are delivered for customers. |
| **Project** | groups | **Estimate** | Multiple estimates may feed one project. |
| **Share** | targets | **Customer** | Shares are addressed to customers. |
| **Approval** | stages through | **Approval Stage** | Approvals pass through ordered stages. |
| **Simulation** | reuses | **Calculation Context** | Simulations replay calculation conditions. |
| **Calculation Context** | feeds | **Formula** | Formulas receive inputs from context. |
| **Audit Entry** | records | **Any Entity** | All entities produce audit events. |
| **History** | narrates | **Any Entity** | History is the readable timeline of an entity. |
| **Custom Attribute** | extends | **Estimate / Customer / Project / Package / BOQ Item** | Entities gain business-specific fields. |
| **Business Domain** | scopes | **Package / Work Component / Formula / Rule** | Domains define industry-specific configuration. |
| **Rate Card** | prices | **Work Component / Pricing Component** | Rate cards define base rates for pricing. |
| **Unit Library** | measures | **BOQ Item / Work Component** | Units standardize measurement across the engine. |

### Relationship Principles

- Every entity has a clear parent-child or peer relationship defined in business terms.
- Versioned entities relate to their source entity as snapshots, never as live mutable copies.
- External-facing relationships (Customer, Share) are always mediated by the Permission Engine.
- Future entities must respect these relationship patterns to remain pluggable.

---

## Entity Ownership

This section defines who owns, edits, and archives each entity.

| Entity | Owned By | May Edit | May Archive |
|--------|----------|----------|-------------|
| **Estimate** | Creator (Sales/Estimator) | Owner + Estimator/Engineer per permission | Admin, lifecycle-permission holders |
| **Estimate Version** | Estimate Owner | No one (immutable after creation) | Admin |
| **Estimate Revision** | Authoring user | Estimate Owner + authorized editors | Admin |
| **Estimate Template** | Configurational role (Estimator Lead/Admin) | Template managers | Admin |
| **Package** | Admin / Sales / Estimator per permission | Package managers | Admin |
| **Package Template** | Configurational role | Template managers | Admin |
| **Work Component** | Estimator / Configurator | Component managers | Admin |
| **Work Component Category** | Configurational role | Configurators | Admin |
| **Pricing Rule** | Pricing configurator (Admin/Account) | Pricing managers | Admin |
| **Formula** | Formula Builder | Formula Builders | Admin |
| **Formula Version** | Formula Builder | No one (immutable) | Admin |
| **Rule** | Rule configurator | Rule managers | Admin |
| **Rule Group** | Rule configurator | Rule managers | Admin |
| **BOQ** | Estimator | Estimator + Engineer per permission | Admin |
| **BOQ Item** | Estimator | Estimator within BOQ lifecycle | Admin |
| **Approval** | Estimate Owner (requester) | Approvers (decision) | Admin |
| **Approval Stage** | Admin/Account | Admin | Admin |
| **Customer** | Sales / Admin | Sales + Admin | Admin |
| **Project** | Sales / Project role | Project managers | Admin |
| **Share** | Estimate Owner / sharer | Owner + Admin | Admin |
| **Notification** | System (generated); recipient (read state) | Recipient (read/dismiss) | System |
| **Attachment** | Uploader | Entity Owner + Admin | Admin |
| **Audit Entry** | System | No one (immutable) | Retention policy |
| **Tag** | Creating user | Admin | Admin |
| **Comment** | Author | Author + Admin | Admin |
| **History** | System | No one (append-only) | Retention policy |
| **Calculation Context** | System | No one | Retention policy |
| **Simulation** | User who ran it | Owner | Admin |
| **Custom Attribute** | Admin (definition) | Admin | Admin |
| **Business Domain** | Platform configurators | Domain managers | Admin |
| **Rate Card** | Pricing configurator | Pricing managers | Admin |
| **Unit Library** | Configurational role | Unit managers | Admin |
| **Future Extension Entity** | Governed at introduction | Per permission | Per permission |

### Ownership Principles

- Ownership always starts with the creator.
- Ownership never grants approval rights over one's own work (separation of duties).
- Archival is always a privileged action performed by lifecycle-permission holders.
- No entity can be permanently deleted when audit or history exists; archival is the terminal state.

---

## Entity Visibility

This section defines the visibility states for each entity.

### Visibility States

| State | Meaning |
|-------|---------|
| **Internal** | Visible only to authorized internal users (per Permission Engine). |
| **Customer** | Visible to the customer via a Share or customer portal. |
| **Shared** | Visible to a specific recipient (customer, vendor, or internal user) via a Share. |
| **Private** | Visible only to the Owner and explicitly granted users. |
| **Archived** | Removed from active views; visible only through archival access. |

### Entity Visibility Matrix

| Entity | Internal | Customer | Shared | Private | Archived |
|--------|----------|----------|--------|---------|----------|
| **Estimate** | ✅ | ⚠️ (customer-safe view) | ✅ | ✅ | ✅ |
| **Estimate Version** | ✅ | ⚠️ (shared snapshot) | ✅ | ✅ | ✅ |
| **Estimate Revision** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Estimate Template** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Package** | ✅ | ⚠️ (published packages) | ✅ | ✅ | ✅ |
| **Package Template** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Work Component** | ✅ | ❌ | ⚠️ (vendor share) | ✅ | ✅ |
| **Work Component Category** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Pricing Rule** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Formula** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Formula Version** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Rule** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Rule Group** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **BOQ** | ✅ | ⚠️ (customer-safe) | ⚠️ | ✅ | ✅ |
| **BOQ Item** | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| **Approval** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Approval Stage** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Customer** | ✅ | ⚠️ (own record) | ⚠️ | ✅ | ✅ |
| **Project** | ✅ | ⚠️ (execution visibility) | ⚠️ | ✅ | ✅ |
| **Share** | ✅ | ⚠️ (recipient view) | ✅ | ❌ | ✅ |
| **Notification** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Attachment** | ✅ | ⚠️ (customer-safe) | ⚠️ | ✅ | ✅ |
| **Audit Entry** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Tag** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Comment** | ✅ | ⚠️ (customer-safe) | ⚠️ | ✅ | ✅ |
| **History** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Calculation Context** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Simulation** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Custom Attribute** | ✅ | ⚠️ (per configuration) | ⚠️ | ✅ | ✅ |
| **Business Domain** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Rate Card** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Unit Library** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Future Extension Entity** | ✅ | Per configuration | Per configuration | ✅ | ✅ |

### Visibility Principles

- **Internal** is the default visibility for all entities.
- **Customer** visibility is always a subset of the internal view — never exposes cost, margin, or internal notes.
- **Shared** visibility is always time-bound and revocable.
- **Private** visibility protects drafts and personal working state.
- **Archived** entities are never deleted; they remain recoverable under permission.
- External parties never see formulas, pricing rules, margins, costs