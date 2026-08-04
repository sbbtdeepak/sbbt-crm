# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02  
**Title:** Logical Data Model  
**Phase:** Phase 10A  
**Date:** August 2026  
**Author:** AI Software Architect  
**Status:** Phase 10A (Logical Data Model Design)  

---

## 1. Logical Model Philosophy

The Logical Data Model defines the business data structure of the Estimate Engine without any implementation detail. It describes what data exists, why it exists, how it groups, and how it relates — purely from a business perspective.

### 1.1 Business-First Definition

- Every logical entity exists to serve a business purpose
- Entity names use business terminology, not technical terminology
- Relationships reflect business rules, not database constraints
- The model is readable by business stakeholders

### 1.2 Implementation Agnostic

- No tables, columns, types, or indexes are defined
- No SQL, schemas, or storage decisions are made
- The logical model can be implemented on any database technology
- Implementation concerns are deferred to Phase 10B

### 1.3 Domain Agnostic

- The logical model does not hard-code Construction, Interior, Solar, or any domain
- Domains are modelled as configuration data, not structural differences
- New business domains require zero logical model changes

### 1.4 Stability Principle

- The logical model changes only when business requirements change
- Technical optimisations never alter the logical model
- The logical model is the contract between business and technical design

---

## 2. Entity Groups

The logical entities are grouped by business function. Grouping helps stakeholders navigate the model and understand responsibility boundaries.

| Group | Purpose | Example Entities |
|-------|---------|------------------|
| **Estimate Core** | The primary document being produced | Estimate, Estimate Version, Estimate Revision |
| **Package & Items** | Pre-built offerings and line item composition | Package, Package Template, Component, Component Category |
| **Pricing** | How values are computed | Pricing Rule, Formula, Formula Version, Rule, Rule Group |
| **BOQ** | Quantity takeoff and scope definition | BOQ, BOQ Item |
| **Approval** | Authorisation workflow | Approval, Approval Stage |
| **Customer & Share** | External parties and distribution | Customer, Project, Share |
| **Operations** | Supporting daily activity | Notification, Attachment, Comment, Tag |
| **Governance** | Compliance and control | Audit Entry, History, Custom Attribute |
| **Template & Simulation** | Reuse and experimentation | Estimate Template, Calculation Context, Simulation |

---

## 3. Entity Relationships (Logical Only)

Relationships are described in business terms. Cardinality is stated logically (one-to-many, many-to-many) without implementation detail.

### 3.1 Core Relationships

- An **Estimate** contains one or more **Estimate Versions**
- An **Estimate Version** is created from one **BOQ**
- An **Estimate Version** references one **Package** (optional)
- A **BOQ** contains one or more **BOQ Items**
- A **BOQ Item** may reference one **Component**
- An **Estimate Version** may be shared as one or more **Shares**
- An **Estimate Version** passes through one or more **Approval Stages**

### 3.2 Pricing Relationships

- A **Formula** belongs to one **Rule Group** (optional)
- A **Formula** has one or more **Formula Versions**
- A **Rule Group** contains one or more **Rules**
- A **Formula** may reference one or more **Components**
- A **Component** may reference multiple **Pricing Rules**
- A **Calculation Context** captures inputs for a formula evaluation

### 3.3 Support Relationships

- An **Estimate** may have zero or more **Notes**
- An **Estimate** may have zero or more **Attachments**
- An **Estimate** may have zero or more **Tags**
- An **Estimate** may have zero or more **Comments**
- An **Estimate** belongs to one **Customer** (optional)
- An **Estimate** may reference one **Project** (optional)
- An **Estimate** may be created from one **Estimate Template**

### 3.4 Governance Relationships

- Every state change creates one **History** entry
- Every auditable action creates one **Audit Entry**
- Every entity may carry zero or more **Custom Attributes**

---

## 4. Aggregate Roots

An aggregate root is a logical boundary inside which all changes are consistent. All entities inside an aggregate are accessed through the root.

### 4.1 Estimate Aggregate

**Root:** Estimate  
**Members:** Estimate Version, Estimate Revision, BOQ, BOQ Item, Notes, Tags, Comments, Shares, Attachments, Calculation Contexts

**Business Rule:** All versioned changes to an estimate occur through the Estimate aggregate. No member is modified without the Estimate root being aware.

### 4.2 Package Aggregate

**Root:** Package  
**Members:** Component references (via mapping), default Pricing Rules

**Business Rule:** A Package is self-contained. Changing a Package does not alter existing Estimates — it only affects new Estimates.

### 4.3 Formula Aggregate

**Root:** Formula  
**Members:** Formula Version, Rules, Rule Groups, Dependencies, Test Case definitions

**Business Rule:** Formula activation is atomic within the Formula aggregate. A formula cannot be partially activated.

### 4.4 Customer Aggregate

**Root:** Customer  
**Members:** Projects, contact preferences, sharing history

**Business Rule:** Customer data is owned and accessed through the Customer root.

---

## 5. Ownership Model

Ownership defines which user, role, or department is responsible for each entity group.

| Entity Group | Business Owner | Creates | Modifies | Approves |
|--------------|----------------|---------|----------|----------|
| **Estimate Core** | Estimation Team | Estimator | Estimator, Engineer | Owner/Approver |
| **Package & Items** | Product/Sales | Sales Manager | Sales Manager | Owner |
| **Pricing** | Finance | Pricing Admin | Pricing Admin | Owner |
| **BOQ** | Estimation Team | Estimator | Estimator | Engineer |
| **Approval** | Management | System | System | Authorised Approver |
| **Customer & Share** | Sales | Sales | Sales | Owner |
| **Governance** | Compliance | System | System (immutable) | Audit |

**Business Rules:**
- Ownership is business-level; technical enforcement is defined in the Permission Engine (Phase 8)
- An entity may have multiple owners for different operations (create vs approve)
- Ownership can be delegated temporarily with audit
- Ownership changes are business events

---

## 6. State Ownership

State ownership defines which role controls the transition of an entity from one state to another.

| Entity | State Transitions | Controlling Role |
|--------|-------------------|------------------|
| **Estimate** | Draft → Submitted → Approved → Shared → Accepted/Rejected → Expired | Estimator (submit), Approver (approve), Customer (decision) |
| **Formula** | Draft → Validated → Approved → Active → Deprecated → Retired → Archived | Formula Admin (draft/validate), Approver (approve) |
| **BOQ** | Draft → Frozen → Locked | Estimator (draft), Engineer (freeze), System (lock) |
| **Approval** | Pending → In Review → Approved / Rejected | Authorised Approver |
| **Share** | Pending → Sent → Viewed → Expired / Withdrawn | System (send), Customer (view), Owner (withdraw) |

**Business Rules:**
- Only the controlling role can perform the transition
- Transitions are not transferable without delegation
- Every transition creates a History entry
- No role can control both sides of a decision (segregation of duties)

---

## 7. Entity Lifecycles

Each major entity follows a lifecycle aligned to business reality.

### 7.1 Estimate Lifecycle

```
Draft → Submitted → In Review → Approved → Shared → Accepted / Rejected / Expired
```

### 7.2 Formula Lifecycle

```
Draft → Validated → Approved → Active → Deprecated → Retired → Archived
```

### 7.3 BOQ Lifecycle

```
Draft → Reviewed → Frozen → Locked → (Referenced by Estimate)
```

### 7.4 Package Lifecycle

```
Draft → Published → Active → Deprecated → Retired
```

### 7.5 Customer Lifecycle

```
Lead → Qualified → Active → Inactive → Dormant
```

**Business Rules:**
- Lifecycles are configurable per domain
- Lifecycle state is part of every aggregate root
- Lifecycle transitions require authorisation
- Lifecycle history is never deleted

---

## 8. Domain Boundaries

The logical model separates entities by business domain responsibility.

| Domain | Entities Owned | Entities Shared |
|--------|----------------|-----------------|
| **Estimation** | Estimate, Estimate Version, Revision, BOQ, BOQ Item, Attachment, Comment, Tag, Note, Share, Calculation Context | Customer, Project, Notification |
| **Product Definition** | Package, Package Template, Component, Component Category | Pricing Rule |
| **Pricing** | Pricing Rule, Formula, Formula Version, Rule, Rule Group, Simulation | Component, Package |
| **Approval** | Approval, Approval Stage | — |
| **Customer** | Customer, Project | Estimate, Share, Notification |

**Business Rules:**
- A domain owns its entities; other domains access via business services
- No domain directly modifies another domain's owned entities
- Shared entities have a single owning domain
- Domain boundaries prevent circular business dependencies

---

## 9. Configuration Entities

Configuration entities define behaviour and are treated as controlled reference data.

| Entity | What It Configures | Change Impact |
|---------|--------------------|----------------|
| **Formula** | How values are computed | Affects new evaluations only |
| **Formula Version** | Formula behaviour at a point in time | Immutable snapshot |
| **Rule** | Business constraint or condition | Affects new evaluations only |
| **Rule Group** | Grouping of related rules | Affects rule execution order |
| **Pricing Rule** | How pricing is determined | Affects new estimates |
| **Component Category** | Classification of components | Affects component selection |
| **Package Template** | Reusable package structure | No impact on existing packages |

**Business Rules:**
- Configuration changes never retroactively alter existing business documents
- Configuration entities are versioned or effective-dated
- Configuration changes require approval
- Configuration is auditable

---

## 10. Transactional Entities

Transactional entities record business activity as it happens. They are high-volume, append-oriented, and must preserve historical accuracy.

| Entity | Purpose | Volume Characteristic |
|---------|---------|-----------------------|
| **Estimate** | The business transaction being produced | Core document |
| **Estimate Version** | Snapshot of estimate content | Created per revision |
| **BOQ Item** | Quantity takeoff line | High (per BOQ) |
| **Simulation** | Test evaluation result | Medium |
| **History** | Every state change | High |
| **Audit Entry** | Every auditable action | Very High |
| **Notification** | Delivered/undelivered messages | High |

**Business Rules:**
- Transactional entities are immutable once committed
- Transactional entities always carry effective time and actor
- Transactional entities are never physically deleted
- Transactional volume is expected to grow; logical model supports archiving

---

## 11. Reference Entities

Reference entities provide stable, reusable data used across the system.

| Entity | Example Data | Business Rule |
|---------|--------------|---------------|
| **Customer** | Name, contact, type | Shared across estimates |
| **Project** | Address, site details | Belongs to one Customer |
| **Component** | Material/Labour/Service definition | Reused across packages |
| **Component Category** | Category hierarchy | Defines component classification |
| **Package** | Pre-built offering | Referenced by Estimates |
| **Tag** | Labelling values | Reusable across entities |

**Business Rules:**
- Reference entities are managed centrally
- Reference data changes are effective-dated
- Reference entities may be soft-deleted (not physically removed)
- Deletion of referenced data is blocked while references exist

---

## 12. Metadata Entities

Metadata entities describe and govern other entities.

| Entity | Describes | Purpose |
|---------|-----------|---------|
| **Formula** | Calculation logic | Governs value computation |
| **Rule** | Business policy | Governs behaviour constraints |
| **Custom Attribute** | Entity extensions | Allows domain-specific fields |
| **Component Category** | Component structure | Governs component organisation |
| **Calculation Context** | Evaluation inputs | Describes formula execution environment |

**Business Rules:**
- Metadata entities are separate from the data they describe
- Metadata changes create new versions; existing documents retain old metadata snapshot
- Metadata is itself governed and audited
- Custom Attributes extend entities without structural change

---

## 13. Versioned Entities

Versioned entities maintain a complete history of their own evolution.

| Entity | Version Trigger | Version Granularity |
|---------|-----------------|---------------------|
| **Estimate Version** | Content/revision change | Major per revision |
| **Formula Version** | Logic/property/domain change | Semantic (Major.Minor.Patch) |
| **Package Template** | Template structure change | Semantic |
| **Pricing Rule** | Rule change | Versioned |
| **BOQ** | Freeze/lock | Frozens state is versioned |

**Business Rules:**
- Versions are immutable once released
- Current and historical versions coexist
- Only one version can be Active per domain at a time (where applicable)
- Version history is retained per retention policy

---

## 14. Shared Entities

Shared entities are used by multiple domains but owned by exactly one.

| Entity | Owning Domain | Consuming Domains |
|---------|----------------|-------------------|
| **Customer** | Customer | Estimation, Sales, Approval |
| **Project** | Customer | Estimation, BOQ |
| **Component** | Product Definition | Pricing, BOQ, Estimation |
| **Notification** | Operations | All domains |
| **Attachment** | Estimation | All domains (referenced) |
| **Tag** | Operations | All domains |

**Business Rules:**
- Shared entities have a single owner, multiple readers/consumers
- Consumers cannot modify shared entities directly
- Sharing is through logical reference, not duplication
- Shared entity changes are communicated as events

---

## 15. Cross Domain Relationships

The logical model supports relationships that span domain boundaries.

| Relationship | From Domain | To Domain | Business Meaning |
|--------------|-------------|-----------|------------------|
| Estimate → Package | Estimation | Product Definition | Estimate references a packaged offering |
| Estimate → Customer | Estimation | Customer | Estimate belongs to a customer |
| BOQ Item → Component | BOQ | Product Definition | Scope line references a defined component |
| Component → Pricing Rule | Product Definition | Pricing | Component uses pricing rules |
| Formula → Component | Pricing | Product Definition | Formula operates on components |
| Simulation → Formula | Pricing | Pricing | Simulation validates a formula |
| Estimate → Approval | Estimation | Approval | Estimate is governed by approval workflow |

**Business Rules:**
- Cross-domain references are navigable both directions (logically)
- Cross-domain cycles (A→B→A) are detected and resolved at design time
- Cross-domain changes trigger events, not direct modification
- Cross-domain relationships are documented in the entity map

---

## 16. Future Extensibility

The logical model is designed to support future business expansion without structural change.

### 16.1 New Domains

Adding Construction → Solar, Furniture, Consultancy, Service Industry requires:

- New Component definitions (configuration)
- New Formula definitions (configuration)
- New domain records (configuration)
- Zero logical model changes

### 16.2 New Entities

New logical entities can be added:

- As extensions of existing groups (sub-entities)
- As new members of an existing aggregate
- As new standalone groups with defined relationships
- Never by modifying existing entity semantics

### 16.3 New Relationships

- Relationships are added between existing entities where business meaning exists
- Relationship addition does not alter existing entities
- New relationships are documented with cardinality and lifecycle

### 16.4 Multi-Tenant Readiness

- The logical model supports a Site/Tenant concept at the ownership level
- All ownership-scoped entities carry a tenant context logically
- Cross-tenant access is forbidden at the business level
- Tenant addition is configuration, not structural change

### 16.5 Extension Rules

- No entity is removed — deprecated entities are retired logically
- No relationship is broken — deprecated relationships are superseded
- No semantic is overloaded — new behaviour gets new entities
- The logical model remains the stable contract for all future phases

---

*End of Document*