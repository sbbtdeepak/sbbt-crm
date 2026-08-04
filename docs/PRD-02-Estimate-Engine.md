# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02  
**Title:** SBBT Estimate Engine — Standalone Reusable Estimation Product  
**Version:** 2.0  
**Date:** August 2026  
**Author:** AI Software Architect  
**Status:** Phase 2 (Module Design)  

---

## 1. Executive Summary

The SBBT Estimate Engine is a completely independent, reusable enterprise-grade estimation product designed to generate accurate, consistent, and professional construction quotations for Shree Badree Build Tech Pvt Ltd (SBBT).

Unlike a feature module embedded within the CRM, this engine is architected as a standalone business product capable of serving SBBT for 10+ years and scaling to support multi-tenant, multi-company operations. It produces estimates based on construction packages, material selections, quantity takeoffs (Bill of Quantities), labor costs, location-based pricing, taxes, and discount rules.

The Estimate Engine operates independently of any specific frontend, backend, or database system. It exposes well-defined integration points that allow future systems to consume its capabilities:

- **Website** — Generate quotations from public quote requests
- **CRM** — Attach quotations to leads and customer profiles (PRD-03)
- **ERP** — Sync estimate data with costing, inventory, and procurement (PRD-04)
- **Customer Portal** — Present estimates to customers for review (PRD-05)
- **Mobile App** — Access estimates on-site (PRD-07)
- **Sales App** — Create and present estimates during sales visits (future)
- **Interior Platform** — Generate interior-specific estimates (future)
- **Future SaaS Platform** — Multi-tenant estimate generation (PRD-08)

This document covers Phase 1 (Business Blueprint) and Phase 2 (Functional Module Design) of PRD-02. Phase 1 defines the business vision, scope, stakeholders, workflow, and risks. Phase 2 defines the functional modules, their specifications, relationships, reusable components, business rules, and future expansion opportunities. No technical design, database schema, API definitions, UI layouts, or calculation logic are included in this document.

---

## 2. Vision

Create the definitive estimation engine for the Indian construction industry — a standalone, reusable, and intelligent platform that transforms how construction companies generate accurate quotations at scale.

The SBBT Estimate Engine will:
- Deliver pricing accuracy within ±1% of actual costs
- Reduce quotation turnaround time from days to minutes
- Eliminate human calculation errors through automated computation
- Support all construction domains (residential, commercial, interior, renovation, villa, farmhouse)
- Scale to serve multi-company, multi-tenant SaaS deployments
- Integrate seamlessly with any downstream system via standardized interfaces

This engine is designed to be the single source of truth for all pricing and estimation across SBBT's entire product ecosystem, serving the company for 10+ years as it expands from a single construction company into a multi-tenant SaaS platform.

---

## 3. Mission

Build a reusable, domain-agnostic estimation engine that enables any construction business to generate professional, accurate, and consistent quotations through a combination of package-based pricing, material takeoffs, labor costing, location-based multipliers, tax calculations, and discount rules — delivered as a standalone product that any SBBT system can consume.

---

## 4. Business Goals

| ID | Goal | Target | Measurement |
|----|------|--------|-------------|
| BG-001 | Eliminate manual quotation creation time | From 2–3 days to under 5 minutes | Average time from lead to first estimate |
| BG-002 | Ensure pricing consistency across all channels | 0 pricing discrepancies between estimates | Audit of estimate vs. final project cost variance |
| BG-003 | Improve sales win rate | Increase quoted-to-won ratio by 15% | Win rate tracking over 3 months |
| BG-004 | Reduce rework from estimation errors | 80% reduction in estimate revision requests | Count of revision requests per month |
| BG-005 | Enable non-estimator staff to generate estimates | Sales team can produce estimates without estimator involvement | Time to first estimate by role |
| BG-006 | Support scalable growth into new domains | Add new business domain (e.g., interior, renovation) within 2 weeks | Time to onboard new domain |
| BG-007 | Provide audit trail for all estimate changes | 100% traceability of every modification | Audit log completeness |
| BG-008 | Enable future multi-tenant SaaS deployment | Single engine serves 100+ companies | Concurrent estimate throughput |

---

## 5. Problems this Engine Solves

| ID | Problem | Current State | Impact of Engine |
|----|---------|---------------|-------------------|
| P-001 | Manual quotation creation | Estimators build quotes from spreadsheets, manually summing materials, labor, taxes | Automated package + BOQ + tax calculation produces a complete quote in minutes |
| P-002 | Pricing inconsistency | Different estimators apply different rates, markups, or tax rules for the same project | Centralized pricing rules ensure every estimate uses identical logic |
| P-003 | Package management complexity | Packages are siloed in spreadsheets; difficult to version and update | Centralized package repository with version control and inheritance |
| P-004 | Revision management | Old quote versions circulate via email; no audit trail | Built-in version control with approval history and restore capability |
| P-005 | BOQ generation | Bill of Quantities is manually compiled from drawings and notes | Engine generates BOQ directly from package and material selections |
| P-006 | Human calculation errors | Manual addition, multiplication, and tax application lead to errors | Automated calculations eliminate arithmetic mistakes |
| P-007 | Sales delays | Customers wait days for revised quotes | Real-time calculation enables instant quote generation and revision |
| P-008 | Geographic pricing rigidity | No mechanism to adjust for location-based material or labor cost differences | Location-based multipliers automatically adjust pricing per region |
| P-009 | No approval governance | Estimates are shared without formal approval process | Structured approval workflow with digital signatures and audit trail |
| P-010 | Integration fragmentation | Each system (CMS, CRM, ERP) calculates prices independently | Single engine ensures all systems consume identical pricing logic |

---

## 6. Business Scope

### Current Scope

The Estimate Engine Phase 1 scope includes:

| Capability | Description |
|------------|-------------|
| Package-based estimation | Generate estimates from predefined construction packages (Solid, Essential, Premium, Luxury) |
| Material selection | Choose materials from a centralized catalog with per-material pricing |
| BOQ generation | Automatically produce a Bill of Quantities from selected packages and materials |
| Calculation engine | Compute totals, subtotals, taxes (GST), discounts, and final amounts |
| Location-based pricing | Apply regional multipliers to materials and labor |
| Version control | Maintain estimate history with ability to restore previous versions |
| Approval workflow | Route estimates through review and approval before finalization |
| Sharing mechanism | Distribute final estimates to customers and internal stakeholders |
| PDF generation | Produce branded PDF quotations with terms, conditions, and signatures |
| Audit trail | Log all estimate creation, modification, and approval events |

### Future Scope

Features to be designed after approval of Phase 1 blueprint:

| Capability | Future PRD Phase |
|------------|-----------------|
| Custom estimate templates | Phase 2 |
| Dynamic package creation | Phase 2 |
| Real-time material pricing API integration | Phase 2 |
| AI-powered cost prediction | Phase 3 |
| Voice-based estimate creation | Phase 3 |
| 3D estimate visualization | Phase 3 |
| Auto BOQ from drawings (image/DWG import) | Phase 3 |
| Tender generation from estimates | Phase 3 |
| Multi-currency and exchange rate handling | Phase 4 |
| Advanced negotiation and multi-round discounting | Phase 4 |

### Out of Scope

The following are explicitly **not** part of the Estimate Engine and belong to other products:

- Invoice generation or billing (belongs to ERP / PRD-04)
- Project execution tracking (belongs to CRM / PRD-03)
- Customer self-service portal (belongs to Customer Portal / PRD-05)
- Inventory procurement workflows (belongs to ERP / PRD-04)
- Vendor management and supplier pricing (belongs to Vendor Portal / PRD-06)
- Mobile application UI (belongs to Mobile App / PRD-07)
- Authentication system design (consumes external auth; does not implement it)
- Database schema design (deferred to Phase 2)
- API endpoint definitions (deferred to Phase 2)
- UI/UX component design (deferred to Phase 3)

[ASSUMPTION] The Estimate Engine will consume authentication and user context from external systems (e.g., SBBT's existing auth flows from PRD-01). It does not own identity management.

---

## 7. Supported Business Domains

### Current Domains

| Domain | Description | Key Considerations |
|--------|-------------|-------------------|
| Residential Construction | Single-family homes, apartment complexes | Standard room counts, fixed per-sqft rates |
| Commercial Construction | Office buildings, retail spaces, showrooms | Larger scale, different material grades |
| Interior | Interior design and fit-out work | Premium materials, decorative elements, finishing |
| Renovation | Remodeling existing spaces | Demolition and reuse factors, variable scope |
| Villa | Large standalone residential properties | High-end materials, landscaping, multiple floors |
| Farm House | Rural or semi-rural residential properties | Different material availability, transportation costs |
| Custom Projects | Non-standard project types with bespoke requirements | Flexible package structure, manual BOQ entry |

### Future Domains

| Domain | Description |
|--------|-------------|
| Industrial Construction | Factories, warehouses |
| Hospital / Healthcare | Specialized construction with hygiene requirements |
| Educational | Schools, colleges, universities |
| Hospitality | Hotels, restaurants, resorts |
| Retail Chain | Multi-location standard builds |
| Infrastructure | Roads, bridges, utilities |

[ASSUMPTION] Each domain will have its own material catalog, labor rate table, and standard package templates. The engine must support domain-specific configuration without code changes.

[OPEN DECISION] Should each business domain have its own isolated pricing database, or should all domains share a single unified catalog with domain filters?

---

## 8. Stakeholders

### 8.1 Internal Stakeholders

| Role | Description | Key Needs |
|------|-------------|-----------|
| **Owner** | Business owner / Managing Director of SBBT | Overall pricing strategy, profit margins, brand consistency |
| **Sales** | Sales representatives and sales managers | Fast quote generation, easy package selection, customer-facing outputs |
| **Estimator** | Professional quantity surveyors and cost estimators | Accurate BOQ, material takeoffs, custom package creation |
| **Engineer** | Structural and construction engineers | Technical accuracy, material specifications, compliance with standards |
| **Accounts** | Finance and accounting team | Tax compliance, profitability analysis, audit trail |
| **Management** | Operations and project managers | Visibility into quoting activity, performance metrics, team productivity |

### 8.2 External Stakeholders

| Role | Description | Key Needs |
|------|-------------|-----------|
| **Customer** | End client receiving the quotation | Clear, professional, branded estimate document |
| **Architect** | Design professionals providing drawings | Accurate material takeoffs from drawings |
| **Contractor** | Third-party contractors executing work | Detailed BOQ and specifications |
| **Supplier** | Material vendors | Material quantities and specifications for procurement |

### 8.3 Future API Consumers

| System | Role | Integration Type |
|--------|------|-------------------|
| Website (PRD-01) | Submit quote requests to the engine | REST/gRPC API |
| CRM (PRD-03) | Attach estimates to leads and customer profiles | REST/gRPC API |
| ERP (PRD-04) | Sync estimates with costing and procurement | Event-driven / Message queue |
| Customer Portal (PRD-05) | Display estimates to customers | Read-only API |
| Mobile App (PRD-07) | Access and generate estimates on-site | REST/gRPC API |
| Interior Platform | Generate interior-specific estimates | Domain plugin / API |
| SaaS Platform (PRD-08) | Multi-tenant estimate generation | Multi-tenant API |

[OPEN DECISION] Should the Estimate Engine expose a single unified API for all consumers, or domain-specific APIs (e.g., a Sales API, a CRM API, an ERP API)?

---

## 9. High Level Workflow

The Estimate Engine follows a structured workflow from initial lead inquiry through final customer delivery and project handoff.

```
Lead
  ↓
Estimate
  ↓
Package
  ↓
Calculation
  ↓
Review
  ↓
Approval
  ↓
Share
  ↓
Customer
  ↓
Project
```

### 9.1 Workflow Step Details

**Step 1: Lead**
A lead is identified — either from the public website quote form, CRM entry, or manual creation. The lead includes basic information: contact details, project type, location, and initial scope description.

**Step 2: Estimate**
An estimator or sales representative creates a new estimate record in the engine. The estimate is initialized with lead context, business domain, location, and currency.

**Step 3: Package**
A construction package is selected (Solid, Essential, Premium, Luxury, or Custom). The package auto-populates a base set of materials, labor items, and specifications. The package can be customized: items added, removed, or modified.

**Step 4: Calculation**
The engine performs automated calculations:
- Material costs (quantity × unit rate)
- Labor costs (based on labor type and hours)
- Floor-level calculations (per-floor or per-sqft rates)
- Area-based adjustments (built-up area multipliers)
- Location-based multipliers (regional material and labor cost adjustments)
- GST tax calculation (multi-tier tax rates based on material/labor classification)
- Discount application (percentage or fixed amount)
- Offer application (promotional discounts)
- Round-off rules (configured rounding precision)

All calculations are logged with full auditability.

**Step 5: Review**
The estimate is reviewed by a second party (e.g., engineer or senior estimator). Comments and change suggestions are recorded. The estimate status transitions to "In Review."

**Step 6: Approval**
An authorized approver (e.g., project manager or owner) reviews the estimate and either approves or requests changes. The approval includes a digital signature or confirmation action. The estimate status transitions to "Approved."

**Step 7: Share**
The approved estimate is shared with the customer via email, WhatsApp, or download link. The engine generates a branded PDF and tracks delivery status.

**Step 8: Customer**
The customer receives the estimate, reviews it, and provides feedback. Feedback may include acceptances, rejections, or requests for revision. The customer interaction is logged.

**Step 9: Project**
Upon customer acceptance, the estimate is converted to a project entry (in the CRM or ERP system via integration). The estimate becomes the baseline for project costing and execution tracking.

[ASSUMPTION] Each workflow step is a distinct state with well-defined transitions. The engine enforces state transition rules (e.g., an estimate cannot be "Shared" before it is "Approved").

[OPEN DECISION] Should revision cycles (customer requests changes, estimate is revised and re-approved) be modeled as a loop within the workflow, or as separate estimate versions with a parent-child relationship?

---

## 10. Business Success Metrics

| Metric | Definition | Target | Measurement Frequency |
|--------|-----------|--------|----------------------|
| Quotation Turnaround Time | Time from lead creation to first estimate delivery | < 5 minutes | Daily |
| Pricing Accuracy | Variance between estimated and actual project cost | ±1% | Post-project |
| Estimate Revision Rate | Percentage of estimates requiring revisions before approval | < 5% | Monthly |
| Win Rate Improvement | Increase in quoted-to-won ratio after engine adoption | +15% | Monthly |
| Sales Self-Service Rate | Percentage of estimates created by non-estimator roles | > 50% | Monthly |
| Calculation Error Rate | Percentage of manual correction requests after automation | 0% | Weekly |
| Approval Cycle Time | Average time from estimate creation to approval | < 2 hours | Weekly |
| Multi-Domain Coverage | Number of business domains supported | 7 (current) → 10+ (future) | Quarterly |
| Integration Count | Number of external systems consuming the engine | 1 (internal) → 8+ (future) | Quarterly |
| Audit Trail Completeness | Percentage of estimate changes with logged origin | 100% | Continuous |

---

## 11. Risks

| ID | Risk | Category | Impact | Mitigation Strategy |
|----|------|----------|--------|---------------------|
| RSK-001 | Pricing engine produces incorrect calculations due to tax rule changes | Correctness | Critical | Build configurable tax engine; test against tax authority guidelines; quarterly review |
| RSK-002 | Location-based multipliers become outdated, causing pricing drift | Data Quality | High | Implement multiplier review schedule; alert on significant deviations |
| RSK-003 | Package templates become inconsistent across business domains | Consistency | High | Centralize package management; enforce validation on template creation |
| RSK-004 | Engine cannot handle complex custom projects requiring manual line items | Flexibility | Medium | Support hybrid approach (package-based + manual BOQ entry) |
| RSK-005 | Integration with downstream systems (CRM, ERP) introduces data sync issues | Integration | High | Define clear API contracts; implement idempotent operations; log sync status |
| RSK-006 | Multi-tenant SaaS adoption leads to performance degradation | Scalability | High | Design stateless engine; horizontal scaling architecture; caching strategy |
| RSK-007 | Regulatory tax changes require urgent pricing updates | Compliance | High | Externalize tax rules; implement rapid update mechanism; notify affected estimates |
| RSK-008 | Over-engineering delays MVP delivery | Delivery | Medium | Phase feature delivery; release core calculation engine first |
| RSK-009 | Estimators resist adoption due to change management | Adoption | Medium | Provide training; maintain familiar output formats; run parallel old/new processes |
| RSK-010 | Engine becomes tightly coupled to a single frontend or backend | Architecture | Critical | Enforce clean separation of concerns; define explicit integration boundaries |

---

## 12. Assumptions

| ID | Assumption |
|----|-----------|
| ASM-001 | The Estimate Engine will consume authentication from an external system (e.g., SBBT's existing auth from PRD-01) and will not implement its own identity management. |
| ASM-002 | Construction packages (Solid, Essential, Premium, Luxury) are already defined or will be defined separately from this engine. The engine consumes package definitions as input data. |
| ASM-003 | Material catalogs, labor rate tables, and tax rules will be managed through a separate configuration system or admin interface, not through this engine's core. |
| ASM-004 | Business domains (Residential, Commercial, Interior, Renovation, Villa, Farm House) each have distinct pricing structures but share the same calculation engine logic. |
| ASM-005 | The engine will be deployed as a separate service with its own infrastructure, independent of the website or CMS hosting. |
| ASM-006 | Customers will consume estimates primarily as PDF documents; digital signature or acceptance mechanisms are handled by external systems. |
| ASM-007 | Location-based multipliers are based on Indian geographic regions (states, cities) and may be updated periodically by the business team. |
| ASM-008 | GST tax rules apply as per current Indian tax law (multi-tier CGST/SGST/IGST depending on location and material type). |
| ASM-009 | The engine will support at least 100 concurrent estimation sessions in the initial production deployment. |
| ASM-010 | Historical estimate data from spreadsheets will be migrated separately; the engine does not include a migration feature in Phase 1. |
| ASM-011 | All monetary values are in Indian Rupees (INR) by default; multi-currency support is a future enhancement. |
| ASM-012 | The engine's outputs (estimates, BOQs, PDFs) will be generated server-side; no client-side calculation is required for security and consistency. |

---

## 13. Open Business Questions

| ID | Question | Rationale | Priority |
|----|----------|-----------|----------|
| OBQ-001 | Should the Estimate Engine own the package definition, or should packages continue to be managed in the CMS (PRD-01)? | Determines data ownership and integration architecture | Critical |
| OBQ-002 | How should the engine handle estimates that span multiple business domains (e.g., residential construction + interior fit-out in the same project)? | Ensures consistent treatment of hybrid projects | High |
| OBQ-003 | Should location-based multipliers be applied at the project level, the line-item level, or both? | Affects calculation granularity and complexity | High |
| OBQ-004 | What is the minimum set of approval roles required? Should approval be single-step or multi-step (e.g., estimator → engineer → owner)? | Defines workflow complexity | High |
| OBQ-005 | Should the engine support scheduled re-pricing (e.g., update all estimates based on new material rates)? | Impacts data consistency and re-calculation strategy | Medium |
| OBQ-006 | How should discount and offer rules interact? Should offers override or stack with manual discounts? | Ensures predictable pricing behavior | Medium |
| OBQ-007 | Should the engine generate estimates in the customer's preferred language? | Affects PDF generation and localization scope | Medium |
| OBQ-008 | When an estimate is revised, should all downstream systems (CRM, ERP) be automatically notified, or should revision be a manual trigger? | Affects integration complexity | Medium |
| OBQ-009 | Should the engine store raw calculation logs for legal/audit purposes, and for how long? | Affects storage costs and compliance | Low |
| OBQ-010 | Should the engine support estimate comparison views (e.g., side-by-side of versions or packages)? | Affects UI/UX scope | Low |
| OBQ-011 | How should the engine handle estimates where material quantities are unknown at creation time (e.g., rough order of magnitude)? | Ensures flexibility in early-stage quoting | Medium |
| OBQ-012 | Should integration events be synchronous (real-time API calls) or asynchronous (message queues)? | Affects architecture and reliability requirements | Critical |

---

## 14. Future PRD Roadmap

| PRD | Title | Scope | Status |
|-----|-------|-------|--------|
| PRD-01 | Website + CMS | Public website, admin dashboard, content management, authentication | Published |
| PRD-02 | Estimate Engine | Standalone estimation engine, pricing, BOQ, packages | Current (Phase 2: Module Design) |
| PRD-03 | CRM | Lead management, customer management, project tracking, follow-up | Future |
| PRD-04 | ERP | Inventory, billing, costing, vendor management | Future |
| PRD-05 | Customer Portal | Self-service portal for customers | Future |
| PRD-06 | Vendor Portal | Supplier and partner portal | Future |
| PRD-07 | Mobile App | Native mobile application | Future |
| PRD-08 | SaaS Platform | Multi-tenant, multi-company SaaS architecture | Future |

---

## 15. Functional Module Overview

The Estimate Engine is composed of 20 independent functional modules. Each module serves a distinct business purpose and can be developed, tested, and deployed independently while interacting through well-defined interfaces.

| # | Module Name |
|---|-------------|
| 1 | Estimate Dashboard |
| 2 | Estimate Builder |
| 3 | Package Engine |
| 4 | Package Comparison |
| 5 | Pricing Engine |
| 6 | Formula Engine |
| 7 | Material Library |
| 8 | Labour Library |
| 9 | BOQ Engine |
| 10 | Cost Summary |
| 11 | Discount Engine |
| 12 | Tax Engine |
| 13 | PDF Generator |
| 14 | Revision Manager |
| 15 | Version Control |
| 16 | Approval Workflow |
| 17 | Sharing Module |
| 18 | Audit Log |
| 19 | Analytics |
| 20 | Import / Export |

---

## 16. Module Specifications

### 16.1 Estimate Dashboard

**Purpose:** Provide a centralized overview of all estimates, their statuses, and key performance indicators for stakeholders.

**Responsibilities:**
- Display summary statistics (estimates by status, total value, approval rate)
- Show recent estimates with status indicators
- Provide quick filters (by date, status, domain, stakeholder)
- Show pending approvals and overdue estimates
- Display quick action buttons (create new estimate, import, view analytics)

**Inputs:** Estimate records, status data, timestamp data, stakeholder metadata.

**Outputs:** Dashboard view, summary statistics, filtered estimate lists, alert notifications.

**Dependencies:** Estimate Builder (for creation), Version Control (for status), Approval Workflow (for approvals), Analytics (for metrics).

**Future Expansion:** Customizable widgets, real-time updates, team-specific views, mobile dashboard.

### 16.2 Estimate Builder

**Purpose:** Orchestrate the creation and editing of estimate records, guiding users through the estimation workflow from lead context to final configuration.

**Responsibilities:**
- Initialize a new estimate from lead or project data
- Set estimate metadata (domain, location, currency, customer)
- Coordinate with Package Engine to select and customize packages
- Coordinate with Pricing Engine to compute totals
- Manage estimate-level notes and attachments
- Trigger workflow state transitions

**Inputs:** Lead information, project context, package selections, material selections, calculation parameters.

**Outputs:** Complete estimate object with all configured parameters, workflow state, and computed totals.

**Dependencies:** Package Engine, Pricing Engine, Material Library, Labour Library, Version Control, Approval Workflow, Audit Log.

**Future Expansion:** Template-based estimate creation, bulk estimate creation, AI-assisted package selection.

### 16.3 Package Engine

**Purpose:** Manage construction package definitions, including package templates, item inheritance, and domain-specific package rules.

**Responsibilities:**
- Store and retrieve package templates by domain
- Apply package inheritance rules (base items, optional add-ons, exclusions)
- Validate package configurations against domain rules
- Support package versioning and lifecycle management
- Enable package customization (add, remove, modify line items)

**Inputs:** Domain type, location, project specifications, package template ID.

**Outputs:** Resolved package item list with baseline quantities, rates, and specifications.

**Dependencies:** Material Library, Labour Library, Version Control, Import/Export (for template management).

**Future Expansion:** Dynamic package creation from AI suggestions, package comparison, package marketplace.

### 16.4 Package Comparison

**Purpose:** Enable side-by-side comparison of different packages to support informed decision-making.

**Responsibilities:**
- Display multiple packages in a comparison matrix
- Highlight differences in items, specifications, and pricing
- Show per-item cost deltas between packages
- Support filtering and sorting of comparison views
- Enable selection of the best package for a given project

**Inputs:** Two or more package configurations, line-item details, pricing data.

**Outputs:** Comparison matrix, cost difference summary, recommendation based on criteria.

**Dependencies:** Package Engine, Cost Summary, Pricing Engine.

**Future Expansion:** Automated package recommendation based on project profile, 3D visualization of package differences.

### 16.5 Pricing Engine

**Purpose:** Compute all cost components of an estimate, including material costs, labor costs, area-based calculations, and location adjustments.

**Responsibilities:**
- Calculate material totals from selected materials and quantities
- Calculate labor totals from labor types and hours
- Apply area-based multipliers (per sqft, per floor, per unit)
- Apply location-based multipliers
- Delegate sub-calculations to Formula Engine
- Aggregate results into cost categories

**Inputs:** Material list with quantities, labor list with hours, area measurements, location data, formula definitions.

**Outputs:** Detailed cost breakdown (material subtotal, labor subtotal, area adjustments, location adjustments).

**Dependencies:** Formula Engine, Material Library, Labour Library, BOQ Engine.

**Future Expansion:** Real-time material price integration, dynamic labor rate lookup, vendor pricing comparison.

### 16.6 Formula Engine

**Purpose:** Evaluate calculation formulas and business rules that determine pricing components. This module encapsulates all mathematical and logical operations used by the Pricing Engine and other modules.

**Responsibilities:**
- Evaluate arithmetic formulas (addition, subtraction, multiplication, division)
- Apply conditional logic (if/then rules for discounts, taxes, premiums)
- Execute domain-specific formulas (e.g., floor calculation, area-based costing)
- Support formula versioning and auditing
- Maintain a library of reusable formula templates

**Inputs:** Formula definitions, input variables (quantities, rates, multipliers), context data (location, domain, package type).

**Outputs:** Computed numerical results, formula evaluation logs, error reports for invalid formulas.

**Dependencies:** BOQ Engine (for line-item data), Pricing Engine (for orchestration).

**Future Expansion:** AI-driven formula suggestions, formula validation against historical data, user-defined formulas.

### 16.7 Material Library

**Purpose:** Serve as the centralized catalog of all construction materials, including pricing, specifications, and domain associations.

**Responsibilities:**
- Store material definitions (name, description, unit, specifications)
- Maintain material pricing by location and domain
- Support material categorization (cement, steel, tiles, etc.)
- Manage material lifecycle (active, discontinued, pending)
- Enable search and filtering of materials

**Inputs:** Material data from admin, supplier price feeds, manual entry.

**Outputs:** Material records with current pricing, material categories, domain associations.

**Dependencies:** Package Engine (for package item resolution), Pricing Engine (for cost calculation), Import/Export (for bulk operations).

**Future Expansion:** Real-time supplier price integration, material substitution suggestions, sustainability scoring.

### 16.8 Labour Library

**Purpose:** Maintain the centralized catalog of labor types, rates, productivity factors, and skill classifications.

**Responsibilities:**
- Store labor type definitions (masons, carpenters, electricians, etc.)
- Maintain labor rates by location and skill level
- Store productivity factors (output per man-hour)
- Manage labor categories and classifications
- Enable search and filtering of labor types

**Inputs:** Labor data from admin, wage rate updates, productivity benchmarks.

**Outputs:** Labor records with rates, productivity factors, skill classifications.

**Dependencies:** Pricing Engine (for labor cost calculation), BOQ Engine (for labor item assignment).

**Future Expansion:** Skill certification tracking, labor availability forecasting, union/negotiated rate management.

### 16.9 BOQ Engine

**Purpose:** Generate and manage the Bill of Quantities from estimate, package, and material selections. The BOQ is the structured line-item breakdown that drives all pricing calculations.

**Responsibilities:**
- Generate BOQ items from selected packages
- Allow manual addition, removal, and modification of BOQ line items
- Maintain BOQ item metadata (description, unit, quantity, rate, specifications)
- Support BOQ grouping and summarization (by trade, by floor, by category)
- Manage BOQ state (draft, locked for calculation, finalized)

**Inputs:** Package selections, material selections, manual line items, area measurements.

**Outputs:** Structured BOQ with line items, group summaries, total quantities per category.

**Dependencies:** Package Engine, Material Library, Labour Library, Pricing Engine, Formula Engine, Version Control.

**Future Expansion:** Auto BOQ from drawings, BOQ versioning, BOQ approval workflow, BOQ export to procurement systems.

### 16.10 Cost Summary

**Purpose:** Aggregate all cost components into a comprehensive summary with detailed breakdowns and totals.

**Responsibilities:**
- Aggregate material, labor, and area-based costs
- Calculate subtotal, grand total, and per-category totals
- Display cost breakdown by trade, floor, or domain
- Show cost per square foot / square meter
- Support cost allocation to project phases or cost centers

**Inputs:** Pricing Engine outputs, BOQ line items, area data, location multipliers.

**Outputs:** Cost summary report with breakdowns, totals, and key metrics.

**Dependencies:** Pricing Engine, BOQ Engine, Material Library, Labour Library.

**Future Expansion:** Cost variance analysis, budget vs. estimate comparison, profitability projection.

### 16.11 Discount Engine

**Purpose:** Apply discount rules, promotional offers, and special pricing adjustments to estimate totals.

**Responsibilities:**
- Apply percentage-based discounts
- Apply fixed-amount discounts
- Apply promotional offers (buy X get Y free, seasonal discounts)
- Apply bulk quantity discounts
- Maintain discount rule library with versioning
- Enforce discount approval thresholds

**Inputs:** Estimate totals, discount rules, customer type, project value, offer codes.

**Outputs:** Discounted amounts, discount breakdown, adjusted totals.

**Dependencies:** Pricing Engine (for pre-discount totals), Cost Summary (for post-discount totals), Approval Workflow (for discount authorization).

**Future Expansion:** Contract-based pricing, volume-tiered discounts, customer-specific pricing rules, AI-optimized discount suggestions.

### 16.12 Tax Engine

**Purpose:** Calculate all applicable taxes (GST, cess, state taxes) based on location, material type, and service classification.

**Responsibilities:**
- Determine applicable tax rates by location (state, city, locality)
- Classify materials and services for tax purposes (taxable, exempt, zero-rated)
- Calculate CGST, SGST, or IGST as applicable
- Apply cess and surcharge rules
- Handle tax exemptions and special categories
- Maintain tax rule library with versioning

**Inputs:** Location data, material/service classifications, taxable amounts, customer type (B2B vs. B2C).

**Outputs:** Tax breakdown (CGST, SGST, IGST, cess), total tax amount, tax-inclusive totals.

**Dependencies:** Pricing Engine (for taxable amounts), Cost Summary (for final totals), Material Library (for classification).

**Future Expansion:** Integration with tax authority APIs, automatic tax rate updates, multi-country tax support.

### 16.13 PDF Generator

**Purpose:** Produce professional, branded PDF documents from finalized estimates, including terms and conditions, signatures, watermarks, and QR codes.

**Responsibilities:**
- Generate branded PDF from estimate data
- Include terms and conditions
- Support digital signatures and approval stamps
- Apply watermarks (draft, approved, confidential)
- Generate QR codes for estimate verification
- Support multi-language output
- Enable template customization

**Inputs:** Finalized estimate data, company branding assets, terms and conditions template, approval status.

**Outputs:** PDF document, PDF metadata, download link or file reference.

**Dependencies:** Cost Summary (for data), Discount Engine (for final amounts), Tax Engine (for tax details), Version Control (for version info), Approval Workflow (for status).

**Future Expansion:** Interactive PDFs, e-signature integration, multi-format export (Word, Excel), automated PDF distribution.

### 16.14 Revision Manager

**Purpose:** Manage the lifecycle of estimate revisions, tracking changes, comparing versions, and enabling rollback to previous states.

**Responsibilities:**
- Create new revisions from existing estimates
- Track and display changes between versions
- Enable comparison of line items across revisions
- Support selective item changes in revisions
- Manage revision numbering and naming

**Inputs:** Approved estimate, change requests, modification details.

**Outputs:** New estimate version, change log, revision comparison report.

**Dependencies:** Version Control (for storing revisions), BOQ Engine (for line items), Approval Workflow (for re-approval).

**Future Expansion:** Automated revision suggestions based on change patterns, revision impact analysis, bulk revision management.

### 16.15 Version Control

**Purpose:** Maintain complete version history of all estimates, including who made changes, when, and what changed. Enables audit, compliance, and restore capabilities.

**Responsibilities:**
- Store all versions of an estimate (draft, in-progress, reviewed, approved, revised)
- Log all changes with timestamp, user, and change description
- Support restoration of any previous version
- Track approval history (who approved, when, comments)
- Manage estimate state transitions (Draft → In Progress → Review → Approved → Expired → Archived)

**Inputs:** Estimate modifications, approval actions, state changes, user actions.

**Outputs:** Version history, change logs, approval records, restore capability.

**Dependencies:** All modules that produce or modify estimate data.

**Future Expansion:** Branching and merging of estimate versions, automated version snapshots, compliance export of version history.

### 16.16 Approval Workflow

**Purpose:** Govern the approval process for estimates, ensuring proper authorization before finalization and customer sharing.

**Responsibilities:**
- Define approval routing (single-step or multi-step)
- Assign approvers based on role, estimate value, or domain
- Enforce approval thresholds (e.g., >₹50L requires senior approval)
- Log approval decisions with comments and timestamps
- Send notifications to approvers and stakeholders

**Inputs:** Estimate requiring approval, approver assignments, approval thresholds, user roles.

**Outputs:** Approval status, approval log, notification triggers.

**Dependencies:** Version Control (for state tracking), Audit Log (for logging), Sharing Module (to block sharing until approved), Discount Engine (for discount approval).

**Future Expansion:** Parallel approvals, conditional routing, delegation, approval analytics, integration with e-signature providers.

### 16.17 Sharing Module

**Purpose:** Distribute finalized estimates to customers and internal stakeholders through multiple channels, with tracking and delivery confirmation.

**Responsibilities:**
- Generate shareable links for estimates
- Send estimates via email with branding
- Send estimates via WhatsApp
- Track delivery, open, and download status
- Support password-protected sharing
- Enable re-sharing and expiration controls

**Inputs:** Approved estimate, recipient information, sharing preferences, channel selection.

**Outputs:** Shared estimate links, delivery receipts, status tracking, activity logs.

**Dependencies:** PDF Generator (for document), Version Control (for approval check), Audit Log (for tracking), Customer Portal (for customer access).

**Future Expansion:** Real-time sharing notifications, multi-channel delivery orchestration, custom landing pages, embedded estimate viewers.

### 16.18 Audit Log

**Purpose:** Maintain a comprehensive, tamper-evident log of all actions performed within the Estimate Engine for compliance, debugging, and accountability.

**Responsibilities:**
- Log all estimate creation, modification, and deletion events
- Log all approval, rejection, and delegation actions
- Log all sharing and delivery events
- Log all system configuration changes
- Support audit log search and filtering
- Ensure tamper-evidence (cryptographic hashing of log entries)

**Inputs:** User actions, system events, integration events, state changes.

**Outputs:** Audit log entries, audit reports, compliance exports.

**Dependencies:** All modules (as event producers).

**Future Expansion:** Real-time audit streaming, SIEM integration, automated anomaly detection, legal hold support.

### 16.19 Analytics

**Purpose:** Provide business intelligence and reporting capabilities to help stakeholders understand estimation performance, usage patterns, and opportunities for improvement.

**Responsibilities:**
- Track estimate creation volume and velocity
- Monitor approval and rejection rates
- Analyze win/loss patterns based on package types
- Track average discount levels by domain
- Report on estimator and team productivity
- Generate standard and custom reports

**Inputs:** Estimate data, approval data, user activity data, version control data.

**Outputs:** Reports, dashboards, data exports, scheduled analytics.

**Dependencies:** Version Control (for data), Audit Log (for user activity), Cost Summary (for financial metrics), Discount Engine (for discount analysis), Tax Engine (for tax analysis).

**Future Expansion:** Predictive analytics, AI-driven insights, benchmarking against industry standards, real-time dashboards.

### 16.20 Import / Export

**Purpose:** Enable bulk import of materials, labor rates, packages, and estimates, as well as export of estimates, BOQs, and reports in standard formats.

**Responsibilities:**
- Import materials from CSV/Excel with validation
- Import labor rates from external sources
- Import package templates from templates or previous estimates
- Export estimates as PDF, Excel, or CSV
- Export BOQs for procurement systems
- Export version history and audit logs for compliance
- Validate data integrity during import/export

**Inputs:** CSV/Excel files, template files, estimate data, BOQ data, audit data.

**Outputs:** Imported data records, exported files, import/export logs, validation reports.

**Dependencies:** Material Library, Labour Library, Package Engine, BOQ Engine, PDF Generator, Version Control, Audit Log.

**Future Expansion:** API-based import/export, real-time data feeds, automated data synchronization, import from CAD/DWG files.

---

## 17. Module Relationships

The modules interact in a directed flow, with data flowing from input modules through processing modules to output modules. The following describes the key interaction patterns.

### Primary Estimation Flow

```
Estimate Builder
    ↓ (selects package + materials)
Package Engine
    ↓ (resolves items)
BOQ Engine
    ↓ (line items with quantities)
Pricing Engine
    ├── (calls) → Formula Engine (for calculations)
    │
    ← (receives computed costs)
Cost Summary
    ├── (receives) → Discount Engine (applies discounts)
    │       ↓
    ├── (receives) → Tax Engine (applies taxes)
    │       ↓
    ← (final totals)
BOQ Engine (finalized)
    ↓ (generates document)
PDF Generator
    ↓ (requires approval)
Approval Workflow
    ↓ (if approved)
Sharing Module
    ↓ (logs all actions)
Audit Log
```

### Supporting Module Interactions

- **Estimate Dashboard** ← reads from → Version Control, Approval Workflow, Analytics, Audit Log
- **Material Library** ← feeds → Package Engine, BOQ Engine, Pricing Engine, Import/Export
- **Labour Library** ← feeds → Package Engine, BOQ Engine, Pricing Engine, Import/Export
- **Revision Manager** ← uses → Version Control, BOQ Engine, Approval Workflow
- **Analytics** ← reads from → Version Control, Audit Log, Cost Summary, Discount Engine, Tax Engine
- **Import/Export** ↔ interacts with → Material Library, Labour Library, Package Engine, BOQ Engine, Audit Log

### Cross-cutting Modules

The following modules are consumed by multiple other modules:

- **Version Control** — consumed by: Estimate Builder, Package Engine, BOQ Engine, Approval Workflow, Revision Manager, Audit Log
- **Audit Log** — consumed by: all modules (as event consumer)
- **Approval Workflow** — consumed by: Estimate Builder, Discount Engine, PDF Generator, Sharing Module
- **Import/Export** — consumed by: Material Library, Labour Library, Package Engine, Analytics

---

## 18. Reusable Components

Several modules are designed as reusable components that can be consumed by future products beyond the Estimate Engine. These modules are intentionally decoupled from estimate-specific logic.

| Module | Reusable For | Rationale |
|--------|-------------|-----------|
| **Material Library** | ERP, Interior, Mobile App, SaaS | A master material catalog with pricing is needed by inventory, procurement, and domain-specific platforms. Reusable as a standalone material service. |
| **Labour Library** | ERP, Interior, SaaS | Labor rate tables and productivity factors are needed for costing, scheduling, and workforce planning in other systems. |
| **Tax Engine** | ERP, CRM, SaaS | Tax calculation logic is needed by billing, invoicing, and financial reporting across all future products. A standalone tax service prevents duplication. |
| **Formula Engine** | ERP, CRM, AI Platform | Generic formula evaluation is a cross-cutting capability needed by any system performing calculations. Reusable as a computation service. |
| **Discount Engine** | ERP, CRM, CRM Portal | Discount and offer logic is needed by billing, pricing, and customer-facing quotation systems. |
| **PDF Generator** | All future products | Branded document generation is a universal need. Reusable as a document-as-a-service across all products. |
| **Sharing Module** | Customer Portal, Mobile App, SaaS | Document sharing and delivery mechanisms (email, WhatsApp, link sharing) are needed by every customer-facing product. |
| **Audit Log** | All future products | Immutable audit logging is a cross-cutting concern. A shared audit service ensures compliance consistency. |
| **Import/Export** | All future products | CSV/bulk import/export capabilities are needed by data-intensive systems. Reusable as a data exchange service. |
| **Analytics** | CRM, ERP, SaaS | Reporting and analytics engines are reusable for any business data analysis need. |
| **Version Control** | CRM, ERP, Interior | Version control for business objects (estimates, projects, configurations) is a common pattern. Reusable as a versioning service. |

[ASSUMPTION] These reusable modules will be designed with well-defined interfaces that do not expose Estimate Engine-specific concepts, ensuring they can be consumed by any future product without tight coupling.

---

## 19. Business Rules

The following are business rules that govern the behavior of the Estimate Engine. These rules are implementation-agnostic and define the logical constraints of the system.

| ID | Business Rule | Scope | Priority |
|----|---------------|-------|----------|
| BR-001 | One Estimate can have multiple revisions. Each revision creates a new version with a sequential version number. | Revision Manager, Version Control | P0 |
| BR-002 | Packages inherit material templates. When a package is selected, all its base materials are automatically included. | Package Engine, Material Library | P0 |
| BR-003 | An estimate cannot be approved without pricing. All line items in the BOQ must have valid rates before approval is allowed. | BOQ Engine, Approval Workflow | P0 |
| BR-004 | Approved estimates become read-only. Once an estimate reaches "Approved" status, no modifications are allowed without creating a new revision. | Version Control, Estimate Builder | P0 |
| BR-005 | An estimate cannot transition from "Draft" directly to "Approved." It must pass through "In Progress" and "Review" states. | Version Control | P0 |
| BR-006 | Estimates older than 90 days in "Approved" status automatically transition to "Expired." | Version Control | P1 |
| BR-007 | Discounts above a configured threshold require additional approval (e.g., discounts above 15% require senior approval). | Discount Engine, Approval Workflow | P0 |
| BR-008 | Tax calculation must use the location at the time of estimate creation, not the current location. | Tax Engine | P0 |
| BR-009 | Only the estimate owner or an admin can delete an estimate. | Estimate Builder, Version Control | P0 |
| BR-010 | A revision cannot be created if the parent estimate is in "Draft" status. Only "Approved" estimates can be revised. | Revision Manager, Version Control | P1 |
| BR-011 | The final estimate total must be rounded to the nearest rupee after all discounts and taxes are applied. | Pricing Engine, Tax Engine | P0 |
| BR-012 | An estimate in "Expired" status cannot be re-approved. A new estimate must be created or the expired one must be restored from version history. | Version Control, Revision Manager | P1 |
| BR-013 | All estimate modifications after initial approval must generate an audit trail entry with change details. | Audit Log, Version Control | P0 |
| BR-014 | An estimate cannot be shared with a customer before final approval. | Sharing Module, Approval Workflow | P0 |
| BR-015 | Packages can be customized, but removed items that have associated BOQ line items cannot be deleted without user confirmation. | Package Engine, BOQ Engine | P2 |
| BR-016 | Material rates are effective-dated. The rate at the time of estimate creation is used, not the current rate. | Material Library, Version Control | P1 |
| BR-017 | Estimates in "In Progress" status can only be modified by the owner or assigned estimator. | Estimate Builder, Version Control | P1 |
| BR-018 | A minimum of two approvals is required for estimates exceeding a configured value threshold. | Approval Workflow | P2 |
| BR-019 | Deleted estimates are retained in an archived state for 7 years for compliance purposes. | Version Control | P1 |
| BR-020 | The engine must validate that all package items are compatible with the selected business domain. | Package Engine | P0 |

[ASSUMPTION] The specific threshold values (e.g., 90-day expiry, 15% discount approval, 7-year retention) are placeholder values that must be confirmed with business stakeholders before implementation.

---

## 20. Future Expansion Opportunities

The following table identifies which modules can later support specific future capabilities. This mapping helps prioritize module design to enable future expansion.

| Module | AI Estimate | Auto BOQ | Drawing Import | Voice Estimate | Rate Prediction | Vendor Pricing | Dynamic Pricing | Tender Generator |
|--------|-------------|----------|----------------|----------------|-----------------|----------------|-----------------|-------------------|
| Estimate Dashboard | Can display AI insights and recommendations | Can show auto-BOQ status | Can display drawing import progress | Can show voice-to-estimate history | Can display rate prediction confidence | Can show vendor pricing alerts | Can show dynamic pricing changes | Can show tender pipeline |
| Estimate Builder | AI suggests packages based on project profile | AI suggests BOQ items from project specs | Voice can create new estimates hands-free | Voice can specify project type | AI can pre-select cost parameters | AI can suggest vendor rates | AI can adjust for market trends | AI can suggest tender strategy |
| Package Engine | AI can generate custom packages | Packages can auto-populate from BOQ | Can import packages from drawings | Voice can select packages | AI can optimize package composition | Can pull vendor-specific packages | Can adjust packages for market rates | Can create packages for tenders |
| Package Comparison | AI can recommend best package | N/A | N/A | Voice can compare packages | AI can predict cost-effectiveness | Can compare vendor packages | Can show real-time package pricing | Can compare tender competitiveness |
| Pricing Engine | AI can predict costs | N/A | Can extract quantities from drawings | N/A | AI can predict market rates | Can apply vendor-specific rates | Can adjust pricing in real-time | Can calculate tender pricing |
| Formula Engine | AI can suggest formulas | N/A | N/A | N/A | AI can optimize formulas | N/A | Can adjust formulas for dynamic markets | Can generate tender formulas |
| Material Library | AI can suggest substitutes | N/A | Can extract materials from drawings | Voice can add materials | AI can predict material costs | Can display vendor prices | Can update prices dynamically | Can list materials for procurement |
| Labour Library | AI can predict labor productivity | N/A | N/A | N/A | AI can predict labor rates | N/A | Can adjust labor rates | Can list labor for tenders |
| BOQ Engine | AI can auto-generate line items | Core enabler — auto BOQ from drawings/specs | Core enabler — extract quantities from drawings | Voice can dictate line items | AI can predict quantities | Can link to vendor catalogs | Can update quantities dynamically | Can generate BOQ for tenders |
| Cost Summary | AI can predict cost variances | Can summarize auto-BOQ results | Can include drawing-derived costs | N/A | AI can predict final costs | Can include vendor costs | Can show dynamic pricing impact | Can summarize tender costs |
| Discount Engine | AI can optimize discount strategy | N/A | N/A | N/A | AI can predict optimal discounts | N/A | Can adjust discounts dynamically | Can create tender-specific discounts |
| Tax Engine | N/A | N/A | N/A | N/A | N/A | N/A | Can adjust for tax changes | Can calculate tender taxes |
| PDF Generator | Can embed AI insights | Can include auto-BOQ | Can display drawing extracts | Can include voice transcript | Can show rate predictions | Can show vendor pricing | Can show dynamic prices | Can generate tender documents |
| Revision Manager | AI can suggest revision scope | N/A | N/A | N/A | AI can predict revision impact | N/A | Can adjust for pricing changes | Can track tender revisions |
| Version Control | AI can suggest optimal versions | Can version auto-BOQ | Can version drawing imports | Can version voice estimates | Can version rate predictions | Can version vendor prices | Can version dynamic pricing | Can version tender documents |
| Approval Workflow | AI can suggest approvers | N/A | N/A | N/A | N/A | N/A | Can auto-approve within thresholds | Can route tenders for approval |
| Sharing Module | N/A | N/A | Can share drawing-based estimates | Can share voice-created estimates | N/A | N/A | Can share dynamic pricing | Can share tender documents |
| Audit Log | Audit AI decisions and predictions | Logs auto-BOQ generation | Logs drawing import events | Logs voice commands | Logs rate predictions | Logs vendor price usage | Logs dynamic pricing changes | Logs tender activities |
| Analytics | AI-powered insights and predictions | Tracks auto-BOQ adoption | Tracks drawing import usage | Tracks voice estimate usage | Tracks rate prediction accuracy | Tracks vendor pricing impact | Tracks dynamic pricing effectiveness | Tracks tender success rates |
| Import/Export | Can export AI-generated estimates | Can import auto-BOQ data | Core enabler — import drawings | Can import voice transcripts | Can export rate predictions | Can import vendor catalogs | Can export dynamic pricing | Can export tender packages |
---

## 21. Estimate Lifecycle

The Estimate Engine defines 11 distinct states that an estimate can occupy throughout its existence. Each state has specific entry conditions, allowed actions, permitted roles, and transition rules.

### 21.1 Draft

**Purpose:** The initial state when an estimate is first created but not yet actively being worked on. The estimate has basic metadata only (lead, domain, location) but no package or BOQ content.

**Allowed Actions:**
- Add/edit basic metadata (domain, location, currency)
- Delete estimate
- Begin editing (transition to "In Progress")

**Allowed Roles:** Estimate Owner, Estimator, Admin

**Next Possible States:** In Progress, Cancelled, Archived

**Business Rules:**
- Only the owner or an admin can delete a draft estimate
- A draft estimate can remain in "Draft" indefinitely without warnings
- Transitioning to "In Progress" requires at least a business domain selection

### 21.2 In Progress

**Purpose:** The estimate is actively being configured with packages, materials, BOQ items, and pricing. Calculations are being run iteratively.

**Allowed Actions:**
- Select and customize packages
- Add/edit BOQ line items
- Run pricing calculations
- Add notes and comments
- Attach files
- Save as draft (manual save)
- Submit for review (transition to "Under Review")

**Allowed Roles:** Estimate Owner, Estimator, Engineer, Admin

**Next Possible States:** Under Review, Cancelled, Archived

**Business Rules:**
- Only the owner, assigned estimator, or engineer can modify an estimate in "In Progress"
- Changes are saved automatically every 2 minutes or on explicit save
- Submitting for review creates a snapshot version

### 21.3 Under Review

**Purpose:** The estimate has been submitted for internal review. A secondary reviewer (e.g., senior estimator or engineer) examines all items, calculations, and assumptions.

**Allowed Actions:**
- View all estimate data
- Add review comments at line-item or estimate level
- Approve review (transition to "Pending Approval")
- Reject review (transition to "In Progress" with comments)
- Request changes (transition to "In Progress" with review feedback)

**Allowed Roles:** Reviewer (Senior Estimator, Engineer, Admin)

**Next Possible States:** In Progress, Pending Approval, Cancelled, Archived

**Business Rules:**
- The original creator cannot approve their own review submission
- Review must be completed within 48 hours default SLA (configurable)
- Review comments are mandatory for rejection or change requests

### 21.4 Pending Approval

**Purpose:** The estimate has passed internal review and is awaiting formal approval by an authorized approver (e.g., project manager or owner).

**Allowed Actions:**
- View all estimate data and review comments
- Approve estimate (transition to "Approved")
- Reject estimate (transition to "In Progress" with rejection reason)
- Request revision (transition to "In Progress" with feedback)
- Send back for additional review (transition to "Under Review")

**Allowed Roles:** Approver (Project Manager, Owner, Admin)

**Next Possible States:** Approved, In Progress, Under Review, Cancelled, Archived

**Business Rules:**
- Approval requires all BOQ line items to have valid rates (per BR-003)
- Approval must be completed within 72 hours default SLA (configurable)
- Approval creates a new version snapshot

### 21.5 Approved

**Purpose:** The estimate has been formally approved. The values are final and the estimate is ready for customer delivery.

**Allowed Actions:**
- Generate PDF
- Share with customer
- Create revision (transition to "In Progress" as new revision)
- Archive estimate
- Export estimate data

**Allowed Roles:** Estimate Owner, Approver, Admin

**Next Possible States:** Shared, In Progress (revision), Expired, Cancelled, Archived

**Business Rules:**
- Approved estimates are read-only (per BR-004)
- Modifications require creating a revision (new version)
- The estimate total is locked and all calculations are frozen
- PDF generation uses the locked values

### 21.6 Rejected

**Purpose:** The estimate has been rejected by an approver or reviewer. It returns to the creator with feedback for corrections.

**Allowed Actions:**
- View rejection comments
- Edit estimate (transition to "In Progress")
- Cancel estimate
- Archive estimate

**Allowed Roles:** Estimate Owner, Estimator, Admin

**Next Possible States:** In Progress, Cancelled, Archived

**Business Rules:**
- Rejection reason is mandatory and must be recorded
- The estimate retains its rejected version in history
- Re-submission starts a new review cycle

### 21.7 Shared

**Purpose:** The approved estimate has been delivered to the customer via one or more channels (email, WhatsApp, link, portal).

**Allowed Actions:**
- Track delivery status
- Track customer view status
- Resend estimate
- Create revision based on customer feedback
- Cancel estimate

**Allowed Roles:** Estimate Owner, Sales, Admin

**Next Possible States:** In Progress (revision), Accepted, Rejected (by customer), Cancelled, Expired, Archived

**Business Rules:**
- Sharing is only allowed after approval
- Each share event is logged as a separate business event
- Delivery receipts are tracked per channel

### 21.8 Accepted

**Purpose:** The customer has accepted the estimate terms, confirming agreement to proceed.

**Allowed Actions:**
- Convert to project (future integration with CRM/ERP)
- View final estimate
- Cancel estimate
- Archive estimate

**Allowed Roles:** Estimate Owner, Sales, Admin

**Next Possible States:** Cancelled, Archived

**Business Rules:**
- Once accepted, the estimate cannot be modified
- Conversion to project creates a reference link to the estimate
- Acceptance is timestamped and attributed to the customer contact

### 21.9 Expired

**Purpose:** The estimate has exceeded its validity period. Pricing, terms, and availability may no longer be current.

**Allowed Actions:**
- View expired estimate
- Create new estimate based on expired one (revision)
- Renew estimate (transition to "Approved" with new validity)
- Archive estimate
- Cancel estimate

**Allowed Roles:** Estimate Owner, Sales, Admin

**Next Possible States:** Approved (renewed), In Progress (new version), Cancelled, Archived

**Business Rules:**
- Default validity period is 90 days (configurable per domain)
- Expired estimates are read-only
- Renewal creates a new version and resets the validity period

### 21.10 Cancelled

**Purpose:** The estimate has been voluntarily cancelled by an authorized user. This is a terminal state.

**Allowed Actions:**
- View cancelled estimate (read-only)
- Restore from cancellation (only within 30 days, transition to original pre-cancel state)
- Archive estimate

**Allowed Roles:** Estimate Owner, Admin

**Next Possible States:** Archived (if cancelled before approval), Original state (restoration)

**Business Rules:**
- Cancellation requires a reason
- Restoration is only possible within 30 days of cancellation
- Cancelled estimates are not included in standard reporting unless explicitly requested

### 21.11 Archived

**Purpose:** The estimate has been moved to long-term storage. It is preserved for compliance and historical reference but is not actively used.

**Allowed Actions:**
- View archived estimate (read-only)
- Search and filter archived estimates
- Restore from archive (transition to "Draft" or "In Progress")
- Export archived estimate

**Allowed Roles:** Admin, Audit team

**Next Possible States:** None (terminal)

**Business Rules:**
- Archived estimates are not included in active dashboards or reporting
- Archive is a soft-delete (data is retained)
- Compliance retention period is 7 years (per BR-019)

---

## 22. Estimate Creation Workflow

The complete business workflow for creating an estimate, from initial creation to customer delivery.

```
Create Estimate
  ↓
Select Estimate Type / Business Domain
  ↓
Select Package (Solid, Essential, Premium, Luxury, Custom)
  ↓
Enter Project Information (location, area, floors, customer)
  ↓
Select Materials (from Material Library, with overrides)
  ↓
Enter Labour Items (from Labour Library, with overrides)
  ↓
Apply Pricing Rules (location multipliers, area calculations)
  ↓
Review & Adjust BOQ Line Items
  ↓
Generate BOQ (structured line-item breakdown)
  ↓
Preview Estimate (review totals, taxes, discounts)
  ↓
Generate PDF (branded document with T&C)
  ↓
[Transition: Pending Approval]
  ↓
Approval
  ↓
[Transition: Approved]
  ↓
Share (Email, WhatsApp, Link, Customer Portal)
  ↓
[Transition: Shared]
  ↓
Customer Review
  ↓
[Transition: Accepted / Rejected / Requested Changes]
  ↓
[If Accepted → Convert to Project]
[If Rejected / Changes → Revision Workflow (Section 23)]
```

### 22.1 Workflow Phases

**Phase A: Initialization**
- User creates estimate from lead or scratch
- Selects business domain and estimate type
- Enters basic project information

**Phase B: Configuration**
- Selects and customizes a package
- Reviews and adjusts BOQ line items
- Material and labor selections are locked

**Phase C: Calculation**
- Pricing engine computes all costs
- Tax engine applies applicable taxes
- Discount engine applies any applicable discounts
- Cost summary aggregates all components

**Phase D: Review**
- User previews the estimate
- Verifies BOQ, pricing, taxes, and discounts
- Generates PDF preview

**Phase E: Approval**
- Workflow routes to "Pending Approval" state
- Approver reviews and approves or rejects

**Phase F: Delivery**
- Approved estimate is shared with customer
- Delivery status is tracked

### 22.2 Workflow Entry Points

| Entry Point | Description | Module Involved |
|-------------|-------------|-----------------|
| Lead → Estimate | Lead from CRM or website triggers estimate creation | Estimate Builder |
| Manual → Estimate | Admin manually creates an estimate | Estimate Builder |
| Template → Estimate | Estimate created from a saved template | Import/Export, Version Control |
| Revision → Estimate | New estimate version created from revision | Revision Manager, Version Control |

---

## 23. Estimate Revision Workflow

### 23.1 Revision Creation

When a customer requests changes or a pricing update is needed, a new revision of the estimate is created. The revision preserves the original estimate as a historical version and creates a new working copy.

**Process:**
1. User selects "Create Revision" from an approved estimate
2. System prompts for revision reason (mandatory)
3. System creates a new version with incremented version number
4. New version inherits all line items, pricing, and metadata from the parent
5. New version enters "In Progress" state for modification

**Business Rules:**
- Only approved estimates can be revised (per BR-010)
- Draft estimates cannot be revised
- Revision reason is mandatory and recorded in audit log
- The original estimate remains unchanged and read-only

### 23.2 Revision Numbering

Revisions follow a semantic versioning scheme:

| Component | Format | Example | Meaning |
|-----------|--------|---------|---------|
| Major | X.0.0 | 2.0.0 | Significant structural changes (package change, domain change) |
| Minor | X.Y.0 | 1.1.0 | Additions or modifications (new line items, updated quantities) |
| Patch | X.Y.Z | 1.0.1 | Minor adjustments (rate corrections, rounding fixes) |

**Business Rules:**
- The initial estimate is version 1.0.0
- Revisions increment based on change magnitude (auto-determined by system)
- Version numbers are immutable once assigned
- Each revision creates a new audit trail entry

### 23.3 Revision Comparison

Users can compare any two revisions of an estimate to see exactly what changed.

**Comparison Features:**
- Line-by-line diff of BOQ items (added, removed, modified)
- Side-by-side display of totals, taxes, and discounts
- Change highlighting (red for reductions, green for additions)
- Summary of change impact (total delta, percentage change)
- Approval comments and review notes included in comparison

**Business Rules:**
- Comparison is read-only
- Only revisions of the same estimate can be compared
- Deleted items are shown with strike-through
- Modified items show old vs. new values

### 23.4 Approval After Revision

Revised estimates follow the same approval workflow as original estimates but with revision-specific behavior.

**Process:**
1. Revised estimate is submitted for review (transitions to "Under Review")
2. Reviewer examines changes highlighted in revision comparison
3. Reviewer approves or requests further changes
4. If approved, estimate transitions to "Approved" (new version)
5. Previous approved version remains in history

**Business Rules:**
- Revision approval resets the estimate validity period
- Customer must re-approve revised estimates that are already shared
- Revision reason and reviewer comments are linked to the new version
- If a revision is rejected, the estimate returns to "In Progress"

### 23.5 History

Every revision creates a permanent historical record.

**History Includes:**
- Full snapshot of the estimate at each version
- Who created each revision and when
- Reason for each revision
- Approval and review comments per version
- All audit trail entries related to that version

**Business Rules:**
- History is immutable
- All versions are accessible for viewing (but not editing)
- Deleted revisions are archived, not purged

### 23.6 Rollback Policy

If a revision introduces errors or unwanted changes, the estimate can be rolled back.

**Rollback Options:**
- Restore to any previous version (full restore)
- Cherry-pick specific line items from a previous version (partial restore)
- Revert only pricing calculations while keeping structure changes

**Business Rules:**
- Rollback creates a new revision (does not overwrite history)
- Rollback requires approval from the same role that approved the current version
- Rollback reason is mandatory
- Rollback is logged as a separate business event

---

## 24. Approval Workflow

### 24.1 Approver Roles

| Role | Description | Approval Authority |
|------|-------------|-------------------|
| **Owner** | Business owner / Managing Director | Unlimited (any value) |
| **Sales** | Sales Manager | Up to ₹50 lakh (default, configurable) |
| **Estimator** | Senior Quantity Surveyor | Up to ₹10 lakh (default, configurable) |
| **Engineer** | Structural/Construction Engineer | Technical approval only (no monetary authority) |
| **Customer** | End client | Customer acceptance only (not internal approval) |

[ASSUMPTION] The monetary thresholds (₹10L, ₹50L) are placeholders and must be confirmed with business stakeholders before implementation.

### 24.2 Approval Sequence

The approval process follows a configurable sequence based on estimate value and business domain.

```
Estimate Submitted
  ↓
Routing Engine determines required approvers based on:
  - Estimate total value
  - Business domain
  - Customer type (new vs. existing)
  - Location
  ↓
Approver 1 (e.g., Estimator - technical review)
  ↓
[If > threshold: Approver 2 (e.g., Sales Manager)]
  ↓
[If > higher threshold: Approver 3 (e.g., Owner)]
  ↓
Final Decision
```

### 24.3 Approval Conditions

An estimate can only be approved when ALL of the following conditions are met:

| Condition | Requirement | Module |
|-----------|-------------|--------|
| All BOQ items priced | Every line item has a valid rate | BOQ Engine |
| Tax calculated | Tax engine has produced a tax breakdown | Tax Engine |
| Discount validated | Any discount above threshold has prior approval | Discount Engine |
| Required fields complete | All mandatory metadata is provided | Estimate Builder |
| Review comments addressed | All review comments have resolution status | Version Control |
| Terms accepted | Terms and conditions checkbox is confirmed | Estimate Builder |

### 24.4 Rejection Conditions

An approver can reject an estimate for any of the following reasons:

| Reason | Description |
|--------|-------------|
| **Pricing Error** | Calculations, rates, or totals are incorrect |
| **Incomplete BOQ** | Required line items are missing |
| **Tax Error** | Tax classification or calculation is incorrect |
| **Specification Mismatch** | Package or material selections don't match project requirements |
| **Terms Issue** | Terms and conditions are inappropriate for the project |
| **Other** | Free-text reason provided by approver |

**Business Rules:**
- Rejection reason is mandatory
- The estimate automatically transitions to "In Progress" when rejected
- The original submitter is notified with rejection details
- All rejection comments are visible in the version history

### 24.5 Escalation

| Time Elapsed | Escalation Action |
|-------------|------------------|
| 48 hours (review deadline) | Notification sent to reviewer's manager |
| 72 hours (approval deadline) | Notification sent to approver's manager |
| 5 days (no action) | Estimate is automatically escalated to Owner for decision |
| 7 days (no action) | Estimate is automatically archived |

[ASSUMPTION] The time thresholds (48h, 72h, 5d, 7d) are defaults and must be confirmed with business stakeholders.

---

## 25. Estimate Sharing Workflow

### 25.1 Sharing Channels

| Channel | Description | Capabilities |
|---------|-------------|--------------|
| **PDF Download** | Generate and download branded PDF | Full estimate with T&C, terms, signatures |
| **Email** | Send estimate via email with custom message | Track delivery, open, download |
| **WhatsApp** | Send estimate via WhatsApp | Quick delivery, mobile-first |
| **Link Sharing** | Generate a secure shareable link | Password protection, expiration, view limits |
| **Customer Portal** | Upload to customer's portal for self-service | Permanent access, history |
| **Future API** | Programmatic sharing via integration | Automated workflows, bulk sharing |

### 25.2 Delivery Tracking

| Event | Channels Tracked | Description |
|-------|-----------------|-------------|
| Sent | Email, WhatsApp, Link | Estimate has been dispatched |
| Delivered | Email, WhatsApp | Message received by recipient's device |
| Opened | Email, Link, Customer Portal | Recipient opened the estimate |
| Downloaded | Email, Link, Customer Portal | PDF was downloaded |
| Viewed Online | Link, Customer Portal | Estimate viewed in browser |
| Link Expired | Link | Shareable link has expired |

[ASSUMPTION] Open and view tracking requires recipient consent and compliance with data privacy regulations.

### 25.3 Customer View Status

| Status | Description | Timestamped |
|--------|-------------|-------------|
| Not Sent | Estimate has not been shared | N/A |
| Sent | Share request dispatched | Yes |
| Delivered | Message reached recipient | Yes |
| Viewed | Customer viewed the estimate | Yes |
| Interaction Detected | Customer scrolled or clicked within estimate | Yes |

---

## 26. Customer Decision Workflow

After an estimate is shared, the customer progresses through a decision workflow. Each stage is tracked and triggers appropriate notifications.

```
Shared
  ↓
Sent (delivered to customer)
  ↓
Viewed (customer opened the estimate)
  ↓
  ┌───────────────┬───────────────┬──────────────────┐
  ↓               ↓               ↓
Accepted       Rejected      Requested Changes
  ↓               ↓               ↓
Convert to     Log rejection   → Estimate Revision
Project        and feedback     Workflow (Section 23)
  ↓               ↓               ↓
  └───────────────┴───────────────┘
  ↓
Negotiation (if applicable)
  ↓
Accepted or Rejected (final)
  ↓
Archived
```

### 26.1 Decision States

| State | Purpose | Allowed Actions | Allowed Roles |
|-------|---------|-----------------|---------------|
| **Sent** | Estimate has been dispatched to customer | Track status, resend | Estimate Owner, Sales |
| **Viewed** | Customer has opened the estimate | Monitor view duration, follow up | Estimate Owner, Sales |
| **Opened** | Customer has interacted with estimate content | Send follow-up, prepare for response | Sales |
| **Accepted** | Customer agrees to terms and pricing | Convert to project, generate contract | Sales, Admin |
| **Rejected** | Customer declines the estimate | Log feedback, close estimate | Sales, Admin |
| **Requested Changes** | Customer requests modifications | Initiate revision workflow | Sales, Estimator |
| **Negotiation** | Back-and-forth discussion on terms | Send counter-proposals, revise | Sales, Estimator, Customer |
| **Converted to Project** | Customer acceptance triggers project creation | Create project record | Sales, Project Manager |
| **Cancelled** | Customer or business cancels the deal | Archive estimate | Sales, Admin |

### 26.2 Customer Interaction Tracking

| Interaction | Description |
|-------------|-------------|
| Time to View | Time between sharing and first view |
| View Duration | Total time spent viewing the estimate |
| Pages Viewed | Which sections were viewed |
| Download Action | Whether the customer downloaded the PDF |
| Comment Activity | Any comments or questions submitted by customer |

---

## 27. Estimate Expiry Workflow

### 27.1 Expiry Rules

| Rule | Description | Configurable |
|------|-------------|-------------|
| **Default Validity** | Estimates expire 90 days from approval date | Yes |
| **Domain-based Validity** | Validity period varies by business domain (e.g., renovation = 30 days, villa = 120 days) | Yes |
| **Location-based Validity** | Validity period varies by location (material scarcity regions may have shorter validity) | Yes |
| **High-value Validity** | Estimates above a threshold have shorter validity (e.g., ₹1 crore = 45 days) | Yes |
| **Manual Override** | Admin can set custom validity period per estimate | Yes |

[ASSUMPTION] The default 90-day validity and domain-based adjustments are placeholders that must be confirmed with business stakeholders.

### 27.2 Reminder Rules

| Reminder | Timing | Action |
|----------|--------|--------|
| First Reminder | 14 days before expiry | Email notification to owner and sales |
| Second Reminder | 3 days before expiry | Email + WhatsApp notification |
| Expiry Notification | On expiry date | Automatic transition to "Expired" state, notification to all stakeholders |
| Post-Expiry Reminder | 7 days after expiry | Email notification with renewal option |

[ASSUMPTION] The reminder timing intervals are defaults and must be confirmed with business stakeholders.

### 27.3 Renewal Rules

| Renewal Type | Description | Required Approval |
|-------------|-------------|-------------------|
| **Simple Renewal** | Same pricing, new validity period | Estimator or above |
| **Price Renewal** | Updated rates, same structure | Approver (same as original) |
| **Full Revision** | New package, new BOQ | Full approval workflow |

**Business Rules:**
- Simple renewal does not require new approval
- Price renewal requires same level of approval as original
- Full revision follows the standard creation workflow

### 27.4 Re-open Rules

| Condition | Action | Required Role |
|-----------|--------|---------------|
| Estimate is expired but within 30 days | Restore to "Approved" with new validity | Owner or Admin |
| Estimate is expired and beyond 30 days | Restore to "Draft" for re-creation | Owner only |
| Estimate is cancelled within 30 days | Restore to original pre-cancel state | Owner or Admin |
| Estimate is cancelled beyond 30 days | Must be archived permanently | Admin only |

---

## 28. Business Event Timeline

The following is the complete list of business events that occur throughout the Estimate Engine lifecycle. Each event is timestamped and attributable to a specific actor.

| ID | Event | Trigger | Logged By |
|----|-------|---------|-----------|
| EVT-001 | Estimate Created | User creates new estimate | Estimate Builder |
| EVT-002 | Estimate Updated | Any modification to estimate metadata | Version Control |
| EVT-003 | Package Selected | Package chosen and applied | Package Engine |
| EVT-004 | Package Modified | Package items added/removed/changed | Package Engine |
| EVT-005 | Material Added | Material added to BOQ | BOQ Engine |
| EVT-006 | Material Removed | Material removed from BOQ | BOQ Engine |
| EVT-007 | Material Updated | Material quantity or rate changed | BOQ Engine |
| EVT-008 | Labour Added | Labor item added to BOQ | BOQ Engine |
| EVT-009 | Labour Updated | Labor quantity or rate changed | BOQ Engine |
| EVT-010 | Calculation Run | Pricing calculation executed | Pricing Engine |
| EVT-011 | Discount Applied | Discount rule applied to estimate | Discount Engine |
| EVT-012 | Tax Calculated | Tax computation executed | Tax Engine |
| EVT-013 | BOQ Generated | BOQ finalized from package + manual items | BOQ Engine |
| EVT-014 | Estimate Submitted for Review | User submits estimate for review | Estimate Builder |
| EVT-015 | Review Started | Reviewer begins review | Approval Workflow |
| EVT-016 | Review Comment Added | Reviewer adds comment | Approval Workflow |
| EVT-017 | Review Completed | Reviewer finishes review | Approval Workflow |
| EVT-018 | Review Rejected | Reviewer rejects with comments | Approval Workflow |
| EVT-019 | Approval Requested | Estimate sent to approver | Approval Workflow |
| EVT-020 | Approval Granted | Approver approves estimate | Approval Workflow |
| EVT-021 | Approval Rejected | Approver rejects estimate | Approval Workflow |
| EVT-022 | Revision Created | New revision from approved estimate | Revision Manager |
| EVT-023 | Revision Approved | Revised estimate approved | Approval Workflow |
| EVT-024 | Revision Rejected | Revised estimate rejected | Approval Workflow |
| EVT-025 | PDF Generated | Branded PDF created | PDF Generator |
| EVT-026 | Estimate Shared | Estimate sent to customer | Sharing Module |
| EVT-027 | Estimate Emailed | Estimate sent via email | Sharing Module |
| EVT-028 | Estimate WhatsApp Sent | Estimate sent via WhatsApp | Sharing Module |
| EVT-029 | Share Link Generated | Secure link created | Sharing Module |
| EVT-030 | Customer Viewed | Customer opened the estimate | Sharing Module |
| EVT-031 | Customer Downloaded | Customer downloaded PDF | Sharing Module |
| EVT-032 | Estimate Accepted | Customer accepted terms | Customer Decision Workflow |
| EVT-033 | Estimate Rejected | Customer rejected estimate | Customer Decision Workflow |
| EVT-034 | Changes Requested | Customer requested modifications | Customer Decision Workflow |
| EVT-035 | Estimate Converted to Project | Customer acceptance → project creation | Integration |
| EVT-036 | Estimate Expired | Validity period exceeded | Version Control |
| EVT-037 | Estimate Renewed | Expired estimate renewed | Version Control |
| EVT-038 | Estimate Cancelled | Estimate voluntarily cancelled | Estimate Builder |
| EVT-039 | Estimate Archived | Estimate moved to archive | Version Control |
| EVT-040 | Estimate Restored | Archived estimate restored | Version Control |
| EVT-041 | Rollback Performed | Estimate rolled back to previous version | Revision Manager |
| EVT-042 | Export Generated | Estimate exported to CSV/Excel | Import/Export |
| EVT-043 | Import Executed | Data imported into engine | Import/Export |

---

## 29. Notifications

The Estimate Engine triggers notifications for critical business events across multiple channels.

### 29.1 Notification Events

| ID | Event | Default Channel(s) | Recipients |
|----|-------|-------------------|------------|
| NOT-001 | Estimate Created | Dashboard | Creator, assigned team |
| NOT-002 | Review Requested | Email, Dashboard | Reviewer |
| NOT-003 | Review Completed | Email, Dashboard | Approver, Creator |
| NOT-004 | Approval Requested | Email, Dashboard | Approver |
| NOT-005 | Approval Granted | Email, Dashboard, WhatsApp | Creator, Sales, Customer |
| NOT-006 | Approval Rejected | Email, Dashboard | Creator |
| NOT-007 | Revision Created | Email, Dashboard | Creator, Approver |
| NOT-008 | Estimate Shared | Dashboard | Creator, Customer (via channel used) |
| NOT-009 | Customer Viewed | Email, Dashboard | Creator, Sales |
| NOT-010 | Customer Accepted | Email, Dashboard, WhatsApp | Sales, Project Manager |
| NOT-011 | Customer Rejected | Email, Dashboard | Sales, Creator |
| NOT-012 | Changes Requested | Email, Dashboard | Creator, Estimator |
| NOT-013 | Estimate Expiring (14 days) | Email, Dashboard | Owner, Sales |
| NOT-014 | Estimate Expiring (3 days) | Email, WhatsApp, Dashboard | Owner, Sales |
| NOT-015 | Estimate Expired | Email, Dashboard | Owner, Sales, Admin |
| NOT-016 | Escalation Triggered | Email, Dashboard | Approver's manager, Owner |
| NOT-017 | Reminder Overdue | Email, Dashboard | Approver's manager, Owner |

### 29.2 Notification Channels

| Channel | Description | Characteristics |
|---------|-------------|----------------|
| **Email** | SMTP-based email notifications | Rich formatting, attachments, tracking |
| **WhatsApp** | WhatsApp Business API messages | Mobile-first, quick delivery |
| **Dashboard** | In-app notifications in the Estimate Engine UI | Real-time, persistent, dismissible |
| **Push** | Mobile push notifications | Requires mobile app integration (future) |
| **SMS** | Text message notifications | Fallback for critical alerts (future) |

### 29.3 Future Integrations

| Integration | Purpose | Future PRD |
|-------------|---------|-----------|
| Slack | Team notifications in Slack channels | PRD-03 (CRM) |
| Microsoft Teams | Team notifications in Teams | PRD-03 (CRM) |
| SMS Gateway | Critical alert delivery via SMS | PRD-03 (CRM) |
| Mobile Push | Push notifications to mobile app | PRD-07 (Mobile App) |
| Webhooks | Custom integration for third-party systems | PRD-08 (SaaS) |

[ASSUMPTION] WhatsApp and Email are the primary channels for MVP. Push and SMS are future enhancements.

---

## 30. Audit Requirements

The Audit Log must capture specific information for every auditable action performed within the Estimate Engine. Not all actions generate audit entries — only those that modify estimate state, configuration, or business data.

### 30.1 Auditable Actions

The following actions must always generate an audit log entry:

| ID | Action | Module |
|----|--------|--------|
| AUD-001 | Estimate created | Estimate Builder |
| AUD-002 | Estimate metadata updated | Estimate Builder |
| AUD-003 | Package selected/applied | Package Engine |
| AUD-004 | Package items modified (added/removed/changed) | Package Engine |
| AUD-005 | Material added to BOQ | BOQ Engine |
| AUD-006 | Material removed from BOQ | BOQ Engine |
| AUD-007 | Material quantity changed | BOQ Engine |
| AUD-008 | Material rate changed | BOQ Engine |
| AUD-009 | Labour item added | BOQ Engine |
| AUD-010 | Labour item modified | BOQ Engine |
| AUD-011 | Calculation executed | Pricing Engine |
| AUD-012 | Discount applied or modified | Discount Engine |
| AUD-013 | Discount approval obtained | Approval Workflow |
| AUD-014 | Tax rate or classification changed | Tax Engine |
| AUD-015 | Estimate submitted for review | Estimate Builder |
| AUD-016 | Review comments added | Approval Workflow |
| AUD-017 | Review completed (approved/rejected) | Approval Workflow |
| AUD-018 | Estimate approved | Approval Workflow |
| AUD-019 | Estimate rejected | Approval Workflow |
| AUD-020 | Revision created | Revision Manager |
| AUD-021 | Revision approved | Approval Workflow |
| AUD-022 | Revision rejected | Approval Workflow |
| AUD-023 | Rollback performed | Revision Manager |
| AUD-024 | PDF generated | PDF Generator |
| AUD-025 | Estimate shared (any channel) | Sharing Module |
| AUD-026 | Customer viewed estimate | Sharing Module |
| AUD-027 | Customer accepted estimate | Customer Decision Workflow |
| AUD-028 | Customer rejected estimate | Customer Decision Workflow |
| AUD-029 | Customer requested changes | Customer Decision Workflow |
| AUD-030 | Estimate expired | Version Control |
| AUD-031 | Estimate renewed | Version Control |
| AUD-032 | Estimate cancelled | Estimate Builder |
| AUD-033 | Estimate archived | Version Control |
| AUD-034 | Estimate restored from archive | Version Control |
| AUD-035 | Estimate exported | Import/Export |
| AUD-036 | Data imported | Import/Export |
| AUD-037 | Configuration settings changed | Audit Log |

### 30.2 Audit Log Entry Structure

Each audit log entry must contain the following fields:

| Field | Description | Required |
|-------|-------------|----------|
| **Timestamp** | UTC timestamp of the action (ISO 8601 format) | Yes |
| **Actor** | User ID, name, role, and IP address of the performer | Yes |
| **Action** | Type of action (from table above) | Yes |
| **Object ID** | ID of the estimate, BOQ item, or entity affected | Yes |
| **Object Type** | Type of object (estimate, line item, approval, etc.) | Yes |
| **Previous Value** | State of the value before the change | Yes (for modifications) |
| **New Value** | State of the value after the change | Yes (for modifications) |
| **Reason** | User-provided reason for the change (if applicable) | No (mandatory for cancellations, rejections) |
| **Session ID** | Traceability session identifier | Yes |
| **Correlation ID** | Links related events (e.g., revision + approval) | No |

### 30.3 Retention and Access

| Requirement | Policy |
|-------------|--------|
| **Retention Period** | 7 years for all audit entries (compliance with Indian tax and commercial law) |
| **Access Control** | Read-only for Admin and Audit roles; no write access after creation |
| **Tamper Evidence** | Each entry is cryptographically hashed; any modification breaks the chain |
| **Export** | Full audit log export available for compliance audits |
| **Search** | Audit entries searchable by timestamp, actor, action type, and object ID |

---

## 31. Pricing Philosophy

The Pricing Engine is built on seven core pricing principles that govern how all costs are determined, presented, and managed within the Estimate Engine. These principles ensure the pricing system is fair, consistent, and maintainable.

### 31.1 Transparency

All pricing components, rules, and calculations must be fully visible to authorized users. No pricing logic should be hidden or opaque. Users must be able to trace any total back to its constituent parts.

**Business Rules:**
- Every line item on the BOQ must show its unit, quantity, rate, and resulting amount
- The cost summary must break down totals by category (material, labour, transportation, markup, discount, tax, etc.)
- All applied multipliers (location, area, floor) must be displayed with their source and value
- Users must be able to view the calculation chain for any sub-total
- The pricing component ledger must show every component's contribution to the final total

### 31.2 Consistency

Every estimate must produce identical results when given the same inputs. Pricing must be deterministic — the same package, materials, labor, and rules always produce the same total.

**Business Rules:**
- The same package selection must produce identical BOQ items across all estimates
- Tax calculation must use the same logic for all estimates in the same location and domain
- Discount rules must be applied in a consistent order (see Section 40, Calculation Order)
- Price overrides must be logged with reasons and visible in the audit trail
- Material and labor rates must be fetched from the same library source at the same effective date

### 31.3 Reusability

Pricing components, rules, and configurations must be reusable across estimates, domains, and future products. The engine should not rebuild pricing logic from scratch for each estimate.

**Business Rules:**
- Material rates, labor rates, and tax rules are managed centrally (via Material Library, Labour Library, and Tax Engine)
- Package templates are reusable and versionable
- Location multipliers are reusable per geographic region
- Pricing rules defined for one estimate can be referenced in another
- Custom pricing components created for one domain can be reused in another

### 31.4 Scalability

The pricing system must scale from simple estimates (a few line items) to complex estimates (hundreds of line items) without degradation in performance or accuracy.

**Business Rules:**
- Pricing calculations must complete within 10 seconds for estimates up to 500 line items (target)
- The engine must support caching of frequently accessed reference data (rates, multipliers)
- Pricing rules must be applied in O(n) complexity where possible
- The system must support pagination for estimates exceeding display limits
- Batch processing of estimates is supported for bulk operations

### 31.5 Manual Override

Authorized users must be able to override any automatically computed pricing value. Overrides should be exceptional, logged, and reversible, but never blocked.

**Business Rules:**
- Any rate, quantity, or multiplier can be overridden with a justification note
- Overrides require role-based approval (see Section 39, Manual Overrides)
- All overrides are logged in the audit trail with previous and new values
- Overrides can be rolled back to the automatically computed value at any time
- Override history is preserved across estimate revisions

### 31.6 Auditability

Every pricing decision must be traceable. The engine must log what was calculated, when, by whom (or by which rule), and what the result was.

**Business Rules:**
- All pricing calculations generate a calculation log entry
- All rate changes (manual or automatic) are tracked with timestamp and actor
- All override actions are logged with reason
- All discount and tax applications are logged separately
- The audit trail must support reconstruction of any estimate's pricing at any point in time

### 31.7 Metadata-Driven Architecture

The Pricing Engine must be completely metadata-driven. No pricing component, rule, multiplier, or calculation should be hardcoded in the engine logic. All pricing behaviour is defined through configuration that can be managed by administrators.

**Business Rules:**
- All pricing components are defined as metadata entries (not code)
- All calculation rules are defined as metadata entries (not code)
- All multipliers (location, area, floor) are metadata-driven
- All discount and tax rules are metadata-driven
- Configuration changes do not require code deployment
- New pricing components can be added without modifying engine code

---

## 32. Pricing Components

The Estimate Engine must never assume that Material or Labour always exist. Instead, every estimate is composed of configurable Pricing Components. Each component is a metadata-driven entity that contributes to the overall estimate total through its defined calculation behaviour.

The system is completely metadata-driven — no pricing component is hardcoded, and the Pricing Engine evaluates all calculation behaviour from metadata at runtime.

The system must allow an administrator to:
- Create new pricing components
- Disable existing components
- Rename components
- Reorder components
- Hide components for specific estimate types
- Reuse components across multiple business domains

No component should be hardcoded. The Pricing Engine must be completely metadata-driven.

### 32.1 Pricing Component Catalog

The following are standard pricing components available in the system. Administrators can create additional custom components as needed.

| # | Component Name | Category | Description |
|---|----------------|----------|-------------|
| 1 | Material | Input | Physical construction materials (cement, steel, tiles, etc.) |
| 2 | Labour | Input | Human labour costs (masons, carpenters, electricians, etc.) |
| 3 | Product | Input | Pre-fabricated or manufactured products (doors, windows, fixtures) |
| 4 | Service | Input | Professional services (consulting, supervision) |
| 5 | Consultancy | Input | Design and engineering consultancy fees |
| 6 | Design Fee | Input | Architectural or interior design fees |
| 7 | Installation | Input | Installation and fitting costs |
| 8 | Transportation | Adjustment | Transport of materials to site |
| 9 | Equipment | Input | Construction equipment rentals |
| 10 | Machinery | Input | Heavy machinery usage costs |
| 11 | Rental | Input | Equipment or machinery rental |
| 12 | Markup | Adjustment | Percentage-based markup on subtotals |
| 13 | Contingency | Adjustment | Risk buffer applied as percentage |
| 14 | Margin | Adjustment | Profit margin applied to totals |
| 15 | Taxes | Adjustment | Tax computations (GST, cess, regional taxes) |
| 16 | Discount | Adjustment | Reductions applied to totals |
| 17 | Round-off | Adjustment | Final rounding of the estimate total |
| 18 | Custom Component | Any | Administrator-defined component for any purpose |

### 32.2 Component Definition Attributes

Each pricing component must define the following attributes. All attributes are configurable metadata — no defaults are hardcoded.

#### 32.2.1 Purpose

**Purpose:** A human-readable description of what the component represents and why it exists in the estimation process.

**Business Rule:** Purpose must be provided when creating or renaming a component. It must be at least 10 characters and clearly describe the component's role.

#### 32.2.2 Category

**Purpose:** Classifies the component into one of four categories that determine how it participates in the calculation sequence.

| Category | Description | Calculation Order Impact |
|----------|-------------|------------------------|
| **Input** | Direct input costs (materials, labour, services) | Applied first |
| **Adjustment** | Modifies the subtotal (markup, discount, taxes, contingency) | Applied after inputs |
| **Output** | Derived values (profit, final total) | Applied last |
| **Any** | Can be used in any category (custom components) | Configurable by admin |

**Business Rules:**
- Category determines the component's position in the calculation sequence (see Section 40)
- Input components are always calculated before Adjustment components
- Output components are always calculated last
- Administrators can change a component's category, which updates its calculation order

#### 32.2.3 Applicability

**Purpose:** Defines which estimates and domains this component applies to.

| Applicability Type | Description |
|-------------------|-------------|
| **All Estimates** | Component appears in every estimate, regardless of domain or type |
| **Domain-Specific** | Component appears only for selected business domains (e.g., Transportation only for remote sites) |
| **Estimate Type-Specific** | Component appears only for specific estimate types (e.g., Consultancy only for design-build projects) |
| **Conditional** | Component appears based on project conditions (e.g., Contingency only for high-risk projects) |
| **Never** | Component is disabled and never appears |

**Business Rules:**
- Applicability rules are evaluated at estimate creation time
- Domain-specific applicability overrides "All Estimates"
- Conditional applicability is evaluated based on project parameters at runtime

#### 32.2.4 Calculation Behaviour

**Purpose:** Defines how the component's value is computed. This is entirely metadata-driven — the Pricing Engine reads the calculation type and applies the corresponding logic at runtime.

| Calculation Type | Description |
|-----------------|-------------|
| **Per Unit Quantity** | Value = quantity × unit rate |
| **Per Area** | Value = area measurement × rate per unit area |
| **Per Floor** | Value = number of floors × rate per floor |
| **Flat Amount** | Value = fixed amount |
| **Percentage** | Value = percentage × base amount |
| **Tiered Percentage** | Value = percentage varies by tier thresholds |
| **Lookup Table** | Value determined from a configurable table |
| **Formula-Based** | Value computed by the Formula Engine using a metadata-defined formula |
| **External** | Value fetched from an external system (future) |
| **Manual** | Value entered manually by user |

**Business Rules:**
- The calculation type is defined in metadata, not in code
- Parameters for each calculation type are also metadata
- If a calculation type requires a dependency that is not available, the component value is zero with a warning
- Formula-based components delegate to the Formula Engine

#### 32.2.5 Dependencies

**Purpose:** Lists which other pricing components, libraries, or data sources this component depends on.

| Dependency Type | Description |
|-----------------|-------------|
| **BOQ Items** | Depends on bill of quantities line items |
| **Material Library** | Depends on material rate data |
| **Labour Library** | Depends on labour rate data |
| **Location Data** | Depends on geographic multipliers |
| **Area Data** | Depends on project area measurements |
| **Floor Data** | Depends on number of floors |
| **Package Definition** | Depends on selected package configuration |
| **Parent Component** | Depends on another component's subtotal |
| **External System** | Depends on external API or data source (future) |
| **None** | No dependencies (fully independent) |

**Business Rules:**
- If a dependency is not available or invalid, the component cannot be calculated
- Dependencies are resolved recursively
- Circular dependencies are detected and blocked
- The Pricing Engine evaluates all dependencies before invoking calculation behaviour

#### 32.2.6 Visibility

**Purpose:** Controls when and where the component is visible to users.

| Visibility Option | Description |
|-------------------|-------------|
| **Always Visible** | Component is shown on all estimate views |
| **Hidden from Summary** | Component value is included in totals but not displayed in the summary view |
| **Hidden from BOQ** | Component is not added as a line item but is included in totals |
| **Admin Only** | Component is only visible to admin users |
| **Estimator Only** | Component is only visible to estimator and above |
| **Hidden (Audit Only)** | Component is never displayed to users but is logged in audit trail |

**Business Rules:**
- Hidden components still participate in calculations
- Visibility rules are role-based and evaluated at render time
- Changing visibility does not affect calculation results

#### 32.2.7 Editability

**Purpose:** Controls who can modify the component's value or parameters.

| Editability Level | Allowed Roles | Description |
|-------------------|---------------|-------------|
| **Full Edit** | All authorized roles (Estimator, Engineer, Admin) | Users can change all parameters |
| **Rate Override Only** | Estimator, Engineer, Admin | Users can override the rate but not quantity |
| **Quantity Override Only** | Estimator, Engineer, Admin | Users can override quantity but not rate |
| **Read-Only** | None | Value is fully computed; users cannot modify |
| **Admin Override** | Admin only | Only admins can change; others see computed value |
| **Approval-Gated** | Estimator → Review → Approve | Changes require approval workflow |

**Business Rules:**
- Editability is role-based and configurable per component
- Changes to editable components by non-admin users require audit logging
- Approval-gated editability triggers the approval workflow for any change

#### 32.2.8 Reusability

**Purpose:** Defines whether and how the component can be reused across estimates, domains, and products.

| Reusability Level | Description |
|-------------------|-------------|
| **Global** | Component is available to all business domains and estimate types |
| **Domain-Shared** | Component is shared across specified domains |
| **Domain-Isolated** | Component is specific to a single business domain |
| **Estimate-Specific** | Component is only available within the estimate it was created for |
| **Product-Scoped** | Component is available to the Estimate Engine and one or more future products |

**Business Rules:**
- Global and Domain-Shared components can be referenced by other modules
- Product-Scoped components must have their interfaces defined to avoid Estimate Engine coupling
- Domain-Isolated components can still be exported and imported by the Import/Export module

#### 32.2.9 Enable/Disable Rules

**Purpose:** Controls when a component is enabled or disabled for calculation.

| Rule Type | Description |
|-----------|-------------|
| **Always Enabled** | Component is always calculated when applicable |
| **Threshold-Based** | Component is enabled only when a condition is met (e.g., total exceeds threshold triggers Contingency) |
| **Date-Based** | Component is enabled or disabled based on effective dates |
| **Domain-Based** | Component is enabled or disabled per business domain |
| **Estimate Type-Based** | Component is enabled or disabled per estimate type |
| **Manual Toggle** | Component can be enabled or disabled by the user at estimate time |

**Business Rules:**
- Disabled components produce a value of zero and are excluded from totals
- Manual toggle is recorded in the audit trail
- Threshold-based rules are evaluated after the base calculation is complete

#### 32.2.10 Future Expansion

Each component is designed to support future enhancements without requiring changes to the component definition.

| Expansion Capability | Description |
|---------------------|-------------|
| **Metadata Versioning** | Component definitions can be versioned; old estimates use the version at time of creation |
| **Plugin Architecture** | New calculation types can be added as plugins without engine code changes |
| **External Integration** | External calculation types can be registered via API (future) |
| **AI Augmentation** | Component values can be AI-suggested (future) |
| **Multi-Currency** | Component values can be stored and displayed in multiple currencies (future) |

### 32.3 Administrator Capabilities

The system must allow an administrator to manage pricing components entirely through a metadata management interface (no code changes required).

| Capability | Description | Constraint |
|-----------|-------------|------------|
| **Create New Pricing Components** | Define a new component with all attributes (purpose, category, calculation behaviour, dependencies, visibility, editability, reusability, enable/disable rules) | Must have a unique component code |
| **Disable Existing Components** | Mark a component as disabled so it no longer appears in estimates | Cannot disable components that are actively in use by approved estimates |
| **Rename Components** | Change the display name of a component | Existing estimates use the name at time of creation; new estimates use the new name |
| **Reorder Components** | Change the sequence in which components appear in the cost summary | Reordering affects display only, not calculation order (calculation order is per Section 40) |
| **Hide Components for Specific Estimate Types** | Configure visibility rules so certain components don't appear for specific estimate types | Visibility can be overridden per estimate |
| **Reuse Components Across Multiple Business Domains** | Configure reusability settings to make a component available in multiple domains | Domain configuration is managed centrally |

**Business Rules:**
- No pricing component is hardcoded in the engine — all are metadata
- Component configuration changes are versioned
- Changes to component definitions do not retroactively alter existing approved estimates
- All administrative actions on components are logged in the audit trail
- The Pricing Engine evaluates all calculation behaviour from metadata at runtime

---

## 33. Pricing Rules

Pricing rules govern how each pricing component behaves within the estimate. Every rule is defined as metadata and applied by the Pricing Engine without hardcoded logic.

### 33.1 Material Pricing Rules

| Rule ID | Rule Name | Purpose | Dependencies | Priority | Override Rules |
|---------|-----------|---------|-------------|----------|----------------|
| PR-MAT-01 | Effective-Date Rate Selection | Use the material rate that was effective at the time of estimate creation, not the current rate | Material Library | P0 | Admin can override rate manually |
| PR-MAT-02 | Location Multiplier | Apply a location-based multiplier to material costs | Location Data, Material Library | P0 | Multiplier can be overridden with justification |
| PR-MAT-03 | Grade Upgrade Cost | Charge the difference when upgrading from standard to premium material grade | Material Library | P1 | Upgrade can be reverted to standard grade |
| PR-MAT-04 | Bulk Quantity Discount | Apply volume-based discount on material quantities | Material Library | P1 | Discount can be overridden |
| PR-MAT-05 | Equivalent Material Fallback | If a specified brand is unavailable, use the equivalent material rate | Material Library | P2 | Manual substitution allowed |

### 33.2 Labour Pricing Rules

| Rule ID | Rule Name | Purpose | Dependencies | Priority | Override Rules |
|---------|-----------|---------|-------------|----------|----------------|
| PR-LAB-01 | Regional Labour Rates | Use labour rates specific to the project location | Location Data, Labour Library | P0 | Rate can be overridden with justification |
| PR-LAB-02 | Productivity Factor | Adjust labour hours based on worker productivity benchmarks | Labour Library | P0 | Factor can be overridden |
| PR-LAB-03 | Floor-wise Multiplier | Apply different labour multipliers for different floors | Floor Data | P1 | Multiplier can be overridden |
| PR-LAB-04 | Skill Premium | Charge premium rates for certified or specialized labour | Labour Library | P1 | Premium can be applied or removed |
| PR-LAB-05 | Overtime Calculation | Apply overtime rates for work beyond standard hours | Labour Library | P2 | Overtime can be disabled per project |

### 33.3 Area-Based Pricing Rules

| Rule ID | Rule Name | Purpose | Dependencies | Priority | Override Rules |
|---------|-----------|---------|-------------|----------|----------------|
| PR-ARE-01 | Built-up Area Multiplier | Apply per-square-foot rates based on built-up area | Area Data | P0 | Area entry can be overridden |
| PR-ARE-02 | Floor Count Multiplier | Apply per-floor rates based on number of floors | Floor Data | P0 | Floor count can be overridden |
| PR-ARE-03 | Deduction for Unfinished Areas | Deduct cost for areas that will not receive full finishing | Area Data | P1 | Deduction percentage can be overridden |

### 33.4 Markup and Margin Pricing Rules

| Rule ID | Rule Name | Purpose | Dependencies | Priority | Override Rules |
|---------|-----------|---------|-------------|----------|----------------|
| PR-MRK-01 | Standard Markup | Apply default markup percentage on cost subtotal | Markup Component | P0 | Markup percentage can be overridden |
| PR-MRK-02 | Domain-Specific Markup | Use different markup rates per business domain | Business Domain | P1 | Domain markup can be overridden |
| PR-MRK-03 | Minimum Margin | Enforce minimum profit margin on all estimates | Cost Summary | P0 | Minimum margin can be overridden by Owner |
| PR-MRK-04 | Maximum Margin Cap | Cap maximum margin for competitive quotations | Cost Summary | P1 | Cap can be overridden by Owner with justification |

### 33.5 Discount Pricing Rules

| Rule ID | Rule Name | Purpose | Dependencies | Priority | Override Rules |
|---------|-----------|---------|-------------|----------|----------------|
| PR-DIS-01 | Campaign Discount | Apply promotional discount for specified campaign periods | Discount Component | P1 | Campaign can be removed |
| PR-DIS-02 | Volume Discount | Apply discount based on total estimate value | Cost Summary | P1 | Discount can be reduced or removed |
| PR-DIS-03 | Customer Loyalty Discount | Apply discount for returning customers | Customer Data | P2 | Can be added or removed |
| PR-DIS-04 | Approval-Based Discount | Discounts above threshold require explicit approval | Approval Workflow | P0 | Cannot be overridden without approval |

### 33.6 Tax Pricing Rules

| Rule ID | Rule Name | Purpose | Dependencies | Priority | Override Rules |
|---------|-----------|---------|-------------|----------|----------------|
| PR-TAX-01 | GST Rate by Location | Apply CGST/SGST or IGST based on site location | Location Data, Tax Engine | P0 | Cannot be overridden |
| PR-TAX-02 | Tax Classification | Classify materials and services as taxable or exempt | Material Library, Labour Library | P0 | Tax classification can be overridden by Admin |
| PR-TAX-03 | Cess Application | Apply cess on specific material categories | Material Library, Tax Engine | P1 | Cess can be removed if exempt |
| PR-TAX-04 | Reverse Charge Mechanism | Apply reverse charge for specific vendor types | Vendor Data (future) | P1 | Requires manual confirmation |

### 33.7 Contingency and Adjustment Rules

| Rule ID | Rule Name | Purpose | Dependencies | Priority | Override Rules |
|---------|-----------|---------|-------------|----------|----------------|
| PR-CON-01 | Risk-Based Contingency | Apply contingency percentage based on project risk profile | Estimate Builder | P1 | Percentage can be overridden |
| PR-CON-02 | Unforeseen Work Buffer | Add buffer for scope changes and unforeseen conditions | Estimate Builder | P2 | Buffer can be added or removed |
| PR-ADJ-01 | Transportation Cost | Add transportation cost based on distance from depot | Location Data | P1 | Cost can be overridden |
| PR-ADJ-02 | Site Condition Premium | Apply premium for difficult site conditions | Site Conditions | P1 | Premium can be removed |
| PR-ADJ-03 | Seasonal Rate Adjustment | Apply seasonal multiplier for peak/off-season work | Date Data | P2 | Adjustment can be overridden |

### 33.8 Override Rules Summary

| Condition | Override Authority | Approval Required |
|-----------|-------------------|-------------------|
| Rate override | Estimator or above | No (logged only) |
| Calculation rule override | Engineer or above | No (logged only) |
| Tax override | Admin only | Yes (audit logging for tax overrides) |
| Discount above threshold | Approver | Yes (Section 24) |
| Markup override | Estimator or above | No (logged only) |
| Contingency override | Estimator or above | No (logged only) |

[ASSUMPTION] The specific threshold values for overrides are configurable and must be confirmed with business stakeholders before implementation.

---

## 34. Package Pricing Behaviour

Packages are pre-defined bundles of materials, labour, and services. The pricing behaviour of packages determines how their contents contribute to the estimate total.

### 34.1 Base Package

**Purpose:** A base package is the standard package definition that ships with the system or is created by an administrator. It contains a fixed set of BOQ line items with default quantities, rates, and specifications.

**Pricing Behaviour:**
- When a base package is selected, all its line items are added to the BOQ at their default rates
- Rates are pulled from the Material Library and Labour Library at the time of package application
- Any project-specific parameters (location, area, floors) trigger applicable multipliers
- The base package total is the sum of all its line item amounts before adjustments

**Business Rules:**
- Base package rates are effective-dated (per BR-016)
- Base package selection is recorded as a single business event (EVT-003)
- Modifying any line item from a base package creates a "Modified Base Package" variant

### 34.2 Inherited Package

**Purpose:** An inherited package is derived from a parent package (base or another inherited package) but with modifications. Inheritance preserves a link to the parent for traceability.

**Pricing Behaviour:**
- Inherited packages start with all line items from the parent package
- Modifications (additions, removals, quantity/rate changes) are recorded as delta changes
- The total is computed as: parent_total + sum of deltas
- Only delta changes are stored; inherited items reference the parent

**Business Rules:**
- Inheritance chain is tracked for audit purposes
- Changes to parent package rates do NOT automatically propagate to inherited packages (rate locking)
- Users can view the inheritance tree at any time
- Inherited packages can themselves be inherited from (multi-level inheritance)

### 34.3 Package Upgrade

**Purpose:** Upgrading a package moves from a lower-tier package to a higher-tier package, adding materials, labour, and services not present in the original.

**Pricing Behaviour:**
- The system computes the delta between the current package and the upgrade target
- New line items are added at their standard rates
- Existing line items that exist in both packages have their specifications updated
- Existing line items unique to the old package are removed
- The upgrade cost is: new_subtotal - old_subtotal (before adjustments)

**Business Rules:**
- Upgrade preserves all manual overrides applied to the original package
- Upgrade is logged as a package modification event (EVT-004)
- Users can review the upgrade diff before applying

### 34.4 Package Downgrade

**Purpose:** Downgrading a package moves from a higher-tier package to a lower-tier package, removing materials, labour, and services.

**Pricing Behaviour:**
- Line items not present in the target package are removed
- Existing line items that exist in both packages are retained
- The downgrade savings are: old_subtotal - new_subtotal (before adjustments)
- Removed items are logged but not zeroed (they appear in comparison views as removed)

**Business Rules:**
- Downgrade cannot remove items that have customer-specific overrides
- Downgrade requires confirmation for any removed line item
- Downgrade is logged as a package modification event (EVT-004)

### 34.5 Package Locking

**Purpose:** Package locking prevents further automatic changes to package-derived line items. Once locked, the package contents are frozen for calculation purposes.

**Pricing Behaviour:**
- When a package is locked, all its BOQ line items are snapshot at their current values
- Subsequent rate changes in Material Library or Labour Library do not affect locked packages
- Manual overrides can still be applied to locked packages (subject to override rules)
- Unlocking a package restores the link to live library rates

**Business Rules:**
- Package locking is triggered automatically when the estimate transitions to "Approved" (per BR-004)
- Users can manually lock/unlock packages in "In Progress" status
- Unlocking requires admin role
- Lock/unlock is logged in the audit trail

### 34.6 Custom Package

**Purpose:** A custom package is created entirely or partially by the user, starting from scratch or by modifying an existing package template.

**Pricing Behaviour:**
- Custom packages have no parent and are standalone
- All line items are manually selected or added by the user
- Rates are pulled from libraries at time of selection
- No inheritance link is maintained
- Custom packages can be saved as templates for future reuse

**Business Rules:**
- Custom packages require at least one line item
- Saving as a template requires a unique name
- Custom package templates follow the same versioning rules as base packages

### 34.7 Package Templates

**Purpose:** Package templates are reusable definitions of packages that can be instantiated in new estimates. They are managed by administrators and version-controlled.

**Pricing Behaviour:**
- When a template is instantiated, its line items are copied into the new estimate's BOQ
- Rates are pulled from libraries at instantiation time
- Template version is recorded for audit purposes
- Updates to a template do not affect existing estimates (per BR-016)

**Business Rules:**
- Templates can be versioned; only the latest version is offered to new estimates
- Older versions remain accessible for existing estimates
- Template changes are logged in the audit trail
- Templates can be domain-specific or global

---

## 35. Material Pricing Behaviour

Material pricing behaviour defines how material costs are calculated, adjusted, and applied within the estimate. The engine does not assume Material always exists — materials are one of many configurable pricing components.

### 35.1 Standard Materials

**Purpose:** Standard materials are the default, most commonly used materials for each category (e.g., standard cement, standard steel grade).

**Pricing Behaviour:**
- Standard materials use the default rate from the Material Library for the selected domain and location
- Rate = library_rate × location_multiplier × area_multiplier × floor_multiplier
- Standard materials are included in packages by default

**Business Rules:**
- Standard material rates are effective-dated
- Location multipliers are applied after rate lookup
- Area and floor multipliers are only applied if the calculation type supports them

### 35.2 Premium Materials

**Purpose:** Premium materials are higher-quality alternatives to standard materials (e.g., premium tiles, Vitrified tiles, specific brand fixtures).

**Pricing Behaviour:**
- Premium materials have a higher rate than standard materials
- The premium amount is: (premium_rate - standard_rate) × quantity
- Premium rates are per-domain and per-location configurable

**Business Rules:**
- Upgrading to premium materials creates a delta cost
- Premium material selection is logged as a modification event (EVT-007)
- Users can compare standard vs. premium side-by-side

### 35.3 Brand Replacement

**Purpose:** When a specific branded material is specified but needs to be replaced with a different brand of the same specification.

**Pricing Behaviour:**
- The replacement rate is pulled from the Material Library for the specified brand
- If the brand is unavailable, the equivalent material rate is used
- The price difference is: (replacement_rate - original_rate) × quantity

**Business Rules:**
- Brand replacement requires a justification note
- Replacement is logged in the audit trail
- Users can revert to the original brand at any time

### 35.4 Equivalent Material

**Purpose:** When a specified material is unavailable or discontinued, an equivalent material of the same specification is used.

**Pricing Behaviour:**
- The equivalent material rate is pulled based on material category, grade, and specification
- A fallback chain is defined: exact match → category match → grade match → category + grade match
- If no equivalent is found, the component value is zero with a warning

**Business Rules:**
- Equivalent material substitution is triggered automatically when the original is marked "discontinued"
- Users are notified of automatic substitutions
- All substitutions are logged in the audit trail

### 35.5 Optional Material

**Purpose:** Materials that are not included in the base package but can be optionally added by the user.

**Pricing Behaviour:**
- Optional materials appear in a separate section during package configuration
- They are not included in the package total by default
- Users can toggle optional materials on or off
- When toggled on, the material is added to the BOQ at its current rate

**Business Rules:**
- Optional material status can be changed at any time before approval
- Changes are logged as BOQ modifications (EVT-005, EVT-006)
- Optional materials are clearly marked in the BOQ

### 35.6 Customer Supplied Material

**Purpose:** Materials that the customer provides directly, for which only handling and installation costs are charged.

**Pricing Behaviour:**
- The material cost is set to zero
- Only the installation or handling component is charged
- The supply cost is excluded from the estimate total but shown as a line item with zero rate

**Business Rules:**
- Customer-supplied materials must be explicitly marked
- A "CS" (Customer Supplied) tag is displayed on the line item
- The total material cost reflects only supplied materials, not customer-supplied ones

### 35.7 Future Price Updates

**Purpose:** Material rates change over time. The engine must handle future price updates without breaking existing estimates.

**Pricing Behaviour:**
- When a material rate is updated in the library, existing estimates are NOT affected (rate locking)
- New estimates use the updated rate
- A notification is sent to estimates where the rate has changed since creation
- Users can optionally update rates in drafts (with audit logging)

**Business Rules:**
- Rate updates create a new version of the material library entry
- Old and new rates coexist with effective dates
- Estimates in "Draft" or "In Progress" can be updated; "Approved" and above cannot

---

## 36. Labour Pricing Behaviour

Labour pricing behaviour defines how labour costs are calculated. Like materials, labour is a configurable pricing component — the engine does not assume labour is always present.

### 36.1 Standard Labour

**Purpose:** Standard labour rates for common construction trades (masons, carpenters, electricians, etc.) based on skill level and region.

**Pricing Behaviour:**
- Standard labour rate = regional_rate × skill_multiplier × productivity_factor
- Regional rates are maintained per city/state in the Labour Library
- Skill multiplier applies for specialized skills (e.g., certified electrician = 1.5× base)
- Productivity factor adjusts man-hours based on expected output per worker

**Business Rules:**
- Standard labour rates are effective-dated
- Regional rates are applied based on project location at time of estimate creation
- Productivity factors can be overridden with justification

### 36.2 Premium Labour

**Purpose:** Premium labour rates for highly skilled or certified workers (e.g., master craftsman, specialized technician).

**Pricing Behaviour:**
- Premium labour uses a premium rate = standard_rate × premium_multiplier
- Premium multiplier is configurable per skill type
- Premium labour reduces projected man-hours due to higher productivity

**Business Rules:**
- Premium labour selection is optional
- Premium rates are logged as a cost modifier
- Users can view the premium impact in the cost summary

### 36.3 Special Labour

**Purpose:** Specialized labour for non-standard work (e.g., structural steel fixers, façade specialists, safety supervisors).

**Pricing Behaviour:**
- Special labour rates are defined separately in the Labour Library
- Rates may be flat daily rates or per-unit rates
- Special labour is added as a separate BOQ line item

**Business Rules:**
- Special labour is never included in packages by default
- Requires explicit addition by the user
- All special labour additions are logged

### 36.4 Regional Labour

**Purpose:** Labour rates that vary by geographic region, reflecting market wage differences across locations.

**Pricing Behaviour:**
- The Labour Library maintains regional rate tables indexed by location
- Rate selection is based on the project location at the time of estimate creation
- Regional rates may include seasonal adjustments

**Business Rules:**
- Regional rates are the default for all labour calculations
- Rate changes are effective-dated
- Location-based rate selection is transparent and visible in the calculation log

### 36.5 Floor-wise Labour

**Purpose:** Labour productivity varies by floor height and accessibility. Lower floors are easier to access; upper floors require more time for material handling.

**Pricing Behaviour:**
- A floor multiplier is applied: Floor 1 = 1.0×, Floor 2 = 1.1×, Floor 3+ = 1.2×
- Multiplier increases for buildings above a threshold number of floors
- The multiplier is applied to labour line items tagged with "floor-based" calculation type

**Business Rules:**
- Floor multipliers are configurable per domain
- Multipliers can be overridden per estimate
- Floor-based calculation is only applied to labour items with the "floor-based" flag

### 36.6 Revision of Labour Rates

**Purpose:** When labour rates change in the library, estimates must handle the change appropriately.

**Pricing Behaviour:**
- Existing estimates retain the rates from the time of creation (rate locking)
- Draft estimates can choose to refresh rates from the library
- Rate refresh creates a new version snapshot
- A comparison view shows old vs. new rates

**Business Rules:**
- Rate refresh requires user action; it is never automatic
- Rate refresh is logged in the audit trail
- Only estimates in "Draft" or "In Progress" can refresh rates
- Approved estimates are locked (per BR-004)

---

## 37. Discount Behaviour

Discount behaviour defines how discounts are applied, overridden, stacked, and governed within the estimate.

### 37.1 Percentage Discount

**Purpose:** A discount expressed as a percentage of a base amount.

**Pricing Behaviour:**
- Discount amount = base_amount × (percentage / 100)
- Base amount is typically the pre-tax subtotal but is configurable per discount rule
- The discount is applied after markup and before tax

**Business Rules:**
- Percentage discounts above a configured threshold require approval (per BR-007)
- The discount percentage can be overridden by authorized users
- All discount applications are logged

### 37.2 Flat Discount

**Purpose:** A discount expressed as a fixed monetary amount deducted from the base amount.

**Pricing Behaviour:**
- Discount amount = fixed_amount (does not depend on base)
- The flat amount is subtracted from the pre-tax subtotal
- Applied before tax calculation

**Business Rules:**
- Flat discounts above a configured threshold require approval
- The flat amount can be overridden by authorized users
- Flat discounts cannot reduce the subtotal below zero

### 37.3 Campaign Discount

**Purpose:** Time-bound promotional discounts tied to marketing campaigns (e.g., festive season, new customer onboarding).

**Pricing Behaviour:**
- Campaign discounts have start and end dates
- Active campaigns are automatically suggested to the user
- Multiple campaigns can be applied (subject to stacking rules)
- Campaign metadata includes: name, description, start/end dates, applicable domains, minimum estimate value

**Business Rules:**
- Campaigns are not active outside their date range
- Campaigns are domain-specific by default but can be global
- Campaign discounts are logged with campaign reference

### 37.4 Approval Required Discount

**Purpose:** Discounts that exceed configurable thresholds and require explicit approval before application.

**Pricing Behaviour:**
- When a discount exceeds the threshold, the estimate status is set to "Pending Discount Approval"
- The approval workflow routes to the configured approver
- The discount is only applied after approval is granted
- If rejected, the discount is removed and the estimate returns to its previous state

**Business Rules:**
- Approval thresholds are configurable per role, domain, and estimate type
- Pending discount approval blocks sharing and PDF generation
- Approval decisions are logged in the audit trail
- Approved discounts can be revoked before final approval of the estimate

### 37.5 Maximum Discount Rules

**Purpose:** Caps that prevent excessive discounting, protecting profit margins.

**Pricing Behaviour:**
- Maximum discount is expressed as a percentage of the pre-discount subtotal
- If the combined discount exceeds the maximum, the discount is automatically reduced to the cap
- The engine applies discounts in priority order (see Section 40, Calculation Order)

**Business Rules:**
- Maximum discount percentage is configurable per domain and customer type
- Exceeding the cap triggers a notification to the user
- The cap is enforced at the final calculation step, not per-discount
- Admin override can bypass the cap with justification

### 37.6 Stacking Rules

**Purpose:** Defines the order in which multiple discounts are applied and whether they can combine.

| Priority | Discount Type | Stacking Rule |
|----------|---------------|---------------|
| 1 | Campaign Discount | Applied first; cannot stack with other campaign discounts |
| 2 | Volume Discount | Applied second; cannot stack with other volume discounts |
| 3 | Customer Loyalty Discount | Applied third; can stack with all previous types |
| 4 | Manual Override Discount | Applied last; can stack with all previous types |

**Business Rules:**
- Only one campaign discount can be active at a time
- Volume discounts are cumulative up to the maximum discount cap
- All stacking rules are configurable by administrators
- The stacking order is visible to the user
- The total discount percentage is displayed after all discounts are applied

---

## 38. Tax Behaviour

Tax behaviour defines how taxes are calculated, classified, exempted, and managed across different locations and regulatory regimes.

### 38.1 GST

**Purpose:** Goods and Services Tax (GST) is the primary indirect tax applied to construction services in India. The engine must handle CGST, SGST, and IGST correctly.

**Pricing Behaviour:**
- **Intra-state supplies:** CGST (Central GST) + SGST (State GST) are applied
- **Inter-state supplies:** IGST (Integrated GST) is applied
- Tax is calculated on the post-discount, pre-margin amount
- CGST and SGST rates are each 50% of the total GST rate (e.g., 18% GST = 9% CGST + 9% SGST)

**Tax Rates by Category:**

| Category | Material Type | GST Rate | Composition |
|----------|--------------|----------|-------------|
| Cement & Steel | Raw materials | 18% | 9% CGST + 9% SGST |
| Tiles & Flooring | Finished materials | 18% | 9% CGST + 9% SGST |
| Paints & Coatings | Consumables | 18% | 9% CGST + 9% SGST |
| Labour Services | Construction service | 18% | 9% CGST + 9% SGST |
| Consultancy | Professional service | 18% | 9% CGST + 9% SGST |
| Exempted Items | Certain materials | 0% | No tax |

**Business Rules:**
- GST is calculated on the net amount after discounts but before markup and margin
- IGST applies when the supplier and recipient are in different states
- GST is not applied to exempted materials (e.g., certain earthworks, basic materials)
- Tax rates are effective-dated and version-controlled
- Tax calculation uses the location at the time of estimate creation (per BR-008)

### 38.2 Future Tax Support

**Purpose:** The Tax Engine must be extensible to support tax regimes beyond GST, as the engine may be used in different countries or regulatory environments.

**Pricing Behaviour:**
- Tax rules are metadata-driven, not hardcoded
- Each tax type (GST, VAT, Sales Tax, etc.) is defined as a tax component
- Tax components can be nested (e.g., state tax + local tax)
- Tax calculations are delegated to the Tax Engine which applies the metadata-defined rules

**Business Rules:**
- New tax types can be added by administrators without code changes
- Tax rules support cascading calculations (tax on tax)
- Tax exemptions are defined as metadata conditions
- Historical tax rules are preserved for existing estimates

### 38.3 Regional Taxes

**Purpose:** Some states or municipalities impose additional taxes, cess, or fees on construction activities.

**Pricing Behaviour:**
- Regional taxes are defined per state/city with rate, type (percentage or flat), and applicability
- Regional taxes are applied after GST calculation
- Multiple regional taxes can stack

| Tax Type | Example | Rate Basis |
|----------|--------|------------|
| Infrastructure Cess | Tamil Nadu Infrastructure Development | Percentage of total |
| Education Cess | Central Education Cess | Percentage of GST |
| Municipal Stamp Duty | Local body tax | Percentage of total |
| Construction Fee | Permit fees | Flat amount per project |

**Business Rules:**
- Regional taxes are location-specific and metadata-driven
- Rates are effective-dated
- Regional taxes can be exempted for certain project types
- All regional taxes are itemized in the tax breakdown

### 38.4 Tax Exemption

**Purpose:** Certain materials, services, or customer types may qualify for tax exemptions.

**Pricing Behaviour:**
- Exemptions are defined as conditions: customer_type = "Government" → 0% GST
- Certain materials (e.g., specified cement grades) may be fully or partially exempted
- Exemption is evaluated per line item during tax calculation
- Exempted items show "EXEMPT" in the tax column with zero tax amount

**Business Rules:**
- Exemption conditions are metadata-defined
- Exemptions must be justified with documentation
- Exempted items still appear in the BOQ with their full amount
- Tax exemption overrides are logged in the audit trail

### 38.5 Reverse Calculation

**Purpose:** In some scenarios (e.g., B2B transactions), the customer is responsible for paying tax directly to the government (reverse charge mechanism). In these cases, the tax amount is calculated and displayed but is not added to the estimate total.

**Pricing Behaviour:**
- The Tax Engine computes the tax amount normally
- The tax amount is shown as a separate line item with the label "Reverse Charge — Payable by Customer"
- The estimate total excludes the reverse-charge tax
- A note is added to the PDF explaining the reverse charge mechanism

**Business Rules:**
- Reverse charge is triggered by customer type (B2B with valid GSTIN)
- The reverse charge tax is still included in the cost summary breakdown
- Reverse charge must be manually confirmed by the user
- All reverse charge applications are logged

---

## 39. Manual Overrides

Manual overrides allow authorized users to deviate from automatically computed pricing values. Overrides are exceptional, audited, and reversible.

### 39.1 Who Can Override Pricing

| Role | Override Authority | Approval Required |
|------|-------------------|-------------------|
| **Estimator** | Override material rates, labour rates, quantities, area values | No (logged only) |
| **Engineer** | Override material rates, labour rates, quantities, area values, floor multipliers | No (logged only) |
| **Sales** | Override discount percentages, markup, and promotional offers | Yes (for discounts above threshold) |
| **Project Manager** | Override all calculation parameters within limits | No (logged only) |
| **Owner** | Override any pricing value | No (logged only) |
| **Admin** | Override any pricing value including tax rates | Yes (audit logging for tax overrides) |

### 39.2 What Can Be Overridden

| Component | Overridable Fields | Default Editability |
|-----------|-------------------|---------------------|
| Material Rate | Unit rate | Rate Override Only (Estimator+) |
| Material Quantity | Quantity | Full Edit (Estimator+) |
| Labour Rate | Unit rate | Rate Override Only (Estimator+) |
| Labour Hours | Number of hours | Full Edit (Estimator+) |
| Area Value | Built-up area | Quantity Override Only (Estimator+) |
| Floor Count | Number of floors | Quantity Override Only (Estimator+) |
| Markup | Percentage | Full Edit (Sales+) |
| Discount | Percentage or flat amount | Approval-Gated (Sales+) |
| Tax Rate | Tax percentage | Admin Override Only |
| Contingency | Percentage | Full Edit (Estimator+) |
| Transportation | Flat amount or percentage | Full Edit (Estimator+) |

### 39.3 Override Process

**Purpose:** Defines the workflow when a user overrides a pricing value.

**Process:**
1. User selects "Override" on a pricing field
2. System prompts for the new value and a mandatory reason/justification
3. System validates the user's role against editability rules
4. If approval is required, the estimate enters "Pending Override Approval" status
5. Approver reviews the change with previous value and reason
6. If approved, the override is applied; if rejected, the value reverts

**Business Rules:**
- Override reason is mandatory for all overrides
- Previous and new values are recorded in the audit trail
- Pending override approval blocks estimate finalization
- Overrides can be viewed in the cost summary with an "OVERRIDE" indicator

### 39.4 Audit Requirements for Overrides

| Requirement | Policy |
|-------------|--------|
| **Timestamp** | Every override is timestamped (UTC, ISO 8601) |
| **Actor** | User ID, name, and role of the person making the override |
| **Previous Value** | The automatically computed value before the override |
| **New Value** | The manually entered override value |
| **Reason** | Justification text provided by the user |
| **Approval Chain** | For approval-gated overrides, the full approval history |
| **Tamper Evidence** | Override entries are cryptographically hashed |

### 39.5 Rollback Policy

| Condition | Action | Required Role |
|-----------|--------|---------------|
| Override needs correction | Revert to automatically computed value | Same role that applied override, or Admin |
| Override caused estimate imbalance | Full rollback of the override | Admin |
| Multiple overrides need reversion | Selective or bulk rollback | Admin |
| Override applied to archived estimate | Cannot be rolled back | N/A (estimate is read-only) |

**Business Rules:**
- Rollback creates a new version (does not modify history)
- Rollback reason is mandatory
- Rollback is logged as a separate business event
- Rollback is only possible if the estimate has not been "Accepted" by the customer

---

## 40. Calculation Order

The Pricing Engine follows a strict, metadata-driven calculation sequence. This sequence ensures deterministic results regardless of when or by whom the estimate is created. The order is defined in configuration and can be adjusted by administrators (with appropriate safeguards).

```
Project Parameters
  ↓
Package Selection
  ↓
Material Components
  ↓
Labour Components
  ↓
Service / Product Components
  ↓
Other Input Components (Equipment, Machinery, Rental, etc.)
  ↓
Input Subtotal
  ↓
Location Multiplier (applied to applicable Input components)
  ↓
Area Multiplier (applied to applicable Input components)
  ↓
Floor Multiplier (applied to applicable Labour components)
  ↓
Input Adjustments (Transportation, Site Conditions, Seasonal Adjustments)
  ↓
Input Total
  ↓
Markup (applied to Input Total)
  ↓
Contingency (applied to Markup-inclusive total)
  ↓
Subtotal (before discount)
  ↓
Discount (Campaign → Volume → Loyalty → Manual, in priority order)
  ↓
Discounted Total
  ↓
Tax Calculation (GST → Cess → Regional Taxes → Reverse Charge adjustments)
  ↓
Tax Total
  ↓
Margin (applied to tax-inclusive total)
  ↓
Grand Total (before round-off)
  ↓
Round-off (per currency/rounding rules)
  ↓
Final Estimate Total
```

### 40.1 Calculation Phases

| Phase | Components | Description |
|-------|-----------|-------------|
| **Phase 1: Input Collection** | Material, Labour, Product, Service, Consultancy, Design Fee, Installation, Equipment, Machinery, Rental | All direct cost inputs are gathered and computed |
| **Phase 2: Input Adjustments** | Transportation, Site Conditions, Seasonal Adjustments | Location, area, and floor multipliers are applied to applicable input components |
| **Phase 3: Subtotal** | — | Sum of all adjusted input components |
| **Phase 4: Markup & Contingency** | Markup, Contingency | Markup is applied to the subtotal; contingency is applied to the markup-inclusive amount |
| **Phase 5: Discount** | Campaign Discount, Volume Discount, Customer Loyalty Discount, Manual Override Discount | Discounts are applied in priority order; maximum discount cap is enforced |
| **Phase 6: Tax** | GST (CGST/SGST/IGST), Cess, Regional Taxes, Reverse Charge adjustments | Taxes are calculated on the post-discount, pre-margin amount |
| **Phase 7: Margin** | Profit Margin | Margin is applied to the tax-inclusive total |
| **Phase 8: Finalization** | Round-off | Final total is rounded per currency rules |

### 40.2 Ordering Business Rules

| Rule | Description |
|------|-------------|
| **Determinism** | The same inputs always produce the same output, regardless of when or how the calculation is run |
| **Metadata Control** | The calculation order is defined in configuration, not in code |
| **Component Independence** | Each component is calculated independently; a component's value does not change other components' values |
| **Dependency Resolution** | Components that depend on other components are calculated after their dependencies |
| **Tax Position Lock** | Tax is always calculated on the post-discount, pre-margin amount (never on margin or markup) |
| **Round-off Last** | Rounding is applied only once, at the very end, to the grand total |
| **No Retroactive Changes** | Once calculated, values are locked for the current version; changes require a revision |

[ASSUMPTION] The exact multiplier application logic, rounding rules, and currency handling details are deferred to Phase 2 (technical design).

---

*End of Document*
