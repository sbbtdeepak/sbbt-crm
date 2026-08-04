# IMP-01: SBBT Estimate Engine — Implementation Roadmap

**Document ID:** IMP-01
**Title:** Estimate Engine Implementation Roadmap
**Date:** August 2026
**Author:** AI Software Architect
**Status:** Implementation Roadmap (Approved for AI Coding Agents)

**Intended Audience:** AI coding agents (Cursor, Cline, Claude, GPT, Devin) and human developers implementing the SBBT Estimate Engine.

---

## 1. Implementation Philosophy

The Estimate Engine must be built as a **metadata-driven, engine-first** product. Every architectural decision in the PRD-02 documentation suite has been designed around this principle.

### 1.1 Why Engine-First Architecture

The Formula Engine, Rule Engine, Pricing Engine, and BOQ Engine are the computational core of the product. They must be built first, tested exhaustively, and stabilised before any user-facing feature is added. An engine built first ensures:

- All downstream modules (Estimate, Approval, Share, Dashboard) consume a stable, verified computation core.
- Calculation correctness is proven once and inherited everywhere.
- Performance bottlenecks are identified early.
- The engine can be tested in isolation with property-based and deterministic test suites.

### 1.2 Why Modules Must Remain Independent

Each module (Unit Library, Rate Card, Package Engine, Formula Engine, Rule Engine, BOQ Engine, Estimate Engine) has a single responsibility. Modules communicate through typed contracts. Independence guarantees:

- A change in one module never destabilises another.
- Each module can be developed, tested, versioned, and deployed independently.
- New industry domains (Interior, Solar, Furniture) are added as configuration, not code changes to the engine.
- The engine can be consumed by multiple frontends (Website, CRM, ERP, Mobile) without modification.

### 1.3 How Future Industries Remain Reusable

The engine never hard-codes Material, Labour, GST, Discount, Margin, Transport, or any pricing component. All pricing behaviour is metadata:

- **Pricing components** are generic registry entries.
- **Formulas** are metadata definitions, not functions.
- **Rules** are declarative metadata, not conditional code.
- **Domains** are configurations (packages, formulas, rules, rate cards) layered on the universal engine.

Adding a new industry = adding new metadata. No engine code changes.

---

## 2. Development Principles

| Principle | Description |
|-----------|-------------|
| **Engine First** | Build computation engines before interfaces. Never build UI on an unproven engine. |
| **Metadata Driven** | All business behaviour is configuration. Zero hard-coded pricing logic. |
| **No Hardcoded Logic** | No component type, formula, rule, or rate is written in code. |
| **Configuration over Code** | New behaviour is added through metadata, not new code paths. |
| **Single Responsibility** | Each module does one thing. Each function does one thing. |
| **Reusable Components** | Shared components stay generic. Never CMS-specific, never CRM-specific. |
| **Independent Modules** | Modules communicate via typed contracts. No internal imports. |
| **Backward Compatibility** | Additive changes only. Never break consumers of published contracts. |
| **Audit First** | Every mutation is audited. Audit is designed in, not bolted on. |
| **Security First** | RLS, role checks, and validation are designed before any feature ships. |
| **Deterministic Computation** | Same inputs always produce same outputs. No hidden state. |
| **Type Safe** | Strict TypeScript. No `any`. Domain types shared across modules. |
| **Testable by Design** | Every engine accepts inputs, produces outputs, and is testable in isolation. |
| **Stateless Services** | Services hold no mutable state. State lives in the database. |

---

## 3. Implementation Order

Build **only** in dependency order. A module must never be built before the modules it depends on are stable.

### 3.1 Complete Dependency Tree

```
Sprint 01: Foundation
├── Project setup (Next.js, TypeScript, Tailwind, ESLint)
├── Supabase project configuration
├── Base schemas (sites, users, audit)
├── Authentication integration (consume external auth)
├── Logging, error handling, observability
└── CI pipeline (lint, typecheck, test, build)

Sprint 02: Business Domain
├── Domain metadata model (construction, interior, solar, etc.)
├── Site configuration
├── Domain configuration
└── Feature flags

Sprint 03: Unit Library
├── Unit entity (name, symbol, category, decimal places)
├── Unit conversions
├── Unit validation
└── Unit repository

Sprint 04: Pricing Component Engine
├── Component entity (generic — no type hardcoding)
├── Component properties (metadata-driven)
├── Component categories
├── Component relationships
└── Component lifecycle (draft, active, deprecated)

Sprint 05: Rate Card
├── Rate card entity
├── Rate entries (component + unit + region + rate)
├── Rate card versions
├── Regional multipliers
└── Rate lookup API

Sprint 06: Package Engine
├── Package entity
├── Package components (component + quantity + unit)
├── Package templates
├── Package versions
├── Package validation
└── Package lifecycle (draft, published, deprecated)

Sprint 07: Formula Engine
├── Formula entity (metadata-driven definition)
├── Formula lifecycle (draft → validated → approved → active)
├── Formula categories
├── Formula dependencies
├── Formula priority
├── Formula validation
└── Formula testing (test cases)

Sprint 08: Calculation Engine
├── Deterministic evaluator (executes formula metadata)
├── Input context (components, quantities, rates)
├── Execution trace (every step audited)
├── Circular dependency detection
├── Numeric precision handling
└── Error propagation

Sprint 09: Rule Engine
├── Rule entity (declarative metadata)
├── Rule categories
├── Conditional rules (when → then)
├── Dependency rules
├── Rule groups
├── Rule priority
└── Rule validation

Sprint 10: Pricing Engine
├── Pricing orchestration (Formula Engine + Rule Engine + Rate Card)
├── Pricing components resolution
├── Calculation order (metadata-driven)
├── Override behaviour
├── Pricing simulation
├── Pricing audit
└── Pricing preview (live calculation)

Sprint 11: BOQ Engine
├── BOQ entity
├── BOQ item entity
├── BOQ item types (mandatory, optional, auto-generated, manual)
├── BOQ categories
├── BOQ lifecycle (draft, reviewed, frozen, locked)
├── BOQ validation (quantity, unit rules)
├── BOQ import/export
└── Cost roll-up

Sprint 12: Estimate Engine
├── Estimate entity
├── Estimate items (from BOQ + pricing)
├── Estimate lifecycle (11 states)
├── Estimate templates
├── Estimate validation
├── Estimate numbering
└── Estimate persistence (version snapshot)

Sprint 13: Approval Engine
├── Approval entity
├── Approval stages
├── Approval workflow (submit → review → approve/reject/return)
├── Approval permissions
├── Approver assignment
├── Approval history
└── Approval notifications

Sprint 14: Version Control
├── Version entity
├── Version snapshot mechanism
├── Version numbering
├── Version comparison
├── Version restore
├── Version export
├── Change tracking
└── Archive/retention

Sprint 15: PDF Generation
├── Estimate PDF template
├── Branded PDF (logo, colours, terms)
├── BOQ PDF
├── PDF export of any version
├── PDF storage (Supabase Storage)
└── Customer-facing PDF

Sprint 16: Sharing
├── Share entity
├── Share link generation
├── Share expiry management
├── Share view tracking
├── Customer decision (Accept / Request Changes / Decline)
├── Customer messaging
└── Share withdrawal

Sprint 17: Dashboard
├── Estimate dashboard
├── KPI cards (totals, status, conversion)
├── Recent estimates
├── Approval queue
├── Reports (estimate, pricing, audit)
└── Activity feed

Sprint 18: Final Integration & Hardening
├── End-to-end workflow test
├── RLS security audit
├── Performance load test
├── Accessibility audit
├── Error boundary coverage
├── Production build verification
└── Deployment pipeline finalisation
```

### 3.2 Dependency Order (Linear Build Sequence)

| Order | Module | Depends On |
|-------|--------|------------|
| 1 | Foundation | — |
| 2 | Business Domain | Foundation |
| 3 | Unit Library | Business Domain |
| 4 | Pricing Component Engine | Business Domain, Unit Library |
| 5 | Rate Card | Pricing Component Engine |
| 6 | Package Engine | Pricing Component Engine, Unit Library |
| 7 | Formula Engine | Pricing Component Engine |
| 8 | Calculation Engine | Formula Engine |
| 9 | Rule Engine | Formula Engine |
| 10 | Pricing Engine | Calculation Engine, Rule Engine, Rate Card, Package Engine |
| 11 | BOQ Engine | Package Engine, Pricing Engine |
| 12 | Estimate Engine | BOQ Engine, Pricing Engine |
| 13 | Approval Engine | Estimate Engine, Permission Engine |
| 14 | Version Control | Estimate Engine |
| 15 | PDF | Estimate Engine, Version Control |
| 16 | Sharing | Estimate Engine, Version Control |
| 17 | Dashboard | Estimate Engine, Approval Engine |
| 18 | Final Integration | All |

---

## 4. Sprint Planning

### Sprint 1 — Foundation

| Item | Detail |
|------|--------|
| **Goal** | Establish project foundation with zero business logic |
| **Modules** | Project setup, CI, Supabase config, auth integration, logging, error handling |
| **Dependencies** | None |
| **Deliverables** | Project compiles, deploys, auth works, CI passes |
| **Testing** | Smoke tests, auth tests, CI pipeline validation |
| **Definition of Done** | `tsc --noEmit` PASS, `npm run build` PASS, CI green |
| **Estimated Complexity** | LOW |
| **Estimated Risk** | LOW |

### Sprint 2 — Business Domain

| Item | Detail |
|------|--------|
| **Goal** | Define metadata model for supported business domains |
| **Modules** | Domain entity, site config, feature flags |
| **Dependencies** | Sprint 1 |
| **Deliverables** | Domain metadata types, site scoping enforced |
| **Testing** | Unit tests on domain config |
| **Definition of Done** | Domains are configurable, site_id scoped, no hardcoded domain logic |
| **Estimated Complexity** | LOW |
| **Estimated Risk** | LOW |

### Sprint 3 — Unit Library

| Item | Detail |
|------|--------|
| **Goal** | Build the unit of measure library |
| **Modules** | Unit entity, conversions, validation |
| **Dependencies** | Sprint 2 |
| **Deliverables** | Unit registry with conversion support |
| **Testing** | Unit conversion tests, validation tests |
| **Definition of Done** | Units CRUD + conversion correctness verified |
| **Estimated Complexity** | LOW |
| **Estimated Risk** | LOW |

### Sprint 4 — Pricing Component Engine

| Item | Detail |
|------|--------|
| **Goal** | Build the metadata-driven component registry |
| **Modules** | Component entity, properties, categories, relationships, lifecycle |
| **Dependencies** | Sprint 2, 3 |
| **Deliverables** | Components configurable without code; no type hardcoding |
| **Testing** | CRUD tests, lifecycle tests, relationship tests |
| **Definition of Done** | Material, Labour, GST, Discount, Margin, Transport all behave as generic entries |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | LOW |

### Sprint 5 — Rate Card

| Item | Detail |
|------|--------|
| **Goal** | Build rate management with regional multipliers |
| **Modules** | Rate card, rate entries, versions, regional pricing |
| **Dependencies** | Sprint 4 |
| **Deliverables** | Rate lookup by component + region + unit + date |
| **Testing** | Rate lookup tests, version tests, regional multiplier tests |
| **Definition of Done** | Rate lookup deterministic and versionable |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | MEDIUM |

### Sprint 6 — Package Engine

| Item | Detail |
|------|--------|
| **Goal** | Build package definitions composed of components |
| **Modules** | Package entity, package components, templates, versions, lifecycle |
| **Dependencies** | Sprint 4, 5 |
| **Deliverables** | Package CRUD with component composition and versioning |
| **Testing** | Package validation tests, component composition tests |
| **Definition of Done** | Packages are versionable, publishable, and contain components only via metadata |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | MEDIUM |

### Sprint 7 — Formula Engine

| Item | Detail |
|------|--------|
| **Goal** | Build the metadata-driven formula definition engine |
| **Modules** | Formula entity, lifecycle, categories, dependencies, priority, validation, testing |
| **Dependencies** | Sprint 4 |
| **Deliverables** | Formulas defined, validated, approved, activated via metadata |
| **Testing** | Formula validation tests, formula test case runner |
| **Definition of Done** | Formulas are pure metadata; no pricing logic in code |
| **Estimated Complexity** | HIGH |
| **Estimated Risk** | HIGH |

### Sprint 8 — Calculation Engine

| Item | Detail |
|------|--------|
| **Goal** | Build the deterministic formula evaluator |
| **Modules** | Evaluator, input context, execution trace, circular detection, precision, errors |
| **Dependencies** | Sprint 7 |
| **Deliverables** | Deterministic execution of formula metadata with full trace |
| **Testing** | Property-based tests, determinism tests, precision tests, circularity tests |
| **Definition of Done** | Same inputs produce identical outputs; full execution trace; circular refs rejected |
| **Estimated Complexity** | HIGH |
| **Estimated Risk** | HIGH |

### Sprint 9 — Rule Engine

| Item | Detail |
|------|--------|
| **Goal** | Build the declarative business rule engine |
| **Modules** | Rule entity, categories, conditional rules, dependency rules, groups, priority, validation |
| **Dependencies** | Sprint 7 |
| **Deliverables** | Rules declared as metadata and enforced at runtime |
| **Testing** | Conditional evaluation tests, rule priority tests, validation tests |
| **Definition of Done** | Business constrains enforceable through metadata without code |
| **Estimated Complexity** | HIGH |
| **Estimated Risk** | HIGH |

### Sprint 10 — Pricing Engine

| Item | Detail |
|------|--------|
| **Goal** | Integrate components, rates, formulas, rules into unified pricing |
| **Modules** | Pricing orchestration, calculation order, overrides, simulation, audit, preview |
| **Dependencies** | Sprint 5, 6, 8, 9 |
| **Deliverables** | End-to-end computation: components → quantities → rates → formulas → rules → totals |
| **Testing** | Integration tests, simulation tests, override tests |
| **Definition of Done** | Pricing is fully metadata-driven; override is audited; simulation works |
| **Estimated Complexity** | HIGH |
| **Estimated Risk** | HIGH |

### Sprint 11 — BOQ Engine

| Item | Detail |
|------|--------|
| **Goal** | Build the Bill of Quantities engine |
| **Modules** | BOQ entity, items, types, categories, lifecycle, validation, import/export, cost roll-up |
| **Dependencies** | Sprint 6, 10 |
| **Deliverables** | BOQ creation from packages; frozen/locked workflows |
| **Testing** | BOQ lifecycle tests, validation tests, cost roll-up tests |
| **Definition of Done** | BOQ items can be mandatory/optional/auto/manual; cost roll-up matches pricing engine |
| **Estimated Complexity** | HIGH |
| **Estimated Risk** | MEDIUM |

### Sprint 12 — Estimate Engine

| Item | Detail |
|------|--------|
| **Goal** | Build the estimate document engine |
| **Modules** | Estimate entity, items, lifecycle (11 states), templates, numbering, persistence |
| **Dependencies** | Sprint 10, 11 |
| **Deliverables** | Full estimate lifecycle: draft → submitted → approved → shared → accepted |
| **Testing** | Lifecycle state machine tests, validation tests, numbering tests |
| **Definition of Done** | Estimates persist with version snapshot; all 11 states correctly enforced |
| **Estimated Complexity** | HIGH |
| **Estimated Risk** | MEDIUM |

### Sprint 13 — Approval Engine

| Item | Detail |
|------|--------|
| **Goal** | Build the approval workflow engine |
| **Modules** | Approval entity, stages, workflow, permissions, assignment, history, notifications |
| **Dependencies** | Sprint 12, Permission Engine |
| **Deliverables** | Submit → review → approve/reject/return with full history |
| **Testing** | Workflow tests, permission tests, history tests |
| **Definition of Done** | Approvals enforce roles; all decisions audited; notifications triggered |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | MEDIUM |

### Sprint 14 — Version Control

| Item | Detail |
|------|--------|
| **Goal** | Build the version control system |
| **Modules** | Version entity, snapshots, numbering, comparison, restore, export, change tracking, archive |
| **Dependencies** | Sprint 12 |
| **Deliverables** | Immutable version snapshots, comparison, restore |
| **Testing** | Version immutability tests, comparison tests, restore tests |
| **Definition of Done** | Any version restorable; comparisons accurate; archive retention enforced |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | MEDIUM |

### Sprint 15 — PDF Generation

| Item | Detail |
|------|--------|
| **Goal** | Build branded PDF export |
| **Modules** | PDF templates, branding, BOQ PDF, version PDF, storage |
| **Dependencies** | Sprint 12, 14 |
| **Deliverables** | Branded estimate PDF downloadable from any version |
| **Testing** | PDF generation tests, branding tests |
| **Definition of Done** | PDFs generated, stored, signed URLs served |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | LOW |

### Sprint 16 — Sharing

| Item | Detail |
|------|--------|
| **Goal** | Build estimate sharing with customer decisions |
| **Modules** | Share entity, links, expiry, view tracking, customer decision, messaging, withdrawal |
| **Dependencies** | Sprint 12, 14 |
| **Deliverables** | Customer-facing share view with Accept / Request Changes / Decline |
| **Testing** | Share expiry tests, decision flow tests, withdrawal tests |
| **Definition of Done** | Share links expire; decisions tracked; withdrawal works |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | MEDIUM |

### Sprint 17 — Dashboard

| Item | Detail |
|------|--------|
| **Goal** | Build the estimate dashboard and reports |
| **Modules** | KPIs, status charts, recent estimates, approval queue, reports, activity feed |
| **Dependencies** | Sprint 12, 13 |
| **Deliverables** | Operational visibility into all estimates |
| **Testing** | Dashboard query tests, report tests |
| **Definition of Done** | KPIs accurate; reports filter correctly; click-through works |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | LOW |

### Sprint 18 — Final Integration & Hardening

| Item | Detail |
|------|--------|
| **Goal** | System-wide verification and hardening |
| **Modules** | All |
| **Dependencies** | All |
| **Deliverables** | E2E tests, security audit, load tests, accessibility audit, production deploy |
| **Testing** | Full regression, load, security, accessibility |
| **Definition of Done** | All success criteria met; production ready |
| **Estimated Complexity** | MEDIUM |
| **Estimated Risk** | MEDIUM |

---

## 5. Module Dependency Matrix

| Module | Depends On | Required Before | Future Consumers |
|--------|-----------|-----------------|------------------|
| **Foundation** | — | Everything | All modules |
| **Business Domain** | Foundation | Unit, Component, Rate Card, Package | All modules |
| **Unit Library** | Business Domain | Component, Rate Card, Package, BOQ | ERP, Catalog |
| **Pricing Component Engine** | Business Domain, Unit | Rate Card, Package, Formula, Calculation, Pricing | ERP, Catalog |
| **Rate Card** | Pricing Component | Pricing Engine | ERP, Procurement |
| **Package Engine** | Pricing Component, Unit | BOQ, Pricing Engine | Website, Sales App |
| **Formula Engine** | Pricing Component | Calculation, Rule, Pricing | AI Module, SaaS |
| **Calculation Engine** | Formula | Pricing Engine | All consumers of computation |
| **Rule Engine** | Formula | Pricing Engine | Approval, CRM |
| **Pricing Engine** | Rate Card, Package, Calculation, Rule | BOQ, Estimate | ERP, Website, Mobile |
| **BOQ Engine** | Package, Pricing | Estimate Engine | Tender, ERP |
| **Estimate Engine** | BOQ, Pricing | Approval, Version, PDF, Share, Dashboard | CRM, Customer Portal |
| **Approval Engine** | Estimate, Permission | Dashboard | CRM Workflows |
| **Version Control** | Estimate | PDF, Share | CRM Audit |
| **PDF** | Estimate, Version | Share | CRM Documents |
| **Sharing** | Estimate, Version | Dashboard | Customer Portal, Mobile |
| **Dashboard** | Estimate, Approval | Final Integration | CRM, ERP |
| **Permission Engine** | Foundation | Approval | Multi-tenant SaaS |

---

## 6. Coding Standards

### 6.1 Folder Structure

```
src/
├── app/                    # Next.js App Router (presentation)
│   ├── dashboard/
│   │   ├── estimates/
│   │   ├── boq/
│   │   ├── pricing/
│   │   ├── formulas/
│   │   ├── approvals/
│   │   └── settings/
│   └── api/
├── components/             # UI components
│   ├── ui/                 # Generic shared UI
│   ├── estimate/
│   ├── formula/
│   └── boq/
├── lib/
│   ├── estimate/           # Estimate domain
│   ├── boq/                # BOQ domain
│   ├── pricing/            # Pricing domain
│   ├── formula/            # Formula domain
│   ├── rules/              # Rule domain
│   ├── product/            # Package/Component domain
│   ├── units/              # Unit domain
│   ├── ratecard/           # Rate Card domain
│   ├── approval/           # Approval domain
│   ├── share/              # Share domain
│   ├── version/            # Version domain
│   ├── audit/              # Audit domain
│   └── supabase/           # Supabase clients
├── actions/                # Server Actions (application layer)
├── types/                  # Shared TypeScript types
└── config/                 # Configuration
```

### 6.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Files/Folders** | kebab-case | `estimate-item.ts` |
| **React Components** | PascalCase | `EstimateTable.tsx` |
| **Functions** | camelCase | `createEstimate()` |
| **Types/Interfaces** | PascalCase | `EstimateItem` |
| **Constants** | UPPER_SNAKE | `MAX_ITEMS` |
| **Database Tables** | snake_case (singular) | `estimate_item` |
| **Server Actions** | verb + noun | `submitEstimate()` |
| **Services** | `{Domain}Service` | `EstimateService` |
| **Repositories** | `{Domain}Repository` | `EstimateRepository` |

### 6.3 Architecture Rules

- Clean layering: Presentation → Application → Domain → Infrastructure
- Dependencies point inward only
- Modules communicate via typed contracts (interfaces)
- No module imports another module's internals
- Services are stateless
- Repositories are the only data access point
- No business logic in repositories

### 6.4 Testing Standards

- Every service has unit tests
- Every engine has property-based tests
- Every API endpoint has integration tests
- RLS policies have security tests
- Test names describe behaviour (`shouldCreateVersionOnSubmit`)

### 6.5 Documentation Standards

- Every module has a README
- Every public function has JSDoc
- Every new metadata type documents its purpose
- CHANGELOG updated per sprint

### 6.6 Logging Standards

- Structured JSON logging
- `request_id` correlation
- Engine execution trace logging
- No secrets in logs
- Sensitive fields redacted

### 6.7 Error Handling

- Domain errors are typed and specific
- Validation errors are field-level
- Engine errors carry execution context
- Never expose internal errors to clients
- All errors are logged and monitored

---

## 7. Git Strategy

### 7.1 Branch Model

```
main               # Production (protected, tagged releases)
  ├── develop      # Integration branch (protected)
  │   ├── feature/*   # Feature branches
  │   ├── release/*   # Release branches (from develop)
  │   └── hotfix/*    # Hotfix branches (from main)
```

### 7.2 Branch Naming

| Branch | Pattern | Example |
|--------|---------|---------|
| **Feature** | `feature/{module}-{short-description}` | `feature/formula-engine-lifecycle` |
| **Bugfix** | `fix/{module}-{short-description}` | `fix/estimate-version-snapshot` |
| **Release** | `release/v{major}.{minor}.{patch}` | `release/v1.2.0` |
| **Hotfix** | `hotfix/{short-description}` | `hotfix/rate-lookup-null` |
| **Chore** | `chore/{short-description}` | `chore/update-docs` |

### 7.3 Commit Naming

```
{type}({scope}): {description}

Types: feat, fix, docs, style, refactor, test, chore
Scope: module name (estimate, boq, formula, pricing, rule, boilerplate)

Examples:
feat(formula): add formula lifecycle state machine
fix(estimate): correct version snapshot on approval
test(pricing): add property-based tests for engine determinism
```

### 7.4 Merge Rules

- Feature → Develop via Pull Request (squash merge)
- Release → Main via Pull Request (merge commit)
- Hotfix → Main then back-merge to Develop
- All PRs require: CI green, TypeScript pass, build pass, tests pass
- No direct commits to `main` or `develop`

### 7.5 Release Strategy

- Releases are tagged `v{major}.{minor}.{patch}`
- Semantic versioning strictly enforced
- Breaking changes bump MAJOR
- New features bump MINOR
- Bug fixes bump PATCH
- Changelog generated from commit history

---

## 8. Testing Strategy

| Test Type | Scope | Tooling | Gate |
|-----------|-------|---------|------|
| **Unit** | Individual functions/services | Vitest/Jest | Required per PR |
| **Integration** | Module interactions, DB access | Vitest + Supabase | Required per PR |
| **Engine** | Formula/Calculation/Rule/Pricing determinism | Property-based (fast-check) | Required for engine sprints |
| **Regression** | Existing behaviour unchanged | Full test suite | Required before release |
| **Performance** | Calculation benchmarks, API latency | k6 / Load Testing | Required before release |
| **Security** | RLS policies, auth, injection | Automated security tests | Required before release |
| **Acceptance** | Business scenarios end-to-end | Playwright / E2E | Required before release |

### 8.1 Test Coverage Targets

| Module | Target |
|--------|--------|
| Unit Library | ≥ 90% |
| Pricing Component Engine | ≥ 90% |
| Rate Card | ≥ 90% |
| Package Engine | ≥ 85% |
| Formula Engine | ≥ 95% |
| Calculation Engine | ≥ 95% |
| Rule Engine | ≥ 95% |
| Pricing Engine | ≥ 95% |
| BOQ Engine | ≥ 85% |
| Estimate Engine | ≥ 85% |
| Approval Engine | ≥ 85% |
| Version Control | ≥ 85% |
| Sharing | ≥ 85% |

### 8.2 Testing Rules

- Determinism test: same input always same output
- Property test: random inputs never crash or produce NaN/Infinity
- RLS test: role A cannot read role B's data
- Regression test: every bug fix adds a test
- E2E test: one happy path per workflow

---

## 9. Deployment Strategy

| Environment | Purpose | Update Frequency | Verification |
|-------------|---------|------------------|--------------|
| **Development** | Local developer environment | Continuous | Local tests |
| **Testing** | CI-integrated verification | On pull request | Automated tests |
| **Staging** | Pre-production validation | On merge to develop | Manual + automated |
| **Production** | Live system | On release approval | Post-deploy smoke tests |

### 9.1 Deployment Pipeline

```
Commit → CI (lint, typecheck, test, build)
       → Deploy Testing
       → Run automated verification suite
       → Deploy Staging
       → Manual approval gate
       → Run database migrations
       → Deploy Production (zero-downtime)
       → Post-deploy smoke tests
       → Rollback ready (previous build tagged)
```

### 9.2 Migration Strategy

- Migrations run **before** application deploy
- Migrations are additive only (no destructive changes)
- Rollback migrations are authored alongside forward migrations
- Migration status is monitored during deploy

### 9.3 Rollback Strategy

- Previous production build is always tagged and recoverable
- Rollback is instant (redeploy previous build)
- Rollback does not revert data migrations (additive migrations remain)
- Rollback triggers post-rollback smoke tests

### 9.4 Monitoring

| Metric | Alert Threshold |
|--------|-----------------|
| Error rate | > 1% |
| API latency P95 | > 2s |
| Engine execution P95 | > 500ms |
| Database CPU | > 80% |
| Quota usage | > 80% |
| Job failures | Any failure |

---

## 10. Definition of Done

Every module must satisfy **all** of the following before it is considered complete:

| Criterion | Requirement |
|-----------|-------------|
| **Documentation** | Module README written; public APIs documented; behaviour documented |
| **Testing** | Unit tests ≥ 85% (engines ≥ 95%); integration tests pass; property tests for engines |
| **Review** | Code reviewed; design reviewed; test cases reviewed |
| **Performance** | Module meets latency targets; no N+1 queries; indexes in place |
| **Security** | RLS enforced; role checks verified; inputs validated; no secrets exposed |
| **Accessibility** | WCAG AA; keyboard accessible; screen reader tested; focus states |
| **Audit** | All mutations audited; audit trail queryable |
| **Logging** | Structured logs; request correlation; error tracking wired |
| **Deployment Ready** | CI green; build passes; migrations authored; rollback plan documented |

---

## 11. Risk Register

### 11.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Formula Engine performance degradation | Medium | High | Cache active formulas; execution trace only in debug; profiling in Sprint 8 |
| Calculation precision loss (floating point) | Medium | High | Decimal precision handling designed in; property tests for precision |
| Circular formula dependencies | Low | High | Circular detection in engine; validation blocks activation |
| Metadata schema evolution breaking active formulas | Medium | Medium | Versioned metadata; additive changes only; migration testing |

### 11.2 Architecture Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Module drift (dependencies crossing boundaries) | Medium | Medium | Typed contracts; lint rules; architecture tests |
| Tight coupling to Supabase | Low | Medium | Repository abstraction; domain never imports Supabase |
| Over-engineering metadata model | Medium | Medium | YAGNI; build only required metadata; extend later |
| Monolithic growth | Medium | Medium | Module boundaries enforced; extract services if needed |

### 11.3 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Pricing accuracy below ±1% target | Medium | High | Property-based engine tests; rate card validation; simulation |
| Business domain expansion blocked | Low | High | Metadata-driven design verified with construction first |
| User adoption low | Medium | Medium | Dashboard clarity; quick estimate wizard; training |

### 11.4 Migration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data loss during migration | Low | Critical | Additive migrations; backup before every migration; rollback plan |
| Existing estimate data incompatible | Medium | Medium | Legacy mapping; data validation before migration |
| Migration takes too long | Low | Medium | Batching; monitoring; staged migration |

### 11.5 Security Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| RLS misconfiguration exposing data | Medium | Critical | Security test suite; role-based tests; audit |
| Share link abuse | Medium | High | Expiry; view tracking; withdrawal; rate limiting |
| Formula injection (malicious formula metadata) | Low | High | Formula validation; allowlist of operations; admin-only editing |
| IDOR (cross-tenant access) | Medium | Critical | site_id scoping; ownership checks; security tests |

### 11.6 Performance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Large BOQ calculation slow | Medium | Medium | Optimisation; indexing; caching; async for large BOQs |
| Dashboard aggregate queries slow | Medium | Medium | Materialized views; query caching |
| PDF generation blocking | Low | Medium | Async PDF generation; queue-based processing |

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| **Code Coverage** | ≥ 85% overall; ≥ 95% engines |
| **Performance** | Engine P95 < 500ms; API P95 < 2s |
| **Build Success** | 100% CI green on main |
| **Bug Count** | Zero critical bugs at release; zero known security issues |
| **Deployment Frequency** | Weekly staging; monthly production (target) |
| **Rollback Rate** | < 5% of deployments |
| **Sprint Completion** | 100% of committed scope completed per sprint |
| **Estimate Generation Time** | Under 5 minutes (business goal BG-001) |
| **Pricing Accuracy** | Within ±1% of actual costs (business goal BG-001) |
| **New Domain Onboarding** | Within 2 weeks (business goal BG-006) |

---

## 13. Future Expansion

| Expansion | What It Means | When |
|-----------|---------------|------|
| **Interior** | Interior design packages, premium materials, decorative components, designer rates | New domain metadata (packages, formulas, rate cards) |
| **Architecture** | Architectural consultancy estimates, fee-based billing, service components | New domain metadata |
| **Solar** | Solar installation estimates, panel/component rates, subsidy rules | New domain metadata + solar-specific rules |
| **Furniture** | Furniture manufacturing estimates, material + labour + finishing components | New domain metadata |
| **Consultancy** | Hourly/day-rate consultancy, professional fees, service components | New domain metadata |
| **Service Industry** | Service-based estimation (maintenance, repairs, AMC), recurring pricing | New domain metadata + recurring rules |
| **ERP** | Consume engine for costing, inventory, procurement (PRD-04) | After Estimate Engine stabilises |
| **CRM** | CRM consumes estimates for leads, customers, opportunities (PRD-03) | After Estimate Engine stabilises |
| **SaaS** | Multi-tenant platform where each company configures its own metadata | After single-tenant stabilised |

### 13.1 Expansion Rule

Every expansion must be achievable **without engine code changes**. If a new industry requires a code change, the engine design has a gap and must be corrected first.

---

## 14. Implementation Checklist

### Foundation

- [ ] Next.js + TypeScript + Tailwind project scaffolding
- [ ] ESLint + Prettier configured
- [ ] CI pipeline (lint, typecheck, test, build)
- [ ] Supabase project + environment variables
- [ ] Logo/error page/not-found page
- [ ] Logging + error tracking wired
- [ ] Auth integration verified

### Business Domain

- [ ] Domain metadata types
- [ ] Site configuration
- [ ] Feature flags
- [ ] site_id scoping in all queries

### Unit Library

- [ ] Unit entity + repository
- [ ] Unit conversions
- [ ] Unit validation
- [ ] Unit test coverage ≥ 90%

### Pricing Component Engine

- [ ] Component entity + repository
- [ ] Component properties (metadata)
- [ ] Component categories
- [ ] Component relationships
- [ ] Component lifecycle (draft, active, deprecated)
- [ ] No hardcoded component types
- [ ] Unit test coverage ≥ 90%

### Rate Card

- [ ] Rate card entity + repository
- [ ] Rate entries (component + unit + region + rate)
- [ ] Rate card versions
- [ ] Regional multipliers
- [ ] Rate lookup API
- [ ] Unit test coverage ≥ 90%

### Package Engine

- [ ] Package entity + repository
- [ ] Package components (component + qty + unit)
- [ ] Package templates
- [ ] Package versions
- [ ] Package validation
- [ ] Package lifecycle
- [ ] Unit test coverage ≥ 85%

### Formula Engine

- [ ] Formula entity + repository
- [ ] Formula lifecycle
- [ ] Formula categories
- [ ] Formula dependencies
- [ ] Formula priority
- [ ] Formula validation
- [ ] Formula testing (test cases)
- [ ] Unit test coverage ≥ 95%

### Calculation Engine

- [ ] Deterministic evaluator
- [ ] Input context
- [ ] Execution trace
- [ ] Circular dependency detection
- [ ] Numeric precision handling
- [ ] Error propagation
- [ ] Property-based tests

### Rule Engine

- [ ] Rule entity + repository
- [ ] Rule categories
- [ ] Conditional rules
- [ ] Dependency rules
- [ ] Rule groups
- [ ] Rule priority
- [ ] Rule validation
- [ ] Unit test coverage ≥ 95%

### Pricing Engine

- [ ] Pricing orchestration
- [ ] Pricing component resolution
- [ ] Calculation order (metadata-driven)
- [ ] Override behaviour
- [ ] Pricing simulation
- [ ] Pricing audit
- [ ] Pricing preview
- [ ] Unit test coverage ≥ 95%

### BOQ Engine

- [ ] BOQ entity + repository
- [ ] BOQ item entity + types
- [ ] BOQ categories
- [ ] BOQ lifecycle
- [ ] BOQ validation
- [ ] BOQ import/export
- [ ] Cost roll-up
- [ ] Unit test coverage ≥ 85%

### Estimate Engine

- [ ] Estimate entity + repository
- [ ] Estimate items
- [ ] Estimate lifecycle (11 states)
- [ ] Estimate templates
- [ ] Estimate validation
- [ ] Estimate numbering
- [ ] Version snapshot persistence
- [ ] Unit test coverage ≥ 85%

### Approval Engine

- [ ] Approval entity + repository
- [ ] Approval stages
- [ ] Approval workflow
- [ ] Approval permissions
- [ ] Approver assignment
- [ ] Approval history
- [ ] Approval notifications
- [ ] Unit test coverage ≥ 85%

### Version Control

- [ ] Version entity + repository
- [ ] Version snapshot mechanism
- [ ] Version numbering
- [ ] Version comparison
- [ ] Version restore
- [ ] Version export
- [ ] Change tracking
- [ ] Archive/retention
- [ ] Unit test coverage ≥ 85%

### PDF Generation

- [ ] Estimate PDF template
- [ ] Branded PDF
- [ ] BOQ PDF
- [ ] Version PDF export
- [ ] PDF storage
- [ ] PDF test coverage

### Sharing

- [ ] Share entity + repository
- [ ] Share link generation
- [ ] Share expiry
- [ ] Share view tracking
- [ ] Customer decision (Accept / Request Changes / Decline)
- [ ] Customer messaging
- [ ] Share withdrawal
- [ ] Unit test coverage ≥ 85%

### Dashboard

- [ ] Estimate dashboard
- [ ] KPI cards
- [ ] Status charts
- [ ] Recent estimates
- [ ] Approval queue
- [ ] Reports
- [ ] Activity feed

### Final Integration

- [ ] End-to-end workflow test
- [ ] RLS security audit
- [ ] Performance load test
- [ ] Accessibility audit
- [ ] Error boundary coverage
- [ ] Production build verification
- [ ] Deployment pipeline finalisation

---

## 15. Final Recommendation

### 15.1 Recommended First Coding Module

**Foundation (Sprint 1) + Unit Library (Sprint 3)**

The Foundation is the prerequisite for everything. The Unit Library is the smallest, safest, highest-value first business module — it introduces the repository pattern, validation, and domain types with minimal complexity, proving the architecture before the expensive engines are built.

**Note:** The Pricing Component Engine (Sprint 4) should be the **first engine** built, not the Formula/Calculation Engines, because components are the foundation of all metadata — formulas, rules, rate cards, and packages all reference components.

### 15.2 Recommended Last Coding Module

**Final Integration & Hardening (Sprint 18)**

System-wide verification, security audit, load testing, and production readiness must be the last coding effort. The Dashboard (Sprint 17) is the last feature module because it depends on Estimate and Approval data.

### 15.3 Estimated Implementation Order

| Sprint | Module | Est. Duration |
|--------|--------|---------------|
| 1 | Foundation | 1 week |
| 2 | Business Domain | 1 week |
| 3 | Unit Library | 1 week |
| 4 | Pricing Component Engine | 2 weeks |
| 5 | Rate Card | 1 week |
| 6 | Package Engine | 2 weeks |
| 7 | Formula Engine | 2 weeks |
| 8 | Calculation Engine | 2 weeks |
| 9 | Rule Engine | 2 weeks |
| 10 | Pricing Engine | 2 weeks |
| 11 | BOQ Engine | 2 weeks |
| 12 | Estimate Engine | 2 weeks |
| 13 | Approval Engine | 1 week |
| 14 | Version Control | 1 week |
| 15 | PDF Generation | 1 week |
| 16 | Sharing | 1 week |
| 17 | Dashboard | 1 week |
| 18 | Final Integration | 1 week |
| | **Total** | **~26 weeks (6 months)** |

### 15.4 Overall Implementation Confidence

```
Implementation Confidence: HIGH
```

| Factor | Assessment |
|--------|-----------|
| **Documentation completeness** | 10 of 10 PRD phases complete |
| **Design consistency** | 0 duplicates, 0 conflicts (verified in 10F) |
| **Technical review score** | 9.1 / 10 |
| **Architecture clarity** | Clean layers, unambiguous module ownership |
| **Risk level** | LOW residual risk |
| **Business readiness** | Implementation-approved in 10F |

The SBBT Estimate Engine is **fully specification-complete and approved for implementation**. The 18-sprint roadmap provides the safest dependency-ordered build sequence. AI coding agents should follow the sprint order strictly and never skip Definition of Done criteria.

---

*End of Document*