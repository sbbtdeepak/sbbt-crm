# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02
**Title:** Technical Architecture
**Phase:** Phase 10E
**Date:** August 2026
**Author:** AI Software Architect
**Status:** Phase 10E (Technical Architecture Design)

---

## 1. Application Layers

The application is organised into clean, layered architecture.

| Layer | Responsibility | Technology |
|-------|----------------|------------|
| **Presentation** | UI rendering, user interaction | Next.js, React, Tailwind |
| **Application** | Use-case orchestration, validation | Next.js Server Actions / Route Handlers |
| **Domain** | Business logic, formula engine, rules | TypeScript (framework-agnostic) |
| **Infrastructure** | Data access, storage, external services | Supabase, Storage, Email |

### 1.1 Layer Rules

- Presentation never accesses database directly
- Application orchestrates domain services
- Domain never depends on framework
- Infrastructure is swappable
- Dependencies point inward only

---

## 2. Module Boundaries

Modules are separated by domain responsibility.

| Module | Boundary | Owns |
|--------|----------|------|
| **estimate** | Estimate documents, versions, states | EstimateService, VersionService |
| **boq** | Bill of quantities | BoqService, BoqItemService |
| **product** | Packages, components, categories | PackageService, ComponentService |
| **pricing** | Formulas, rules, simulation | FormulaService, RuleService, PricingEngine |
| **approval** | Approval workflows | ApprovalService |
| **customer** | Customers, projects | CustomerService, ProjectService |
| **share** | Estimate sharing | ShareService |
| **audit** | Audit and history | AuditService |

### 2.1 Module Rules

- Modules communicate via typed contracts (interfaces)
- No module imports another module's internals
- Cross-module calls go through application layer
- New domains add new modules, never modify existing

---

## 3. Folder Structure

```
src/
├── app/                    # Next.js App Router (pages, routes)
│   ├── dashboard/
│   │   ├── estimates/
│   │   ├── boq/
│   │   ├── pricing/
│   │   ├── formulas/
│   │   ├── approvals/
│   │   └── settings/
│   └── api/
├── components/             # UI components
│   ├── ui/                 # Generic UI (shared)
│   ├── estimate/           # Estimate-specific components
│   ├── formula/            # Formula builder components
│   └── boq/                # BOQ components
├── lib/
│   ├── estimate/           # Estimate domain
│   ├── boq/                # BOQ domain
│   ├── pricing/            # Pricing domain (Formula Engine)
│   ├── product/            # Package/Component domain
│   ├── approval/           # Approval domain
│   ├── share/              # Share domain
│   ├── audit/              # Audit domain
│   └── supabase/           # Supabase clients
├── actions/                # Server Actions (application layer)
├── types/                  # Shared TypeScript types
└── config/                 # Configuration
```

---

## 4. Services

Services implement business use-cases.

| Service | Module | Key Operations |
|---------|--------|----------------|
| `EstimateService` | estimate | create, submit, approve, restore, share |
| `VersionService` | estimate | create version, compare, export |
| `BoqService` | boq | create items, freeze, lock |
| `PackageService` | product | create, publish, deprecate |
| `ComponentService` | product | manage components, categories |
| `FormulaService` | pricing | create, validate, activate, test |
| `RuleService` | pricing | manage rules, rule groups |
| `PricingEngine` | pricing | evaluate formulas, compute totals |
| `ApprovalService` | approval | create workflow, approve, reject |
| `ShareService` | share | create links, withdraw, track views |
| `AuditService` | audit | record actions, query history |
| `ExportService` | estimate | PDF, Excel generation |

### 4.1 Service Rules

- Services are stateless
- State lives in database, not memory
- Services validate before acting
- Services emit events on state changes

---

## 5. Repositories

Repositories abstract data access.

| Repository | Module | Data Source |
|------------|--------|-------------|
| `EstimateRepository` | estimate | Supabase (estimate tables) |
| `BoqRepository` | boq | Supabase (boq tables) |
| `FormulaRepository` | pricing | Supabase (formula tables) |
| `ComponentRepository` | product | Supabase (component tables) |
| `ApprovalRepository` | approval | Supabase (approval tables) |
| `CustomerRepository` | customer | Supabase (customer tables) |
| `AuditRepository` | audit | Supabase (audit tables) |

### 5.1 Repository Rules

- Repositories return domain objects (not raw rows)
- Repositories encapsulate queries and filters
- No business logic in repositories
- Repositories are the only data access point

---

## 6. Engine Interaction

The Formula Engine is the core computational component.

### 6.1 Execution Flow

```
Estimate Builder
      ↓
EstimateService
      ↓
PricingEngine.evaluate(context)
      ├→ Load formula
      ├→ Load rules
      ├→ Evaluate formula
      ├→ Apply rules
      ├→ Compute result
      └→ Return result + trace
      ↓
Estimate persisted (version snapshot)
```

### 6.2 Engine Contracts

| Contract | Purpose |
|----------|---------|
| `EvaluationContext` | Inputs: components, quantities, rates, domain, site |
| `EvaluationResult` | Output: computed values, breakdown, trace |
| `FormulaDefinition` | Metadata-driven formula structure |
| `RuleSet` | Collection of applicable rules |

### 6.3 Engine Rules

- Engine executes metadata only (no hard-coded pricing)
- Engine is deterministic (same input → same output)
- Engine produces execution trace for audit
- Engine runs in server context (never client)
- Engine is stateless (no shared mutable state)

---

## 7. Caching

| Cache | Data | Strategy | TTL |
|-------|------|----------|-----|
| **Formula Cache** | Active formula definitions | In-memory | 5 min |
| **Reference Cache** | Components, categories, packages | In-memory | 15 min |
| **Config Cache** | Site configuration | In-memory | 5 min |
| **Query Cache** | Dashboard aggregates | Server cache | 60 sec |
| **Static Cache** | Public share pages | CDN/ISR | Per policy |

### 7.1 Cache Rules

- Cache keys include `site_id`
- Cache invalidation on data change (event-based)
- Cache failures fall back to database
- Never cache user-specific data beyond session

---

## 8. Events

Events enable decoupled communication between modules.

| Event | Emitter | Consumers |
|-------|---------|-----------|
| `estimate.created` | EstimateService | Audit, Notification |
| `estimate.submitted` | EstimateService | Approval, Audit |
| `estimate.approved` | ApprovalService | Share, Notification |
| `estimate.shared` | ShareService | Notification, Audit |
| `formula.activated` | FormulaService | Audit, Notification |
| `boq.frozen` | BoqService | Estimate, Audit |
| `customer.request_changes` | ShareService | Estimate, Notification |

### 8.1 Event Rules

- Events are fire-and-forget (async)
- Events are logged for replay
- Event handling failures are retried with backoff
- Events never carry sensitive payloads (only IDs)

---

## 9. Background Jobs

| Job | Trigger | Purpose |
|-----|---------|---------|
| **Share Expiry** | Scheduled (hourly) | Expire share links past validity |
| **Estimate Expiry** | Scheduled (daily) | Mark estimates expired |
| **Archive** | Scheduled (monthly) | Move old data to archive |
| **Materialized View Refresh** | Scheduled (daily) | Refresh reporting aggregates |
| **Export Generation** | Async (on request) | Generate PDF/Excel |
| **Notification Dispatch** | Async (on event) | Send emails/WhatsApp |

### 9.1 Job Rules

- Jobs are idempotent (safe to re-run)
- Jobs log start, end, rows affected, errors
- Job failures alert admins
- Jobs run with service role (bypass RLS)

---

## 10. File Storage

| Storage | Content | Access |
|---------|---------|--------|
| **Share PDFs** | Exported estimate PDFs | Signed URL (expiring) |
| **BOQ Imports** | CSV/Excel uploads | Private (service only) |
| **Attachments** | Estimate attachments | Signed URL (role-scoped) |
| **Branding Assets** | Company logo, templates | Public (CDN) |

### 10.1 Storage Rules

- Storage buckets enforce RLS
- Public files are cached on CDN
- Private files use signed URLs with expiry
- File types are validated (allowlist)
- File size limits enforced

---

## 11. Logging

| Log Type | Content | Retention |
|----------|---------|-----------|
| **Application** | Request, service, engine executions | 30 days |
| **Engine Trace** | Formula evaluation details | 90 days |
| **Error** | Stack traces, context | 90 days |
| **Audit** | Business events (actor, action) | 7 years |
| **Security** | Auth failures, access denials | 1 year |

### 11.1 Logging Rules

- Logs include `request_id` for correlation
- Logs never contain passwords or tokens
- Structured JSON logging
- Sensitive fields are redacted

---

## 12. Monitoring

| Metric | Tool | Alert |
|--------|------|-------|
| **Error Rate** | Error tracking | > 1% error rate |
| **API Latency** | APM | P95 > 2s |
| **Engine Execution Time** | APM | P95 > 500ms |
| **Database Load** | Supabase metrics | CPU > 80% |
| **Quota Usage** | Supabase metrics | > 80% quota |
| **Job Failures** | Job monitoring | Any failure |

### 12.1 Monitoring Rules

- Dashboards per module
- Alerts route to appropriate team
- Daily health report generated

---

## 13. Configuration

| Configuration | Source | Example |
|---------------|--------|---------|
| **Environment** | Environment variables | DATABASE_URL, API keys |
| **Site** | Database (settings table) | Company name, branding |
| **Domain** | Database (domain config) | Pricing components per domain |
| **Feature Flags** | Database (flags table) | Enable/disable features |

### 13.1 Configuration Rules

- Secrets never in code
- Environment-specific configs documented
- Feature flags are additive
- Config changes are versioned and audited

---

## 14. Deployment

| Environment | Purpose | Updates |
|-------------|---------|---------|
| **Development** | Local development | Continuous |
| **Staging** | Pre-production validation | On merge |
| **Production** | Live system | On approval |

### 14.1 Deployment Pipeline

```
Commit → CI (lint, typecheck, test) → Build → Deploy Staging → Validate → Deploy Production
```

### 14.2 Deployment Rules

- Migrations run before app deploy
- Deploys are zero-downtime (staged)
- Rollback via previous build (instant)
- Deployments are logged with version

---

## 15. Scalability

| Scale Vector | Strategy |
|--------------|----------|
| **Users** | Next.js serverless auto-scaling |
| **Database** | Connection pooling, indexes, materialized views |
| **API** | Horizontal scaling via Vercel |
| **Background Jobs** | Queue-based processing |
| **Storage** | CDN distribution |
| **Context** | Read replicas (future) |

### 15.1 Scaling Rules

- Stateless services scale horizontally
- Stateful components stay in database
- Heavy computation is offloaded to jobs
- Load testing before scale events

---

## 16. Future Microservices

The modular architecture supports future service decomposition without rewrite.

| Future Service | Extracted From | When |
|----------------|---------------|------|
| **Formula Engine Service** | pricing module | When engine load justifies standalone |
| **Export Service** | estimate module | When PDF volume high |
| **Notification Service** | ops module | When multi-channel volume high |
| **Approval Service** | approval module | When workflow complexity grows |

### 16.1 Decomposition Rules

- Extract only when module is independently scalable
- Interfaces become API contracts at extraction
- No shared database state between services
- Event-driven communication between services

---

## 17. Validation

- All layers compile with strict TypeScript
- All services have unit tests
- All API endpoints have integration tests
- Formula Engine has property-based tests
- RLS policies have security tests
- Deployment pipeline gates on tests

---

*End of Document*