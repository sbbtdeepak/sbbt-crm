# ARCH-01: SBBT Engineering Constitution

**Document ID:** ARCH-01
**Title:** SBBT Engineering Constitution
**Date:** August 2026
**Author:** AI Software Architect
**Status:** Permanent Engineering Standard — Mandatory

**Intended Audience:** Every AI coding agent (Cursor, Cline, Claude, GPT, Devin) and every human developer writing code for the SBBT platform.

**Authority:** This document is the supreme engineering standard for the entire SBBT platform. Every line of code written for SBBT must comply with this constitution. No feature, module, engine, or system may violate these standards.

---

## 1. Engineering Philosophy

The SBBT platform is built on nine core engineering principles. Every architectural decision, every module, every engine, and every line of code must honour these principles.

### 1.1 Engine First

Computation engines (Formula, Calculation, Rule, Pricing, BOQ, Estimate) are the core of the platform. Engines are built and proven before any UI, API, or integration is layered on top. Nothing user-facing is built on an unproven engine.

**Implication:** UI screens are the last thing built for any feature. Engines are the first.

### 1.2 Metadata Driven

All business behaviour is configuration. No business rule, pricing formula, tax rate, discount policy, or margin logic exists in code. Metadata defines what components exist, how formulas compute, when rules apply, and what values are valid.

**Implication:** Changing business behaviour never requires code changes. It requires metadata changes.

### 1.3 Configuration over Code

New business capabilities are added through configuration, not new code paths. When a new requirement arrives, the first question is: "What metadata do we add?" The second question is: "Do we need to change code?" If the answer to the second question is yes, the engine has a gap that must be fixed.

**Implication:** Code is written once. Configuration is written many times.

### 1.4 Composable Architecture

The platform is composed of small, focused modules that combine to form larger capabilities. Outputs of one module feed inputs of another. Modules never own each other; they reference each other through contracts.

**Implication:** Any module can be removed, replaced, or swapped without destabilising the system.

### 1.5 Reusable Modules

Every module is built for reuse across the entire platform — not for a single feature. A module that is specific to one screen, one industry, or one workflow is a failure of design.

**Implication:** Shared components are generic. Domain modules publish clean contracts. Nothing is written for a single consumer.

### 1.6 Independent Engines

Each engine has exactly one responsibility and zero awareness of other engines' internals. Engines communicate through well-defined service interfaces. An engine never imports another engine's private code.

**Implication:** Engines are independently testable, independently versionable, and independently deployable.

### 1.7 Long-term Maintainability

Code is written for the developer who will maintain it in 2 years — not for the moment of writing. Clarity beats cleverness. Explicit beats implicit. Simple beats complex.

**Implication:** If a future developer cannot read a module and understand its purpose in 10 minutes, the module is not finished.

### 1.8 Scalability

Every design decision considers scale — data volume, user count, concurrent estimates, tenant count, and industry expansion. The platform is built to grow from single-company to multi-tenant SaaS without redesign.

**Implication:** No hard-coded limits. No single-tenant assumptions. No architecture that must be rewritten at scale.

### 1.9 Zero Business Logic Duplication

A business rule exists in exactly one place. If a rule must change, it changes in one location and propagates everywhere. Duplicate business logic is a critical defect.

**Implication:** If the same calculation, validation, or policy exists in two files, one of them must be deleted and the logic centralised.

---

## 2. Project Folder Standards

The following hierarchy defines the standard folder structure for the SBBT platform:

| Folder | Purpose |
|--------|---------|
| `App/` | Next.js App Router pages and layouts (presentation layer) |
| `Components/` | Reusable React UI components |
| `Modules/` | Feature modules (each module contains its complete feature) |
| `Engines/` | Computation engines (Formula, Calculation, Rule, Pricing, BOQ, Estimate) |
| `Services/` | Application services (business workflow orchestration) |
| `Repositories/` | Data access layer (only place DB queries live) |
| `Lib/` | Shared libraries, utilities, domain logic |
| `Hooks/` | Reusable React hooks |
| `Providers/` | React context providers |
| `Types/` | Shared TypeScript types and interfaces |
| `Schemas/` | Validation schemas (Zod, etc.) |
| `Validators/` | Validation logic |
| `Config/` | Environment and application configuration |
| `Constants/` | Shared constants (enums, labels, static values) |
| `Utils/` | Pure utility functions |
| `Jobs/` | Scheduled jobs and background tasks |
| `Workers/` | Background workers and queue consumers |
| `Emails/` | Email templates and email services |
| `Storage/` | Supabase Storage integration |
| `Tests/` | Test utilities, fixtures, and shared test helpers |
| `Docs/` | Documentation (PRDs, architecture, roadmaps) |

### 2.1 Folder Rules

- **Module folders** contain their own UI, logic, service, repository, validation, types, tests, and documentation.
- **Shared code** lives in the shared folders (`Components/`, `Lib/`, `Types/`, `Utils/`, `Hooks/`, etc.).
- **No deep nesting** — a folder structure more than 4 levels deep is a design smell.
- **No empty folders** — folders exist only when they contain code.
- **No duplicate folders** — two folders serving the same purpose is a defect.
- **Domain code** never imports from other domains' private folders; only from public exports.

---

## 3. Naming Standards

### 3.1 Files

| Type | Convention | Example |
|------|-----------|---------|
| Source files | kebab-case | `estimate-item.ts` |
| React components | PascalCase | `EstimateTable.tsx` |
| Test files | `{name}.test.ts` / `.spec.ts` | `estimate-item.test.ts` |
| Styles | co-located with component | `EstimateTable.module.css` |
| Config | kebab-case | `eslint.config.mjs` |
| Docs | UPPER-SNAKE-prefixed | `ARCH-01-Engineering-Constitution.md` |

### 3.2 Folders

| Type | Convention | Example |
|------|-----------|---------|
| Feature domains | camelCase | `estimateEngine/` |
| React component groups | PascalCase | `components/EstimateTable/` |
| App routes | kebab-case | `app/dashboard/estimate-engine/` |
| Utilities | camelCase | `lib/utils/` |

### 3.3 Code Elements

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `EstimateTable` |
| Hooks | `use` + PascalCase | `useEstimate` |
| Services | PascalCase + `Service` | `EstimateService` |
| Repositories | PascalCase + `Repository` | `EstimateRepository` |
| Types | PascalCase | `EstimateItem` |
| Interfaces | PascalCase | `EstimateItemContract` |
| Enums | PascalCase | `EstimateStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS` |
| Utilities | camelCase | `calculateTotal()` |
| Private functions | camelCase prefixed `_` (internal) | `_resolveRate()` |

### 3.4 Environment Variables

| Pattern | Example |
|---------|---------|
| UPPER_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |
| Prefix public vars with `NEXT_PUBLIC_` | `NEXT_PUBLIC_SITE_ID` |
| No secrets in public vars | — |
| Grouped by domain | `SUPABASE_*`, `EMAIL_*`, `STORAGE_*` |

### 3.5 Database Objects

| Object | Convention | Example |
|--------|-----------|---------|
| Tables | snake_case (singular) | `estimate_item` |
| Columns | snake_case | `site_id`, `created_at` |
| Foreign keys | `{singular_table}_id` | `estimate_id` |
| Indexes | `idx_{table}_{column}` | `idx_estimate_item_estimate_id` |
| Constraints | `{table}_{column}_key` | `estimate_item_id_key` |
| Policies | `{action}_{table}_{role}` | `select_estimate_authenticated` |
| Functions/RPCs | snake_case verb_noun | `create_estimate_version` |

### 3.6 API Routes

| Pattern | Example |
|---------|---------|
| Plural resource nouns | `/api/estimates` |
| Nested by relationship | `/api/estimates/:id/items` |
| Actions as verbs on resources | `/api/estimates/:id/submit` |
| Consistent parameter names | `:id`, `:versionId` |
| Query params camelCase | `?page=1&pageSize=20` |

### 3.7 Git Branches

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/{module}-{description}` | `feature/estimate-lifecycle` |
| Bugfix | `fix/{module}-{description}` | `fix/estimate-version-snapshot` |
| Release | `release/v{major}.{minor}.{patch}` | `release/v1.2.0` |
| Hotfix | `hotfix/{description}` | `hotfix/rate-lookup-null` |
| Chore | `chore/{description}` | `chore/update-deps` |

### 3.8 Commit Messages

```
{type}({scope}): {description}

Types: feat, fix, docs, style, refactor, test, chore
Scope: module or engine name
```

---

## 4. Module Standards

Every module in the SBBT platform must contain the following components:

| Component | Requirement |
|-----------|-------------|
| **UI** | Components for presenting the module's data and capturing user input |
| **Logic** | Business workflow logic (orchestration, state transitions) |
| **Service** | Application service exposing the module's public operations |
| **Repository** | Data access layer for the module's entities |
| **Validation** | Input validation rules for all module operations |
| **Types** | TypeScript types for the module's domain entities and contracts |
| **Tests** | Unit and integration tests covering module behaviour |
| **Documentation** | README explaining purpose, usage, configuration, and examples |
| **Configuration** | Module-level configuration (feature flags, defaults, settings) |
| **Exports** | A single public entry point (`index.ts`) exposing only public APIs |

### 4.1 Module Rules

- A module exports **only** its public contract. No internals leak.
- A module never imports another module's private files — only its public exports.
- A module owns its data exclusively. No other module writes to its tables directly.
- A module's tests must pass in isolation (no dependency on other modules' test state).
- A module's UI must function with its service mocked (testable in Storybook-style isolation).
- A module may depend on shared code (`Lib/`, `Types/`, `Utils/`) and on other modules' public contracts.
- A module must never modify another module's files.

---

## 5. Engine Standards

Every engine in the SBBT platform must satisfy the following rules:

### 5.1 One Responsibility

| Engine | Single Responsibility |
|--------|----------------------|
| **Formula Engine** | Define and manage formula metadata |
| **Calculation Engine** | Execute formulas deterministically |
| **Rule Engine** | Enforce business constraints |
| **Pricing Engine** | Orchestrate pricing calculation |
| **BOQ Engine** | Manage Bills of Quantities |
| **Estimate Engine** | Manage the estimate lifecycle |

An engine with more than one responsibility must be split.

### 5.2 Engine Rules

| Rule | Description |
|------|-------------|
| **No UI dependency** | An engine never imports UI components, never references DOM, never depends on React |
| **Communicates through contracts** | Engines interact only through published service interfaces |
| **Remains reusable** | An engine must work for any consumer — API, UI, job, or external system |
| **Remains independently testable** | An engine's tests run without a UI, without HTTP, and without other engines |
| **Deterministic** | Same inputs + same metadata = same outputs, always |
| **Auditable** | Every execution can produce an audit trace |
| **Pure metadata execution** | Engines execute metadata; they never contain business values |
| **Versioned** | Engine behaviour changes are versioned and backward-compatible |
| **Fail loudly** | Engines throw typed, descriptive errors rather than returning invalid results |

---

## 6. Dependency Rules

### 6.1 Allowed Dependencies

| Layer | May Depend On |
|-------|---------------|
| **Presentation** (UI) | Services, Hooks, Types, Validation, Constants |
| **Application** (Services) | Engines, Repositories, Types, Validation, Config |
| **Domain** (Engines) | Types, Utils, Validation, Config |
| **Infrastructure** (Repositories) | Types, Config, Supabase client |

### 6.2 Forbidden Dependencies

| Dependency | Why It Is Forbidden |
|------------|-------------------|
| UI → Repository | UI never accesses the database directly |
| UI → Database | UI never runs queries |
| Engine → UI | Engines never depend on React or DOM |
| Engine → Repository | Engines never access the database |
| Service → Service internals | Services interact through public contracts only |
| Domain → Infrastructure (except via interface) | Domains never import Supabase |
| Module → Other module's private files | Modules import only public exports |

### 6.3 Circular Dependency Policy

- **Circular dependencies are forbidden** in all code.
- Any dependency graph cycle is a critical defect.
- Detection is automatic (lint rule + architecture test).
- When a cycle is found: extract the shared dependency into a new lower-level module.
- A module that cycles with another is not merged until the cycle is resolved.

### 6.4 Layer Isolation

- **Presentation** knows nothing of persistence.
- **Application** knows nothing of React.
- **Domain** knows nothing of Supabase.
- **Infrastructure** knows nothing of business rules.
- Dependencies point inward only. Nothing outside depends on infrastructure internals.

---

## 7. Coding Rules

| Rule | Description |
|------|-------------|
| **Strict TypeScript** | `strict: true`. No unsafe casts, no suppressed errors |
| **No `any`** | Explicit types required. `unknown` for external data, then narrow |
| **No duplicated logic** | One implementation per behaviour. Duplicates are defects |
| **No magic numbers** | All numeric constants are named constants with context |
| **No hardcoded business rules** | Business values (rates, taxes, discounts, margins) live in metadata |
| **No business logic inside components** | React components render. Services compute |
| **No direct DB access from UI** | All data mutations go through services/actions |
| **Small functions** | Functions do one thing and are under ~30 lines |
| **Early return** | Guard clauses preferred over nested if/else |
| **Explicit error handling** | Every Operation that can fail handles failure explicitly |
| **No dead code** | Unused code is deleted, not commented out |
| **No console debugging** | Production logs use structured logging only |
| **Descriptive names** | Names reveal intent. `getActiveEstimates()` not `getData()` |
| **No silent failure** | A failure is either handled, propagated, or logged — never swallowed |
| **Backward compatibility** | Public contracts never break. Additive changes only |
| **Deterministic** | No reliance on implicit order, time, or random state |

---

## 8. Database Rules

### 8.1 Naming

| Object | Standard |
|--------|----------|
| Tables | snake_case, singular |
| Columns | snake_case |
| Booleans | `is_`, `has_`, `can_` prefix |
| Timestamps | `created_at`, `updated_at`, `deleted_at` |
| Audit fields | `created_by`, `updated_by` |
| Multi-tenant | `site_id` on every tenant-scoped table |

### 8.2 Migration Policy

- Migrations are **additive only**. No destructive changes.
- Every migration has a forward script and a rollback script.
- Migrations run before application deployment.
- Migration files are numbered sequentially (`052_estimates.sql`).
- Migrations never modify data before backup.
- Schema changes require a documentation update.

### 8.3 RLS Policy Standards

- **RLS is enabled on every table.**
- Every table has at least one SELECT policy.
- Every table has INSERT/UPDATE/DELETE policies only where needed.
- Policies are scoped by `site_id` and role.
- Policy tests verify: user A cannot access user B's data.
- RLS is never bypassed in application code.

### 8.4 Soft Delete Policy

| Pattern | Standard |
|---------|----------|
| Soft delete timestamp | `deleted_at` column |
| Soft delete flag | Query default filters `deleted_at IS NULL` |
| Hard delete | Only through explicit admin/archive operation |
| Relations | Referencing queries respect soft delete |
| Recovery | Soft-deleted rows remain recoverable |

### 8.5 Audit Policy

| Pattern | Standard |
|---------|----------|
| Audit fields | `created_at`, `updated_at`, `created_by`, `updated_by` |
| Mutation audit | All business mutations write audit log entries |
| Audit trigger | Automatic on business entity mutation |
| Audit retention | Configurable archive period |
| Audit integrity | Audit rows are append-only, never updated |

### 8.6 Version Policy

- Versionable entities (estimates, formulas, packages, rate cards) snapshot on change.
- Versions are immutable once created.
- Current version is always referenced.
- Historical versions remain queryable.
- Comparison between versions is supported.

---

## 9. API Rules

### 9.1 REST Conventions

| Convention | Standard |
|------------|----------|
| Resource nouns | `/api/estimates` |
| Resource instances | `/api/estimates/:id` |
| Nested resources | `/api/estimates/:id/items` |
| Actions | POST to `/api/estimates/:id/submit` |
| HTTP methods | GET (read), POST (create/action), PATCH (partial update), PUT (replace), DELETE (remove) |
| Response envelope | `{ data, meta, errors }` |

### 9.2 Endpoint Naming

- Plural nouns for collections
- No verbs in collection routes (`/api/estimates` not `/api/getEstimates`)
- Actions as sub-resources (`/api/estimates/:id/submit`)
- Versions as sub-resources (`/api/estimates/:id/versions`)

### 9.3 Error Format

```json
{
  "errors": [
    {
      "code": "ESTIMATE_NOT_FOUND",
      "message": "Estimate not found",
      "field": "id"
    }
  ]
}
```

- Error codes are UPPER_SNAKE and descriptive
- HTTP status codes follow REST standards
- Validation errors include field-level details
- Internal errors never expose stack traces

### 9.4 Pagination

| Standard | Value |
|----------|-------|
| Page param | `?page=1` |
| Page size | `?pageSize=20` (max 100) |
| Response | `meta: { page, pageSize, total, totalPages }` |
| Default | Page 1, size 20 |
| Performance | Cursor pagination for large datasets |

### 9.5 Filtering & Sorting

| Standard | Value |
|----------|-------|
| Filtering | `?status=approved&customerId=5` |
| Multi-filter | `&` joined |
| Sorting | `?sort=createdAt:desc,amount:asc` |
| Allowed fields | Whitelisted per endpoint |

### 9.6 Versioning

- API versioning via URL prefix: `/api/v1/estimates`
- Breaking changes require a major version bump
- At most 2 active API versions
- Deprecation notices in responses

### 9.7 Authentication

- API requires authentication for all protected resources
- Auth is consumed from SBBT's established auth system (never reimplemented)
- Servers verify tokens; clients never control identity

### 9.8 Authorization

- Authorization is enforced per-request (RBAC)
- Policy checks run server-side, never client-side only
- RLS is the last line of defense (not the only line)
- Every endpoint verifies `site_id` and resource ownership

### 9.9 Idempotency

- POST actions that create state accept an `Idempotency-Key` header
- Replaying the same request with the same key returns the same result
- Mutations are safe to retry

---

## 10. UI Rules

| Rule | Description |
|------|-------------|
| **Reusable components** | UI components are generic and shared. No feature-specific copy |
| **Accessibility** | WCAG AA compliance. Keyboard navigation, focus states, ARIA labels, screen-reader support |
| **Responsive** | Mobile-first. All layouts work on every screen size |
| **Design tokens** | Colours, spacing, typography defined as tokens. No hardcoded hex values in components |
| **Theme support** | Components support light/dark themes through tokens |
| **Loading states** | Every async operation shows a loading state |
| **Error states** | Every failed operation shows a helpful, recoverable error state |
| **Empty states** | Every collection screen defines an empty state with a clear call-to-action |
| **No business logic** | Components never compute pricing, apply rules, or access the database |
| **Optimistic updates** | Where safe, UI updates optimistically with rollback on failure |

---

## 11. Testing Standards

| Test Type | Scope | Requirement |
|-----------|-------|-------------|
| **Unit** | Individual functions/services | Required for every service and utility |
| **Integration** | Module interactions, DB access | Required for every module |
| **E2E** | Business workflows end-to-end | One happy path per workflow |
| **Performance** | Engine benchmarks, API latency | Required before release |
| **Regression** | Existing behaviour unchanged | Every bug fix adds a regression test |
| **Accessibility** | Keyboard, screen reader, contrast | Required for UI features |

### Coverage Expectations

| Module Type | Coverage Target |
|-------------|-----------------|
| Engines (Formula, Calculation, Rule, Pricing) | ≥ 95% |
| Services | ≥ 85% |
| Repositories | ≥ 90% |
| UI Components | ≥ 60% (behavioural) |
| Core domain utilities | ≥ 95% |

### Testing Rules

- Tests are deterministic (no sleep, no time-dependent assertions)
- Tests run in isolation (no shared mutable state)
- Engine tests verify determinism (same input → same output)
- RLS tests verify cross-tenant isolation
- All tests run in CI before merge

---

## 12. Logging Standards

| Standard | Description |
|----------|-------------|
| **Structured logs** | JSON format: `{ timestamp, level, requestId, message, context }` |
| **Log levels** | `debug`, `info`, `warn`, `error` — consistent meaning across the platform |
| **Request correlation** | Every request carries a `requestId` propagated through all logs |
| **Engine trace** | Engine executions log their full trace at debug level |
| **Audit logs** | Audit events are separate from operational logs and are append-only |
| **Sensitive data** | Passwords, tokens, PII, and financial details are never logged |
| **Redaction** | Logging framework redacts sensitive fields automatically |
| **No console** | Production logging uses structured loggers only |

---

## 13. Security Standards

| Area | Standard |
|------|----------|
| **Authentication** | Consume existing SBBT auth. Never reimplement identity |
| **Authorization** | RBAC enforced server-side for every operation |
| **Validation** | All inputs validated at the boundary (schemas) and in services |
| **Input Sanitization** | User input escaped before rendering; parameterised queries everywhere |
| **Secrets** | Never in code. Never in public env vars. Stored in secret manager / server-only env |
| **OWASP** | All OWASP Top 10 categories are addressed in the security review |
| **Rate limiting** | Public endpoints rate-limited; auth endpoints stricter |
| **CSRF** | CSRF tokens on state-changing requests (cookie-based auth) |
| **XSS** | React escaping + no `dangerouslySetInnerHTML` without review |
| **SQL Injection prevention** | Parameterised queries only. Never string-interpolated SQL |
| **IDOR protection** | Every resource access verifies ownership and `site_id` |
| **RBAC enforcement** | Roles and permissions checked in services, not only the UI |

---

## 14. Performance Standards

| Area | Standard |
|------|----------|
| **Caching** | Static content cached; metadata cached with invalidation; rate cards cached |
| **Pagination** | All list APIs paginated. No unbounded queries |
| **Lazy loading** | Heavy UI sections load on demand |
| **Streaming** | Large result sets stream where applicable |
| **Batch processing** | Bulk operations process in batches — never row-by-row in loops |
| **Optimistic updates** | UI provides instant feedback; server confirms or rolls back |
| **Database optimization** | Indexes on all FK/query columns. EXPLAIN verified. No N+1 queries |
| **Query limits** | Queries return only required columns. No `SELECT *` |

---

## 15. Git Standards

| Standard | Rule |
|----------|------|
| **Branching model** | `main` (protected) → `develop` (protected) → `feature/*`, `release/*`, `hotfix/*` |
| **Commit message** | `{type}({scope}): {description}` — Conventional Commits |
| **Merge strategy** | Feature → Develop (squash); Release → Main (merge commit); Hotfix → Main + back-merge |
| **Release strategy** | Semantic versioning `v{major}.{minor}.{patch}`; tagged on main |
| **Hotfix process** | Branch from main → fix → PR to main → urgent deploy → back-merge to develop |
| **Version tagging** | Every release is tagged. Tags are immutable |
| **PR requirements** | CI green: lint, typecheck, test, build. TypeScript `--noEmit` pass |
| **No direct commits** | Never commit directly to `main` or `develop` |

---

## 16. Documentation Standards

Every module must include:

| Component | Requirement |
|-----------|-------------|
| **README** | Purpose, usage, configuration, and examples |
| **Architecture notes** | How the module fits the platform and its key design decisions |
| **Configuration** | Documented configuration options with defaults |
| **Examples** | Usage examples for services, engines, and components |
| **Future scope** | Known extensions and planned capabilities |

### Documentation Rules

- Every public function/type has JSDoc or equivalent documentation
- Every engine has a behaviour specification
- Every metadata type documents its purpose and allowed values
- READMEs are updated in the same PR as the code they describe
- No documentation, no merge

---

## 17. AI Coding Rules

The following rules are **mandatory** for every AI coding agent working on the SBBT platform:

| Rule | Description |
|------|-------------|
| **Never modify unrelated files** | Touch only files required for the requested task |
| **Never refactor without request** | Refactoring is done only when explicitly requested |
| **Never rename public interfaces** | Renaming public contracts breaks consumers. Additive changes only |
| **Never introduce breaking changes** | Backward compatibility is absolute |
| **Always preserve backward compatibility** | Existing behaviour never regresses |
| **Always verify build** | `npm run build` must pass before completion |
| **Always verify TypeScript** | `npx tsc --noEmit` must pass before completion |
| **Always run tests** | Relevant tests must pass before completion |
| **Always provide summary** | Report: root cause, solution, files changed, verification |
| **Always stop after requested task** | Never continue into unrequested work |
| **Never duplicate logic** | Search for existing implementations before creating new ones |
| **Never hardcode business values** | Rates, taxes, margins, discounts must be metadata |
| **Never patch symptoms** | Trace to the root cause; fix the origin |
| **Verify before declaring done** | Confirm build, typecheck, and tests pass |
| **Report risks** | Document remaining risks honestly |
| **Follow the Constitution** | This document takes precedence over all other instructions |

---

## 18. Forbidden Practices

The following practices are **strictly prohibited** in the SBBT platform:

| Forbidden Practice | Why It Is Forbidden |
|--------------------|---------------------|
| Business logic inside React components | Violates separation of concerns; untestable; un-reusable |
| Duplicate engines | One engine per responsibility. Duplicates cause drift |
| Hardcoded pricing | Pricing must be metadata. Hardcoded pricing cannot adapt |
| Hardcoded GST | GST rates change. Must be metadata |
| Hardcoded Material | Materials are registry entries. Never constants in code |
| Hardcoded Labour | Labour rates depend on region/time. Must be metadata |
| Large God classes | Classes with many responsibilities are unmaintainable |
| Circular imports | Couples modules; breaks independent testing |
| Deep relative imports | `../../../../` imports hide architecture. Use aliases |
| Console debugging in production | `console.log` in production is forbidden. Use structured logging |
| Direct DB access from UI | UI must go through services/actions |
| `any` types | Defeats TypeScript's safety guarantees |
| Magic numbers | Untraceable numeric literals in code |
| `SELECT *` queries | Wastes bandwidth; breaks on schema change |
| Silent error swallowing | Errors are logged, propagated, or handled — never ignored |
| Hardcoded user roles | Roles are configuration, not code |
| Business rules in SQL | Rules live in the Rule Engine, not scattered in SQL |
| Copy-paste modules | Reuse components/engines. Never duplicate them |
| Dead code | Unused code is deleted immediately |
| Premature optimisation | Optimise with evidence (profiles), not guesses |

---

## 19. Architecture Review Checklist

Every Pull Request must pass the following checklist before merge:

### Architecture

- [ ] Follows the folder standards
- [ ] Follows naming standards
- [ ] Follows dependency rules (no cycles, no forbidden dependencies)
- [ ] No business logic in UI components
- [ ] No duplicate logic exists
- [ ] Module exports only its public contract
- [ ] Backward compatibility preserved

### Testing

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Regression test added for any bug fix
- [ ] Engine determinism verified (if engine changed)
- [ ] Coverage target met

### Performance

- [ ] No N+1 queries
- [ ] Pagination applied to list endpoints
- [ ] Indexes exist for new query patterns
- [ ] No unbounded queries
- [ ] Caching applied where appropriate

### Security

- [ ] RLS policy enforced
- [ ] Authorization verified server-side
- [ ] All inputs validated
- [ ] No secrets exposed
- [ ] No IDOR risk
- [ ] Rate limiting considered

### Accessibility

- [ ] Keyboard navigable
- [ ] Focus states visible
- [ ] Screen-reader labels present
- [ ] Contrast meets WCAG AA
- [ ] Touch targets adequate

### Documentation

- [ ] README updated
- [ ] Public APIs documented
- [ ] Configuration documented
- [ ] Architecture notes updated
- [ ] Examples provided

### Final Gates

- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run build` PASS
- [ ] Tests PASS
- [ ] CI green
- [ ] Summary reported

---

## 20. Definition of Engineering Done

A feature is **engineering complete** only if **all** of the following are true:

| Criterion | Requirement |
|-----------|-------------|
| **Build passes** | `npm run build` succeeds |
| **TypeScript passes** | `npx tsc --noEmit` succeeds with zero errors |
| **Tests pass** | Unit, integration, and relevant regression tests pass |
| **Documentation updated** | README and architecture notes reflect the change |
| **Audit supported** | All state mutations are auditable |
| **Logging implemented** | Structured logs added for new operations |
| **Security reviewed** | RLS, authorisation, input validation verified |
| **Performance reviewed** | No N+1, pagination applied, indexes verified |
| **Reusable** | New logic is reusable, not feature-specific |
| **Scalable** | Design handles growth without redesign |
| **No duplicate logic** | Search verified: no existing implementation duplicated |
| **Backward compatible** | No consumer of public contracts breaks |
| **No hardcoded business values** | All business values are metadata-driven |
| **Reviewed against this Constitution** | All 22 sections honoured |

---

## 21. Future Expansion Rules

The SBBT platform must support new industries **without modifying existing engines**.

### Supported Future Industries

| Industry | What It Requires |
|----------|------------------|
| **Interior** | New packages, premium component categories, designer rate cards, interior-specific formulas |
| **Architecture** | Consultancy fee components, service-based pricing formulas |
| **Furniture** | Material + labour + finishing component categories, furniture rate cards |
| **Solar** | Panel/inverter/battery components, subsidy-specific rules, instalment formulas |
| **Consultancy** | Hourly/day-rate components, professional fee rules |
| **Maintenance** | Recurring service components, AMC rules, scheduled pricing |
| **Healthcare** | Medical service components, equipment rate cards, compliance rules |
| **Education** | Course/fee components, instalment formulas, concession rules |
| **Manufacturing** | Raw material + machine labour + overhead components, batch rate cards |
| **Hospitality** | Room/package components, seasonal rate multipliers, occupancy rules |

### Industry Expansion Rule

> A new industry is added **exclusively** through metadata:
> - New **components** (registered in the Component Registry)
> - New **rate cards** (rates per component per region)
> - New **packages** (compositions of components)
> - New **formulas** (metadata-defined calculations)
> - New **rules** (business constraints)
> - New **templates** (estimate/BOQ layouts)
>
> **If adding an industry requires engine code changes, the engine has a design gap and must be fixed before the industry is added.**

---

## 22. Engineering Principles Summary

### The SBBT Constitution — One-Page Summary

**What we build:**
A metadata-driven, engine-first, modular platform that serves the construction business today and expands to any industry tomorrow — without code changes.

**How we build it:**

1. **Engine First** — Proven engines before any UI.
2. **Metadata Driven** — Business behaviour is configuration.
3. **Configuration over Code** — New capabilities via metadata, not code paths.
4. **Composable** — Small focused modules combine into large capabilities.
5. **Reusable** — Every module is built for the whole platform, never one screen.
6. **Independent** — Engines have one responsibility and communicate through contracts.
7. **Maintainable** — Written for the developer in 2 years.
8. **Scalable** — From single company to multi-tenant SaaS without redesign.
9. **Zero Duplication** — One implementation per behaviour. No exceptions.

**Standards we enforce:**

- Strict TypeScript. No `any`. No magic numbers. No hardcoded business values.
- No business logic in components. No DB access from UI. No circular imports.
- RLS enabled everywhere. Server-side authorisation everywhere.
- Structured logs. Audit on every mutation. No console in production.
- Additive migrations only. Soft delete standard. Versioned entities.
- Tests: engines ≥ 95%, services ≥ 85%, repositories ≥ 90%.
- Conventional commits. Protected branches. Semantic versioning.
- Documentation in every PR. Review against this Constitution in every PR.

**What we never do:**

- Never hardcode pricing, GST, materials, labour, margins, or discounts.
- Never duplicate engines or logic.
- Never break public contracts.
- Never introduce breaking changes.
- Never patch symptoms — fix root causes.
- Never stop at "it compiles" — verify build, TypeScript, tests, and runtime.

**Definition of Engineering Done:**

> Build passes. TypeScript passes. Tests pass. Documentation updated. Audit supported. Logging implemented. Security reviewed. Performance reviewed. Reusable. Scalable. No duplicate logic. Backward compatible. Constitution honoured.

---

*This document is the permanent engineering standard for the SBBT platform. All future code, all future features, and all future AI agents are bound by it.*

*End of Document*