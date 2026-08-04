# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02  
**Title:** SBBT Estimate Engine — Version Control  
**Phase:** Phase 6  
**Date:** August 2026  
**Author:** AI Software Architect  
**Status:** Phase 6 (Version Control Design)  

---

## 1. Versioning Philosophy

The Version Control system governs how estimates, BOQs, packages, and all related entities are versioned, tracked, and managed throughout their lifecycle. The system is founded on four core principles.

### 1.1 Immutability

Once a version is created, it is immutable. No version can be modified, deleted, or overwritten. Any change creates a new version.

**Business Rules:**
- Every version is a complete, self-contained snapshot of the entity at a point in time
- Previous versions are always accessible for viewing and comparison
- Version immutability is enforced at the storage layer
- Attempts to modify a version create a new version instead

### 1.2 Traceability

Every version records who created it, when, why, and what changed from the previous version.

**Business Rules:**
- Every version records the actor (user ID, role), timestamp (UTC, ISO 8601), and change reason
- Each version has a parent version (except the initial version)
- Full change logs are available for every version
- Version-to-version relationships form an unbroken chain

### 1.3 Branchability

Estimates can be branched for parallel development (e.g., creating a revision while another team works on a different revision). Branches can later be merged.

**Business Rules:**
- Branching creates a divergent version history from a common ancestor
- Multiple branches can exist concurrently
- Each branch is independently versionable
- Merging requires explicit approval

### 1.4 Recoverability

Any version can be restored at any time. The system supports rollback to any point in version history.

**Business Rules:**
- Rollback creates a new version (does not overwrite history)
- Rollback reason is mandatory
- Rollback is logged as a separate business event
- Restored versions inherit the timestamp of the restored version as their effective date

---

## 2. Version Lifecycle

Every versioned entity (estimate, BOQ, package, configuration) progresses through a defined lifecycle.

```
Created
  ↓ (first save)
Active
  ↓ (modifications made)
Modified
  ↓ (revision created or changes applied)
Versioned
  ↓ (approved)
Frozen
  ↓ (expired or superseded)
Archived
```

### 2.1 Created

**Purpose:** The entity is initialized but not yet persisted as a version.

**Business Rules:**
- Entity exists only in memory/session storage
- No version number assigned
- All changes in this state are session-scoped

### 2.2 Active

**Purpose:** The entity is actively being developed. Changes are saved frequently.

**Business Rules:**
- Each save may or may not create a version (auto-save does not create versions)
- User-initiated saves create intermediate checkpoints (not full versions)
- The entity has a "latest" pointer to the most recent state

### 2.3 Modified

**Purpose:** The entity has unsaved changes relative to the last version.

**Business Rules:**
- A "dirty" flag is set
- Changes are tracked at the field level
- Users can view a diff before deciding to save

### 2.4 Versioned

**Purpose:** The entity has been explicitly versioned by the user or system.

**Business Rules:**
- A new version is created with incremented version number
- The previous version becomes "frozen"
- Version creation requires a reason/comment
- Version creation is logged as a business event

### 2.5 Frozen

**Purpose:** The entity version is locked for read-only access. No further changes can be made to this version.

**Business Rules:**
- Only the "latest" version in the chain is active
- All previous versions are frozen
- Frozen versions can be viewed, compared, and restored to
- Unfreezing requires creating a new version

### 2.6 Archived

**Purpose:** The entity version is moved to long-term storage. It is retained for compliance but not actively used.

**Business Rules:**
- Archived versions are not included in standard queries or dashboards
- Archived versions are retrievable via explicit archive filters
- Archive transitions are logged
- Archived entities can be restored from archive

---

## 3. Version Numbering Strategy

The Estimate Engine uses a semantic versioning scheme for all versioned entities, with optional pre-release and metadata suffixes.

### 3.1 Version Format

```
MAJOR.MINOR.PATCH(-PRERELEASE)(+BUILD)
```

| Component | Description | Example |
|-----------|-------------|---------|
| MAJOR | Significant structural changes | 2.0.0 |
| MINOR | Additive changes (new items, new sections) | 1.1.0 |
| PATCH | Small corrections (rate fixes, rounding) | 1.0.1 |
| PRERELEASE | Pre-release identifier | 1.0.1-beta.1 |
| BUILD | Build metadata | 1.0.1+build.20260803 |

### 3.2 Version Increment Rules

| Change Type | Increment | Example |
|-------------|-----------|---------|
| **Major** | Structural: package change, domain change, BOQ restructure | 1.0.0 → 2.0.0 |
| **Minor** | Additive: new line items, new sections, new specifications | 1.0.0 → 1.1.0 |
| **Patch** | Corrective: rate corrections, quantity fixes, rounding | 1.0.0 → 1.0.1 |
| **Pre-release** | Draft or review state | 1.0.0 → 1.0.1-beta.1 |

**Business Rules:**
- Version increments are determined by the magnitude of changes
- The system auto-detects the change magnitude and suggests the appropriate increment
- Users can override the suggested increment with justification
- Version numbers are immutable once assigned

### 3.3 Version Labels

In addition to version numbers, versions can have human-readable labels for easier identification.

| Label Type | Description | Example |
|------------|-------------|---------|
| **Named** | User-assigned descriptive name | "Q3 2026 Budget Revision" |
| **Auto-Named** | System-generated based on change type | "Minor Revision - Added Items" |
| **Tagged** | System-assigned for key milestones | "Initial", "Approved", "Shared", "Accepted" |
| **Flagged** | User-flagged for attention | "Needs Review", "Customer Feedback" |

**Business Rules:**
- Each version can have one Named label and multiple Tags
- Tags are system-managed; Named labels are user-assigned
- Flagged versions appear in filtered views
- Labels are searchable

### 3.4 Version Branching Numbers

When a version is branched, the branch version inherits the parent version and adds a branch identifier.

| Format | Example | Meaning |
|--------|---------|---------|
| `MAJOR.MINOR.PATCH/branch.NAME` | `1.0.0/branch/quote-revision` | Branch from version 1.0.0, named "quote-revision" |
| `MAJOR.MINOR.PATCH.merge.DESCRIPTION` | `1.1.0.merge/customer-feedback` | Merged version incorporating customer feedback |

**Business Rules:**
- Branch identifiers are unique within the estimate
- Branch naming follows a configurable pattern
- Merged versions are marked as merges with reference to the merged branch
- Branch versioning does not affect the main version sequence

---

## 4. Revision Behaviour

A revision is a specific type of version created when an approved estimate needs to be modified (typically after customer feedback or a pricing update).

### 4.1 Revision Creation

**Process:**
1. User selects "Create Revision" from an approved estimate
2. System prompts for a mandatory revision reason
3. System creates a new version with incremented version number
4. The revision inherits all data from the parent version
5. The revision enters "In Progress" state for modification

**Business Rules:**
- Only approved estimates can be revised (per BR-010 in Phase 2)
- Draft estimates cannot be revised
- Revision reason is mandatory and recorded in audit log
- The original estimate remains unchanged and read-only
- Revision creation is logged as EVT-022

### 4.2 Revision Numbering

Revisions follow the semantic versioning scheme with specific rules for increment type:

| Revision Type | Trigger | Version Change |
|---------------|---------|----------------|
| **Patch Revision** | Minor corrections (rate fixes, rounding) | PATCH increment (1.0.0 → 1.0.1) |
| **Minor Revision** | Additions or modifications (new items, quantity changes) | MINOR increment (1.0.0 → 1.1.0) |
| **Major Revision** | Structural changes (package change, domain change) | MAJOR increment (1.0.0 → 2.0.0) |

**Business Rules:**
- The initial estimate is version 1.0.0
- The system auto-suggests the revision type based on change analysis
- Users can override the suggested type with justification
- Revision numbering is immutable once assigned

### 4.3 Revision Independence

Each revision is fully independent of other revisions. Changes to one revision do not affect others.

**Business Rules:**
- A revision's BOQ, pricing, and metadata are self-contained
- Shared components (Material Library, Labour Library) are referenced, not copied
- Changes to library rates affect all revisions equally (subject to rate locking)
- Revisions can be deleted independently (with appropriate permissions)

### 4.4 Revision Expiry

Revisions inherit the parent estimate's expiry behaviour but have their own validity periods.

**Business Rules:**
- Each revision has its own validity period (default 90 days, configurable)
- The validity period starts from the revision's approval date
- Expired revisions can be renewed or a new revision created
- Revision expiry is logged as EVT-036

---

## 5. Approval History

Every version and revision maintains a complete approval history that records all approval-related actions.

### 5.1 Approval History Structure

Each approval history entry contains:

| Field | Description | Required |
|-------|-------------|----------|
| **Timestamp** | UTC timestamp of the action | Yes |
| **Actor** | User who performed the action | Yes |
| **Action** | Type of action (submitted, reviewed, approved, rejected) | Yes |
| **Role** | Role of the actor at time of action | Yes |
| **Comments** | Free-text comments | No (mandatory for rejection) |
| **Version** | Version number at time of action | Yes |
| **Decision Threshold** | The monetary threshold that triggered this approval | No |

### 5.2 Approval History Entries

The following actions generate approval history entries:

| Entry Type | Trigger | Module |
|------------|---------|--------|
| Submission Record | Estimate submitted for review | Estimate Builder |
| Review Start | Reviewer begins review | Approval Workflow |
| Review Comments | Reviewer adds comments | Approval Workflow |
| Review Completion | Reviewer completes review (approve/reject) | Approval Workflow |
| Approval Request | Estimate sent to approver | Approval Workflow |
| Approval Granted | Approver approves estimate | Approval Workflow |
| Approval Rejected | Approver rejects estimate | Approval Workflow |
| Revision Approved | Revised estimate approved | Approval Workflow |
| Revision Rejected | Revised estimate rejected | Approval Workflow |
| Override Approved | Pricing override approved | Approval Workflow |
| Override Rejected | Pricing override rejected | Approval Workflow |

**Business Rules:**
- All approval history entries are immutable
- Approval history is linked to the estimate version, not the estimate overall
- Users can view approval history for any version
- Approval history is included in version comparisons

### 5.3 Approval History Access

| Role | View | Export |
|------|------|--------|
| Owner | Full | Yes |
| Approver | Full | Yes |
| Estimator | Read | Yes (limited) |
| Admin | Full | Yes |
| Audit | Full | Yes |
| Customer | Read (accepted versions only) | Yes (PDF of accepted version) |

---

## 6. Change Tracking

The Version Control system tracks all changes at the field level, providing granular visibility into what changed between versions.

### 6.1 Change Tracking Granularity

| Entity Type | Tracked Fields | Detail Level |
|-------------|----------------|--------------|
| **Estimate Metadata** | Domain, location, currency, customer, start date | Full before/after |
| **BOQ Items** | All item fields (description, unit, quantity, rate, category) | Field-level diff |
| **Package Selection** | Package ID, version, customizations | Field-level diff |
| **Pricing Parameters** | Multipliers, rates, discounts, taxes | Value-level diff |
| **Workflow State** | Status transitions | Before/after state |
| **Notes & Comments** | All additions and edits | Full content |
| **Attachments** | Add, remove, modify | File metadata |
| **Approvals** | Approval actions and decisions | Role, timestamp, outcome |

### 6.2 Change Tracking Metadata

Each change record contains:

| Field | Description |
|-------|-------------|
| **Change ID** | Unique identifier for the change |
| **Version** | Version in which the change occurred |
| **Entity** | Affected entity (estimate, BOQ item, approval, etc.) |
| **Entity ID** | Identifier of the affected entity |
| **Field** | Specific field that changed |
| **Previous Value** | Value before the change |
| **New Value** | Value after the change |
| **Actor** | User who made the change |
| **Timestamp** | When the change occurred |
| **Reason** | User-provided justification |
| **Session ID** | Tracking session identifier |
| **Correlation ID** | Links related changes |

### 6.3 Change Tracking Policies

| Policy | Description |
|--------|-------------|
| **Always Track** | Record all changes (default for most fields) |
| **Track on Lock** | Only record changes when entity is locked |
| **Track Major Only** | Only record changes that result in a new version |
| **Do Not Track** | Do not record changes (for low-value fields) |
| **Summarize** | Record a summary instead of individual changes |

**Business Rules:**
- Track policies are configurable per field and entity type
- "Always Track" is the default policy
- Change tracking adds storage and performance overhead; policies should be optimized per use case
- All change tracking data is immutable

---

## 7. Comparison Behaviour

The Version Control system supports comparison of any two versions of an estimate, showing exactly what changed between them.

### 7.1 Comparison Types

| Comparison Type | Description | Use Case |
|-----------------|-------------|----------|
| **Line-by-Line** | Shows each changed field with before/after values | Detailed review |
| **Summary** | Shows a summary of change categories and counts | Quick overview |
| **Visual Diff** | Side-by-side visual comparison | Customer presentation |
| **Export Diff** | Comparison exported to CSV/Excel | External review |
| **Approval Diff** | Shows only changes since last approval | Approval review |

### 7.2 Comparison Features

**Line-by-Line Comparison:**
- Added items shown with green highlight
- Removed items shown with red strikethrough
- Modified items show old value (strikethrough) and new value (underline)
- Unchanged items shown in normal text
- All changes grouped by entity type (BOQ, pricing, metadata, approvals)

**Summary Comparison:**
- Total change count per category
- Net change in estimate total
- Number of added/removed/modified items
- Approval and workflow changes
- Visual indicators for impact level (high, medium, low)

**Business Rules:**
- Comparison is always between two specific versions
- Comparison results are read-only
- Comparison can be saved as a snapshot for later reference
- Comparison exports include the version numbers and timestamps

### 7.3 Comparison Granularity

| Level | Detail |
|-------|--------|
| **Estimate Level** | Overall estimate metadata changes |
| **BOQ Item Level** | Individual line item changes |
| **Pricing Level** | Rate, quantity, discount, tax changes |
| **Workflow Level** | Status and approval changes |
| **Attachment Level** | File additions/removals |
| **Note Level** | Comment and note changes |

**Business Rules:**
- Users can filter comparison results by level
- Comparison at each level can be expanded/collapsed
- Full comparison (all levels) is available
- Comparison results are cached for performance

---

## 8. Rollback Behaviour

Rollback allows reverting an estimate to a previous version while preserving the full version history.

### 8.1 Rollback Process

1. User selects "Rollback" from a specific version
2. System prompts for mandatory rollback reason
3. System creates a new version (does not overwrite the rolled-back version)
4. The new version contains the data from the rolled-back version
5. The estimate transitions to "In Progress" state

### 8.2 Rollback Scope

| Rollback Type | Scope | Result |
|---------------|-------|--------|
| **Full BOQ Rollback** | Entire BOQ | All items, quantities, rates reverted |
| **Pricing Rollback** | Pricing data only | Rates, discounts, taxes reverted; structure unchanged |
| **Metadata Rollback** | Estimate metadata only | Domain, location, parameters reverted; BOQ unchanged |
| **Selective Item Rollback** | Specific BOQ items | Only selected items reverted |
| **Approval Rollback** | Approval state only | Estimate returns to pre-approval state |

### 8.3 Rollback Constraints

| Condition | Action |
|-----------|--------|
| Estimate is "Accepted" by customer | Rollback blocked (must create new revision) |
| Estimate is "Archived" | Rollback blocked (must restore from archive first) |
| Rollback to version older than 90 days | Requires Owner approval |
| Rollback affects pricing (rates changed) | Requires re-approval |
| Rollback is to the current version | Not allowed |

**Business Rules:**
- Rollback always creates a new version (history is never overwritten)
- Rollback reason is mandatory
- Rollback is logged as EVT-041
- Users can compare the current version with the rolled-back version
- Rollback creates a new version number (not a reversion of the old version)

### 8.4 Rollback Authority

| Role | Full Rollback | Selective Rollback | Pricing Rollback |
|------|---------------|-------------------|------------------|
| Estimator | No | No | No |
| Engineer | No | No | No |
| Sales | No | No | No |
| Owner | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes |

---

## 9. Restore Behaviour

Restore is different from rollback — it brings back an archived estimate or version without creating a new version.

### 9.1 Restore from Archive

When an archived estimate is restored:

1. User selects "Restore from Archive"
2. System prompts for restore reason
3. System changes the estimate status from "Archived" to its pre-archive state
4. System logs the restore action

**Business Rules:**
- Only Admin and Audit roles can restore from archive
- The restored estimate retains its original version history
- Restore is logged as EVT-040
- Restored estimates can be modified (if in an appropriate state)

### 9.2 Restore to Specific Version

Users can restore a specific version as the working version:

1. User selects "Restore Version" on any historical version
2. System creates a new version that copies the selected version's data
3. The new version becomes the active version
4. The original version history is preserved

**Business Rules:**
- Restore to specific version creates a new version (like rollback)
- The selected version remains unchanged
- Restore reason is mandatory
- Restored versions can be modified immediately

### 9.3 Restore Constraints

| Condition | Action |
|-----------|--------|
| Estimate is "Cancelled" (beyond 30 days) | Restore blocked (must be archived permanently) |
| Estimate is "Active" | Restore to version available (creates new version) |
| Estimate is "Locked" | Restore requires approval |
| Estimate is "Finalized" | Restore requires creating a new revision |
| Restore to version affected by library rate changes | Warning displayed about potential rate differences |

---

## 10. Branch Behaviour

Branching allows creating parallel development paths from any version, enabling multiple revisions or variations to be explored simultaneously.

### 10.1 Branch Creation

**Process:**
1. User selects "Create Branch" from any version
2. System prompts for branch name and purpose
3. System creates a new branch starting from the selected version
4. The branch is independent of the main version chain

### 10.2 Branch Properties

| Property | Description |
|----------|-------------|
| **Branch Name** | Human-readable identifier for the branch |
| **Parent Version** | The version from which the branch originated |
| **Branch Creator** | User who created the branch |
| **Branch Purpose** | Description of what the branch is for |
| **Branch Status** | Active, Merged, Abandoned |
| **Branch Head** | The latest version on this branch |

### 10.3 Branch Types

| Branch Type | Purpose | Typical Use Case |
|-------------|---------|------------------|
| **Customer Revision** | Incorporate customer feedback | Customer requested changes |
| **Price Update** | Test new rate changes | Material price update |
| **Package Swap** | Compare different packages | Customer wants to compare options |
| **Experimental** | Test structural changes | Trying a different approach |
| **Compliance** | Apply regulatory changes | Code or tax updates |
| **Competitive** | Create alternative pricing | Competitive response |

**Business Rules:**
- Each branch has a single "head" (latest version)
- Branches can have multiple versions in sequence
- Branch creation is logged as a version event
- Branch names must be unique within the estimate

### 10.4 Branch Isolation

Branches are fully isolated from each other:

**Business Rules:**
- Changes on one branch do not affect other branches
- Each branch maintains its own approval workflow
- Branches can have different statuses and states
- Cross-branch references are read-only

### 10.5 Branch Deletion

| Branch Status | Deletion Allowed | Required Role |
|---------------|-----------------|---------------|
| Active | No | N/A |
| Merged | Yes | Owner, Admin |
| Abandoned | Yes | Owner, Admin |

**Business Rules:**
- Only merged or abandoned branches can be deleted
- Deletion is a soft-delete (metadata retained)
- Branch deletion is logged
- Deleted branches can be restored within 30 days

---

## 11. Merge Behaviour

Merging integrates changes from one branch back into another (typically merging a revision branch into the main estimate chain).

### 11.1 Merge Process

1. User selects "Merge Branch" on the target branch
2. System prompts for source branch and merge options
3. System performs an automated three-way merge (target, source, common ancestor)
4. System presents merge results: auto-merged, conflicts requiring resolution
5. User reviews and confirms merge
6. System creates a new version on the target branch with merged content
7. Source branch is marked as "Merged"

### 11.2 Merge Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Fast-Forward** | Target branch has no new commits; source branch is simply advanced | No concurrent changes on target |
| **Three-Way Merge** | Merge with a common ancestor; conflicts are auto-resolved where possible | Concurrent changes on both branches |
| **Squash Merge** | All source branch changes are combined into a single new version | Want to simplify history |
| **Manual Merge** | User specifies which changes to include | Complex conflicts, partial merge |

### 11.3 Conflict Handling

When the same field is changed in both the source and target branches, a conflict occurs.

| Conflict Resolution | Description |
|---------------------|-------------|
| **Accept Source** | Use the value from the source branch |
| **Accept Target** | Use the value from the target branch |
| **Use Both** | For list-type fields, include items from both branches |
| **Custom** | Manually specify the merged value |
| **Defer** | Leave the conflict for later resolution |

**Business Rules:**
- All conflicts must be resolved before merge can be completed
- Conflict resolutions are recorded in the merge metadata
- Unresolved conflicts block the merge operation
- Merge conflict resolution requires Estimator role or above

### 11.4 Merge Approval

Merges that affect pricing or structure require approval.

| Merge Type | Approval Required | Authority |
|------------|-------------------|-----------|
| BOQ additions only | No | N/A |
| BOQ modifications | Yes | Approver or above |
| Rate changes | Yes | Approval workflow |
| Structural changes (package change) | Yes | Owner |
| Status changes | Yes | Same authority as original approval |

---

## 12. Archive Behaviour

Archiving moves estimates, versions, and related data to long-term storage, removing them from active views while preserving them for compliance and audit.

### 12.1 Archive Triggers

| Trigger | Conditions | Action |
|---------|------------|--------|
| **Manual Archive** | User initiates archive | System transitions to "Archived" status |
| **Post-Acceptance** | Customer accepts estimate, project created | System offers auto-archive option |
| **Expiry Completion** | Estimate expired and renewal window passed | System auto-archives |
| **Cancellation Aging** | Cancelled estimate past 30-day restoration window | System auto-archives |
| **Project Closure** | Linked project is completed and closed | System offers auto-archive |

### 12.2 Archive Scope

| Data Type | Archived | Accessibility |
|-----------|----------|---------------|
| Estimate metadata | Yes | Read-only |
| BOQ items (all versions) | Yes | Read-only |
| Approval history | Yes | Read-only |
| Audit trail | Yes | Read-only |
| Attachments | Yes | Read-only |
| Notes and comments | Yes | Read-only |
| Notifications | Yes | Read-only |
| Export history | Yes | Read-only |

**Business Rules:**
- Archived data is fully preserved (no data loss)
- Archived estimates do not appear in standard dashboards or reports
- Archived estimates are searchable via archive filter
- Archive transition is logged as EVT-039

### 12.3 Archive Access

| Role | View Archived | Restore | Export |
|------|---------------|--------|--------|
| Owner | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes |
| Audit | Yes | No | Yes |
| Estimator | No | No | No |
| Sales | No | No | No |
| Customer | No | No | No |

### 12.4 Archive Restoration

Archived estimates can be restored through the restore process (see Section 9).

**Business Rules:**
- Restoration returns the estimate to its pre-archive state
- All associated data (BOQ, approvals, audit) is restored
- Restoration creates a new audit entry
- Restored estimates can be modified if in an appropriate state

---

## 13. Retention Policy

The retention policy defines how long version data, audit logs, and related information are kept before permanent deletion.

### 13.1 Data Type Retention

| Data Type | Retention Period | Reason |
|-----------|-----------------|--------|
| **Estimate Versions** | 7 years | Tax and contract compliance |
| **Approval History** | 7 years | Audit and compliance |
| **Change Tracking Records** | 7 years | Audit and compliance |
| **Audit Log Entries** | 7 years | Regulatory requirements |
| **Branch Data** | Until merged or 7 years | Audit trail completeness |
| **Comparison Snapshots** | 3 years | Operational convenience |
| **Archived Estimates** | 7 years from archive date | Compliance |
| **Notification History** | 2 years | Operational |
| **Export History** | 2 years | Operational |
| **Session Data** | 30 days | Performance optimization |

**Business Rules:**
- Retention periods are configurable per data type
- Retention is measured from the last access date (not creation date) for frequently accessed data
- Pre-deletion notifications are sent 30 days before expiry
- Deletion is permanent and irreversible
- Legal hold overrides retention policies

### 13.2 Retention Enforcement

| Phase | Description |
|-------|-------------|
| **Monitoring** | System tracks data age and retention status continuously |
| **Notification** | 30 days before expiry, notification sent to retention admin |
| **Review** | 15 days before expiry, retention admin reviews each item |
| **Legal Hold Check** | 10 days before expiry, system checks for legal hold |
| **Deletion** | On expiry date, data is permanently deleted |
| **Audit** | Deletion is logged in a separate permanent audit log |

### 13.3 Legal Hold

| Event | Action |
|-------|--------|
| Legal hold applied | Affected data is exempted from retention deletion |
| Legal hold removed | Retention countdown resumes from the hold removal date |
| Legal hold expires | Data returns to normal retention lifecycle |

**Business Rules:**
- Only Admin and Legal teams can apply legal hold
- Legal hold is logged with reason and duration
- Multiple legal holds can apply to the same data
- Legal hold expiration triggers a review before deletion resumes

---

## 14. Customer-visible Versions

Customer-visible versions are those that have been shared with the customer. These versions follow specific rules to prevent confusion and ensure consistency.

### 14.1 Customer-visible Version Types

| Version Type | Description | Sharing Allowed |
|--------------|-------------|-----------------|
| **Initial Approved** | First approved version shared with customer | Yes |
| **Revised Approved** | Subsequent approved revision shared | Yes |
| **Renewed** | Expired estimate renewed and re-shared | Yes |
| **Restored** | Archived estimate restored and re-shared | Yes |

### 14.2 Customer-visible Version Constraints

**Business Rules:**
- All versions shared with customers must be in "Approved" status
- Customers view only the latest shared version (not the full history)
- Customers cannot access internal versions or branches
- If a revision is created from a shared version, the original remains visible to the customer
- Customer acceptance applies only to the specific shared version

### 14.3 Customer-visible Version Numbering

Customer-facing versions follow a simplified numbering scheme to avoid confusion:

| Internal Version | Customer Version |
|------------------|------------------|
| 1.0.0 | Quote #SBBT-001 v1 |
| 1.0.1 | Quote #SBBT-001 v1.1 |
| 1.1.0 | Quote #SBBT-001 v2 |
| 2.0.0 | Quote #SBBT-001 v3 |

**Business Rules:**
- Customer version numbers are sequential (v1, v2, v3...)
- Customer version numbers do not skip
- The customer version number is displayed on all shared documents
- Version differences are not visible to customers

### 14.4 Customer Response Tracking

Customer interactions with shared versions are tracked:

| Interaction | Tracked? |
|------------|----------|
| Viewed | Yes (timestamp, user if known) |
| Downloaded | Yes (timestamp, IP address) |
| Accepted | Yes (timestamp, method) |
| Rejected | Yes (timestamp, comments) |
| Requested Changes | Yes (timestamp, comments) |
| Commented | Yes (timestamp, comments) |

**Business Rules:**
- All customer interactions are logged in the audit trail
- Customer interactions are linked to the specific shared version
- Customer comments trigger revision workflow

---

## 15. Internal Versions

Internal versions are versions created during the estimation process that are never shared with customers. These include drafts, reviews, and internal revisions.

### 15.1 Internal Version Types

| Version Type | Purpose | Shared with Customer? |
|--------------|---------|----------------------|
| **Draft** | Initial estimation work | No |
| **Internal Review** | Review by internal team | No |
| **Approver Review** | Approval by authorized approver | No |
| **Internal Revision** | Changes requested by internal stakeholders | No |
| **Pre-approval** | Final review before customer sharing | No |

### 15.2 Internal Version Visibility

| Role | Can View | Can Export |
|------|----------|-----------|
| Owner | All | Yes |
| Estimator | All (own + assigned) | Yes |
| Engineer | All (domain-relevant) | Yes |
| Sales | All | Yes |
| Approver | All (assigned) | Yes |
| Admin | All | Yes |
| Customer | No (only shared versions) | No |

**Business Rules:**
- Internal versions are not accessible to customers under any circumstances
- Internal version numbering is visible to all internal users
- Internal versions can be exported for internal review
- Internal version changes are logged in the audit trail

### 15.3 Internal Version Lifecycle

Internal versions follow a shorter lifecycle with less ceremony:

| Stage | Trigger | Action |
|-------|---------|--------|
| Draft | Estimate created | No version number, auto-saved |
| Checkpoint | User saves | Intermediate version (e.g., "Checkpoint 1") |
| Review | Submitted for review | Versioned (e.g., "v1.0.0-r1") |
| Approved | Internal approval | Versioned (e.g., "v1.0.0") |
| Shared | First customer share | Tagged as "Shared-v1" |

**Business Rules:**
- Checkpoints do not create full versions (lightweight snapshots)
- Review versions follow full versioning
- Approved internal versions are the basis for customer versions
- Internal version tags are system-managed

---

## 16. Audit Integration

The Version Control system integrates with the Audit Log to ensure all version-related actions are traced and auditable.

### 16.1 Version-Related Audit Events

| Event | Trigger | Audit Section |
|-------|---------|---------------|
| Version Created | New version explicitly created | AUD-020 |
| Version Approved | New version approved | AUD-018, AUD-021 |
| Version Rejected | New version rejected | AUD-019, AUD-022 |
| Revision Created | New revision from approved version | AUD-020 |
| Revision Approved | Revised version approved | AUD-021 |
| Revision Rejected | Revised version rejected | AUD-022 |
| Rollback Performed | Version rolled back | AUD-023 |
| Archive | Estimate/version archived | AUD-033 |
| Restore | Estimate/version restored | AUD-034 |
| Branch Created | New branch created | Custom audit event |
| Branch Merged | Branch merged into target | Custom audit event |
| Branch Deleted | Branch deleted (soft) | Custom audit event |

### 16.2 Audit Integration Rules

**Business Rules:**
- All version-related actions generate audit entries
- Audit entries for version operations are immutable
- Version audit entries include the previous and new version numbers
- Audit entries for conflicts and merge resolutions include the resolution details
- All version audit data is retained for 7 years (per retention policy)

### 16.3 Audit Query Support

The Audit Log supports querying version-related events:

| Query Type | Description |
|------------|-------------|
| Version History | All versions of a specific estimate |
| Change Timeline | All changes between two versions |
| User Activity | All version actions by a specific user |
| Approval Chain | Full approval history for any version |
| Branch History | All branch creation, merge, and deletion events |
| Rollback History | All rollback operations on an estimate |

**Business Rules:**
- Audit queries support date range, user, action type, and version filters
- Query results include all relevant metadata (timestamps, actors, reasons)
- Query results can be exported in CSV, Excel, or PDF format
- Audit queries are role-based (users see only what they're authorized for)

---

## 17. Future Expansion

The Version Control system is designed to support future Git-like capabilities and advanced collaboration features.

### 17.1 Git-like Capabilities

| Capability | Description | Future Phase |
|------------|-------------|-------------|
| **Commit Messages** | Each version includes a detailed commit message | Phase 6 |
| **Tagging** | Semantic tags for releases (e.g., "v1.0-release") | Phase 6 |
| **Cherry-Picking** | Selectively apply individual changes from one branch to another | Phase 6 |
| **Rebasing** | Re-apply a branch's changes on top of a different base | Phase 6 |
| **Blame** | Identify who last changed each BOQ item or field | Phase 6 |
| **Stash** | Temporarily save working changes without creating a version | Phase 6 |
| **Hooks** | Automate actions on version events (e.g., notify on branch creation) | Phase 6 |

### 17.2 Advanced Collaboration

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Real-time Collaboration** | Multiple users edit the same BOQ simultaneously | Faster estimation |
| **Conflict Resolution UI** | Visual interface for resolving merge conflicts | Easier branching |
| **Change Suggestions** | Users can suggest changes without modifying the version | Non-destructive review |
| **Version Comments** | Threaded discussions attached to specific versions | Better communication |
| **Smart Diffs** | AI-powered comparison highlighting significant changes | Faster review |
| **Version Dependencies** | Track which versions of external systems (CMS, CRM) are needed | Integration traceability |

### 17.3 Future Branch Types

| Branch Type | Purpose |
|-------------|---------|
| **Feature Branch** | For developing new BOQ features or items |
| **Hotfix Branch** | For urgent corrections to approved versions |
| **Release Branch** | For stabilizing a version before sharing |
| **Experiment Branch** | For exploring alternative pricing or structures |
| **Customer Branch** | For customer-specific modifications |
| **Audit Branch** | For forensic analysis and compliance review |

### 17.4 Future Integration Points

| Integration | Description |
|-------------|-------------|
| **External VCS (Git)** | Sync estimate versions with Git repositories for development workflows |
| **CI/CD Pipeline** | Trigger automated validation on version creation |
| **Document Management** | Sync with enterprise document management systems |
| **Compliance Systems** | Feed version and audit data to compliance platforms |
| **AI Assistant** | AI suggests optimal version strategy based on change patterns |

**Business Rules:**
- Future capabilities are designed as pluggable extensions
- Git-like features maintain the same immutability and traceability guarantees
- All future integrations follow the existing audit and retention policies
- Backward compatibility is maintained with existing version data

---

*End of Document*
