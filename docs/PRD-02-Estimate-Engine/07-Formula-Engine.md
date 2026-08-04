# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02  
**Title:** SBBT Estimate Engine — Formula Engine & Business Rule Engine  
**Phase:** Phase 7  
**Date:** August 2026  
**Author:** AI Software Architect  
**Status:** Phase 7 (Formula Engine Design)  

---

## 1. Formula Philosophy

The Formula Engine is a universal, metadata-driven computation engine that evaluates business rules and calculations without hard-coding any specific pricing component, business domain, or calculation type. The engine operates on a single principle: **all behaviour is configurable through metadata**.

### 1.1 Universal Applicability

The engine never assumes the existence of specific pricing components such as materials, labour, GST, discounts, margins, or transportation. These are all treated as generic "components" whose behaviour is defined entirely through configuration.

**Business Rules:**
- The engine does not have any hard-coded component types
- All component types are registered through metadata configuration
- New component types can be added without code changes
- The engine evaluates formulas based on component metadata, not component type

### 1.2 Metadata-Driven Everything

Every aspect of formula behaviour — what triggers evaluation, what inputs it uses, how it computes results, and when it applies — is defined through metadata.

**Business Rules:**
- Formulas are defined as metadata entries, not code
- Formula dependencies are declared in metadata, not inferred
- Formula priority and conflict resolution rules are metadata-driven
- Formula execution order is determined by metadata configuration

### 1.3 Separation of Concerns

The Formula Engine is completely separated from the Business Rule Engine. The Formula Engine handles mathematical and logical computations; the Rule Engine handles conditional logic, business constraints, and policy enforcement.

**Business Rules:**
- The Formula Engine never makes business decisions
- The Rule Engine never performs calculations
- Communication between engines is through well-defined interfaces (metadata references)
- Both engines can be tested and validated independently

### 1.4 Composability

Formulas and rules can be composed — the output of one formula can serve as an input to another, and rules can chain together to enforce complex policies.

**Business Rules:**
- Formula outputs are published as named results available to other formulas
- Rule conditions can reference formula outputs
- Circular dependencies between formulas are detected and rejected
- Composition chains are logged for audit purposes

### 1.5 Extensibility

The engine architecture supports pluggable evaluation strategies, data sources, and output handlers without modifying the core engine.

**Business Rules:**
- New evaluation strategies are registered through metadata
- Data sources can be added without code changes
- Output handlers can be extended for new integration targets
- Extension points are documented and versioned

---

## 2. Rule Engine Philosophy

The Business Rule Engine enforces business constraints, policies, and conditional logic that govern how formulas are applied, when they execute, and what values they can produce.

### 2.1 Declarative Rules

Rules are declared through metadata, not imperative code. The engine evaluates rules against the current context and enforces compliance.

**Business Rules:**
- Each rule is a self-contained declaration of a business constraint
- Rules are independent and composable
- Rules can reference other rules as dependencies
- Rules are evaluated in priority order

### 2.2 Constraint Enforcement

The Rule Engine enforces constraints on formula inputs, outputs, and execution conditions.

**Business Rules:**
- Input constraints validate data before formula execution
- Output constraints validate results after formula execution
- Execution constraints determine whether a formula should run
- All constraint violations are logged with context

### 2.3 Policy Management

Business policies — such as approval thresholds, rate limits, and access controls — are defined as rules and managed through metadata.

**Business Rules:**
- Policies are versioned independently
- Policy changes do not affect existing evaluations
- Policy overrides are tracked with audit trails
- Policies can be enabled/disabled per business domain

### 2.4 Dynamic Rule Evaluation

Rules are evaluated dynamically based on the current context, including entity state, user role, and environmental conditions.

**Business Rules:**
- Rule conditions are evaluated at runtime, not at configuration time
- Context includes all relevant entity, user, and system attributes
- Rule evaluation results are cached for performance (with cache invalidation)
- Partial evaluation results are available for debugging

---

## 3. Component Engine

The Component Engine is the metadata registry that defines what components exist, what properties they have, and how they interact with formulas and rules. The engine treats all components as generic entities — no component type is privileged.

### 3.1 Component Registry

All components are registered in a central metadata registry. Each component definition includes:

| Property | Description |
|----------|-------------|
| **Component ID** | Unique identifier for this component type |
| **Component Name** | Human-readable name |
| **Domain** | Business domain this component applies to (or "global") |
| **Properties** | List of configurable properties (fields) |
| **Default Values** | Default values for each property |
| **Validators** | Validation rules for property values |
| **Dependencies** | Other components this component depends on |
| **Lifecycle Hooks** | Points where rules or formulas are triggered |

**Business Rules:**
- Every component must have a unique ID within its domain
- Components without a domain are global (available to all domains)
- Component properties are typed (string, number, boolean, date, enum, reference)
- Property validators are metadata entries, not hard-coded
- Dependencies form a directed acyclic graph (cycles detected and rejected)

### 3.2 Component Properties

Component properties define the data fields that formulas and rules operate on.

| Property Type | Description | Validation |
|---------------|-------------|------------|
| **Text** | Free-form string | Length, format, character restrictions |
| **Number** | Numeric value | Min, max, decimal precision |
| **Boolean** | True/false flag | None |
| **Date** | Date or timestamp | Range, format |
| **Enum** | One of predefined values | Must be in allowed list |
| **Reference** | Link to another component or entity | Must exist, type check |
| **Calculated** | Computed from other properties | Cannot be manually set |
| **Composite** | Group of sub-properties | Recursive validation |

**Business Rules:**
- Properties can be required or optional
- Property default values are metadata, not hard-coded in UI
- Calculated properties are evaluated by the Formula Engine
- Reference properties can point to any registered component
- Composite properties can nest recursively (with depth limits)

### 3.3 Component Relationships

Components can relate to each other through defined relationship types.

| Relationship Type | Description | Example |
|-------------------|-------------|---------|
| **Depends On** | Component A requires Component B to function | Labour depends on Material |
| **Contains** | Component A contains Component B | Package contains Materials |
| **References** | Component A links to Component B | Estimate references Package |
| **Replaces** | Component A is an alternative to Component B | Premium material replaces standard |
| **Triggers** | Component A activates Component B | Risk factor triggers Contingency |
| **Constrains** | Component A limits options for Component B | Budget constrains Package selection |

**Business Rules:**
- All relationships are bidirectional (if A depends on B, B is depended-upon by A)
- Relationship definitions are metadata, not hard-coded
- Relationship cardinality is configurable (one-to-one, one-to-many, many-to-many)
- Circular relationships are detected and rejected
- Relationship changes create new component versions

### 3.4 Cross-Domain Component Support

The engine supports components that span multiple business domains without requiring code changes.

| Domain | Supported | Notes |
|--------|-----------|-------|
| **Construction** | Yes | Default domain |
| **Interior** | Yes | Shares component types with Construction |
| **Architecture** | Yes | Extends Construction with design components |
| **Renovation** | Yes | Extends Construction with demolition components |
| **Solar** | Yes | Adds renewable energy components |
| **Furniture** | Yes | Independent component set |
| **Consultancy** | Yes | Time-based and service components |
| **Service Industry** | Yes | Recurring and subscription components |

**Business Rules:**
- New domains are added through metadata configuration only
- Domains can inherit components from other domains
- Domain-specific components do not affect other domains
- Cross-domain formulas are supported through domain-agnostic references
- Domain switching preserves existing data and creates audit trail

### 3.5 Pricing Component Engine

The Pricing Component Engine is a dedicated view over the Component Registry that governs how pricing-related components are defined, registered, and consumed. It enforces the core principle that the engine never assumes any specific pricing component — Material, Labour, GST, Discount, Margin, Transport, or any other pricing element are all treated as generic, configurable components.

| Pricing Component | Engine Behaviour |
|-------------------|------------------|
| **Material** | Registered as a generic component with properties (rate, unit, wastage); no special engine logic |
| **Labour** | Registered as a generic component with properties (rate, hours, skill level); no special engine logic |
| **GST / Tax** | Registered as a generic component with properties (rate, applicability); no special engine logic |
| **Discount** | Registered as a generic component with properties (type, value, conditions); no special engine logic |
| **Margin** | Registered as a generic component with properties (percentage, floor, ceiling); no special engine logic |
| **Transport** | Registered as a generic component with properties (rate, distance, mode); no special engine logic |
| **Any Future Component** | Registered through metadata; engine behaviour is identical to existing components |

**Business Rules:**
- The engine contains zero hard-coded pricing component types
- Every pricing component is defined, validated, and versioned through metadata
- Formulas reference pricing components by their registered metadata identity, never by a hard-coded type
- Adding a new pricing component (e.g., "Wastage", "Insurance", "Permit Fee") requires no code changes
- Pricing component behaviour (calculation, priority, override, validation) is fully configurable
- The Pricing Component Engine is domain-agnostic and supports all future business domains
- Pricing component definitions are versioned; running estimates retain their pricing component snapshot

---

## 4. Formula Lifecycle

Every formula progresses through a defined lifecycle from creation to retirement. Each stage has specific allowed actions and constraints.

```
Draft
  ↓ (definition complete)
Validated
  ↓ (tested and verified)
Approved
  ↓ (authorized for use)
Active
  ↓ (in use, evaluating on entities)
Deprecated
  ↓ (no longer recommended, but still functional)
Retired
  ↓ (removed from evaluation)
Archived
```

### 4.1 Draft

**Purpose:** The formula is being created or modified. It has not yet been validated or tested.

**Allowed Actions:**
- Define formula inputs, outputs, and logic
- Set formula properties (priority, dependencies, triggers)
- Test formula in isolation (simulation mode)
- Save as draft for later editing

**Allowed Roles:** Formula Administrator, System Administrator

**Business Rules:**
- Draft formulas are not evaluated against any entity
- Multiple draft versions of the same formula can coexist
- Draft formulas must pass validation before activation
- Draft formulas can be tested using simulation

### 4.2 Validated

**Purpose:** The formula has passed all validation checks and test cases. It is ready for business approval.

**Allowed Actions:**
- View formula definition and test results
- Submit formula for approval
- Run additional simulation tests
- Edit formula (returns to Draft)

**Allowed Roles:** Formula Administrator, System Administrator

**Business Rules:**
- Only formulas that pass all validation checks can enter Validated state
- Validation results are stored with the formula version
- Validated formulas are not yet evaluated against any entity
- A Validated formula can be returned to Draft if further changes are needed

### 4.3 Approved

**Purpose:** The formula has been formally approved by an authorized approver and is authorized for activation.

**Allowed Actions:**
- Activate the formula
- View approval record
- Return to Validated (with reason)

**Allowed Roles:** Approver, Formula Administrator, System Administrator

**Business Rules:**
- Approval is recorded with approver, timestamp, and reason
- Only Approved formulas can be activated
- Approval does not automatically activate the formula
- Approval history is retained for audit

### 4.4 Active

**Purpose:** The formula is deployed and actively evaluates against entities that match its trigger conditions.

**Allowed Actions:**
- View formula definition
- View formula usage statistics
- Create new versions (sends current to Retired)
- Test formula against real entities (read-only)

**Allowed Roles:** All roles (view), Formula Administrator (manage)

**Business Rules:**
- Only one version of a formula can be Active at any time per domain
- Active formulas are evaluated whenever their trigger conditions are met
- Formula evaluation errors are logged but do not block the entity
- Active formulas appear in formula catalogs

### 4.5 Deprecated

**Purpose:** The formula is no longer recommended for use but remains active for backward compatibility.

**Allowed Actions:**
- View formula definition
- View formula usage statistics
- Export formula definition
- Create new versions (replacement formulas)

**Allowed Roles:** All roles (view), Formula Administrator (manage)

**Business Rules:**
- Deprecated formulas continue to evaluate until no longer referenced
- A deprecation warning is shown when creating new entities that use deprecated formulas
- Deprecation date is recorded
- Deprecated formulas can be force-retired by administrators

### 4.6 Retired

**Purpose:** The formula is no longer evaluated. It is retained for historical and audit purposes.

**Allowed Actions:**
- View formula definition
- View formula usage statistics
- Export formula definition
- Restore to Active (creates new version)

**Allowed Roles:** Formula Administrator, System Administrator

**Business Rules:**
- Retired formulas are excluded from formula catalogs
- Existing entity evaluations are not retroactively changed
- Retired formulas can be referenced in audit logs and comparisons
- Restoration creates a new Active version

### 4.7 Archived

**Purpose:** The formula is moved to long-term storage. It is retained for compliance but not functional.

**Allowed Actions:**
- View formula definition (metadata only)
- Export formula definition

**Allowed Roles:** System Administrator, Audit

**Business Rules:**
- Archived formulas cannot be restored to Active status
- Archived formulas are removed from all catalogs and references
- Archival date and reason are recorded
- Archived formulas are subject to retention policy

---

## 5. Formula Categories

Formulas are organized into categories based on their purpose and behaviour. Categories determine default priority, trigger conditions, and validation rules.

### 5.1 Calculation Formulas

**Purpose:** Perform standard arithmetic, statistical, or lookup calculations on component properties.

**Characteristics:**
- Deterministic output for given inputs
- No side effects
- Fast evaluation
- Cacheable results

**Common Operations:**
- Addition, subtraction, multiplication, division
- Percentage calculations
- Per-unit calculations
- Area-based calculations
- Volume-based calculations
- Lookup table references

**Business Rules:**
- Calculation formulas must declare all input properties
- Output property must be declared and typed
- Division by zero is handled gracefully (returns configured default)
- Results are rounded according to output property configuration

### 5.2 Conditional Formulas

**Purpose:** Evaluate conditions and return different results based on the outcome.

**Characteristics:**
- Boolean logic evaluation
- Multiple branches possible
- Inputs may be optional (if not needed for current branch)
- Result type may vary by branch

**Common Patterns:**
- If-then-else evaluations
- Multi-condition switch logic
- Threshold-based selections
- Domain-specific rule engines

**Business Rules:**
- All possible output types must be declared
- Condition expressions must be evaluated against declared inputs
- Unreachable branches are flagged for review
- Default branch (else) is mandatory unless all conditions are exhaustive

### 5.3 Transformation Formulas

**Purpose:** Convert data from one format or representation to another.

**Characteristics:**
- Input and output types may differ
- May involve unit conversion, format mapping, or code translation
- Usually deterministic
- Often cached

**Common Transformations:**
- Unit conversions (sqft to sqm, etc.)
- Code mappings (internal codes to display codes)
- Format conversions (text to number, date to string)
- Aggregation (line items to summary)

**Business Rules:**
- Transformation formulas must declare input and output types
- Type mismatch generates a validation error
- Transformation chains are supported (output of one is input to another)
- Transformation formulas are evaluated lazily (only when output is needed)

### 5.4 Aggregation Formulas

**Purpose:** Combine multiple values into a summary result.

**Characteristics:**
- Operates on collections of items
- Supports grouping and filtering
- Result is typically a single value or summary structure

**Common Aggregations:**
- Sum of all line item amounts
- Average rate across items
- Count of items matching criteria
- Maximum/minimum values
- Weighted averages

**Business Rules:**
- Aggregation formulas must declare the collection type
- Filtering conditions must be declared
- Grouping dimensions must be declared
- Empty collections return configured default values

### 5.5 Lookup Formulas

**Purpose:** Retrieve pre-computed or configured values from reference data.

**Characteristics:**
- Key-based retrieval
- May involve multiple lookup tables
- Results depend on key validity

**Common Lookups:**
- Rate tables by location and date
- Multiplier tables by project size
- Tax tables by jurisdiction
- Discount tables by customer type

**Business Rules:**
- Lookup keys must be declared
- Missing key returns configured default or error
- Lookup tables are versioned
- Lookup results are cached with invalidation strategy

---

## 6. Rule Categories

Business rules are categorized by their enforcement mechanism and scope. Each category has specific evaluation timing and failure behaviour.

### 6.1 Validation Rules

**Purpose:** Ensure data integrity and compliance with business constraints.

**Characteristics:**
- Evaluated before formula execution
- Failures prevent or warn on execution
- High priority
- Must be fast

**Common Validations:**
- Required field checks
- Value range checks
- Format validations
- Cross-field consistency checks
- Existence checks (references)

**Business Rules:**
- Validation rules are evaluated in priority order
- Failures can be blocking (prevent execution) or non-blocking (warning)
- Multiple validation failures are aggregated before reporting
- Validation rules can be conditional (only apply under certain conditions)

### 6.2 Constraint Rules

**Purpose:** Enforce business policies that limit what values are allowed.

**Characteristics:**
- Evaluated during and after formula execution
- Can modify or reject values
- Medium priority
- May involve complex logic

**Common Constraints:**
- Rate ceilings and floors
- Quantity limits
- Budget caps
- Approval thresholds
- Domain-specific limits

**Business Rules:**
- Constraint rules can override formula outputs (with logging)
- Violations can trigger approval workflows
- Constraints are domain-specific
- Constraint changes create new rule versions

### 6.3 Selection Rules

**Purpose:** Determine which formulas, components, or options are available for use.

**Characteristics:**
- Evaluated during entity initialization
- Results in enable/disable of options
- Affects user experience
- Medium priority

**Common Selections:**
- Package eligibility based on budget
- Component availability by domain
- Formula applicability by entity type
- Rate table selection by location

**Business Rules:**
- Selection rules are evaluated at entity initialization
- Results are cached for the entity session
- Selection changes trigger re-evaluation of dependent formulas
- Users can override selections with justification

### 6.4 Trigger Rules

**Purpose:** Determine when formulas and engines should execute.

**Characteristics:**
- Event-driven evaluation
- Affects performance and frequency
- High impact on system behaviour
- Low priority (but early evaluation)

**Common Triggers:**
- On entity creation
- On field change
- On state transition
- On time-based schedule
- On external event

**Business Rules:**
- Trigger rules must declare their trigger events
- Multiple triggers can fire the same formula
- Trigger conditions can include context filters
- Trigger rules are evaluated before formula execution

### 6.5 Override Rules

**Purpose:** Govern when and how formula outputs can be manually overridden.

**Characteristics:**
- Evaluated when a user attempts an override
- Can approve, reject, or require justification
- High priority
- Directly affects data integrity

**Common Overrides:**
- Rate override approval
- Quantity override justification
- Category override validation
- Manual item override limits

**Business Rules:**
- Override rules define who can override and under what conditions
- All overrides require justification
- Override authority is role-based
- Override rules are audited

---

## 7. Conditional Rules

Conditional rules determine whether a formula or constraint should be applied based on the current context. Conditions are evaluated dynamically at runtime.

### 7.1 Condition Types

| Condition Type | Description | Example |
|----------------|-------------|---------|
| **Entity State** | Based on the entity's current state | Only apply if estimate is "Approved" |
| **User Role** | Based on the acting user's role | Only allow override if user is "Admin" |
| **Field Value** | Based on a specific field's value | Apply if quantity > 100 |
| **Date/Time** | Based on date or time conditions | Apply only during promotion period |
| **External Data** | Based on external system data | Apply if material rate changed |
| **Composite** | Combination of multiple conditions | Apply if (state = Approved) AND (role = Admin) |
| **Custom** | User-defined condition logic | Apply if custom business logic evaluates to true |

### 7.2 Condition Evaluation

**Business Rules:**
- Conditions are evaluated lazily (only when needed)
- Condition results are cached with appropriate invalidation
- Condition evaluation failures are treated as "false" (rule does not apply)
- Circular condition references are detected and rejected
- Conditions can reference formula outputs as inputs

### 7.3 Condition Context

Each condition has access to a rich context including:

| Context Element | Description |
|-----------------|-------------|
| **Entity** | The entity being evaluated (estimate, BOQ, etc.) |
| **Entity State** | Current state and status |
| **User** | Acting user with role and permissions |
| **Environment** | System environment, date, configuration |
| **Related Entities** | Referenced entities (packages, materials, etc.) |
| **Formula Results** | Outputs of previously evaluated formulas |
| **Rule History** | Past rule evaluations and outcomes |
| **External Data** | Latest data from integrated systems |

**Business Rules:**
- Context is assembled at evaluation time
- Context elements are typed (prevents type errors)
- Missing context elements cause condition evaluation to fail (false)
- Context assembly is optimized for performance

---

## 8. Dependency Rules

Dependency rules define the order in which formulas and components must be evaluated, based on their input-output relationships.

### 8.1 Dependency Declaration

Each formula declares:
- **Input Properties** — properties it reads to compute its result
- **Output Properties** — properties it writes to
- **Explicit Dependencies** — other formulas it depends on
- **Implicit Dependencies** — inferred from input/output property overlap

**Business Rules:**
- All input properties must be declared
- Output properties must not be declared as inputs of the same formula (self-reference)
- Implicit dependencies are detected and can be made explicit
- Circular dependencies are detected and rejected

### 8.2 Dependency Resolution

The engine resolves the evaluation order using a topological sort of all declared dependencies.

**Process:**
1. Collect all formulas matching the current context
2. Build a dependency graph from declared and inferred dependencies
3. Perform topological sort to determine evaluation order
4. Detect and report circular dependencies
5. Evaluate formulas in resolved order

**Business Rules:**
- The dependency graph is rebuilt whenever formulas change
- Evaluation order is logged for audit
- Partial evaluation is supported (evaluate only a subset)
- Dependency resolution is cached with invalidation on formula changes

### 8.3 Dependency Validation

| Validation Check | Rule |
|------------------|------|
| **No Circular Dependencies** | A → B → C → A is rejected |
| **Input Availability** | All declared inputs must be available before formula execution |
| **No Duplicate Outputs** | Two formulas cannot write to the same output property for the same entity |
| **No Implicit Overriding** | A formula cannot silently override another's output |
| **Dependency Completeness** | All transitive dependencies must be declared or inferable |

**Business Rules:**
- Dependency validation runs whenever a formula is activated or modified
- Validation failures prevent formula activation
- Users can view the full dependency graph
- Dependency graphs are version-specific

### 8.4 Cross-Engine Dependencies

Formulas and rules from different engines can depend on each other:

| Dependency | From Engine | To Engine | Resolution |
|------------|-------------|-----------|------------|
| Formula output → Rule condition | Formula | Rule | Rule waits for formula evaluation |
| Rule override → Formula input | Rule | Formula | Formula uses overridden value |
| Formula trigger → Rule action | Formula | Rule | Rule executes after formula |
| Rule constraint → Formula output | Rule | Formula | Formula checks constraint before output |

**Business Rules:**
- Cross-engine dependencies must be explicitly declared
- The engine scheduler coordinates evaluation across engines
- Cross-engine dependency cycles are detected and rejected

---

## 9. Component Relationships

Component relationships define how formulas interact with the component registry, determining which formulas apply to which components, in what order, and with what constraints.

### 9.1 Formula-to-Component Mapping

Formulas are associated with components through metadata mappings:

| Mapping Type | Description |
|--------------|-------------|
| **Direct** | Formula applies to a specific component type |
| **Inherited** | Formula applies to components that inherit from a base type |
| **Scoped** | Formula applies to components within a specific domain |
| **Conditional** | Formula applies based on component properties or context |
| **Pattern-Based** | Formula applies to components matching a pattern or tag |

**Business Rules:**
- A formula can map to multiple components
- A component can have multiple formulas
- Mappings are evaluated at formula registration time
- Mapping changes create new formula versions

### 9.2 Relationship Resolution

The engine resolves component relationships at evaluation time based on:

| Factor | Description |
|--------|-------------|
| **Component Type** | The registered type of the component |
| **Domain** | The business domain context |
| **Entity State** | The current state of the entity |
| **User Role** | The role of the acting user |
| **Time** | Current date/time and configured time windows |
| **External Context** | Data from integrated systems |

**Business Rules:**
- Relationship resolution considers all factors simultaneously
- Conflicting relationship assignments are resolved by priority
- Relationship resolution is logged for audit
- Users can force specific relationship assignments with justification

### 9.3 Relationship Change Detection

When component relationships change:

**Business Rules:**
- Relationship changes trigger re-evaluation of affected formulas
- Only directly affected relationships trigger re-evaluation
- Relationship change history is maintained
- Relationship changes are logged as business events

### 9.4 Relationship Inheritance

Components can inherit relationships from parent components or domain configurations.

**Business Rules:**
- Inherited relationships can be overridden by component-specific relationships
- Inheritance chains are tracked and logged
- Circular inheritance is detected and rejected
- Inheritance is domain-scoped

---

## 10. Formula Priority

Formula priority determines the order of evaluation when multiple formulas target the same output or when formulas compete for resources.

### 10.1 Priority Levels

| Priority Level | Description | Behavior |
|----------------|-------------|----------|
| **Critical** (1) | Must be evaluated first; failure blocks evaluation | Highest precedence |
| **High** (2) | Important formulas that should run before others | Overrides many |
| **Medium** (3) | Standard priority; runs in declared order | Default |
| **Low** (4) | Optional or supplementary formulas | Runs after medium |
| **Background** (5) | Non-critical; runs asynchronously or on-demand | Lowest precedence |

### 10.2 Priority Assignment

Priority is assigned through multiple mechanisms:

| Mechanism | Description | Override |
|-----------|-------------|----------|
| **Category Default** | Each formula category has a default priority | Yes |
| **Domain Config** | Domain settings override category defaults | Yes |
| **Explicit Declaration** | Formula creator sets priority | Yes |
| **Conflict Resolution** | System assigns priority for conflicting outputs | No |
| **Temporal** | Priority changes based on time/date | Yes |
| **User Role** | Priority varies by user role | Yes |

**Business Rules:**
- Explicit declaration overrides all other mechanisms
- Conflicting outputs are resolved by priority (higher priority wins)
- Priority conflicts are logged
- Users can view the effective priority of each formula

### 10.3 Priority Conflicts

When two formulas with the same output target and different priorities are both applicable:

**Resolution Process:**
1. Higher priority formula is evaluated first
2. Its output is recorded
3. Lower priority formula is evaluated
4. If both produce results, lower priority result is discarded (with logging)
5. If lower priority formula has an error, higher priority result is used (with warning)

**Business Rules:**
- Priority conflicts do not block evaluation
- The discarded result is logged with reason
- Users can configure conflict resolution behavior per formula category
- Conflict reports are available in the formula management interface

### 10.4 Dynamic Priority

Priority can change dynamically based on context:

| Condition | Priority Change |
|-----------|-----------------|
| Entity is "Approved" | Critical formulas become Background |
| User lacks role | Priority reduced by 1 level |
| Outside business hours | Priority reduced by 2 levels |
| System under load | Non-critical formulas deferred |
| Emergency override activated | Only Critical formulas run |

**Business Rules:**
- Dynamic priority is evaluated at runtime, not at registration
- Priority changes are logged
- Users can view the effective priority in real-time
- Dynamic priority rules are domain-configurable

---

## 11. Override Behaviour

Overrides allow users to manually set values that would normally be computed by formulas. The override system ensures that overrides are controlled, audited, and reversible.

### 11.1 Override Types

| Override Type | Description | Formula Impact |
|---------------|-------------|----------------|
| **Hard Override** | Formula is completely bypassed | Formula output is ignored |
| **Soft Override** | Formula runs but output is replaced | Formula result is logged but not used |
| **Conditional Override** | Formula runs but output is modified | Formula result is adjusted by override rule |
| **Suggestion Override** | Formula output is a suggestion; user choice | User can accept or modify formula output |

**Business Rules:**
- Hard overrides require the highest authority level
- Soft overrides require medium authority
- Conditional overrides follow rule engine logic
- Suggestion overrides require no special authority

### 11.2 Override Workflow

When a user attempts to override a formula-computed value:

1. System flags the field as overridden
2. System prompts for override reason (mandatory)
3. Override authority is checked against the formula's override rules
4. If authorized, the override is applied
5. If not authorized, an approval workflow is triggered
6. All steps are logged

**Business Rules:**
- Override reasons must be at least 10 characters
- Authority checks are dynamic (based on user's current role)
- Approval workflows are logged as separate events
- Users can view override history for any field

### 11.3 Override Propagation

Overrides can propagate to dependent formulas:

| Propagation Type | Description |
|------------------|-------------|
| **Direct** | Override of an input to formula B propagates to formula B's output |
| **Indirect** | Override affects formula B's output, which is input to formula C, so formula C's output changes |
| **None** | Override is local and does not affect other formulas |
| **Selective** | Override propagates only under certain conditions |

**Business Rules:**
- Override propagation is declared in formula metadata
- Users can view the propagation chain
- Circular propagation is detected and broken
- Propagation is logged

### 11.4 Override Authority

Override authority is role-based and formula-specific:

| Role | Can Hard Override | Can Soft Override | Can Conditional Override | Can Suggestion Override |
|------|-------------------|-------------------|--------------------------|------------------------|
| Estimator | No | No | Yes (own estimates) | Yes |
| Engineer | No | Yes | Yes | Yes |
| Sales | No | No | No | Yes |
| Owner | Yes | Yes | Yes | Yes |
| Approver | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes |

---

## 12. Formula Validation

Formula validation ensures that formulas are syntactically correct, semantically valid, and safe to execute. Validation occurs at multiple stages throughout the formula lifecycle.

### 12.1 Validation Stages

| Stage | When | What is Validated | Action on Failure |
|-------|------|-------------------|-------------------|
| **Definition** | When formula is first saved | Syntax, property declarations, references | Saved as Draft (invalid) |
| **Activation** | When formula is activated | All validation rules | Activation blocked |
| **Pre-Evaluation** | Before each evaluation | Input availability, context validity | Evaluation skipped, warning logged |
| **Post-Evaluation** | After each evaluation | Output type, range, constraints | Error logged, output reverted |
| **Periodically** | Scheduled (daily/weekly) | All checks + consistency | Report generated, admin notified |

### 12.2 Validation Checks

| Check Category | Validation |
|----------------|-----------|
| **Syntax** | Formula logic is well-formed and parseable |
| **Structure** | Inputs and outputs are declared, no self-references |
| **References** | All referenced components, properties, and formulas exist |
| **Types** | Input/output types are compatible |
| **Dependencies** | No circular dependencies, all dependencies declared |
| **Constraints** | Output passes constraint rules |
| **Permissions** | User has permission to use this formula |
| **Domain** | Formula is applicable to the current domain |
| **Performance** | Formula execution time is within acceptable limits |
| **Security** | Formula does not access unauthorized data |

**Business Rules:**
- All validation checks are metadata-driven (configurable thresholds)
- Failed validations provide actionable error messages
- Validation results are cached for performance
- Validation failures do not corrupt existing data

### 12.3 Validation Reporting

Validation results are reported through multiple channels:

| Report Type | Audience | Detail Level |
|-------------|----------|--------------|
| **Real-time** | Formula creator | Immediate, detailed |
| **Summary** | Formula administrator | Daily/weekly summary |
| **Detailed** | System administrator | Full report with traces |
| **Compliance** | Audit team | All validations over retention period |

**Business Rules:**
- Real-time validation provides instant feedback
- Summary reports group errors by type and frequency
- Detailed reports include full execution traces
- Compliance reports are immutable and retention-governed

---

## 13. Formula Testing

Formula testing allows validation of formula behaviour using simulated inputs and known scenarios before deployment.

### 13.1 Testing Methods

| Method | Description | When to Use |
|--------|-------------|-------------|
| **Unit Test** | Test a single formula with mock inputs | Development and validation |
| **Integration Test** | Test a formula within its dependency chain | Pre-activation |
| **Scenario Test** | Test a formula with realistic entity data | Pre-deployment |
| **Regression Test** | Re-run previous tests to ensure no breakage | Post-change |
| **Performance Test** | Test formula execution time and resource usage | Pre-production |

### 13.2 Test Cases

Each test case defines:

| Field | Description | Required |
|-------|-------------|----------|
| **Test Name** | Descriptive name | Yes |
| **Test Type** | Unit, Integration, Scenario, Regression, Performance | Yes |
| **Inputs** | Mock input values | Yes |
| **Expected Output** | Expected formula result | Yes |
| **Context** | Entity state, user role, environment | Conditional |
| **Priority** | Execution priority | No (defaults to Medium) |
| **Tags** | Classification tags | No |

**Business Rules:**
- Test cases must declare all required inputs
- Expected output must match the formula's output type
- Tests can be run in isolation (unit) or with dependencies (integration)
- Test results are stored and compared across runs
- Failed tests block formula activation

### 13.3 Simulation Mode

Simulation mode allows testing formula behaviour without affecting real data.

**Features:**
- Mock inputs can be provided manually or generated from patterns
- Real entity data can be used (read-only) for realistic testing
- Results are compared against expected outputs
- Performance metrics are collected
- Simulation can be run for any formula in any lifecycle stage

**Business Rules:**
- Simulation does not modify any real data
- Simulation can be saved as a test case
- Simulation results are not included in production calculations
- Simulation is available to all roles (with read access to the formula)

---

## 14. Formula Versioning

Formulas are versioned to maintain a history of changes and ensure reproducibility. Each version is immutable and traceable.

### 14.1 Version Creation

| Trigger | Version Increment | Requires Reason |
|---------|-------------------|-----------------|
| New formula definition | 1.0.0 | Yes |
| Property change (addition/removal) | MAJOR | Yes |
| Property change (default value only) | PATCH | Yes |
| Logic change | MAJOR | Yes |
| Priority change | PATCH | Yes |
| Dependency change | MINOR | Yes |
| Trigger condition change | MINOR | Yes |
| Override rule change | PATCH | Yes |
| Category change | MAJOR | Yes |
| Domain scope change | MAJOR | Yes |
| Description only change | PATCH | No |
| Tag addition/removal | PATCH | No |

**Business Rules:**
- All version changes are tracked
- Version numbers follow semantic versioning (MAJOR.MINOR.PATCH)
- The reason for each version change is mandatory
- Only one version of a formula can be Active per domain
- Previous versions remain accessible but inactive

### 14.2 Version History

Each formula maintains a complete version history:

| Field | Description |
|-------|-------------|
| **Version Number** | Semantic version |
| **Created By** | User who created this version |
| **Created At** | Timestamp (UTC) |
| **Change Reason** | User-provided justification |
| **Change Type** | What kind of change (logic, property, etc.) |
| **Affected Properties** | List of properties that changed |
| **Status** | Active, Deprecated, Retired, Archived |
| **Deployed To** | Environments where this version is active |

**Business Rules:**
- Version history is immutable
- Users can view any version's definition
- Version history is included in formula exports
- Version history is subject to retention policy (7 years)

### 14.3 Version Rollback

Users can roll back to a previous formula version:

**Process:**
1. Select target version from history
2. System creates a new version that restores the target version's logic
3. New version gets incremented version number
4. New version becomes Active (old version remains accessible)

**Business Rules:**
- Rollback creates a new version (history is never overwritten)
- Rollback reason is mandatory
- Rollback is logged
- Rolled-back formulas can be immediately tested

---

## 15. Formula Templates

Formula templates are pre-configured formula definitions that can be quickly customized and deployed. Templates accelerate formula creation and ensure consistency.

### 15.1 Template Categories

| Template Category | Description | Example Use |
|-------------------|-------------|-------------|
| **Standard Calculation** | Pre-built arithmetic and percentage formulas | Material cost = qty × rate |
| **Conditional Switch** | Multi-branch conditional logic | Rate based on quantity tier |
| **Lookup Table** | Key-based value retrieval | Rate by location and date |
| **Aggregation** | Collection aggregation patterns | Summing line items |
| **Unit Conversion** | Standard unit conversions | sqft to sqm |
| **Tax Calculation** | Tax computation patterns | Multi-tier GST |
| **Discount Engine** | Discount application patterns | Volume discounts |
| **Custom** | User-defined template structure | Any custom pattern |

**Business Rules:**
- Templates are domain-specific or global
- Templates can be subclassed (inherit and customize)
- Template changes do not affect already-created formulas
- Templates can be versioned independently

### 15.2 Template Customization

When a formula is created from a template:

**Customizable Elements:**
- Input property names and types
- Output property name and type
- Calculation parameters (multipliers, offsets, thresholds)
- Condition expressions
- Priority and category
- Domain scope

**Non-Customizable Elements:**
- Overall formula structure (template logic)
- Core algorithm patterns
- Standard validation checks

**Business Rules:**
- Customization options are defined per template
- Over-customization triggers a warning
- Templates document which elements are customizable
- Customization history is tracked

### 15.3 Template Publishing

Templates can be published to make them available for use:

| Status | Description | Available For |
|--------|-------------|---------------|
| **Draft** | Template is being defined | Creator only |
| **Published** | Template is available for new formulas | All authorized users |
| **Deprecated** | Template is no longer recommended | Existing formulas only |
| **Retired** | Template is no longer available | Not available (existing formulas unaffected) |

**Business Rules:**
- Published templates can be used immediately
- Deprecated templates show a warning when used
- Retired templates cannot be used for new formulas
- Template status changes are logged

---

## 16. Dynamic Formula Selection

Dynamic formula selection enables the engine to choose the appropriate formula based on the current context, entity state, and business conditions — all without hard-coded logic.

### 16.1 Selection Criteria

The engine evaluates selection criteria to determine which formula to apply:

| Criterion | Description | Example |
|-----------|-------------|---------|
| **Entity Type** | The type of entity being processed | Estimate vs. Revision |
| **Domain** | The business domain | Construction vs. Solar |
| **Entity State** | The current state of the entity | Draft, Approved, Shared |
| **User Role** | The role of the acting user | Estimator, Owner, Admin |
| **Time Context** | Date, time, business calendar | Promotion period, off-hours |
| **External Data** | Data from integrated systems | Material rate updates |
| **Property Values** | Values of entity properties | Budget exceeds threshold |
| **Previous Results** | Results of prior formula evaluations | Previous calculation exceeded limit |

### 16.2 Selection Process

1. Engine collects all formulas matching the entity's component type and domain
2. Engine filters formulas based on selection criteria (entity state, user role, time, etc.)
3. Engine evaluates remaining formulas' condition expressions
4. Engine selects the highest-priority formula that passes all criteria
5. If multiple formulas tie, the one with the most specific criteria wins
6. If no formula matches, the default (if configured) or none is used

**Business Rules:**
- Selection criteria are metadata-driven
- The selection process is logged for audit
- Users can view which formula was selected and why
- Selection can be overridden by authorized users with justification
- The default formula (if any) is applied when no other formula matches

### 16.3 Selection Priority

When multiple formulas match the selection criteria:

| Priority Factor | Weight |
|-----------------|--------|
| **Explicit Priority** | 40% |
| **Specificity** | 25% |
| **Recency** | 15% |
| **User Trust** | 10% |
| **Performance** | 10% |

**Business Rules:**
- The weighting is configurable per domain
- Users can view the selection score for each formula
- Selection scores are logged
- Users can force a specific formula with override authority

---

## 17. Formula Audit

The Formula Engine maintains a complete audit trail of all formula evaluations, changes, overrides, and system decisions.

### 17.1 Auditable Events

| Event | Trigger | Audit Entry |
|-------|---------|-------------|
| Formula Created | New formula saved | AUD-FORMULA-001 |
| Formula Activated | Formula set to Active | AUD-FORMULA-002 |
| Formula Deactivated | Formula deprecated/retired | AUD-FORMULA-003 |
| Formula Modified | Formula logic or properties changed | AUD-FORMULA-004 |
| Formula Rolled Back | Reverted to previous version | AUD-FORMULA-005 |
| Formula Evaluated | Formula ran on an entity | AUD-FORMULA-006 |
| Formula Error | Formula evaluation failed | AUD-FORMULA-007 |
| Override Applied | User overrode formula output | AUD-FORMULA-008 |
| Override Rejected | Override attempt denied | AUD-FORMULA-009 |
| Formula Selection | Dynamic formula selection occurred | AUD-FORMULA-010 |
| Formula Test Run | Test/scenario run executed | AUD-FORMULA-011 |
| Formula Template Used | New formula created from template | AUD-FORMULA-012 |
| Formula Version Created | New version of formula | AUD-FORMULA-013 |

### 17.2 Audit Entry Structure

Each audit entry for formula events contains:

| Field | Description |
|-------|-------------|
| **Event ID** | Unique identifier |
| **Event Type** | Formula event type |
| **Timestamp** | UTC, ISO 8601 |
| **Actor** | User who triggered the event |
| **Entity** | Affected entity (estimate ID, BOQ item ID, etc.) |
| **Formula ID** | Formula that was involved |
| **Formula Version** | Specific version of the formula |
| **Inputs** | Values used for evaluation (truncated for large inputs) |
| **Output** | Computed or overridden value |
| **Execution Time** | Duration of formula evaluation |
| **Context** | Selection context, user role, entity state |
| **Reason** | User-provided justification |
| **Correlation ID** | Links related events |
| **Outcome** | Success, error, skipped, overridden |

### 17.3 Formula Simulation Auditing

| Aspect | Recording |
|--------|-----------|
| Simulation requests | Logged with user, timestamp, formula |
| Simulation inputs | Stored in full |
| Simulation outputs | Stored |
| Simulation results | Pass/fail, deviation from expected |
| Simulation performance | Execution time, resource usage |

**Business Rules:**
- All formula audit data is immutable
- Audit data is retained for 7 years (per retention policy)
- Audit data includes sufficient context for forensic reconstruction
- Audit data does not include personally identifiable information beyond user ID
- Audit queries support filtering by formula, entity, user, date range, and outcome

---

## 18. Formula Simulation

Formula simulation allows testing and validating formula behaviour against real-world data and hypothetical scenarios before deployment.

### 18.1 Simulation Types

| Type | Description | Input Source |
|------|-------------|--------------|
| **Unit Simulation** | Test a single formula in isolation | Manual or generated mock inputs |
| **Chain Simulation** | Test a formula with its dependency chain | Mock inputs for all dependencies |
| **Full Estimate Simulation** | Test all formulas for a complete entity | Real or mock entity data |
| **Historical Simulation** | Test a formula against past entity data | Historical entity data |
| **Stress Simulation** | Test formula under extreme conditions | Generated edge-case inputs |
| **Regression Simulation** | Re-run previous simulations after formula change | Previous simulation inputs and expected outputs |

### 18.2 Simulation Context

Simulation provides a controlled environment with configurable context:

| Context Element | Configurable | Description |
|-----------------|-------------|-------------|
| **Entity State** | Yes | Draft, Active, Locked, Finalized |
| **User Role** | Yes | Estimator, Owner, Admin, etc. |
| **Domain** | Yes | Construction, Interior, Solar, etc. |
| **Date/Time** | Yes | Current timestamp for time-based rules |
| **External Data** | Yes | Mock external system responses |
| **Environment** | Yes | Production, Staging, Development |

**Business Rules:**
- Simulation does not affect real data or formula state
- Simulation results are stored for comparison
- Simulation can be run by any user with formula read access
- Simulation performance metrics are collected

### 18.3 Simulation Results

Each simulation run produces:

| Output | Description |
|--------|-------------|
| **Execution Log** | Step-by-step formula evaluation trace |
| **Output Value** | The computed result |
| **Validation Results** | All validation checks and their outcomes |
| **Performance Metrics** | Execution time, memory usage, dependencies resolved |
| **Comparison** | Diff against expected output or previous runs |
| **Warnings** | Non-critical issues (deprecation, low confidence) |
| **Errors** | Critical issues that prevented successful execution |

**Business Rules:**
- Simulation results are stored and can be compared across runs
- Failed simulations are flagged with detailed error information
- Simulation can be saved as a test case
- Simulation results include sufficient detail for debugging

---

## 19. Future AI Formula Suggestions

The Formula Engine is designed to support future AI-powered formula suggestions and optimization.

### 19.1 AI-Generated Formula Suggestions

**Purpose:** AI analyzes historical estimate data, successful formulas, and industry patterns to suggest new formulas or improvements to existing ones.

**Planned Capabilities:**
- **Pattern Recognition:** AI identifies recurring calculation patterns in historical data
- **Anomaly Detection:** AI flags unusual formula outputs or override patterns
- **Optimization Suggestions:** AI suggests formula simplifications or performance improvements
- **Gap Analysis:** AI identifies missing formulas in a domain or use case
- **Best Practice Recommendations:** AI suggests industry-standard formulas for common scenarios

**AI Formula Attributes:**
- Confidence score (0% to 100%)
- Source evidence (historical data, industry benchmarks, peer data)
- Impact assessment (cost, time, accuracy improvement)
- Risk assessment (potential negative consequences)
- Implementation guidance

**Business Rules:**
- AI suggestions are displayed as recommendations, not mandates
- All AI suggestions require user review and acceptance
- AI confidence below a threshold requires additional approval
- AI suggestion history is logged and auditable
- AI can be enabled/disabled per domain

### 19.2 AI-Powered Testing

**Purpose:** AI generates comprehensive test cases and scenarios for formula validation.

**Planned Capabilities:**
- **Edge Case Generation:** AI produces edge-case inputs that are likely to break formulas
- **Regression Coverage:** AI identifies gaps in existing test coverage
- **Performance Profiling:** AI predicts formula performance under various loads
- **Cross-Domain Testing:** AI tests formulas against scenarios from other domains

**Business Rules:**
- AI-generated tests are clearly marked as AI-generated
- AI test results are stored separately from user-created tests
- Users can accept, reject, or modify AI-generated tests
- AI test generation is opt-in per formula

### 19.3 AI Integration Points

| Integration Point | Current State | Future AI State |
|-------------------|---------------|-----------------|
| Formula Creation | Manual/template | AI suggests formula for use case |
| Formula Optimization | Manual tuning | AI identifies optimization opportunities |
| Test Case Generation | User-created | AI generates edge cases and scenarios |
| Dependency Analysis | Static analysis | AI predicts impact of dependency changes |
| Priority Assignment | Static priority | AI dynamically adjusts based on usage patterns |
| Override Analysis | Manual review | AI detects anomalous overrides |
| Selection Logic | Rule-based | AI learns optimal formula selection |
| Performance Tuning | Manual profiling | AI predicts and prevents performance issues |

---

## 20. Future No-Code Formula Builder

The Formula Engine is designed to eventually support a no-code formula builder that allows business users to create, test, and deploy formulas without any technical expertise.

### 20.1 Visual Formula Builder

**Purpose:** A drag-and-drop interface for creating formulas using pre-built blocks representing common operations, conditions, and data sources.

**Planned Capabilities:**
- **Block Library:** Pre-built blocks for calculations, conditions, lookups, aggregations
- **Drag-and-Drop Canvas:** Visual workspace for assembling formula logic
- **Real-time Preview:** Live preview of formula output as blocks are assembled
- **Validation Feedback:** Immediate feedback on formula validity
- **Template Browser:** Browse and use pre-built formula templates

### 20.2 Natural Language Formula Entry

**Purpose:** Users can describe a formula in natural language, and the system converts it to a structured formula definition.

**Planned Capabilities:**
- **NL-to-Formula:** "Calculate material cost as quantity times rate, plus 10% wastage"
- **Context Understanding:** Understands domain-specific terminology
- **Ambiguity Resolution:** Asks clarifying questions for ambiguous inputs
- **Learning:** Improves over time based on user corrections
- **Multi-language:** Support for multiple natural languages

### 20.3 Collaborative Formula Development

**Purpose:** Multiple users can collaborate on formula creation, testing, and refinement.

**Planned Capabilities:**
- **Branching:** Create alternative formula versions for A/B testing
- **Comments:** Add comments and notes to formula blocks
- **Suggestions:** Team members can suggest changes to formulas
- **Approval Workflow:** Changes go through approval before deployment
- **Version Compare:** Visual diff of formula changes

### 20.4 Business Rules for No-Code Builder

**Business Rules:**
- All no-code-built formulas must pass the same validation as code-built formulas
- Business users can build formulas within their authorized domain scope only
- No-code formulas are subject to the same versioning, testing, and audit requirements
- No-code formula blocks are themselves metadata (configurable)
- The no-code builder does not bypass any security or validation checks

---

*End of Document*
