# PRD-02: SBBT Estimate Engine

**Document ID:** PRD-02
**Title:** API Specification — REST
**Phase:** Phase 10C
**Date:** August 2026
**Author:** AI Software Architect
**Status:** Phase 10C (API Specification Design)

---

## 1. REST API

The Estimate Engine exposes a RESTful API following standard HTTP conventions.

### 1.1 API Principles

| Principle | Description |
|-----------|-------------|
| **Resource-Oriented** | URLs represent resources, not actions |
| **HTTP Methods** | GET (read), POST (create), PATCH (update), DELETE (remove) |
| **Stateless** | Each request carries all context |
| **JSON** | Request/response bodies are JSON |
| **Versioned** | API version in URL (`/v1/`) |
| **Idempotent** | PUT/DELETE are idempotent |
| **Consistent Errors** | Standardised error envelope |

### 1.2 Base URL

```
https://api.sbbt.in/estimate/v1
```

### 1.3 Content Type

- `Content-Type: application/json`
- `Accept: application/json`

---

## 2. Authentication

### 2.1 Auth Methods

| Method | Use Case | Token Source |
|--------|----------|--------------|
| **Bearer Token** | Authenticated users | Supabase Auth JWT |
| **API Key** | System-to-system | Service role key (server only) |
| **Share Token** | Public estimate sharing | Share link token |

### 2.2 Auth Headers

```
Authorization: Bearer {JWT}
```

### 2.3 Auth Rules

- All endpoints require authentication unless marked `public`
- Share endpoints use share token, not user JWT
- API keys are never exposed to browser
- Tokens expire per Supabase policy

---

## 3. Authorization

Authorization is enforced at API layer in addition to database RLS.

| Role | Access |
|------|--------|
| **Estimator** | Estimates (own), BOQ (own), packages (read) |
| **Engineer** | Estimates, BOQ, overrides |
| **Sales** | Estimates (read), customers, shares |
| **Approver** | Approvals, estimates (review) |
| **Formula Admin** | Formulas, rules, pricing |
| **Admin** | All resources |

**Rules:**
- Authorization is role-based (RBAC) plus attribute-based (ABAC)
- API checks authorization before data access
- Authorization failures return `403 Forbidden`
- Authorization is enforced server-side, never client-side

---

## 4. Endpoints

### 4.1 Resource Groups

| Resource | Base Path |
|----------|-----------|
| Estimates | `/estimates` |
| Estimate Versions | `/estimates/{id}/versions` |
| BOQ | `/boqs` |
| BOQ Items | `/boqs/{id}/items` |
| Packages | `/packages` |
| Components | `/components` |
| Formulas | `/formulas` |
| Rules | `/rules` |
| Pricing Rules | `/pricing-rules` |
| Approvals | `/approvals` |
| Customers | `/customers` |
| Projects | `/projects` |
| Shares | `/shares` |
| Notifications | `/notifications` |
| Attachments | `/attachments` |
| Audit | `/audit` |

---

## 5. Resources

| Resource | Description | Primary Actions |
|----------|-------------|-----------------|
| **Estimate** | Estimate document | Create, Read, Update, Submit, Approve |
| **Estimate Version** | Immutable snapshot | Read, Compare |
| **BOQ** | Bill of quantities | Create, Read, Freeze, Lock |
| **BOQ Item** | BOQ line item | Create, Read, Update, Delete |
| **Package** | Pre-built offering | Create, Read, Update, Publish |
| **Component** | Generic component | Create, Read, Update, Retire |
| **Formula** | Calculation definition | Create, Read, Update, Activate |
| **Rule** | Business rule | Create, Read, Update, Enable |
| **Approval** | Approval workflow | Create, Read, Approve, Reject |
| **Customer** | Customer record | Create, Read, Update |
| **Share** | Estimate sharing | Create, Read, Withdraw |

---

## 6. Methods

| Method | Usage | Idempotent | Body |
|--------|-------|------------|------|
| `GET` | Read resources | Yes | No |
| `POST` | Create resources, actions | No | Yes |
| `PATCH` | Partial update | No | Yes |
| `PUT` | Full update | Yes | Yes |
| `DELETE` | Remove resource | Yes | No |

---

## 7. Payloads

### 7.1 Request Payload Structure

```json
{
  "data": { },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-08-03T12:00:00Z"
  }
}
```

### 7.2 Response Payload Structure

```json
{
  "data": { },
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-08-03T12:00:00Z"
  }
}
```

### 7.3 Payload Rules

- All monetary fields are numbers (not strings)
- All dates are ISO 8601 UTC
- All IDs are UUIDs
- Nested resources use `{resource}_id` references
- Optional fields use `null`, never omitted (for PATCH: omitted = unchanged)

---

## 8. Responses

| Status | Meaning | Used For |
|--------|---------|----------|
| `200 OK` | Successful read/update | GET, PATCH, PUT |
| `201 Created` | Resource created | POST |
| `202 Accepted` | Async action accepted | Bulk, export |
| `204 No Content` | Successful delete | DELETE |
| `400 Bad Request` | Invalid payload | Validation |
| `401 Unauthorized` | Missing/invalid auth | Auth failure |
| `403 Forbidden` | Authenticated, not allowed | Authorization |
| `404 Not Found` | Resource not found | Missing resource |
| `409 Conflict` | State conflict | Version conflict, duplicate |
| `422 Unprocessable` | Business rule violation | Business validation |
| `429 Too Many Requests` | Rate limit | Throttling |
| `500 Internal Server Error` | Unexpected error | Server failure |

---

## 9. Errors

### 9.1 Error Envelope

```json
{
  "error": {
    "code": "ESTIMATE_NOT_FOUND",
    "message": "Estimate not found",
    "details": [
      { "field": "id", "issue": "does not exist" }
    ],
    "request_id": "req_123"
  }
}
```

### 9.2 Error Codes

| Category | Code Pattern | Example |
|----------|--------------|---------|
| **Validation** | `VALIDATION_*` | `VALIDATION_REQUIRED_FIELD` |
| **Auth** | `AUTH_*` | `AUTH_TOKEN_EXPIRED` |
| **Authorization** | `FORBIDDEN_*` | `FORBIDDEN_RESOURCE` |
| **Not Found** | `*_NOT_FOUND` | `ESTIMATE_NOT_FOUND` |
| **Conflict** | `CONFLICT_*` | `CONFLICT_VERSION` |
| **Business** | `BUSINESS_*` | `BUSINESS_APPROVAL_REQUIRED` |
| **Rate Limit** | `RATE_LIMIT_*` | `RATE_LIMIT_EXCEEDED` |

### 9.3 Error Rules

- All errors return structured JSON
- Error messages are user-safe (no stack traces)
- Details array provides field-level validation
- `request_id` enables traceability

---

## 10. Pagination

- **Method:** Cursor-based (keyset)
- **Parameters:** `limit` (default 50, max 200), `cursor`
- **Response meta:** `next_cursor`, `has_more`

```json
{
  "data": [...],
  "meta": {
    "next_cursor": "eyJ...",
    "has_more": true
  }
}
```

**Rules:**
- Cursor is opaque (client cannot construct)
- Cursor expires after 24 hours
- Sorting must be stable for pagination

---

## 11. Filtering

- **Syntax:** `filter[field]=value`
- **Operators:** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`
- **Multiple:** Repeatable parameters (`filter[status]=active&filter[status]=pending`)
- **Example:**

```
GET /estimates?filter[status]=approved&filter[created_at][gte]=2026-01-01
```

**Rules:**
- Filterable fields are documented per resource
- Invalid filters return `400`
- Filtering always respects authorization scope

---

## 12. Sorting

- **Syntax:** `sort=field` or `sort=-field` (descending)
- **Multiple:** `sort=-created_at,name`
- **Allowed fields:** Documented per resource
- **Default:** `created_at` descending (most recent first)

**Rules:**
- Sort fields must be indexed
- Invalid sort fields return `400`
- Pagination requires stable sort

---

## 13. Bulk APIs

Bulk endpoints batch operations for efficiency.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/bulk/boq-items` | POST | Create multiple BOQ items |
| `/bulk/components` | POST | Import components |
| `/bulk/formulas` | POST | Import formulas |
| `/bulk/estimates/export` | POST | Export multiple estimates |
| `/bulk/items/update` | PATCH | Update multiple BOQ items |

**Payload:**

```json
{
  "items": [ { "action": "create", "data": {} } ]
}
```

**Response:**

```json
{
  "data": {
    "success_count": 98,
    "failure_count": 2,
    "failures": [
      { "index": 5, "code": "VALIDATION_REQUIRED_FIELD", "field": "qty" }
    ]
  }
}
```

**Rules:**
- Bulk limit: 500 items per request
- Bulk operations are partially committed (successful items saved)
- Failures are returned with index references
- Bulk operations are async for > 100 items (202 Accepted)

---

## 14. Approval APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/approvals` | GET | List approvals (filterable by status) |
| `/approvals/{id}` | GET | Approval details |
| `/approvals` | POST | Create approval workflow |
| `/approvals/{id}/approve` | POST | Approve |
| `/approvals/{id}/reject` | POST | Reject (with reason) |
| `/approvals/{id}/return` | POST | Return for revision |
| `/approvals/{id}/stages` | GET | Stage history |

**Rules:**
- Approve/reject require approver role
- Reject requires mandatory reason
- Approval actions are idempotent (repeated request returns same state)
- Approval actions are audited

---

## 15. Formula APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/formulas` | GET | List formulas |
| `/formulas` | POST | Create formula |
| `/formulas/{id}` | GET | Formula details |
| `/formulas/{id}` | PATCH | Update formula (creates new version) |
| `/formulas/{id}/activate` | POST | Activate formula |
| `/formulas/{id}/deprecate` | POST | Deprecate formula |
| `/formulas/{id}/retire` | POST | Retire formula |
| `/formulas/{id}/versions` | GET | Version history |
| `/formulas/{id}/validate` | POST | Run validation |
| `/formulas/{id}/test` | POST | Run test suite |
| `/formulas/{id}/simulate` | POST | Run simulation |

**Rules:**
- Formula updates always create new versions
- Activation requires validation pass
- Simulation requires simulation payload
- Formula management requires Formula Admin role

---

## 16. Pricing APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pricing-rules` | GET | List pricing rules |
| `/pricing-rules` | POST | Create pricing rule |
| `/pricing-rules/{id}` | PATCH | Update pricing rule |
| `/pricing-rules/{id}/activate` | POST | Activate rule |
| `/rules` | GET | List business rules |
| `/rules` | POST | Create rule |
| `/rules/{id}` | PATCH | Update rule |
| `/rules/{id}/enable` | POST | Enable rule |
| `/rules/{id}/disable` | POST | Disable rule |
| `/rule-groups` | GET | List rule groups |
| `/rule-groups` | POST | Create rule group |

**Rules:**
- Pricing rule changes affect new estimates only
- Rule activation requires validation
- Pricing management requires Pricing Admin role

---

## 17. Version APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/estimates/{id}/versions` | GET | List version history |
| `/estimates/{id}/versions/{version_id}` | GET | Version detail |
| `/estimates/{id}/versions/{version_id}/export` | GET | Export version |
| `/estimates/{id}/versions/compare` | POST | Compare two versions |
| `/estimates/{id}/versions/{version_id}/restore` | POST | Restore version (creates new) |

**Rules:**
- Versions are immutable (no PATCH/PUT/DELETE)
- Compare requires two version IDs
- Restore creates a new version
- Version access follows estimate authorization

---

## 18. BOQ APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/boqs` | GET | List BOQs |
| `/boqs` | POST | Create BOQ |
| `/boqs/{id}` | GET | BOQ detail |
| `/boqs/{id}/items` | GET | List BOQ items |
| `/boqs/{id}/items` | POST | Add BOQ item |
| `/boqs/{id}/items/{item_id}` | PATCH | Update BOQ item |
| `/boqs/{id}/items/{item_id}` | DELETE | Remove BOQ item |
| `/boqs/{id}/freeze` | POST | Freeze BOQ |
| `/boqs/{id}/lock` | POST | Lock BOQ |

**Rules:**
- Frozen/locked BOQs reject item modifications
- Item updates require version state awareness
- BOQ items reference components
- BOQ modification requires Estimator/Engineer role

---

## 19. Export APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/estimates/{id}/export` | GET | Export estimate (PDF) |
| `/estimates/{id}/export?format=excel` | GET | Export estimate (Excel) |
| `/boqs/{id}/export` | GET | Export BOQ |
| `/packages/{id}/export` | GET | Export package |
| `/formulas/export` | GET | Export formulas (JSON) |
| `/bulk/estimates/export` | POST | Mass export |

**Rules:**
- Exports are generated asynchronously for large documents
- Export format is query parameter
- Exports respect share/authorization scope
- Export generation is logged

---

## 20. Import APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/import/boq-items` | POST | Import BOQ items from file |
| `/import/components` | POST | Import components |
| `/import/formulas` | POST | Import formulas |
| `/import/packages` | POST | Import packages |
| `/import/estimates` | POST | Import estimates |

**Rules:**
- Import supports CSV, Excel, JSON
- Import returns preview (validated rows) before commit
- Import is async for > 100 rows
- Import failures are reported per row
- Imports require Import role

---

## 21. Audit APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/audit` | GET | List audit entries |
| `/audit/{id}` | GET | Audit entry detail |
| `/audit/entities/{entity_type}/{entity_id}` | GET | Audit history for an entity |
| `/audit/export` | GET | Export audit data |

**Rules:**
- Audit queries require Admin or Audit role
- Audit data is read-only (no create/update/delete)
- Audit filters: `entity_type`, `entity_id`, `actor`, `event_type`, `date_from`, `date_to`
- Audit export is async

---

## 22. Validation

- All create/update payloads are validated against resource schemas
- Validation is performed at API layer and database layer
- Validation errors return `400` with field-level details
- Business rule violations return `422`
- All validation is documented per resource

---

*End of Document*