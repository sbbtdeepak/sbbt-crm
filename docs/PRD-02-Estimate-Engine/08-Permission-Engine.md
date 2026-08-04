# PRD-02 — Phase 8

## Permission & Access Control Engine

---

## Purpose

This document defines the **Permission & Access Control Engine** for the SBBT Estimate Engine. It describes how users, roles, resources, and actions are governed through a unified, enterprise-grade permission system.

The engine is designed as a **metadata-driven, policy-agnostic** permission layer. It supports:

- **Role Based Access Control (RBAC)** — permissions assigned to roles, roles assigned to users.
- **Attribute Based Access Control (ABAC)** — permissions evaluated dynamically using attributes of the user, resource, and environment.
- **Future Policy Based Access Control (PBAC)** — a policy layer that will combine RBAC and ABAC into declarative access policies.

This document describes **business behaviour only**. No implementation, code, SQL, API, or database design is included.

---

## 1. Permission Philosophy

### 1.1 Purpose

Permissions exist to answer one question:

> Who can do what, on which resource, under what conditions?

The Permission Engine provides a consistent, auditable, and predictable answer to that question across the entire Estimate Engine.

### 1.2 Design Principles

The Permission Engine follows these principles:

| Principle | Description |
|-----------|-------------|
| **Least Privilege** | Every user is granted only the minimum permissions required to perform their job. |
| **Default Deny** | If no permission rule matches, access is denied. |
| **Separation of Duties** | No single role can perform conflicting actions (e.g., create an estimate and approve the same estimate). |
| **Explicit over Implicit** | Permissions must be explicitly granted. They are never implied by membership or proximity. |
| **Metadata Driven** | Roles, permissions, and rules are configuration, not code. New roles and permission combinations can be added without engineering changes. |
| **Centralized Enforcement** | All access decisions are evaluated by the Permission Engine. No module decides its own permissions. |
| **Full Auditability** | Every access decision — granted or denied — is recorded and traceable. |
| **Least Surprise** | Permission behaviour must be predictable and explainable to users. |

### 1.3 What the Permission Engine Is Not

The Permission Engine does **not**:

- Store user credentials or handle authentication.
- Manage passwords, sessions, tokens, or MFA.
- Define business validation rules.
- Define workflow states.

Authentication (who you are) and permission (what you can do) are separate concerns. This document covers permissions only.

### 1.4 Universal Application

The Permission Engine applies consistently to all Estimate Engine modules:

- Estimates
- BOQ
- Pricing
- Formulas
- Rules
- Customers
- Projects
- Packages
- Reports
- Settings

No module is exempt. No module can bypass the permission system.

---

## 2. Permission Architecture

### 2.1 Three-Layer Model

The Permission Engine is architected as three cooperating layers:

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Identity Layer** | Identifies who is acting | User, API Client, System |
| **Policy Layer** | Determines what is allowed | Role permissions, attribute rules, policies |
| **Enforcement Layer** | Applies the decision at the point of action | Blocks or allows a create, edit, approve, export action |

### 2.2 RBAC (Role Based Access Control)

RBAC is the primary permission model.

- Users are assigned one or more roles.
- Roles are granted permissions.
- Permissions apply across resources and actions.

RBAC provides predictable, manageable access for day-to-day operations.

### 2.3 ABAC (Attribute Based Access Control)

ABAC supplements RBAC with attribute-based conditions.

Access is granted only when:

- The role permission allows the action, **and**
- The attribute conditions are satisfied.

Attribute categories include:

| Attribute Category | Examples |
|--------------------|----------|
| **User Attributes** | Department, region, seniority, employment status |
| **Resource Attributes** | Estimate owner, estimate status, estimate value, project region, customer type |
| **Context Attributes** | Time of day, day of week, office location, device type |
| **Relationship Attributes** | Is creator, is assigned, is in same team, is account manager |

Example ABAC behaviour:

- An Estimator can edit estimates they created.
- An Estimator can edit estimates created by teammates only when the estimate status is Draft.
- No one can edit an estimate after it has been Approved, regardless of role.

### 2.4 Future PBAC (Policy Based Access Control)

PBAC will unify RBAC and ABAC into declarative policies.

A policy will be a complete statement such as:

> "Estimators may edit Draft estimates they created or that are assigned to their team, provided the estimate value is below a configured threshold."

PBAC will allow non-technical administrators to express complex access rules in plain language, which the engine evaluates.

### 2.5 Evaluation Order

The Permission Engine evaluates access in a defined order:

1. **Identity Resolution** — Who is the user?
2. **Role Resolution** — What roles and role hierarchy apply?
3. **Permission Lookup** — What does the role allow for this resource and action?
4. **Attribute Evaluation** — Do ABAC conditions pass?
5. **Override Check** — Is there any explicit grant or deny that supersedes?
6. **Decision** — Allow or Deny.

Deny decisions are final. Grants can be conditional. Absence of a grant means denial.

---

## 3. Roles

### 3.1 Role Definition

A role is a named collection of permissions. Roles are metadata-driven: administrators can modify permission assignments, create new roles, or adjust role hierarchy without code changes.

### 3.2 Core Roles

The Estimate Engine defines the following core roles:

| Role | Typical Responsibility | Access Level |
|------|------------------------|--------------|
| **Owner** | Business owner; ultimate authority | Full access to all resources, settings, and administrative functions |
| **Admin** | System administration; user management | Full access except ownership-level settings |
| **Sales** | Sales pipeline, customer communication, quote sharing | Create estimates, share with customers, track sales |
| **Estimator** | Estimate creation, BOQ preparation, pricing | Full estimate authoring capability within assigned scope |
| **Engineer** | Technical review, BOQ validation, design input | Review and validate estimates, edit technical components |
| **Account** | Financial approval, invoicing, cost tracking | Approve estimates, view costs, manage financial data |
| **Viewer** | Read-only access for reporting and oversight | View estimates and reports; no edit or action permissions |
| **Customer** | External customer reviewing quotes | View shared estimates, accept/decline, request changes |
| **Vendor** | External vendor providing rates and materials | View/submit pricing information for assigned categories only |
| **Future API Client** | External system integration | Programmatic access governed by scoped API credentials |

### 3.3 Role Characteristics

Each role has the following characteristics:

| Characteristic | Description |
|----------------|-------------|
| **Name** | Human-readable role name |
| **Description** | What the role is for |
| **Scope** | Which resources the role applies to |
| **Active** | Enabled or disabled |
| **System Role** | Predefined role that cannot be deleted |
| **Custom Role** | User-created role derived from core roles |
| **Hierarchy Level** | Position in the role hierarchy for inheritance |

### 3.4 Custom Roles

Administrators can create custom roles by:

- Cloning an existing role.
- Modifying its permission set.
- Restricting its resource scope.
- Restricting its attribute conditions.

Custom roles are validated against the Permission Matrix to prevent accidental privilege escalation.

---

## 4. Permission Categories

Permission categories group permissions by the type of control they grant.

| Category | Description | Examples |
|----------|-------------|----------|
| **Resource Permissions** | Control access to resource types | Can view estimates, can edit BOQ items |
| **Lifecycle Permissions** | Control movement through lifecycle states | Can approve, can archive, can restore |
| **Data Permissions** | Control access to data fields and values | Can view cost prices, can view customer phone numbers |
| **Operational Permissions** | Control operational actions | Can export, can duplicate, can share |
| **Administrative Permissions** | Control system administration | Can manage users, can manage roles, can change settings |
| **Configurational Permissions** | Control configuration changes | Can modify formulas, can modify rules, can modify templates |
| **Temporal Permissions** | Control time-bound access | Can access only during business hours, can access for N days |

### 4.1 Permission Granularity

Permissions operate at multiple granularity levels:

| Granularity | Description | Example |
|-------------|-------------|---------|
| **Module Level** | Access to an entire module | Can access Estimate module |
| **Resource Level** | Access to a resource type | Can create estimates |
| **Record Level** | Access to individual records | Can edit estimate EST-2026-001 |
| **Field Level** | Access to individual fields | Can view cost price field |
| **Action Level** | Access to individual actions | Can approve estimates |
| **Status Level** | Access based on record status | Can edit only Draft estimates |

---

## 5. Resource Categories

Resources are the objects the Permission Engine protects. Resource categories group resources by domain.

| Category | Resources |
|----------|-----------|
| **Estimate Resources** | Estimates, estimate versions, estimate notes, estimate attachments |
| **BOQ Resources** | BOQ documents, BOQ items, BOQ categories, quantity data |
| **Pricing Resources** | Pricing configs, pricing components, rate data, cost data |
| **Formula Resources** | Formulas, formula versions, formula templates, formula tests |
| **Rule Resources** | Business rules, rule sets, rule versions |
| **Customer Resources** | Customer records, customer contacts, customer communication history |
| **Project Resources** | Projects, project stages, project documents |
| **Package Resources** | Packages, package versions, package pricing |
| **Master Data Resources** | Materials, units, regions, vendors, tax rates, activities |
| **Report Resources** | Reports, dashboards, export files, analytics views |
| **Administrative Resources** | Users, roles, permissions, settings, audit logs |

### 5.1 Resource Scoping

Every resource permission is scoped. Scope determines which records the permission applies to:

| Scope | Description |
|-------|-------------|
| **All Records** | Permission applies to all records of the resource type |
| **Owned Records** | Permission applies only to records created by the user |
| **Assigned Records** | Permission applies only to records assigned to the user |
| **Team Records** | Permission applies only to records owned by members of the user's team |
| **Region Records** | Permission applies only to records in the user's region |
| **Project Records** | Permission applies only to records of projects the user is part of |
| **Custom Scope** | Permission applies based on configurable criteria |

---

## 6. Action Categories

Actions are the operations that can be performed on resources. The Permission Engine defines the following action categories:

| Action | Description |
|--------|-------------|
| **View** | Read or view a resource |
| **Create** | Create a new resource |
| **Edit** | Modify an existing resource |
| **Delete** | Delete a resource (with appropriate safeguards) |
| **Approve** | Approve a resource, moving it forward in its lifecycle |
| **Share** | Share a resource with internal users or external parties |
| **Duplicate** | Duplicate a resource to create a copy |
| **Export** | Export a resource or data set to an external format |
| **Archive** | Archive a resource, removing it from active view |
| **Restore** | Restore an archived resource to active state |
| **Override** | Override a computed value, rule result, or restriction |
| **Publish** | Publish a resource to a broader audience (e.g., customer-facing) |

### 6.1 Action Characteristics

Each action has characteristics that influence permission evaluation:

| Characteristic | Description |
|----------------|-------------|
| **Destructive** | Whether the action removes data (e.g., Delete vs View) |
| **Sensitive** | Whether the action exposes sensitive data (e.g., Export) |
| **Irreversible** | Whether the action cannot be undone (e.g., Publish) |
| **Lifecycle Affecting** | Whether the action changes the resource state (e.g., Approve) |
| **External Facing** | Whether the action exposes data outside the organization (e.g., Share) |

### 6.2 Action Permissions

An action permission is the combination of:

**Resource Category + Action + Scope + Condition**

Example:

> An Estimator can **Edit** **Estimate** resources that are **Assigned to them** when the estimate status is **Draft**.

---

## 7. Permission Matrix

The Permission Matrix is the central configuration that maps roles to resource-action permissions.

### 7.1 Matrix Structure

The matrix is maintained as role-based permission mappings:

| Role | Estimate | BOQ | Pricing | Formula | Customer | Report |
|------|----------|-----|---------|---------|----------|--------|
| Owner | Full | Full | Full | Full | Full | Full |
| Admin | Full | Full | Full | Full | Full | Full |
| Sales | View, Create, Share | View | View | View | View, Edit | View |
| Estimator | View, Create, Edit | View, Create, Edit | View, Edit | View | View | View |
| Engineer | View, Edit | View, Edit | View | View | View | View |
| Account | View, Approve | View | View | View | View | View, Export |
| Viewer | View | View | View | View | View | View |
| Customer | View (shared) | View (shared) | — | — | — | — |
| Vendor | — | View (assigned) | View (assigned) | — | — | — |

### 7.2 Matrix Extensibility

The matrix is not fixed. It is metadata-driven and can be extended to support:

- New roles.
- New resource categories.
- New action categories.
- New attribute conditions.
- New custom matrix entries.

### 7.3 Matrix Validation

The Permission Matrix is validated against security rules before activation:

- No role may be granted **approve** on resources they also have **create** rights on (separation of duties).
- No external role (Customer, Vendor) may be granted access to internal cost data.
- No role may be granted permission to modify its own permissions.
- No role may be granted permission to grant permissions to itself.

---

## 8. Role Hierarchy

### 8.1 Purpose

Role hierarchy allows permissions to flow from higher-level roles to lower-level roles, reducing configuration duplication.

### 8.2 Hierarchy Model

```
Owner
 └── Admin
      ├── Sales
      │    └── Sales Viewer
      ├── Estimator
      │    ├── Junior Estimator
      │    └── Senior Estimator
      ├── Engineer
      ├── Account
      └── Viewer
           ├── Customer
           └── Vendor
```

### 8.3 Inheritance Rules

- A child role inherits all permissions of its parent role.
- A child role can be granted **additional** permissions.
- A child role can **restrict** inherited permissions through explicit denies.
- A child role cannot escalate beyond its parent's resource scope.
- Role hierarchy changes are audited.

### 8.4 Multiple Roles

A user can hold multiple roles simultaneously.

When a user holds multiple roles:

- The user's effective permission set is the **union** of all role permissions.
- Explicit denies take precedence over grants regardless of role.
- The user's effective scope is the **broadest** scope across roles.
- Conflicting role assignments are flagged for review.

### 8.5 Hierarchy Constraints

Role hierarchy is constrained to prevent security violations:

- A role cannot be its own ancestor (no cycles).
- A role cannot inherit from two roles at the same level unless explicitly permitted.
- External roles (Customer, Vendor) cannot be parent roles.
- Future API Client roles must be explicitly granted, never inherited from internal roles.

---

## 9. Delegation Rules

### 9.1 Purpose

Delegation allows a user to temporarily transfer their permission authority to another user for a defined period and scope.

### 9.2 Delegation Types

| Type | Description |
|------|-------------|
| **Full Delegation** | The delegate receives all of the delegator's permissions within the delegation window |
| **Partial Delegation** | The delegate receives only specific permissions of the delegator |
| **Resource Delegation** | The delegate receives access only to specific resources |
| **Approval Delegation** | The delegate receives only approval authority |

### 9.3 Delegation Rules

- Only users with the **Delegate** permission can delegate.
- Delegation is always time-bound.
- Delegation cannot exceed the delegator's own permissions.
- Delegation cannot transfer ownership.
- Delegation can be revoked at any time by the delegator or an Admin.
- Delegation events are fully audited.
- When the delegator is unavailable or on leave, delegation may be configured in advance.

### 9.4 Delegation Restrictions

- A delegate cannot re-delegate to another user.
- A delegate cannot delegate approval on resources they created.
- Delegation cannot be used to approve one's own work.
- Delegation expires automatically and requires renewal for continuation.

---

## 10. Temporary Permissions

### 10.1 Purpose

Temporary permissions grant time-limited access for specific circumstances.

### 10.2 Use Cases

| Use Case | Description |
|----------|-------------|
| **Leaves** | Temporary access for a substitute while the primary user is on leave |
| **Projects** | Temporary elevated access for a project duration |
| **Emergencies** | Short-term access for urgent operational need |
| **Seasonal Work** | Access during a business season or campaign |
| **Onboarding** | Time-limited access during user onboarding |

### 10.3 Temporary Permission Rules

- Every temporary permission has a start time and an end time.
- Temporary permissions expire automatically and cannot be extended silently.
- Extensions require explicit approval and are audited.
- Temporary permissions are visible to the user and to administrators.
- Temporary permissions cannot be used to override permanent denies.
- Temporary permission grants above the user's permanent level trigger notifications to Admins.

---

## 11. Approval Permissions

### 11.1 Purpose

Approval permissions control who can approve estimates, BOQ changes, pricing changes, and other lifecycle transitions.

### 11.2 Approval Permission Rules

- Approval permissions are distinct from edit permissions. A user can edit without approving and approve without editing.
- **Separation of Duties:** The creator of an estimate cannot approve their own estimate.
- The approver must have explicit approval permission for the resource type and status.
- Approvals can require a single approver or multiple approvers (multi-stage approval).
- Approval chains follow the role hierarchy where configured.

### 11.3 Approval Scenarios

| Scenario | Behaviour |
|----------|-----------|
| **Draft → Pending Approval** | Estimator submits; only users with Approve permission can advance |
| **Pending Approval → Approved** | Approved by an authorized approver; change is locked |
| **Pending Approval → Rejected** | Rejected with reason; estimate returns to Draft for revision |
| **Approved → Archival** | Only users with lifecycle permissions can archive an approved estimate |

### 11.4 Approval Limits

- Approvals can be limited by estimate value thresholds.
- Approvals can require a second approver above a value threshold.
- Approval limits are metadata-driven and configurable.
- All approval decisions are audited with timestamp, user, and reason.

---

## 12. Override Permissions

### 12.1 Purpose

Override permissions control who can override system-computed values, rule enforcement, or restrictive conditions.

### 12.2 Override Types

| Type | Description |
|------|-------------|
| **Value Override** | Override a computed price, quantity, or formula result |
| **Rule Override** | Bypass a validation rule or business rule for a specific case |
| **Lifecycle Override** | Force a status change that bypasses normal workflow |
| **Access Override** | Temporarily grant access that the normal permission model denies |

### 12.3 Override Permission Rules

- Override permissions must be explicitly granted. They are never implied.
- Overrides are always recorded with reason and justification.
- Overrides have an expiry where applicable.
- Overrides cannot be used to:
  - Bypass financial approval thresholds.
  - Expose cost data to external roles.
  - Delete auditable records.
  - Grant permissions to modify roles or permission systems.
- Override activity is prominently flagged in audit logs.

### 12.4 Override Authority

- Only roles at or above a configured authority level can override.
- The authority level is metadata-driven.
- Override authority can be scoped to resource categories.
- Override authority can be time-limited.

---

## 13. Ownership Rules

### 13.1 Purpose

Ownership determines who has primary control and responsibility for a resource.

### 13.2 Ownership Principles

- Every resource has exactly **one Owner** (the user or role that owns it).
- The Owner has default elevated permissions on their owned resources.
- Ownership determines access scope for other users.
- Ownership can be transferred with appropriate permissions.

### 13.3 Ownership Rules

| Rule | Description |
|------|-------------|
| **Creator Ownership** | When a user creates a resource, they become its Owner by default |
| **Transfer Ownership** | Ownership can be transferred to another user with appropriate permission |
| **Team Ownership** | Some resources belong to a team rather than an individual |
| **Customer Ownership** | Estimates shared to a customer remain owned by the internal creator |
| **Ownership Expiry** | Ownership can be reassigned after a period of inactivity |
| **Escalation** | Unassigned or orphaned resources escalate to the Admin role |

### 13.4 Ownership Permissions

Ownership affects permission evaluation:

- The Owner of a resource can always **View** and **Edit** their resource within its lifecycle.
- The Owner cannot **Approve** their own resource (separation of duties).
- The Owner can request approval, but approval is performed by another authorized user.
- The Owner can **Share** the resource within their allowed sharing scope.

---

## 14. Sharing Rules

### 14.1 Purpose

Sharing rules control how resources are shared internally and externally.

### 14.2 Sharing Types

| Type | Description |
|------|-------------|
| **Internal Share** | Share with internal users or roles |
| **Team Share** | Share with a team or department |
| **Customer Share** | Share an estimate with a customer |
| **Vendor Share** | Share pricing requests with vendors |
| **Public Link** | Generate a secure link for external review |

### 14.3 Sharing Rules

- Sharing requires the **Share** permission.
- Shared resources retain the original resource's permission boundaries.
- Sharing does not grant ownership.
- Shared resources can be revoked at any time by the Owner or Admin.
- Shared resources expire when configured.
- Customer shares display only customer-safe data (no internal costs, margins, or notes).

### 14.4 Share Permissions

Sharing grants specific action scopes to the recipient:

| Recipient | Typical Share Permissions |
|-----------|---------------------------|
| Internal User | View, Comment |
| Internal Role | View, Edit (within scope) |
| Customer | View (customer-safe data only), Accept, Decline, Request Changes |
| Vendor | View (assigned pricing scope only), Submit Pricing |
| Public Link | View (limited data), No editing |

---

## 15. Audit Permissions

### 15.1 Purpose

Audit permissions control visibility of and access to audit trail data.

### 15.2 Audit Permission Rules

- Audit logs are readable only by roles with explicit audit permissions (Owner, Admin, and configured Audit roles).
- Audit data cannot be edited or deleted by any user.
- Audit data cannot be overridden.
- Audit log access itself is audited.
- Audit exports are restricted and logged.

### 15.3 Audit Data Protection

| Protection | Description |
|------------|-------------|
| **Immutability** | Audit records cannot be modified |
| **Retention** | Audit data is retained per policy |
| **Integrity** | Audit data is protected against tampering |
| **Personally Identifiable Information (PII)** | Audit data containing PII is access-restricted |
| **Access Visibility** | Every audit read is recorded |

### 15.4 Permission Audit Events

Every permission change is audited, including:

- Role creation, modification, deletion.
- User role assignment and removal.
- Permission matrix changes.
- Temporary permission grants and revocations.
- Delegations and revocations.
- Override actions.
- Denied access attempts.

---

## 16. Security Principles

### 16.1 Core Security Principles

| Principle | Description |
|-----------|-------------|
| **Least Privilege** | Minimum access necessary to perform duties |
| **Default Deny** | No permission grant → no access |
| **Separation of Duties** | Conflicting actions must require different actors |
| **Defense in Depth** | Multiple layers of control for sensitive actions |
| **Fail Safe** | Any evaluation failure defaults to deny |
| **No Self-Service Escalation** | No user can grant themselves permissions |
| **Time-Bound Access** | Sensitive access should be temporary where possible |
| **Full Audit** | All permission decisions are recorded |
| **Explainability** | Every deny can be explained to the user |

### 16.2 Sensitive Data Protection

The Permission Engine enforces data-level protections:

- Cost prices and margins are restricted to internal financial roles.
- Customer contact data is restricted by need-to-know.
- Formula configurations are restricted to configurational roles.
- Export actions on sensitive data require elevated permission.
- External-facing views strip internal-only fields automatically.

### 16.3 Approval of Permission Changes

- Permission changes that expand access require approval.
- Permission changes applied by Admins are immediately effective.
- Permission changes applied by non-Admins (where permitted) require approval.
- Bulk permission changes require dual-approval.

---

## 17. Future SSO

### 17.1 Vision

The Permission Engine will integrate with enterprise Single Sign-On (SSO) providers.

### 17.2 Expected Behaviour

| Area | Description |
|------|-------------|
| **Identity Provider** | Support SSO providers such as Google Workspace, Microsoft Entra ID, Okta |
| **Role Mapping** | Map SSO groups and attributes to Estimate Engine roles |
| **Attribute Sync** | Sync user attributes from the identity provider for ABAC evaluation |
| **Just-In-Time Provisioning** | Automatically create users on first SSO login |
| **De-provisioning** | Disable users when they are removed from the identity provider |
| **Session Management** | SSO session lifecycle integration |

### 17.3 SSO Permissions

- SSO users receive the permissions of their mapped roles.
- SSO group membership changes reflect in permission evaluation at the next session refresh.
- SSO does not override internal permission restrictions.
- SSO identity attributes can be used as ABAC attributes.

---

## 18. Future Multi Company

### 18.1 Vision

The Estimate Engine will support multiple companies within a single installation.

### 18.2 Expected Behaviour

| Area | Description |
|------|-------------|
| **Company Scope** | All resources are scoped to a company |
| **Company Roles** | Roles can be defined per company or shared across companies |
| **Isolation** | Users cannot see resources of companies they are not members of |
| **Cross-Company Access** | Cross-company access requires explicit permission |
| **Company Admin** | Each company has its own admin with scoped administrative rights |
| **Branding** | Company-specific display configuration |

### 18.3 Multi-Company Permissions

- Resource permissions include a company dimension.
- A user can belong to multiple companies with different roles in each.
- Role hierarchy applies within each company.
- Audit logs record the company context of every decision.

---

## 19. Future SaaS Tenant Isolation

### 19.1 Vision

The Estimate Engine will support a multi-tenant SaaS deployment model.

### 19.2 Expected Behaviour

| Area | Description |
|------|-------------|
| **Tenant Isolation** | Tenant data is completely isolated from other tenants |
| **Tenant Admin** | Each tenant has its own administrative role scope |
| **Platform Admin** | Platform-level administrators manage tenants, not tenant data |
| **Tenant Attribute** | Every permission evaluation includes the tenant context |
| **Tenant Configuration** | Permission matrix defaults per tenant, override by platform |
| **Tenant Quotas** | Permission-based limits on tenants (users, resources, storage) |

### 19.3 Tenant Isolation Rules

- No cross-tenant access is possible without explicit platform-level grant.
- Tenant-level audit logs are visible only to the tenant and platform admins.
- Tenant configuration cannot override platform security policies.
- Platform admins cannot access tenant data without documented and audited justification.

---

## 20. Future AI Permission Suggestions

### 20.1 Vision

The Permission Engine will use AI to suggest permission improvements and detect permission risks.

### 20.2 Expected Behaviour

| Area | Description |
|------|-------------|
| **Anomaly Detection** | AI identifies unusual access patterns or privilege escalation attempts |
| **Permission Recommendations** | AI suggests permission adjustments based on usage patterns |
| **Least Privilege Enforcement** | AI highlights roles with overly broad permissions |
| **Inactive Access Cleanup** | AI suggests removing access for inactive users or unused roles |
| **Separation of Duties Verification** | AI continuously verifies separation of duties is maintained |
| **Policy Risk Scoring** | AI scores permission configurations for security risk |

### 20.3 AI Permission Suggestions

- AI suggestions are **advisory only**. No AI change is applied automatically.
- Every AI suggestion requires human approval.
- AI suggestion history is audited.
- AI suggestions respect tenant and company isolation.
- AI cannot suggest permissions that violate security principles.

---

## Summary

The Permission & Access Control Engine provides a unified, metadata-driven, enterprise-grade permission system for the SBBT Estimate Engine.

It combines:

- **RBAC** — predictable role-based access.
- **ABAC** — dynamic attribute-based conditions.
- **Future PBAC** — declarative policy-based control.

It supports:

- 10+ core roles.
- 12 action categories.
- 11+ resource categories.
- Role hierarchy and inheritance.
- Delegation, temporary permissions, approvals, and overrides.
- Ownership and sharing rules.
- Full audit ability.
- Future SSO, Multi Company, SaaS Tenancy, and AI-driven permission management.

No implementation. No code. No SQL. No APIs. No database design.

---

*End of Document*