# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02
**Title:** UI/UX Specification
**Phase:** Phase 10D
**Date:** August 2026
**Author:** AI Software Architect
**Status:** Phase 10D (UI/UX Design)

---

## 1. Information Architecture

The Estimate Engine UI is organised around user goals and tasks. The architecture is role-aware — each role sees the sections relevant to their work.

### 1.1 Navigation Structure

```
Dashboard
├── Estimates
│   ├── All Estimates
│   ├── My Estimates
│   ├── Pending Approval
│   └── Estimate Builder
├── BOQ
│   ├── All BOQs
│   └── BOQ Builder
├── Packages
│   ├── Package Catalog
│   └── Package Builder
├── Components
│   ├── Component Library
│   └── Component Categories
├── Pricing
│   ├── Pricing Rules
│   ├── Formulas
│   ├── Formula Builder
│   └── Simulations
├── Approvals
│   ├── My Approvals
│   └── Approval History
├── Customers
│   ├── Customer List
│   └── Customer Profile
├── Projects
│   └── Project List
├── Reports
│   ├── Estimates Report
│   ├── Pricing Report
│   └── Audit Report
└── Settings
    ├── General
    ├── Roles & Permissions
    ├── Templates
    └── Integrations
```

### 1.2 Role-Based Navigation

| Role | Primary Sections |
|------|------------------|
| **Estimator** | Dashboard, Estimates, BOQ, Components |
| **Engineer** | Dashboard, Estimates, BOQ, Pricing |
| **Sales** | Dashboard, Estimates (read), Customers, Packages |
| **Approver** | Dashboard, Approvals, Estimates (review) |
| **Formula Admin** | Dashboard, Pricing, Formulas, Simulations |
| **Admin** | All sections |

---

## 2. Navigation

### 2.1 Navigation Patterns

| Pattern | Usage |
|---------|-------|
| **Sidebar** | Desktop — persistent primary navigation |
| **Top Bar** | Desktop — global actions, search, profile |
| **Breadcrumbs** | All — location context |
| **Tabs** | Detail pages — section switching |
| **Bottom Nav** | Mobile — primary actions |
| **Overflow Menu** | Mobile — secondary actions |

### 2.2 Navigation Rules

- Current section is always highlighted
- Breadcrumbs show full path
- Deep links are supported everywhere
- Navigation state is preserved on refresh
- Unsaved changes trigger confirmation on navigation

---

## 3. Dashboard

### 3.1 Dashboard Components

| Component | Content |
|-----------|---------|
| **KPI Cards** | Total estimates, pending approval, conversion rate, average value |
| **Status Chart** | Estimate counts by status |
| **Recent Estimates** | Latest estimates with status |
| **Approval Queue** | Items awaiting my approval |
| **Activity Feed** | Recent estimate events |
| **Quick Actions** | New estimate, new BOQ, find customer |

### 3.2 Dashboard Rules

- KPIs are configurable per role
- Date range filter (7d, 30d, 90d, custom)
- Click-through from KPI to filtered list
- Dashboard is read-only (no editing)

---

## 4. Estimate Builder

### 4.1 Builder Layout

The Estimate Builder is a three-panel workspace:

```
┌─────────────┬────────────────────┬─────────────┐
│ Customer &  │    Estimate        │  Totals &   │
│ Scope Panel │    Content Panel   │  Summary    │
│             │    (BOQ, Items,    │  Panel      │
│             │    Pricing)        │             │
└─────────────┴────────────────────┴─────────────┘
```

| Panel | Content |
|-------|---------|
| **Left Panel** | Customer, project, package selection, estimate details |
| **Centre Panel** | BOQ items, quantities, rates, component selection |
| **Right Panel** | Live totals, taxes, discounts, margin, status |

### 4.2 Builder Features

- **Live calculation** — totals update instantly on any change
- **Inline editing** — quantities and rates editable in table
- **Component picker** — search and select components
- **Package switcher** — switch base package (warning on changes)
- **Override indicator** — overridden fields are visually flagged
- **Version indicator** — current version number always visible
- **Validation panel** — field-level validation with inline messages

### 4.3 Builder States

| State | Behaviour |
|-------|-----------|
| **Draft** | All fields editable, no locks |
| **Submitted** | Read-only, shows "Pending Approval" banner |
| **In Review** | Read-only, shows reviewer identity |
| **Approved** | Read-only, approval details visible |
| **Shared** | Read-only, share links visible |
| **Rejected** | Editable, rejection reason visible |
| **Expired** | Read-only, expiry notice visible |

---

## 5. Pricing Screen

### 5.1 Pricing Configuration

The Pricing screen manages pricing components and rules without hard-coding any component type (Material, Labour, GST, Discount, Margin, Transport are all generic entries).

| Section | Content |
|---------|---------|
| **Component List** | All pricing components with type, status, effective dates |
| **Pricing Rules** | Rules governing pricing behaviour |
| **Priority Map** | Visual priority ordering of formulas |
| **Calculation Preview** | Simulated calculation with current rules |
| **Version History** | Changes to pricing configuration |

### 5.2 Pricing Screen Features

- Add new pricing components without code
- Configure component properties dynamically
- Set priority ordering via drag-and-drop
- Preview calculation impact before saving
- Compare current vs previous pricing configurations

---

## 6. Formula Builder

The Formula Builder is a visual workspace for defining formulas.

### 6.1 Builder Modes

| Mode | Description | User |
|------|-------------|------|
| **Visual Builder** | Drag-and-drop blocks | Business users |
| **Structured Editor** | Form-based editing | Advanced users |
| **JSON Editor** | Raw metadata editing | Technical users |

### 6.2 Visual Builder Canvas

```
┌────────────────────────────────────────┐
│ Formula: Material Cost                 │
│ ┌──────────┐                          │
│ │ Quantity │──┐                       │
│ └──────────┘  │  ┌──────────────┐     │
│               ├→ │   Multiply   │→ out│
│ ┌──────────┐  │  └──────────────┘     │
│ │ Rate     │──┘                       │
│ └──────────┘                          │
└────────────────────────────────────────┘
```

### 6.3 Builder Features

- **Block Palette** — calculation, condition, lookup, aggregation blocks
- **Connections** — drag to connect inputs to outputs
- **Live Preview** — sample values update result in real-time
- **Validation** — inline errors on invalid connections
- **Version History** — compare formula versions
- **Test Panel** — run test cases directly from builder
- **Simulation** — run simulation and view results

### 6.4 Builder Rules

- Formula must be named and categorised
- All inputs/outputs must be declared
- Circular connections are blocked
- Formula must pass validation before activation
- Builder supports all lifecycle actions (Draft → Validated → Approved → Active)

---

## 7. BOQ Screen

### 7.1 BOQ Layout

```
┌─────────────────────────────────────────────┐
│ BOQ: Ground Floor — Status: Draft          │
├──────────────┬───────┬───────┬─────────────┤
│ Description  │ Qty   │ Unit  │ Rate        │
│ Item 1       │ 100   │ sqft  │ ₹45         │
│ Item 2       │ 50    │ nos   │ ₹1,200      │
│ ...          │       │       │             │
├──────────────┴───────┴───────┴─────────────┤
│ Add Item │ Import │ Export │ Freeze │ Lock │
└─────────────────────────────────────────────┘
```

### 7.2 BOQ Features

- **Editable Table** — inline editing of items
- **Bulk Add** — paste rows or import from file
- **Component Picker** — choose from component library
- **Category Filter** — filter items by category
- **Item Types** — mandatory, optional, auto-generated, manual indicators
- **Validation** — quantity/rate errors shown inline
- **Freeze/Lock** — state controls with confirmation

### 7.3 BOQ States

| State | Editing | Rules |
|-------|---------|-------|
| **Draft** | Full editing | Items can be added/removed/modified |
| **Reviewed** | Restricted | Requires Engineer review |
| **Frozen** | Read-only | Must be unfrozen by authorised user |
| **Locked** | Read-only | Cannot be changed |

---

## 8. Version Screen

### 8.1 Version History View

- List of all versions with number, date, author, change type
- Timeline visualisation of version evolution
- Each version expandable to view summary of changes
- Version comparison available between any two versions

### 8.2 Version Comparison

```
┌──────────┬──────────────┬──────────────┐
│ Field    │ Version 1.2  │ Version 1.3  │
├──────────┼──────────────┼──────────────┤
│ Rate     │ ₹45          │ ₹48          │
│ Qty      │ 100          │ 100          │
│ Total    │ ₹4,500       │ ₹4,800       │
└──────────┴──────────────┴──────────────┘
```

### 8.3 Version Actions

- **Compare** — choose any two versions
- **Restore** — create new version from historical
- **Export** — export any version
- **View Audit** — see audit trail for version changes

---

## 9. Approval Screen

### 9.1 Approval Queue

- List of items awaiting my approval
- Filters: estimate, formula, BOQ, package
- Sort by priority, age, value
- Inline summary of what changed

### 9.2 Approval Detail

- Full document view (read-only)
- Change summary (what is being approved)
- Comparison against previous version
- Decision panel (Approve / Reject / Return)
- Mandatory reason field for reject/return
- Approval history timeline

### 9.3 Approval Rules

- Approver cannot approve own submission
- Decision requires reason for rejection
- Duplicate decisions are blocked
- Approval actions are logged and audited

---

## 10. Share Screen

### 10.1 Share Management

- Share links per estimate version
- Link status (active, expired, withdrawn)
- View count and last viewed date
- Copy share link / Regenerate / Withdraw

### 10.2 Customer Share Experience

| Element | Behaviour |
|---------|-----------|
| **Landing Page** | Branded estimate summary |
| **Estimate View** | Read-only estimate with totals |
| **Decision Buttons** | Accept / Request Changes / Decline |
| **Message Field** | Free-form customer message |
| **Download** | PDF download option |
| **Expiry Notice** | Shows if link expired |

---

## 11. Settings

| Tab | Content |
|-----|---------|
| **General** | Company info, branding, defaults |
| **Roles & Permissions** | Role definitions, permission matrix |
| **Templates** | Estimate templates, formula templates |
| **Pricing Defaults** | Default pricing components |
| **Integrations** | Email, WhatsApp, storage connections |
| **Notifications** | Notification preferences, channels |

---

## 12. Responsive Behaviour

| Breakpoint | Layout |
|------------|--------|
| **Desktop (≥1024px)** | Full sidebar, 3-panel builder |
| **Tablet (768-1023px)** | Collapsed sidebar, 2-panel builder, bottom nav |
| **Mobile (<768px)** | Bottom nav, single-panel, full-width tables |

### 12.1 Table Adaptations

- Tables become horizontally scrollable on mobile
- Priority columns hide first, then secondary
- Row tap opens detail view
- Action buttons move to swipe/overflow menu

### 12.2 Builder Adaptations

- 3-panel becomes 2-panel on tablet (right panel becomes tab)
- 2-panel becomes single-panel on mobile (tabbed)
- Inline editing becomes modal editing on mobile

---

## 13. Accessibility

| Principle | Implementation |
|-----------|----------------|
| **Keyboard Navigation** | Full keyboard access to all actions |
| **Screen Reader** | ARIA labels, roles, live regions |
| **Colour Contrast** | WCAG AA minimum |
| **Focus States** | Visible focus indicators |
| **Touch Targets** | Minimum 44×44px |
| **Text Scaling** | Supports browser text resize |
| **Error Messaging** | Inline, descriptive, actionable |
| **Reduced Motion** | Respects `prefers-reduced-motion` |

---

## 14. Future Mobile

The Estimate Engine mobile experience is planned as a progressive enhancement, not a separate product.

### 14.1 Mobile App Features

- Estimate approval on-the-go
- Customer approval notifications
- Share link management
- Quick quote creation
- Real-time status updates
- Photo attachment capture

### 14.2 Offline Behaviour

- Draft estimates can be cached locally
- Changes are queued and synced
- Conflict resolution on sync
- Offline indicator with sync status

---

## 15. Design System

### 15.1 Design Tokens

| Token | Definition |
|-------|------------|
| **Colour** | Primary, secondary, success, warning, danger, neutral |
| **Typography** | Font family, sizes, weights, line heights |
| **Spacing** | 4px scale (4, 8, 12, 16, 24, 32, 48) |
| **Radius** | 4px, 8px, 12px, full |
| **Shadow** | Elevation levels (1-4) |
| **Z-Index** | Layer scale for overlays |

### 15.2 Component Library

| Component | Description |
|-----------|-------------|
| **Button** | Primary, secondary, outline, ghost, danger, link |
| **Input** | Text, number, date, select, search, textarea |
| **Table** | Sortable, filterable, row selection, pagination |
| **Card** | Container with title, actions, footer |
| **Modal** | Dialog with overlay, focus trap, keyboard close |
| **Tabs** | Section navigation |
| **Toast** | Notifications, success/error |
| **Badge** | Status indicators |
| **Tooltip** | Hover/focus information |
| **Stepper** | Multi-step wizards |
| **Empty State** | Guided empty views with action |
| **Skeleton** | Loading placeholders |

### 15.3 Accessibility Components

- All components are keyboard accessible
- All interactive elements have ARIA labels
- All form fields have associated labels
- All feedback is announced to screen readers

---

## 16. Validation

- All screens are mobile responsive
- All screens are keyboard accessible
- All interactive elements meet WCAG AA
- All flows work with screen readers
- All screens are tested on mobile, tablet, desktop
- All screens are tested with browser zoom 200%

---

*End of Document*