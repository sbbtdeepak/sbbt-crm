# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02
**Title:** Database Design — Supabase / PostgreSQL
**Phase:** Phase 10B
**Date:** August 2026
**Author:** AI Software Architect
**Status:** Phase 10B (Database Architecture Design)

---

## 1. Entity to Table Mapping

The logical entities defined in Phase 10A map to physical tables. Each logical entity maps to exactly one primary table. Supporting structures (history, audit, version) map to dedicated tables.

| Logical Entity | Physical Table | Schema |
|----------------|----------------|--------|
| Estimate | `estimate` | `estimate` |
| Estimate Version | `estimate_version` | `estimate` |
| Estimate Revision | `estimate_revision` | `estimate` |
| Estimate Template | `estimate_template` | `estimate` |
| BOQ | `boq` | `estimate` |
| BOQ Item | `boq_item` | `estimate` |
| Package | `package` | `product` |
| Package Template | `package_template` | `product` |
| Component | `component` | `product` |
| Component Category | `component_category` | `product` |
| Pricing Rule | `pricing_rule` | `pricing` |
| Formula | `formula` | `pricing` |
| Formula Version | `formula_version` | `pricing` |
| Rule | `rule` | `pricing` |
| Rule Group | `rule_group` | `pricing` |
| Calculation Context | `calculation_context` | `pricing` |
| Simulation | `simulation` | `pricing` |
| Approval | `approval` | `approval` |
| Approval Stage | `approval_stage` | `approval` |
| Customer | `customer` | `customer` |
| Project | `project` | `customer` |
| Share | `share` | `estimate` |
| Notification | `notification` | `ops` |
| Attachment | `attachment` | `estimate` |
| Comment | `comment` | `estimate` |
| Tag | `tag` | `ops` |
| History | `history` | `audit` |
| Audit Entry | `audit_entry` | `audit` |
| Custom Attribute | `custom_attribute` | `ops` |

---

## 2. Schemas

The database is organised into logical schemas that mirror domain boundaries.

| Schema | Purpose | Tables |
|--------|---------|--------|
| `estimate` | Estimate documents, versions, BOQ, shares | estimate, estimate_version, estimate_revision, estimate_template, boq, boq_item, share |
| `product` | Packages, components, categories | package, package_template, component, component_category |
| `pricing` | Formulas, rules, pricing | formula, formula_version, rule, rule_group, pricing_rule, calculation_context, simulation |
| `approval` | Approval workflows | approval, approval_stage |
| `customer` | Customers and projects | customer, project |
| `ops` | Operational support | notification, attachment, comment, tag, custom_attribute |
| `audit` | Governance and history | history, audit_entry |
| `auth` | Supabase-managed authentication | (managed by Supabase) |
| `storage` | Supabase-managed file storage | (managed by Supabase) |

**Business Rules:**
- Each schema is owned by a single domain
- Cross-schema access is through views or service functions only
- Schema names are lowercase, singular
- New domains add new schemas without altering existing ones

---

## 3. Tables

Each table follows a consistent structure pattern.

### 3.1 Core Table Pattern

Every business table includes:

| Column Group | Columns | Purpose |
|--------------|---------|---------|
| **Identity** | `id` (UUID PK) | Unique identifier |
| **Tenant** | `site_id` | Multi-tenant isolation |
| **Audit** | `created_at`, `updated_at`, `created_by`, `updated_by` | Standard audit fields |
| **State** | `status`, `state` | Lifecycle state |
| **Soft Delete** | `deleted_at`, `deleted_by` | Soft delete support |
| **Version** | `version_no` | Optimistic concurrency |

### 3.2 Table Inventory

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `estimate` | id, site_id, customer_id, project_id, status, total_amount | Core document |
| `estimate_version` | id, estimate_id, version_no, content_snapshot | Immutable snapshot |
| `estimate_revision` | id, estimate_id, version_id, revision_no, reason | Revision tracking |
| `estimate_template` | id, name, structure | Reusable template |
| `boq` | id, estimate_id, status | Quantity takeoff |
| `boq_item` | id, boq_id, component_id, qty, unit | Line item |
| `package` | id, name, status | Pre-built offering |
| `package_template` | id, name, structure | Template |
| `component` | id, category_id, name, type | Generic component |
| `component_category` | id, parent_id, name | Hierarchy |
| `pricing_rule` | id, name, rule_type | Pricing behaviour |
| `formula` | id, name, category, priority | Formula definition |
| `formula_version` | id, formula_id, version_no, definition | Immutable version |
| `rule` | id, rule_group_id, name, condition | Business rule |
| `rule_group` | id, name, priority | Rule grouping |
| `calculation_context` | id, formula_id, inputs | Evaluation inputs |
| `simulation` | id, formula_id, inputs, output | Test result |
| `approval` | id, entity_type, entity_id, status | Approval workflow |
| `approval_stage` | id, approval_id, stage_no, approver_id | Stage tracking |
| `customer` | id, name, contact | Customer |
| `project` | id, customer_id, name, address | Project |
| `share` | id, estimate_id, token, status | Sharing |
| `notification` | id, recipient_id, type, status | Notification |
| `attachment` | id, entity_type, entity_id, file_ref | Attachment |
| `comment` | id, entity_type, entity_id, body | Comment |
| `tag` | id, name | Tag |
| `history` | id, entity_type, entity_id, action, actor | State history |
| `audit_entry` | id, event_type, actor, entity, payload | Audit |
| `custom_attribute` | id, entity_type, entity_id, key, value | Extension |

---

## 4. Columns

### 4.1 Naming Standards

| Element | Standard | Example |
|---------|----------|---------|
| Table names | snake_case, plural | `estimate_versions` |
| Column names | snake_case, singular | `created_at` |
| Primary key | `id` | `id` |
| Foreign key | `{table}_id` | `estimate_id` |
| Boolean | `is_` prefix | `is_active` |
| Timestamp | `_at` suffix | `created_at` |
| Actor | `_by` suffix | `created_by` |
| Enum | `_type`, `_status` suffix | `status` |

### 4.2 Data Types

| Type | Usage |
|------|-------|
| `uuid` | Primary keys, foreign keys |
| `text` | Names, descriptions, notes |
| `numeric(18,4)` | Monetary values |
| `numeric(12,4)` | Quantities, rates |
| `integer` | Counts, version numbers |
| `boolean` | Flags |
| `timestamptz` | All timestamps (UTC) |
| `jsonb` | Flexible metadata, snapshots, inputs |
| `citext` | Case-insensitive text (emails, codes) |

---

## 4. Primary Keys

- All tables use `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- No composite primary keys (surrogate keys only)
- Natural keys (e.g., estimate number) are unique constraints, not PKs
- Primary keys are immutable

---

## 5. Foreign Keys

| Relationship | FK Column | References | On Delete |
|--------------|-----------|------------|-----------|
| Estimate → Customer | `customer_id` | `customer.id` | `SET NULL` |
| Estimate → Project | `project_id` | `project.id` | `SET NULL` |
| Estimate Version → Estimate | `estimate_id` | `estimate.id` | `CASCADE` |
| Estimate Revision → Estimate | `estimate_id` | `estimate.id` | `CASCADE` |
| BOQ → Estimate | `estimate_id` | `estimate.id` | `CASCADE` |
| BOQ Item → BOQ | `boq_id` | `boq.id` | `CASCADE` |
| BOQ Item → Component | `component_id` | `component.id` | `RESTRICT` |
| Package → Component | `component_id` | `component.id` | `RESTRICT` |
| Component → Category | `category_id` | `component_category.id` | `RESTRICT` |
| Formula Version → Formula | `formula_id` | `formula.id` | `CASCADE` |
| Rule → Rule Group | `rule_group_id` | `rule_group.id` | `RESTRICT` |
| Approval → Entity | `entity_id` | polymorphic | `CASCADE` |
| Project → Customer | `customer_id` | `customer.id` | `RESTRICT` |
| Share → Estimate | `estimate_id` | `estimate.id` | `CASCADE` |
| Attachment → Entity | `entity_id` | polymorphic | `CASCADE` |

**Business Rules:**
- `CASCADE` only for child documents (versions, revisions, items)
- `RESTRICT` for reference data (components, categories, customers)
- `SET NULL` for optional references (customer, project)
- Polymorphic references use `entity_type` + `entity_id` with application-level enforcement

---

## 6. Indexes

### 6.1 Index Strategy

| Index Type | Purpose | Example |
|------------|---------|---------|
| **Primary** | PK lookup | `id` |
| **Foreign Key** | Join performance | `estimate_id` on `estimate_version` |
| **Unique** | Enforce uniqueness | `(site_id, estimate_number)` |
| **Filtered** | Partial index on active rows | `WHERE deleted_at IS NULL` |
| **Composite** | Common query patterns | `(site_id, status, created_at)` |
| **GIN** | JSONB search | `payload` on `audit_entry` |
| **Trigram** | Text search | `name` on `component` |

### 6.2 Index Rules

- Every FK column is indexed
- Every unique constraint creates an index
- Partial indexes are used for soft-delete filtering
- Indexes are named `idx_{table}_{column}`
- No more than 5 indexes per table (except audit/history)

---

## 7. Unique Constraints

| Table | Unique Constraint | Purpose |
|-------|-------------------|---------|
| `estimate` | `(site_id, estimate_number)` | Unique estimate number per site |
| `estimate_version` | `(estimate_id, version_no)` | Unique version per estimate |
| `formula` | `(site_id, name)` | Unique formula name per site |
| `formula_version` | `(formula_id, version_no)` | Unique version per formula |
| `component` | `(site_id, name, category_id)` | Unique component per category |
| `customer` | `(site_id, phone)` | Unique customer phone per site |
| `tag` | `(site_id, name)` | Unique tag per site |
| `rule_group` | `(site_id, name)` | Unique rule group per site |

**Business Rules:**
- All unique constraints are scoped by `site_id` (multi-tenant)
- Unique constraints are enforced at database level
- Unique constraint violations return standardised errors

---

## 8. Check Constraints

| Table | Constraint | Rule |
|-------|-----------|------|
| `estimate` | `status IN (...)` | Valid lifecycle states |
| `estimate_version` | `version_no > 0` | Version must be positive |
| `boq_item` | `qty >= 0` | Quantity cannot be negative |
| `boq_item` | `rate >= 0` | Rate cannot be negative |
| `formula` | `priority BETWEEN 1 AND 5` | Priority range |
| `formula_version` | `version_no > 0` | Version must be positive |
| `customer` | `phone ~ '^[0-9+ -]+$'` | Phone format |
| `share` | `status IN ('pending','sent','viewed','expired','withdrawn')` | Share states |
| `approval` | `status IN ('pending','in_review','approved','rejected')` | Approval states |
| `audit_entry` | `event_type IS NOT NULL` | Event type required |

**Business Rules:**
- Check constraints enforce business invariants at database level
- Check constraints are additive (never removed without migration)
- Constraint violations return standardised error codes

---

## 9. Views

Views provide read-optimised, security-filtered access to data.

| View | Purpose | Schema |
|------|---------|--------|
| `v_estimate_summary` | Estimate list with totals, status, customer | `estimate` |
| `v_estimate_detail` | Full estimate with versions, BOQ | `estimate` |
| `v_boq_summary` | BOQ with item counts, totals | `estimate` |
| `v_formula_catalog` | Active formulas with versions | `pricing` |
| `v_customer_activity` | Customer with recent estimates | `customer` |
| `v_approval_queue` | Pending approvals for a user | `approval` |
| `v_audit_recent` | Recent audit entries (filtered) | `audit` |

**Business Rules:**
- Views are read-only (no `INSTEAD OF` triggers)
- Views apply RLS automatically (they inherit table RLS)
- Views are used for reporting and list screens
- Views are versioned with migrations

---

## 10. Materialized Views

Materialized views provide pre-computed aggregates for performance.

| Materialized View | Purpose | Refresh |
|-------------------|---------|---------|
| `mv_estimate_totals` | Sum of estimate amounts by status | On-demand |
| `mv_formula_usage` | Formula usage statistics | Daily |
| `mv_customer_estimates` | Customer estimate counts and totals | Daily |
| `mv_domain_metrics` | Domain-level performance metrics | Weekly |

**Business Rules:**
- Materialized views are refreshed on schedule (not real-time)
- Refresh is logged
- Materialized views are used only for reporting/analytics
- No application reads depend on materialized views for correctness

---

## 11. RLS Strategy

Row Level Security (RLS) is the primary data access control mechanism.

### 11.1 RLS Principles

- RLS is enabled on **all** business tables
- RLS is **never** disabled for application access
- Service role bypasses RLS only for system operations
- RLS policies are defined per role

### 11.2 RLS Policies

| Table | Policy | Rule |
|-------|--------|------|
| `estimate` | `site_isolation` | `site_id = auth.jwt() ->> 'site_id'` |
| `estimate` | `owner_access` | `created_by = auth.uid()` |
| `estimate` | `approver_access` | `status IN ('submitted','in_review') AND role = 'approver'` |
| `estimate_version` | `parent_site` | `estimate_id IN (SELECT id FROM estimate WHERE site_id = ...)` |
| `formula` | `site_isolation` | `site_id = auth.jwt() ->> 'site_id'` |
| `formula` | `admin_manage` | `role IN ('formula_admin','admin')` |
| `customer` | `site_isolation` | `site_id = auth.jwt() ->> 'site_id'` |
| `audit_entry` | `audit_read` | `role IN ('admin','audit')` |
| `share` | `token_access` | `token = current_setting('app.share_token')` |

### 11.3 RLS Rules

- Every table has at least one `SELECT` policy
- Write policies are role-scoped
- RLS policies are tested with automated test cases
- RLS bypass is only via `service_role` (server-side only)

---

## 12. Audit Tables

Audit tables record every auditable action.

| Table | Purpose | Volume |
|-------|---------|--------|
| `audit_entry` | Every auditable action | Very High |
| `audit_entry_detail` | Detailed payload for audit entries | Very High |

**Business Rules:**
- Audit entries are append-only (no UPDATE/DELETE)
- Audit entries are written by database triggers
- Audit entries include actor, action, entity, timestamp, payload
- Audit entries are never purged (retention 7 years)

---

## 13. History Tables

History tables track state changes of business entities.

| Table | Purpose |
|-------|---------|
| `history` | State transitions for all entities |

**Business Rules:**
- History is written on every state change
- History includes from-state, to-state, actor, timestamp, reason
- History is append-only
- History is used for audit and rollback analysis

---

## 14. Version Tables

Version tables store immutable snapshots of versioned entities.

| Table | Purpose |
|-------|---------|
| `estimate_version` | Immutable estimate snapshots |
| `formula_version` | Immutable formula snapshots |
| `package_template` | Versioned template structures |

**Business Rules:**
- Version rows are immutable (no UPDATE)
- Version rows include full snapshot (JSONB) for reconstruction
- Version rows are never deleted
- Version rows are linked to parent via FK

---

## 15. Soft Delete

Soft delete preserves data while removing it from active use.

| Table | Soft Delete Columns | Behaviour |
|-------|---------------------|-----------|
| `estimate` | `deleted_at`, `deleted_by` | Hidden from lists, retained |
| `customer` | `deleted_at`, `deleted_by` | Hidden, references blocked |
| `component` | `deleted_at`, `deleted_by` | Hidden, references blocked |
| `package` | `deleted_at`, `deleted_by` | Hidden, references blocked |
| `formula` | `deleted_at`, `deleted_by` | Hidden, references blocked |

**Business Rules:**
- Soft-deleted rows are excluded from all queries (via partial index)
- Soft-deleted rows are recoverable by admin
- Soft delete does not cascade to children
- Hard delete is only for system admin with audit

---

## 16. Archiving

Archiving moves old data to long-term storage.

| Archive Level | Trigger | Storage |
|---------------|---------|---------|
| **Cold Archive** | Estimate older than 3 years, status = Expired | Separate archive schema |
| **Compliance Archive** | Audit entries older than 1 year | Separate archive schema |
| **Deep Archive** | All data older than 7 years | External cold storage |

**Business Rules:**
- Archiving is a background job
- Archived data is read-only
- Archived data is restorable on request
- Archive operations are logged

---

## 17. Migration Strategy

| Migration Type | Process | Rollback |
|----------------|---------|----------|
| **Additive** | New tables, columns, indexes | Safe (no rollback needed) |
| **Modification** | Column type change, constraint change | Requires forward migration |
| **Destructive** | Drop table, drop column | Requires backup + restore |
| **Data** | Data transformation, backfill | Requires reverse migration |

**Business Rules:**
- All migrations are versioned and ordered
- Migrations are applied in CI/CD pipeline
- Migrations are tested against staging first
- Destructive migrations require explicit approval
- Migration history is tracked in `schema_migrations`

---

## 18. Performance Strategy

| Strategy | Description |
|----------|-------------|
| **Indexing** | All FK, unique, and query-pattern indexes |
| **Partial Indexes** | Active-row filtering for soft-delete |
| **Query Optimisation** | EXPLAIN ANALYZE on hot queries |
| **Connection Pooling** | Supabase pooler for serverless |
| **Caching** | Application-level cache for reference data |
| **Pagination** | Keyset pagination for large lists |
| **Materialized Views** | Pre-computed aggregates for reports |
| **JSONB** | Flexible metadata without joins |

**Business Rules:**
- Performance is validated with load testing
- Slow queries are logged and reviewed
- No N+1 query patterns in application
- Indexes are reviewed quarterly

---

## 19. Partitioning (Future)

Partitioning is planned for high-volume tables.

| Table | Partition Key | When |
|-------|---------------|------|
| `audit_entry` | `created_at` (monthly) | When > 10M rows |
| `history` | `created_at` (monthly) | When > 10M rows |
| `notification` | `created_at` (monthly) | When > 5M rows |
| `boq_item` | `boq_id` (hash) | When > 5M rows |

**Business Rules:**
- Partitioning is introduced only when volume thresholds are met
- Partitioning is transparent to application
- Partitioning is additive (no schema change to app)
- Partitioning is tested in staging first

---

## 20. Naming Standards

| Element | Standard | Example |
|---------|----------|---------|
| Schema | lowercase, singular | `estimate` |
| Table | lowercase, plural | `estimate_versions` |
| Column | lowercase, snake_case | `created_at` |
| Primary key | `id` | `id` |
| Foreign key | `{table}_id` | `estimate_id` |
| Index | `idx_{table}_{column}` | `idx_estimate_status` |
| Unique constraint | `uq_{table}_{column}` | `uq_estimate_number` |
| Check constraint | `chk_{table}_{rule}` | `chk_boq_item_qty` |
| View | `v_{name}` | `v_estimate_summary` |
| Materialized view | `mv_{name}` | `mv_estimate_totals` |
| Function | `fn_{name}` | `fn_estimate_number` |
| Trigger | `trg_{table}_{event}` | `trg_estimate_audit` |
| RLS policy | `{table}_{policy}` | `estimate_site_isolation` |

**Business Rules:**
- Naming is enforced in code review
- No abbreviations (except standard: `id`, `qty`, `no`)
- No reserved words as identifiers
- All names are lowercase

---

*End of Document*