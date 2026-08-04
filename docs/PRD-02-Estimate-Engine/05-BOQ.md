# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02  
**Title:** SBBT Estimate Engine — Bill of Quantities (BOQ) Engine  
**Phase:** Phase 5  
**Date:** August 2026  
**Author:** AI Software Architect  
**Status:** Phase 5 (BOQ Engine Design)  

---

## 1. BOQ Philosophy

The Bill of Quantities (BOQ) Engine operates on five core philosophical principles that ensure the BOQ is accurate, transparent, flexible, and maintainable.

### 1.1 Data-Centric

The BOQ is data-centric — every line item, group, and summary is derived from structured data, not free-text descriptions. This enables automation, validation, and integration with downstream systems.

**Business Rules:**
- Every BOQ line item must reference a structured data source (material library, labour library, package, or manual entry)
- All BOQ fields (description, unit, quantity, rate, amount) must be individually addressable
- BOQ data must be serializable and transportable in standard formats

### 1.2 Determinism

The same inputs must always produce the same BOQ. The BOQ generation process must be reproducible and auditable.

**Business Rules:**
- Given the same package, material selections, and project parameters, the BOQ must be identical
- BOQ item ordering follows a predictable, configurable sequence
- All automatic BOQ generation is logged with full traceability

### 1.3 Flexibility

The BOQ must support estimates that range from fully automated (package-based) to fully manual (custom line items), or any hybrid in between.

**Business Rules:**
- The BOQ can contain items from multiple sources (package, library, manual)
- Items can be added, removed, or modified at any time before approval
- The BOQ structure supports hierarchical grouping (by trade, by floor, by phase)

### 1.4 Transparency

Every BOQ line item must be traceable to its origin — whether it came from a package, a material selection, a labour selection, or was manually entered.

**Business Rules:**
- Each BOQ line item must record its source (package ID, library ID, or manual flag)
- The calculation chain for each item must be visible (rate source, quantity source, multiplier source)
- BOQ changes are logged with before/after values

### 1.5 Metadata-Driven

The BOQ structure, categories, units, and grouping rules are defined through metadata, not hardcoded logic. Administrators can configure BOQ behaviour without code changes.

**Business Rules:**
- BOQ categories, units of measure, and grouping rules are metadata entries
- New BOQ item types can be added through configuration
- BOQ templates are version-controlled metadata

---

## 2. BOQ Objectives

| ID | Objective | Measurement | Priority |
|----|-----------|-------------|----------|
| BOQ-OBJ-01 | Automatically generate BOQ from selected packages | 100% of package items appear in BOQ | P0 |
| BOQ-OBJ-02 | Support manual BOQ line item addition | Users can add any line item at any time | P0 |
| BOQ-OBJ-03 | Enable BOQ item grouping and summarization | Items grouped by trade, floor, category | P1 |
| BOQ-OBJ-04 | Support BOQ item lifecycle (draft, locked, finalized) | Correct state transitions enforced | P0 |
| BOQ-OBJ-05 | Maintain full audit trail of BOQ changes | Every modification logged with timestamp/actor | P0 |
| BOQ-OBJ-06 | Support BOQ export to procurement systems | Export in CSV, Excel, PDF formats | P1 |
| BOQ-OBJ-07 | Support BOQ versioning and revision comparison | Diff views show additions/removals | P1 |

---

## 3. BOQ Lifecycle

The BOQ progresses through four distinct states during the estimate lifecycle. Each state has specific allowed actions and constraints.

```
Draft
  ↓ (package applied, items populated)
Active
  ↓ (user finalizes structure, no further structural changes)
Locked
  ↓ (estimate approved, BOQ frozen for calculation)
Finalized
```

### 3.1 Draft

**Purpose:** The BOQ is in its initial state. Items are being added, removed, and edited freely.

**Allowed Actions:**
- Add items from packages, libraries, or manual entry
- Remove any non-locked items
- Edit quantities, rates, and descriptions
- Change item grouping
- Reorder items within groups

**Allowed Roles:** Estimate Owner, Estimator, Engineer, Admin

**Business Rules:**
- All items are editable (subject to editability constraints)
- No pricing calculations are locked
- Items can be freely added or removed

### 3.2 Active

**Purpose:** The BOQ structure is mostly finalized. Structural changes (adding/removing items) are restricted; only value edits are allowed.

**Allowed Actions:**
- Edit quantities, rates, and descriptions of existing items
- Add notes and comments to items
- Change item visibility
- Reorder items within groups

**Allowed Roles:** Estimate Owner, Estimator, Engineer, Admin

**Business Rules:**
- Items cannot be removed (only marked as removed)
- New items can be added only with admin override
- Rate locking applies to package-derived items

### 3.3 Locked

**Purpose:** The BOQ is locked to prevent modifications during the approval process. Only authorized overrides are permitted.

**Allowed Actions:**
- View all items (read-only)
- Apply manual overrides (with approval)
- Add comments and notes

**Allowed Roles:** Approver, Admin

**Business Rules:**
- No structural changes allowed
- Value changes require approval workflow (Section 39 in Phase 4)
- All override attempts are logged

### 3.4 Finalized

**Purpose:** The BOQ is frozen and used as the authoritative basis for pricing calculations and PDF generation. No changes are allowed.

**Allowed Actions:**
- View items (read-only)
- Export BOQ
- Create revision (which starts a new BOQ in Draft state)

**Allowed Roles:** Owner, Approver, Admin, Sales

**Business Rules:**
- No modifications allowed (per BR-004 in Phase 2)
- All calculations are based on finalized values
- Revision creates a new BOQ version

---

## 4. BOQ Types

The engine supports four BOQ types to accommodate different estimation scenarios. Not every estimate uses all types — the BOQ type is selected at estimate creation and can be changed only in Draft status.

### 4.1 Package-Based BOQ

**Purpose:** A BOQ generated entirely or primarily from a selected construction package. The package defines the base set of line items, which the user can then customize.

**Characteristics:**
- All line items have a package reference
- Items inherit default quantities, rates, and specifications from the package
- Rate changes from Material Library and Labour Library do not automatically propagate (rate locking)

**Business Rules:**
- Package-based BOQs must include at least the base package items
- Users can remove optional items from the package
- Users can add items not in the package (manual addition)
- The package-to-BOQ mapping is logged as EVT-003

### 4.2 Manual BOQ

**Purpose:** A BOQ where all line items are manually entered by the user. No package is selected. This type is used for custom projects where predefined packages do not apply.

**Characteristics:**
- No package reference for any line item
- All rates, quantities, and descriptions are manually specified
- Users rely on Material Library and Labour Library for rate references

**Business Rules:**
- Manual BOQ requires at least one line item
- All items must have a valid rate before calculation
- Material/library references are optional but recommended

### 4.3 Hybrid BOQ

**Purpose:** A BOQ that combines package-based items with manually added items. The package provides the base structure; manual items fill gaps or add customizations.

**Characteristics:**
- Some items have package references; others are manual
- Package items follow package lifecycle rules (locking, rate locking)
- Manual items follow manual BOQ rules (full editability until finalization)

**Business Rules:**
- Package items and manual items are clearly differentiated in the UI
- Package removal does not affect manually added items
- Rate locking applies only to package-derived items

### 4.4 Auto-Generated BOQ

**Purpose:** A BOQ generated automatically from external inputs such as drawings, project specifications, or AI suggestions (future capabilities). The user reviews and confirms the generated BOQ before proceeding.

**Characteristics:**
- Items are generated by an external process (drawing import, AI, etc.)
- All items start in "pending confirmation" status
- User must accept or reject each item before it becomes active

**Business Rules:**
- Auto-generated items require user confirmation before pricing
- Unconfirmed items are excluded from calculations
- Confirmation is logged with timestamp and user

---

## 5. BOQ Categories

BOQ items are organized into categories that reflect the nature of the work or material. Categories drive grouping, summarization, and reporting.

### 5.1 Standard Categories

| Category | Description | Example Items |
|----------|-------------|---------------|
| Earthwork | Excavation, filling, leveling | Site excavation, backfilling |
| Concrete | Concrete work, formwork, reinforcement | RCC, formwork, steel bars |
| Masonry | Brick, block, stone masonry | Brick wall, block wall |
| Woodwork | Carpentry, joinery, wood fixtures | Door frames, window frames |
| Plastering | Internal and external plastering | Cement plaster, POP finish |
| Flooring | All flooring materials and installation | Tiles, marbles, vitrified tiles |
| Painting | Internal and external painting | Emulsion paint, weatherproofing |
| Plumbing | Sanitary, water supply, drainage | Pipes, fittings, sanitary ware |
| Electrical | Electrical wiring, fittings, fixtures | Wires, switches, sockets |
| HVAC | Heating, ventilation, air conditioning | Ducting, AC units |
| Ceiling | False ceilings, grid systems | Gypsum ceiling, acoustic tiles |
| Waterproofing | Waterproofing treatments | Bathroom waterproofing, terrace coating |
| Steel Work | Structural and architectural steel | Gratings, railings, lintels |
| Glazing | Windows, doors, glazing work | Glass panes, UPVC windows |
| Exterior | External finishing, cladding | Plaster of Paris, exterior paint |
| Interior | Interior finishing, décor | Modular kitchens, wardrobes |
| Fixtures | Built-in and loose fixtures | Sanitary fixtures, hardware |
| Services | Specialized services | Fire safety, security systems |
| Transportation | Material transport to site | Haulage charges |
| Overhead | Site overheads and temporary works | Site office, security |

### 5.2 Category Hierarchy

Categories can be organized hierarchically — a parent category can contain child categories. This supports multi-level BOQ grouping.

**Business Rules:**
- Parent categories aggregate totals from child categories
- Users can collapse/expand categories in the view
- Category hierarchy is metadata-driven and configurable per domain

### 5.3 Custom Categories

Administrators can create custom categories for domain-specific work types.

**Business Rules:**
- Custom categories must have a unique code
- Custom categories can be parent or child categories
- Custom categories are domain-specific or global

---

## 6. BOQ Item Behaviour

Each BOQ line item follows defined behaviour rules regarding calculation, display, and lifecycle management.

### 6.1 Item Calculation

BOQ items are calculated based on their source and configuration.

**Calculation Modes:**

| Mode | Source | Calculation |
|------|--------|-------------|
| **Package Default** | Package template | quantity × package_rate |
| **Library Rate** | Material/Labour Library | quantity × library_rate |
| **Override Rate** | User override | quantity × override_rate |
| **Formula-Based** | Formula Engine | formula_result based on inputs |
| **Flat Amount** | Manual entry | fixed_amount |
| **Lookup Table** | Configurable table | table_value based on quantity/area |

**Business Rules:**
- Package default items can be overridden to library rates
- Library rate items are subject to effective-date rate selection
- Formula-based items delegate to the Formula Engine
- All calculation modes produce an audit entry

### 6.2 Item Display

| Property | Behavior |
|----------|----------|
| **Description** | Auto-populated from source; can be edited |
| **Unit** | Determined by item type; configurable per domain |
| **Quantity** | Editable unless locked by approval workflow |
| **Rate** | Displayed with source indicator (Package, Library, Override, Manual) |
| **Amount** | Computed as quantity × rate; not directly editable |
| **Category** | Assigned from item source; can be changed |
| **Notes** | Free-text field for user comments |

**Business Rules:**
- Rate source is always displayed visually
- Amount is never directly editable
- Category changes are logged
- Notes are optional but recommended for overrides

### 6.3 Item Lifecycle

| Lifecycle Stage | Description | Editable? | Deletable? |
|-----------------|-------------|-----------|------------|
| New | Item just added, not yet saved | Yes | Yes |
| Saved | Item persisted in BOQ | Yes | Yes (Draft/Active only) |
| Modified | Item changed from source default | Yes | Yes (Draft/Active only) |
| Locked | Item frozen during approval | No | No |
| Finalized | Item frozen after approval | No | No |
| Removed | Item marked for removal | No | N/A (soft delete) |

**Business Rules:**
- New and Saved items can be freely modified in Draft and Active states
- Locked items can only be changed via approval-gated override
- Removed items are retained for audit purposes with zero value
- Finalized items cannot be modified without creating a revision

### 6.4 Item Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| Default | Gray | Item matches package/library default exactly |
| Modified | Yellow | Item has been changed from its default |
| Overridden | Orange | Item rate has been manually overridden |
| Locked | Blue | Item is locked for calculation |
| Finalized | Green | Item is part of the finalized BOQ |
| Removed | Red (strikethrough) | Item marked for removal |
| Pending | Purple | Auto-generated item awaiting confirmation |

### 6.5 Grouping and Sorting

Items can be grouped by multiple dimensions and sorted according to configurable rules.

| Sort Option | Description |
|-------------|-------------|
| By Category | Items grouped under their assigned category |
| By Floor | Items grouped by floor number |
| By Trade | Items grouped by trade (labour type) |
| By Package | Items grouped by their source package |
| By Source | Items grouped by origin (Package, Manual, Library) |
| By Amount | Items sorted by total amount (high to low) |
| By Sequence | Items in their natural entry order |

**Business Rules:**
- Sorting is user-selectable and persisted per estimate
- Grouping can be nested (e.g., Category → Floor → Source)
- Group totals are automatically computed and displayed

---

## 7. Component Library Integration

The BOQ Engine integrates with the Component Library (a metadata-driven pricing component registry) to determine which items can appear on the BOQ.

### 7.1 Component Types on BOQ

Each pricing component type defines how it appears on the BOQ:

| Component Type | BOQ Representation | Default Calculation |
|----------------|-------------------|---------------------|
| Material | Line item with material code, description, unit, quantity, rate | Per Unit Quantity |
| Labour | Line item with labour type, description, unit, hours, rate | Per Unit Quantity |
| Product | Line item with product code, description, unit, quantity, rate | Per Unit Quantity |
| Service | Line item with service type, description, unit, quantity, rate | Per Unit Quantity |
| Consultancy | Line item with flat amount | Flat Amount |
| Transportation | Line item (optional) with distance-based or flat calculation | Per Unit Quantity or Flat Amount |
| Equipment | Line item with hourly or daily rate | Per Unit Quantity |
| Machinery | Line item with hourly rate | Per Unit Quantity |
| Rental | Line item with rental period rate | Per Unit Quantity |
| Markup | Not a BOQ line item; applied at the Cost Summary level | Percentage |
| Contingency | Not a BOQ line item; applied at the Cost Summary level | Percentage |
| Margin | Not a BOQ line item; applied at the Cost Summary level | Percentage |
| Taxes | Not a BOQ line item; applied at the Tax Engine level | Percentage |
| Discount | Not a BOQ line item; applied at the Discount Engine level | Percentage or Flat |
| Round-off | Not a BOQ line item; applied at the final total | Flat Amount |

### 7.2 Component Configuration

Each component type has configurable properties that determine its BOQ behaviour:

| Property | Options | Description |
|----------|---------|-------------|
| **Appears on BOQ** | Yes / No | Whether the component generates a line item |
| **Default Calculation** | Per Unit, Per Area, Flat, Percentage, etc. | Default calculation type |
| **Unit of Measure** | Configurable list | Default unit for the component |
| **Editable on BOQ** | Yes / No | Whether users can edit quantities/rates |
| **Visible by Default** | Yes / No | Whether the component is shown by default |
| **Requires Justification** | Yes / No | Whether changes require a reason note |

### 7.3 Dynamic Component Display

The BOQ dynamically shows or hides component types based on metadata configuration.

**Business Rules:**
- Components with "Appears on BOQ = No" are only visible in the Cost Summary, not the BOQ
- Components with "Visible by Default = No" can be enabled by the user per estimate
- Component display rules are evaluated at estimate initialization
- Changes to component configuration do not affect existing BOQ items

---

## 8. Package Integration

The BOQ Engine integrates with the Package Engine to generate line items from selected packages.

### 8.1 Package-to-BOQ Mapping

When a package is applied, each package item is mapped to a BOQ line item.

| Package Field | BOQ Field | Behavior |
|---------------|-----------|----------|
| Item Code | Item Code | Copied directly |
| Description | Description | Copied; editable |
| Unit | Unit | Copied; editable if allowed |
| Quantity | Quantity | Computed from package formula; editable |
| Rate | Rate | From Material/Labour Library; editable with override |
| Category | Category | Assigned from package configuration |
| Trade | Trade | Assigned from package configuration |
| Floor | Floor | Assigned from project parameters |
| Specifications | Specifications | Copied as item notes |

### 8.2 Package Application Logic

**Process:**
1. User selects a package (base, inherited, custom, or template)
2. The Package Engine resolves all package items (including inherited and optional items)
3. Each resolved item is converted to a BOQ line item
4. Rates are pulled from Material Library and Labour Library at the time of package application
5. Project parameters (location, area, floors) trigger applicable multipliers
6. The BOQ is populated and displayed for user review

**Business Rules:**
- Package application is a single atomic operation (all-or-nothing)
- If any package item fails to resolve, the entire package application fails with an error
- Package application is logged as EVT-003
- Users can review and modify BOQ items immediately after package application

### 8.3 Package Modification After Application

After a package is applied to the BOQ, modifications follow specific rules:

| Action | Allowed | Conditions |
|--------|---------|------------|
| Add package items not yet on BOQ | Yes | In Draft or Active state |
| Remove package items from BOQ | Yes | In Draft or Active state; package items only (not manual) |
| Change package item quantities | Yes | If editable |
| Change package item rates | Yes (with override rules) | Subject to override approval |
| Re-apply package (refresh from source) | Yes (Admin only) | Discards manual changes to package items |

**Business Rules:**
- Package item removal is a soft delete (item marked as removed, not deleted)
- Re-applying a package does not affect manually added items
- Package source tracking is maintained for all items

### 8.4 Package Locking Integration

When an estimate transitions to "Approved", the BOQ engine locks all package-derived items.

**Business Rules:**
- Package-derived items are locked to their rates at the time of approval
- Package version changes do not propagate to locked BOQ items
- Unlocking requires admin role (per BR-004)
- Lock/unlock is logged in the audit trail

---

## 9. Estimate Integration

The BOQ Engine integrates with the Estimate Builder and other estimate-level data to ensure BOQ items reflect the project's actual parameters.

### 9.1 Project Parameter Influence

Project parameters influence BOQ item calculation in the following ways:

| Parameter | BOQ Impact |
|-----------|------------|
| **Location** | Triggers location-based rate multipliers on applicable items |
| **Built-up Area** | Drives area-based BOQ items (per sqft rates) |
| **Number of Floors** | Drives floor-based BOQ items and floor multipliers |
| **Business Domain** | Determines which categories and components are available |
| **Estimate Type** | Filters which packages and items are applicable |
| **Customer Type** | May trigger customer-specific rates or exemptions |
| **Project Start Date** | Determines effective-date rate selection for materials |

### 9.2 Estimate State Integration

The BOQ engine enforces estimate-level state rules:

| Estimate State | BOQ State | Constraints |
|----------------|-----------|-------------|
| Draft | Draft | Full editability |
| In Progress | Active | Structural changes restricted |
| Under Review | Locked | Read-only, overrides require approval |
| Pending Approval | Locked | Read-only |
| Approved | Finalized | No changes allowed |
| Rejected | Active | Returns to editable state |
| Shared | Finalized | Read-only |
| Accepted | Finalized | Read-only |
| Expired | Finalized | Read-only; renewal creates new BOQ |
| Cancelled | Locked | Read-only |
| Archived | Finalized | Read-only |

**Business Rules:**
- BOQ state transitions are driven by estimate state transitions
- State mismatches trigger warnings to the user
- All state transitions are logged

### 9.3 Calculation Trigger Integration

The BOQ engine triggers pricing calculations in the Pricing Engine under specific conditions:

| Trigger | Action |
|---------|--------|
| BOQ item added | Recalculate BOQ totals |
| BOQ item removed | Recalculate BOQ totals |
| BOQ item modified | Recalculate if rate or quantity changed |
| Package applied | Full recalculation |
| Estimate state changed | Lock or unlock calculations |

**Business Rules:**
- BOQ totals are updated automatically after each change
- Full recalculation is triggered only on package application or bulk changes
- Calculation events are logged as EVT-010
- Users can manually trigger recalculation at any time in Draft or Active states

---

## 10. Version Behaviour

The BOQ Engine implements version control for all BOQ data, integrated with the Estimate Engine's Version Control system.

### 10.1 BOQ Versioning

Each BOQ state change creates a new version, preserving the previous state.

**Version States:**

| Version | Trigger | Contents |
|---------|---------|----------|
| v0.1 (Initial) | Estimate created, no package applied | Empty BOQ |
| v0.2 (Package Applied) | Package selected and applied | Package-derived items |
| v1.0 (First Save) | User first saves BOQ with modifications | Package items + any manual/customizations |
| v1.1 (Modification) | User adds/removes/modifies items | Latest BOQ state |
| v1.2 (Approval Lock) | Estimate transitions to Approved | Locked BOQ snapshot |

### 10.2 Revision Versioning

When a revision is created, the BOQ receives a new version within the revision:

| Revision | BOQ Version | Description |
|----------|-------------|-------------|
| v1.0 | 1.0.0 | Original approved BOQ |
| v1.1 | 1.0.1 | Minor revision (quantity changes) |
| v2.0 | 2.0.0 | Major revision (package change) |

**Business Rules:**
- BOQ versions are immutable after creation
- Users can view and compare any two BOQ versions
- Version numbering follows semantic versioning
- BOQ version history is linked to estimate version history

### 10.3 Rollback Versioning

When a BOQ is rolled back to a previous version:

**Business Rules:**
- Rollback creates a new BOQ version (does not overwrite history)
- The rolled-back version references the original version in its metadata
- Rollback reason is mandatory and logged
- Users can compare the current BOQ with the rolled-back version

### 10.4 Branch Versioning

BOQ items can exist on different branches when a revision forks from an approved version.

**Business Rules:**
- The branch origin (parent version) is recorded for each item
- Changes on a branch do not affect the parent branch
- Merging back requires approval workflow
- Branch visualization is available in the revision comparison view

---

## 11. Editable vs Locked Items

BOQ items have different editability states depending on their source and the estimate's current state.

### 11.1 Editable Items

Items that users can freely modify:

| Item Source | Editable Fields | Conditions |
|-------------|----------------|------------|
| **Package-Derived** | Quantity, Description, Notes | Estimate in Draft or Active state |
| **Library-Derived** | Quantity, Description, Notes | Estimate in Draft or Active state |
| **Manual** | All fields (Quantity, Rate, Description, Unit, Notes, Category) | Estimate in Draft or Active state |
| **Auto-Generated** | Pending confirmation, then all fields | After confirmation, same as Manual |

**Business Rules:**
- Editable items show an edit icon (pencil)
- Changes to editable items are auto-saved with audit logging
- Undo/redo is supported for editable items

### 11.2 Locked Items

Items that cannot be modified without approval:

| Lock Reason | Items Affected | Unlock Authority |
|-------------|----------------|------------------|
| **Estimate Approved** | All BOQ items | Admin only |
| **Package Applied (locked)** | Package-derived items | Admin only |
| **Rate Override Applied** | Specific items with overrides | Same or higher role |
| **Approval-Pending Override** | Items with pending overrides | Approver |
| **Auto-generated (unconfirmed)** | Pending AI/Drawing items | Any authorized user |

**Business Rules:**
- Locked items show a lock icon
- Attempting to edit a locked item triggers the override workflow
- Lock status is visible in the item details panel
- All lock/unlock actions are logged

### 11.3 Override Process for Locked Items

When a user needs to modify a locked item:

1. User clicks "Request Override" on the locked item
2. System prompts for the new value and mandatory justification
3. System creates a pending modification record
4. Approval workflow is triggered (per Section 39 in Phase 4)
5. If approved, the item is temporarily unlocked for modification
6. If rejected, the item remains locked

**Business Rules:**
- Pending overrides are visible in the Cost Summary with an "OVERRIDE" indicator
- The item value is not changed until approval is granted
- All override attempts (approved or rejected) are logged

---

## 12. Optional Items

Optional items are BOQ line items that are not included in the base calculation but can be toggled on or off by the user.

### 12.1 Optional Item Sources

| Source | Description |
|--------|-------------|
| **Package Optional** | Items from the package marked as optional |
| **User Optional** | Items manually marked as optional by the user |
| **System Optional** | Items automatically flagged as optional based on conditions |
| **Customer Optional** | Items the customer can choose to include/exclude |

### 12.2 Optional Item Behaviour

| State | Visibility | Calculation | Audit |
|-------|-----------|-------------|-------|
| Enabled | Visible on BOQ | Included in totals | Logged as added |
| Disabled | Visible (greyed out) | Excluded from totals | Logged as excluded |
| Hidden | Not visible | Excluded from totals | Logged as hidden |

**Business Rules:**
- Optional items are clearly marked with an "O" badge
- Enabling/disabling optional items triggers recalculation
- Customer-supplied optional items have zero rate
- Optional item status can be changed at any time before approval

### 12.3 Optional Item Presentation

In the BOQ view, optional items are displayed with:

- A checkbox or toggle control
- Visual distinction (greyed out when disabled)
- A "Optional" badge
- A summary of optional item totals at the bottom of the BOQ

**Business Rules:**
- The total of all enabled optional items is shown separately
- Users can enable/disable all optional items at once (bulk action)
- Optional item selections are saved per estimate version

---

## 13. Mandatory Items

Mandatory items are BOQ line items that must be included in every estimate of a given type or domain. These items cannot be removed or disabled.

### 13.1 Mandatory Item Sources

| Source | Description |
|--------|-------------|
| **Package Mandatory** | Items from the package marked as mandatory |
| **Domain Mandatory** | Items required for the business domain (e.g., site supervision for all construction) |
| **Regulatory Mandatory** | Items required by building codes or regulations (e.g., fire safety) |
| **Company Mandatory** | Items required by company policy (e.g., overhead, temporary works) |

### 13.2 Mandatory Item Behaviour

| Validation Point | Behavior |
|------------------|----------|
| BOQ Generation | Mandatory items are automatically added if missing |
| Item Removal | Blocked with error message |
| Item Disable | Blocked (items cannot be set to optional/disabled) |
| Cost Calculation | Mandatory items are always included in totals |
| PDF Export | Mandatory items are always shown in the BOQ section |

**Business Rules:**
- Mandatory items are identified with an "M" badge
- Attempting to remove a mandatory item shows a modal explaining why it cannot be removed
- The list of mandatory items is domain-specific and configurable
- New mandatory items added by admin do not retroactively apply to existing approved estimates

### 13.3 Mandatory Item Compliance

The BOQ Engine validates mandatory item compliance at specific checkpoints:

| Checkpoint | Validation | Action on Failure |
|------------|------------|-------------------|
| Package Application | All package mandatory items present | Warning, not blocking |
| Before Calculation | All domain mandatory items present | Blocking error |
| Before Sharing | All regulatory mandatory items present | Blocking error |
| Before Approval | All mandatory items present and priced | Blocking error |

---

## 14. Auto-generated Items

Auto-generated items are BOQ line items created automatically by the engine based on project parameters, package selections, or business rules — not manually added by the user.

### 14.1 Auto-generation Triggers

| Trigger | Items Generated |
|---------|-----------------|
| **Area-Based Generation** | Per-sqft items scaled to built-up area (e.g., flooring, painting) |
| **Floor-Based Generation** | Per-floor items scaled to number of floors (e.g., floor finishing, railing) |
| **Location-Based Generation** | Items specific to the project location (e.g., transportation, site conditions) |
| **Risk-Based Generation** | Contingency items triggered by risk factors |
| **Code-Based Generation** | Items required by building codes for the domain |
| **Season-Based Generation** | Seasonal items (e.g., weatherproofing for monsoon season) |

### 14.2 Auto-generation Logic

For each auto-generation trigger, the engine evaluates rules and generates items:

| Rule | Condition | Action |
|------|-----------|--------|
| AG-01 | Built-up area > 1000 sqft | Add "Site Supervision" item at 1% of total |
| AG-02 | Number of floors > 2 | Add "Vertical Transportation" item |
| AG-03 | Location is remote (>50km from depot) | Add "Transportation" item at per-km rate |
| AG-04 | Risk profile = High | Add "Contingency" item at 5% of subtotal |
| AG-05 | Domain = Renovation | Add "Demolition" items from domain template |
| AG-06 | Season = Monsoon | Add "Waterproofing" items |

**Business Rules:**
- Auto-generated items are flagged with their generation source
- Users can review, modify, or remove auto-generated items (subject to lock status)
- All auto-generation is logged with the triggering rule
- Auto-generation rules are metadata-driven and configurable by administrators

### 14.3 Auto-generation Audit

Each auto-generated item records:

| Field | Content |
|-------|---------|
| Generation Rule ID | The rule that triggered the item |
| Triggering Parameter | Which project parameter caused the generation |
| Generation Timestamp | When the item was created |
| Generation Context | Full context (location, area, domain) at time of generation |

**Business Rules:**
- Auto-generation audit data is immutable
- Users can view the generation rule in the item details
- Re-running auto-generation is logged as a separate event

---

## 15. Manual Items

Manual items are BOQ line items entered directly by the user, without reference to a package, library, or auto-generation rule.

### 15.1 Manual Item Creation

Users can create manual items through two methods:

| Method | Description |
|--------|-------------|
| **Quick Add** | Single-line entry form for fast item creation |
| **Detailed Add** | Full-form entry with all fields and validation |

**Fields Available:**
- Item Code (optional, auto-generated if not provided)
- Description (required)
- Category (required, from configured categories)
- Unit (required, from configured units)
- Quantity (required, numeric)
- Rate (required, numeric)
- Specifications (optional, free text)
- Trade (optional, from configured trades)
- Floor (optional, from project floors)
- Notes (optional)

**Business Rules:**
- Description must be at least 5 characters
- Quantity and Rate must be positive numbers
- Unit must be from the configured unit list
- Category must be from the configured category list
- All manual item creations are logged as EVT-005

### 15.2 Manual Item Validation

Manual items are validated for data integrity:

| Validation | Rule |
|-----------|------|
| **Duplicate Check** | System warns if item code already exists in the BOQ |
| **Rate Validation** | Rate must be within domain-configured min/max range |
| **Quantity Validation** | Quantity must be within reasonable bounds |
| **Unit Consistency** | Unit must match the item's measurement type |
| **Category Validity** | Category must be enabled for the current domain |

**Business Rules:**
- Validation failures prevent saving but allow editing
- Users can override validation warnings with justification
- All validation overrides are logged

### 15.3 Manual Item Sourcing

Manual items can optionally reference a source for traceability:

| Source | Reference |
|--------|-----------|
| **Material Library** | Material code from the library |
| **Labour Library** | Labour type from the library |
| **Vendor Quote** | Vendor reference number |
| **Previous Estimate** | Estimate ID and item ID |
| **Drawing** | Drawing reference and mark-up |
| **Supplier Catalog** | Supplier name and catalog number |
| **None** | No source reference (fully custom) |

**Business Rules:**
- Source reference is optional but recommended
- If a source is provided, the system attempts to validate the rate against the source
- Source mismatches generate a warning
- Source references are stored in the item metadata

---

## 16. Cost Roll-up Behaviour

Cost roll-up defines how BOQ line items are aggregated into sub-totals, category totals, and the overall BOQ summary.

### 16.1 Roll-up Levels

The BOQ supports hierarchical cost roll-up at multiple levels:

| Level | Scope | Aggregation |
|-------|-------|-------------|
| **Line Item** | Individual BOQ item | quantity × rate = amount |
| **Group** | Items within a group (e.g., all flooring items) | Sum of item amounts |
| **Category** | Items within a category (e.g., all Finishing items) | Sum of group totals |
| **Trade** | Items within a trade (e.g., all Masonry trade items) | Sum of category totals |
| **Section** | Items within a project section (e.g., Foundation) | Sum of trade totals |
| **Floor** | Items on a specific floor | Sum of section totals |
| **Package** | Items from a specific package | Sum of floor totals (if applicable) |
| **BOQ Summary** | All items in the BOQ | Sum of all package/section totals |
| **Estimate Total** | BOQ + non-BOQ components | BOQ summary + markup + contingency + margin + tax |

### 16.2 Roll-up Timing

Cost roll-up occurs at specific points in the estimate lifecycle:

| Event | Roll-up Action |
|-------|----------------|
| Item Added | Recalculate item amount and parent group total |
| Item Modified | Recalculate item amount, parent group, parent category, and all ancestors up to BOQ summary |
| Item Removed | Recalculate parent group and all ancestors (set removed item amount to zero) |
| Package Applied | Full roll-up of all items |
| Manual Trigger | Full roll-up of all levels |

**Business Rules:**
- Roll-up is automatic and real-time
- Roll-up calculations are logged as EVT-010
- Users can trigger manual roll-up at any time
- Roll-up respects item visibility (hidden items contribute to totals but are not displayed)

### 16.3 Roll-up Display

The cost summary displays roll-up at each level with the following columns:

| Column | Description |
|--------|-------------|
| **Item Count** | Number of line items contributing to this total |
| **Subtotal** | Sum of all item amounts (before adjustments) |
| **Markup** | Markup applied at this level (if applicable) |
| **Contingency** | Contingency applied at this level (if applicable) |
| **Discount** | Discount applied at this level (if applicable) |
| **Tax** | Tax calculated at this level (if applicable) |
| **Total** | Final total at this level |

**Business Rules:**
- Users can expand/collapse each roll-up level
- Totals are always the sum of visible child items
- Hidden items' totals are included in parent totals but not displayed in detail
- Roll-up totals update in real-time

### 16.4 Roll-up Validation

The engine validates roll-up integrity to prevent calculation errors:

| Check | Rule |
|-------|------|
| **Sum Integrity** | Parent total = sum of child totals (within rounding tolerance) |
| **No Orphan Items** | Every item must belong to a group, category, or summary |
| **No Circular References** | No item can be its own ancestor in the roll-up hierarchy |
| **Positive Amounts** | All item amounts must be zero or positive |
| **Rate Consistency** | Rates must not change without user action or rate update |

**Business Rules:**
- Roll-up validation runs automatically after each modification
- Validation failures generate warnings, not errors (except for orphaned items)
- Users can view validation issues in the "Issues" panel
- All validation results are logged

---

## 17. Quantity Rules

BOQ item quantities follow defined rules to ensure data quality and consistency.

### 17.1 Quantity Types

| Type | Description | Example |
|------|-------------|---------|
| **Count** | Integer count of items | 10 doors, 5 windows |
| **Length** | Linear measurement | 25.5 meters of railing |
| **Area** | Square measurement | 150 sqft of flooring |
| **Volume** | Cubic measurement | 50 cuft of concrete |
| **Weight** | Mass measurement | 500 kg of steel |
| **Time** | Duration measurement | 3 days of supervision |
| **Percentage** | Fractional value | 10% contingency |
| **Multiplier** | Scaling factor | 1.2× floor multiplier |

### 17.2 Quantity Input Rules

| Rule | Description |
|------|-------------|
| **Positive Values** | Quantities must be zero or positive |
| **Decimal Precision** | Configurable decimal places per unit type (e.g., 2 decimal places for area, 0 for count) |
| **Unit Consistency** | Quantity unit must match the item's defined unit |
| **Maximum Bounds** | Configurable maximum per item type |
| **Minimum Bounds** | Configurable minimum (usually zero) |

**Business Rules:**
- Quantity entry supports keyboard input, calculator, and formula entry
- Real-time validation shows errors as user types
- Quantities can be overridden by authorized users
- Quantity changes trigger recalculation and audit logging

### 17.3 Quantity Derivation

Some quantities are derived from project parameters rather than manually entered:

| Source | Derivation | Example |
|--------|------------|---------|
| **Built-up Area** | Directly from project parameter | Flooring quantity = built-up area |
| **Floor Count** | Multiplied by per-floor quantity | Railing = 10 meters × floor count |
| **Wall Perimeter** | Computed from area and shape | Skirting = perimeter of each floor |
| **Volume from Area** | Area × thickness | Concrete = area × 0.15m thickness |
| **Count from Area** | Area ÷ coverage per item | Tiles = area ÷ 1 sqft per tile |

**Business Rules:**
- Derived quantities are recalculated when source parameters change
- Users can override derived quantities (with audit logging)
- The derivation formula is displayed in the item details
- Derived quantities are highlighted visually

### 17.4 Quantity Rounding

Quantities are rounded according to configurable rules:

| Rule | Description |
|------|-------------|
| **Round Up** | Always round up to the next unit | Ceiling for material procurement |
| **Round Down** | Always round down | Conservative estimates |
| **Round to Nearest** | Standard rounding (5 rounds up) | General use |
| **Truncate** | Remove decimal places | Integer counts |
| **Banker's Rounding** | Round to nearest even | Financial precision |

**Business Rules:**
- Rounding rules are configurable per unit type
- Rounding is applied at the item level before cost calculation
- Rounded quantities are displayed with the original value available in details
- All rounding actions are logged

---

## 18. Unit Rules

Units of measure are managed centrally and applied to BOQ items according to defined rules.

### 18.1 Standard Units

| Unit | Type | Symbol | Decimal Places |
|------|------|--------|----------------|
| Square Feet | Area | sqft | 2 |
| Square Meter | Area | sqm | 2 |
| Cubic Feet | Volume | cuft | 3 |
| Cubic Meter | Volume | cum | 3 |
| Square Feet per Floor | Area | sqft/floor | 2 |
| Number | Count | nos | 0 |
| Linear Feet | Length | lf | 2 |
| Linear Meter | Length | lm | 2 |
| Kilogram | Weight | kg | 3 |
| Tonnes | Weight | tonnes | 3 |
| Days | Time | days | 0 |
| Hours | Time | hrs | 1 |
| Percentage | Percentage | % | 2 |
| Multiplier | Multiplier | x | 2 |

### 18.2 Unit Assignment Rules

| Rule | Description |
|------|-------------|
| **Package-Based** | Unit assigned from package definition |
| **Library-Based** | Unit assigned from material/labour library entry |
| **Domain-Based** | Unit assigned based on domain defaults |
| **User-Assigned** | Unit manually selected by user (for manual items) |
| **Auto-Detected** | Unit inferred from calculation type |

**Business Rules:**
- Units are consistent within a group (all items in a group share compatible units)
- Unit conversion is supported for mixed-unit BOQs
- Unit changes require justification if items have been priced
- Unit definitions are metadata-driven and configurable

### 18.3 Unit Conversion

When items within the same group have different units, the engine converts for aggregation:

| From Unit | To Unit | Conversion Factor |
|-----------|---------|-------------------|
| sqft | sqm | 0.0929 |
| sqm | sqft | 10.764 |
| cuft | cum | 0.0283 |
| cum | cuft | 35.315 |
| kg | tonnes | 0.001 |
| tonnes | kg | 1000 |
| lf | lm | 0.3048 |
| lm | lf | 3.281 |

**Business Rules:**
- Conversions use the latest factor from the system configuration
- Converted values maintain original precision (no double-rounding)
- Conversion factors are metadata and can be updated
- All conversions are logged in the audit trail

### 18.4 Unit Display

Units are displayed according to domain and user preferences:

| Setting | Options |
|---------|---------|
| **Primary Unit System** | Metric, Imperial, Both |
| **Decimal Separator** | Period (.), Comma (,) |
| **Thousands Separator** | Comma (,), Period (.), Space, None |
| **Unit Display** | Symbol (sqft), Full Name (Square Feet), Abbreviation (Sq Ft) |

**Business Rules:**
- Display settings are per-user and persisted
- BOQ data is stored in the system's base unit regardless of display
- PDF export uses the project's preferred unit system
- Unit display does not affect calculation results

---

## 19. Future AI BOQ

The BOQ Engine is designed to support future AI-powered BOQ generation and optimization.

### 19.1 AI-Generated BOQ

**Purpose:** An AI system analyzes project drawings, specifications, and historical data to generate a BOQ automatically.

**Planned Capabilities:**
- **Drawing Analysis:** AI reads construction drawings (PDF, DWG, image) to identify materials, dimensions, and quantities
- **Specification Parsing:** AI parses project specifications to extract material grades, finishes, and standards
- **Historical Learning:** AI learns from past estimates to suggest items for similar projects
- **Domain Knowledge:** AI applies domain-specific rules (e.g., bathroom fixture counts from room count)

**AI BOQ Item Attributes:**
- Confidence score (0% to 100%)
- Source evidence (drawing sheet, specification clause, historical reference)
- Suggested modification (if AI has a different recommendation)
- Review status (confirmed, rejected, pending)

**Business Rules:**
- AI-generated items start in "pending confirmation" status
- Users must review and accept/reject each AI-generated item
- The AI's confidence score thresholds are configurable
- AI generation events are logged with full context

### 19.2 AI Optimization

**Purpose:** AI suggests optimizations to the BOQ for cost reduction, efficiency, or material selection.

**Planned Capabilities:**
- **Substitute Suggestions:** AI suggests alternative materials with lower cost
- **Quantity Optimization:** AI identifies over-specified quantities
- **Grouping Optimization:** AI suggests better item groupings for procurement
- **Vendor Recommendations:** AI suggests preferred vendors based on historical pricing

**Business Rules:**
- AI suggestions are displayed as recommendations, not mandates
- All AI suggestions require user review and approval
- AI optimization can be enabled or disabled per estimate
- AI suggestion history is logged and auditable

### 19.3 AI Integration Points

| Integration Point | Current State | Future State |
|-------------------|---------------|--------------|
| BOQ Generation | Manual / Package-based | AI from drawings + specifications |
| Item Review | User review | AI-assisted review with confidence scoring |
| Quantity Takeoff | Manual entry | AI from measurements in drawings |
| Material Selection | Library lookup | AI suggests optimal materials |
| Cost Estimation | Deterministic calculation | AI predicts actual vs. estimated variance |

**Business Rules:**
- AI capabilities are opt-in and configurable
- AI-generated BOQs require a higher level of review
- AI confidence below a threshold requires additional approval
- AI integration points are designed as pluggable interfaces

---

## 20. Future Drawing Import

The BOQ Engine is designed to support future direct import of BOQ data from construction drawings.

### 20.1 Drawing Import Sources

| Source | Format | BOQ Impact |
|--------|--------|------------|
| **Architectural Drawings** | PDF, DWG, DXF | Extract room dimensions, door/window schedules, finish specs |
| **Structural Drawings** | PDF, DWG, DXF | Extract structural quantities (beams, columns, slabs) |
| **MEP Drawings** | PDF, DWG, DXF | Extract mechanical, electrical, plumbing quantities |
| **Landscape Drawings** | PDF, DWG, DXF | Extract site work and landscaping quantities |
| **Detail Sheets** | PDF, Image | Extract detailed component quantities |

### 20.2 Drawing-to-BOQ Mapping

The engine will map drawing elements to BOQ items through configurable rules:

| Drawing Element | BOQ Category | Mapping Logic |
|-----------------|--------------|--------------|
| Room Dimensions | Flooring, Painting | Area = length × width |
| Door Schedule | Doors, Frames | Count = number of doors |
| Window Schedule | Windows, Glazing | Count = number of windows |
| Wall Schedule | Masonry, Plaster | Length × height for each wall type |
| Column Schedule | Concrete, Steel | Count × size-based formulas |
| Beam Schedule | Concrete, Steel | Length × section-based formulas |
| Slab Schedule | Concrete, Finishing | Area × thickness |
| Landscape Plan | Earthwork, Planting | Area-based or count-based |

**Business Rules:**
- Drawing import requires a mapping configuration per drawing type
- Imported items start in "pending confirmation" status
- Users can adjust imported quantities before confirmation
- Drawing import is logged with the source file reference

### 20.3 Drawing Import Validation

Imported BOQ items are validated against drawing data:

| Validation | Rule |
|-----------|------|
| **Completeness** | All drawing elements must be mapped to BOQ items |
| **Accuracy** | Imported quantities must match drawing measurements within tolerance |
| **Consistency** | Items from the same drawing must have consistent units |
| **Traceability** | Each item must reference its source drawing and element |

**Business Rules:**
- Validation failures are reported as issues for user review
- Tolerance is configurable per drawing type and measurement precision
- Traceability references are stored in item metadata
- Validation reports can be exported for audit purposes

---

*End of Document*