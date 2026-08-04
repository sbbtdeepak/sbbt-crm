# PRD-02

## SBBT Estimate Engine

---

## Purpose

The SBBT Estimate Engine is a standalone, reusable, domain-agnostic estimation product that generates accurate construction quotations for Shree Badree Build Tech Pvt Ltd (SBBT). It produces estimates based on construction packages, material selections, quantity takeoffs (Bill of Quantities), labor costs, location-based pricing, taxes, and discount rules.

This document serves as the **Master Index** for the multi-document PRD-02 specification. It tracks the status, progress, and location of each phase document.

---

## Document Status

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 (Business Blueprint) | `PRD-02-Estimate-Engine.md` (Sections 1-20) | ✅ Completed |
| Phase 2 (Module Design) | `PRD-02-Estimate-Engine.md` (Sections 15-20) | ✅ Completed |
| Phase 3 (Workflows) | `PRD-02-Estimate-Engine.md` (Sections 21-30) | ✅ Completed |
| Phase 4 (Pricing Engine) | `PRD-02-Estimate-Engine.md` (Sections 31-40) | ✅ Completed |
| Phase 5 (BOQ Engine) | `PRD-02-Estimate-Engine/05-BOQ.md` | ✅ Completed |
| Phase 6 (Version Control) | `PRD-02-Estimate-Engine/06-Version-Control.md` | ✅ Completed |
| Phase 7 (Formula Engine) | `PRD-02-Estimate-Engine/07-Formula-Engine.md` | ✅ Completed |
| Phase 8 (Permission Engine) | `PRD-02-Estimate-Engine/08-Permission-Engine.md` | ✅ Completed |
| Phase 9 (Business Entity Model) | `PRD-02-Estimate-Engine/09-Business-Entity-Model.md` | ✅ Completed |
| Phase 10A (Logical Data Model) | `PRD-02-Estimate-Engine/10A-Logical-Data-Model.md` | ✅ Completed |
| Phase 10B (Database Design) | `PRD-02-Estimate-Engine/10B-Database-Design.md` | ✅ Completed |
| Phase 10C (API Specification) | `PRD-02-Estimate-Engine/10C-API-Specification.md` | ✅ Completed |
| Phase 10D (UI/UX) | `PRD-02-Estimate-Engine/10D-UI-UX.md` | ✅ Completed |
| Phase 10E (Technical Architecture) | `PRD-02-Estimate-Engine/10E-Technical-Architecture.md` | ✅ Completed |
| Phase 10F (Final Technical Review) | `PRD-02-Estimate-Engine/10F-Technical-Review.md` | ✅ Completed |

---

## Current Phase

**Phase 10 (Technical Design Pack)** — Completed. The Phase 10 documentation suite has been fully written. Specification now covers the complete technical design package: Logical Data Model, Database Design, API Specification, UI/UX, Technical Architecture, and Final Technical Review. The overall technical score is 9.1 / 10 with implementation-ready status.

All 10 phases of the PRD-02 Estimate Engine specification are now complete.

---

## Document Map

### 01-Business.md (Pending)

**Status:** ⏳ Pending (content currently in `PRD-02-Estimate-Engine.md`, Sections 1-14)

**Description:** Business Blueprint — Vision, Mission, Goals, Problems, Scope, Stakeholders, Workflow, Success Metrics, Risks, Assumptions, Open Questions, PRD Roadmap.

**Line Count:** N/A (pending split from monolithic file)

---

### 02-Modules.md (Pending)

**Status:** ⏳ Pending (content currently in `PRD-02-Estimate-Engine.md`, Sections 15-20)

**Description:** Functional Module Design — 20 module specifications, module relationships, reusable components, business rules, and future expansion opportunities.

**Line Count:** N/A (pending split from monolithic file)

---

### 03-Workflows.md (Pending)

**Status:** ⏳ Pending (content currently in `PRD-02-Estimate-Engine.md`, Sections 21-30)

**Description:** Business Workflows — 11 estimate lifecycle states, creation workflow, revision workflow, approval workflow, sharing workflow, customer decision workflow, expiry workflow, business event timeline, notifications, and audit requirements.

**Line Count:** N/A (pending split from monolithic file)

---

### 04-Pricing.md (Pending)

**Status:** ⏳ Pending (content currently in `PRD-02-Estimate-Engine.md`, Sections 31-40)

**Description:** Pricing Engine — Pricing philosophy, pricing components (metadata-driven), pricing rules, package pricing behaviour, material pricing behaviour, labour pricing behaviour, discount behaviour, tax behaviour, manual overrides, and calculation order.

**Line Count:** N/A (pending split from monolithic file)

---

### 05-BOQ.md

**Status:** ✅ Completed

**Description:** Bill of Quantities Engine — BOQ philosophy, objectives, lifecycle, types, categories, item behaviour, component library integration, package integration, estimate integration, version behaviour, editable vs locked items, optional items, mandatory items, auto-generated items, manual items, cost roll-up behaviour, quantity rules, unit rules, future AI BOQ, and future drawing import.

**Line Count:** ~680 lines

---

### 06-Version-Control.md

**Status:** ✅ Completed

**Description:** Version Control — Versioning philosophy, lifecycle, numbering strategy, revision behaviour, approval history, change tracking, comparison behaviour, rollback behaviour, restore behaviour, branch behaviour, merge behaviour, archive behaviour, retention policy, customer-visible versions, internal versions, audit integration, and future expansion.

**Line Count:** ~780 lines

---

### 07-Formula-Engine.md

**Status:** ✅ Completed

**Description:** Formula Engine & Business Rule Engine — Formula philosophy, rule engine philosophy, component engine, formula lifecycle, formula categories, rule categories, conditional rules, dependency rules, component relationships, formula priority, override behaviour, formula validation, formula testing, formula versioning, formula templates, dynamic formula selection, formula audit, formula simulation, future AI formula suggestions, and future no-code formula builder.

**Line Count:** ~1,387 lines

---

### 08-Permission-Engine.md

**Status:** ✅ Completed

**Description:** Permission & Access Control Engine — Permission philosophy, permission architecture (RBAC + ABAC + Future PBAC), roles, permission categories, resource categories, action categories, permission matrix, role hierarchy, delegation rules, temporary permissions, approval permissions, override permissions, ownership rules, sharing rules, audit permissions, security principles, future SSO, future multi-company, future SaaS tenant isolation, and future AI permission suggestions.

**Line Count:** ~1,000 lines

---

### 09-Business-Entity-Model.md

**Status:** ✅ Completed

**Description:** Business Entity Model — 30 business entities (Estimate, Estimate Version, Estimate Revision, Estimate Template, Package, Package Template, Component, Component Category, Pricing Rule, Formula, Formula Version, Rule, Rule Group, BOQ, BOQ Item, Approval, Approval Stage, Customer, Project, Share, Notification, Attachment, Audit Entry, Tag, Comment, History, Calculation Context, Simulation, Custom Attribute, Future Extension Entity), each with Purpose, Business Meaning, Responsibilities, Lifecycle, Relationships, Dependencies, Ownership, Visibility, Versioning Behaviour, Audit Behaviour, and Future Expansion. Dedicated sections for Business Relationships, Entity Ownership, and Entity Visibility.

**Line Count:** ~1,000+ lines

---

### 10A-Logical-Data-Model.md

**Status:** ✅ Completed

**Description:** Logical Data Model — Logical model philosophy, entity groups, entity relationships (logical only), aggregate roots, ownership model, state ownership, entity lifecycles, domain boundaries, configuration entities, transactional entities, reference entities, metadata entities, versioned entities, shared entities, cross domain relationships, and future extensibility.

**Line Count:** ~300 lines

---

### 10B-Database-Design.md

**Status:** ✅ Completed

**Description:** Database Design (Supabase/PostgreSQL) — Entity to table mapping, schemas, tables, columns, primary keys, foreign keys, indexes, unique constraints, check constraints, views, materialized views, RLS strategy, audit tables, history tables, version tables, soft delete, archiving, migration strategy, performance strategy, future partitioning, and naming standards.

**Line Count:** ~400 lines

---

### 10C-API-Specification.md

**Status:** ✅ Completed

**Description:** API Specification (REST) — REST API, authentication, authorization, endpoints, resources, methods, payloads, responses, errors, pagination, filtering, sorting, bulk APIs, approval APIs, formula APIs, pricing APIs, version APIs, BOQ APIs, export APIs, import APIs, audit APIs, and validation.

**Line Count:** ~350 lines

---

### 10D-UI-UX.md

**Status:** ✅ Completed

**Description:** UI/UX Specification — Information architecture, navigation, dashboard, estimate builder, pricing screen, formula builder, BOQ screen, version screen, approval screen, share screen, settings, responsive behaviour, accessibility, future mobile, and design system.

**Line Count:** ~400 lines

---

### 10E-Technical-Architecture.md

**Status:** ✅ Completed

**Description:** Technical Architecture — Application layers, module boundaries, folder structure, services, repositories, engine interaction, caching, events, background jobs, file storage, logging, monitoring, configuration, deployment, scalability, and future microservices.

**Line Count:** ~300 lines

---

### 10F-Technical-Review.md

**Status:** ✅ Completed

**Description:** Final Technical Review Report — Review of all Phase 10 documents, validation of duplicates, conflicts, dependencies, naming, and missing relationships. Includes Technical Score (9.1/10), Implementation Readiness, Risk Assessment, and Final Recommendation (Approved for Implementation).

**Line Count:** ~200 lines

---

## Overall Documentation Progress

```
Phase 1 ✅ — Business Blueprint Complete
Phase 2 ✅ — Functional Modules Complete
Phase 3 ✅ — Workflows Complete
Phase 4 ✅ — Pricing Engine Complete
Phase 5 ✅ — BOQ Engine Complete
Phase 6 ✅ — Version Control Complete
Phase 7 ✅ — Formula Engine Complete
Phase 8 ✅ — Permission Engine Complete
Phase 9 ✅ — Business Entity Model Complete
Phase 10 ✅ — Technical Design Pack Complete
```

### Completion Summary

| Metric | Value |
|--------|-------|
| Phases Started | 10 of 10 |
| Phases Completed | 10 of 10 |
| Phases Pending | 0 of 10 |
| Total Sections Written | 191 (Sections 1-40 in monolithic file + Sections 1-20 in 05-BOQ.md + Sections 1-17 in 06-Version-Control.md + Sections 1-20 in 07-Formula-Engine.md + Sections 1-20 in 08-Permission-Engine.md + 30 entities + 3 dedicated sections in 09-Business-Entity-Model.md + 16 sections in 10A + 20 sections in 10B + 22 sections in 10C + 16 sections in 10D + 17 sections in 10E + 7 sections in 10F) |
| Total Estimated Lines | ~9,100 lines across all documents |

---

## Document References

### Primary Specification Document

- **`docs/PRD-02-Estimate-Engine.md`** — Contains Phases 1-4 (Sections 1-40). This is the original monolithic specification document covering Business Blueprint, Functional Modules, Workflows, and Pricing Engine.

### Multi-Document Specification

- **`docs/PRD-02-Estimate-Engine/05-BOQ.md`** — Phase 5: BOQ Engine design (20 sections)
- **`docs/PRD-02-Estimate-Engine/06-Version-Control.md`** — Phase 6: Version Control design (17 sections)
- **`docs/PRD-02-Estimate-Engine/07-Formula-Engine.md`** — Phase 7: Formula Engine & Business Rule Engine design (20 sections)
- **`docs/PRD-02-Estimate-Engine/08-Permission-Engine.md`** — Phase 8: Permission & Access Control Engine design (20 sections)
- **`docs/PRD-02-Estimate-Engine/09-Business-Entity-Model.md`** — Phase 9: Business Entity Model design (30 entities + 3 dedicated sections)
- **`docs/PRD-02-Estimate-Engine/10A-Logical-Data-Model.md`** — Phase 10A: Logical Data Model design (16 sections)
- **`docs/PRD-02-Estimate-Engine/10B-Database-Design.md`** — Phase 10B: Database Design — Supabase/PostgreSQL architecture (20 sections)
- **`docs/PRD-02-Estimate-Engine/10C-API-Specification.md`** — Phase 10C: API Specification — REST (22 sections)
- **`docs/PRD-02-Estimate-Engine/10D-UI-UX.md`** — Phase 10D: UI/UX Specification (16 sections)
- **`docs/PRD-02-Estimate-Engine/10E-Technical-Architecture.md`** — Phase 10E: Technical Architecture (17 sections)
- **`docs/PRD-02-Estimate-Engine/10F-Technical-Review.md`** — Phase 10F: Final Technical Review Report (7 sections)

---

*End of Document*