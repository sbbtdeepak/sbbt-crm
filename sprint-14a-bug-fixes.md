# Sprint 14A - Localhost Bug Fix

Bug tracking document.

## Bugs to Fix:
1. Hero empty Image src
2. CMS Company (saveCompany/getCompanyData/getCompanyPublicData)
3. CMS Social (saveSocial/Footer/Header)
4. Packages CRUD
5. Projects CRUD
6. Blogs CRUD
7. Testimonials CRUD
8. Lead Submission (hotlead / quote form → dashboard)

---

## 8. Lead Submission — Root Cause Investigation (2026-08-01)

### Symptom
Public website lead/quote forms fail to save leads in the production Supabase database. Dashboards show no new leads.

### Evidence

| Item | File | Finding |
|------|------|---------|
| Request source | `App/quote/page.tsx` | POSTs to `/api/leads` with `{ name, phone, email?, projectType?, message?, source }` |
| API route | `App/api/leads/route.ts` | Validates payload → calls `createLeadFromAPI()` |
| Insert path | `App/dashboard/leads/actions.ts:335` | `createLeadFromAPI()` calls `supabase.from("contact_leads").insert(...)` |
| All DB references | `App/dashboard/leads/*`, providers, notifications | `search_files "from\("` → **100% use `contact_leads`** |
| Table definition | `Supabase_v2/050_contact_leads.sql:9` | `CREATE TABLE IF NOT EXISTS contact_leads ( ... site_id UUID REFERENCES sites(id) ... created_by UUID REFERENCES profiles(id) ...)` |
| RLS policy | `Supabase_v2/050_contact_leads.sql:57` | `contact_leads_insert_public` — allows anon insert (only exists if table was created) |
| Production reality | User confirmed | **`contact_leads` table does NOT exist in production** |
| Production schema | `Supabase/master_data_migration.sql` | Contains only master-data tables; **no leads/quote/enquiry/contact table** |
| Docs | `Docs/DATABASE_SCHEMA.md` | **No lead/quote table documented** |

### Chain of Failure

1. `contact_leads` was designed in SQL migration `050` with foreign keys to `sites(id)` and `profiles(id)`.
2. Production database has **no `sites` or `profiles` tables** (documented in `035_cms_packages.sql:9`: *"production database does NOT have sites or profiles tables"*).
3. Therefore migration `050_contact_leads.sql` **cannot be applied** to production as-is — the FK references fail.
4. Even if applied with FKs stripped, RLS policy depends on the table existing (it doesn't).
5. Production also has **no legacy `leads` / `quotes` / `enquiries` table** that a compat layer could fall back to.
6. All application code (actions, API, notification providers) hard-codes `contact_leads`, so submissions fail with `PGRST205` / invalid table name.

### Root Cause

**Reference-Table Mismatch (Schema Drift)**
`contact_leads` exists only in the V2 migration set (which is tied to V2 `sites`/`profiles` tables). Production never received the 050 migration — either it was never applied or it failed because the referenced `sites`/`profiles` tables do not exist in production.

### FINAL VERDICT (2026-08-01, exhaustive search complete)

| Question | Answer |
|----------|--------|
| Existing production lead table? | **NONE EXISTS** |
| Legacy lead/quote/enquiry table? | **NONE EXISTS** |
| `crm_leads` / `website_leads` / `estimate_leads` / `customer_leads` / `enquiries` / `contact_forms` / `quote_requests` | **Do not exist anywhere** — not in code, not in SQL migrations, not in docs |
| Only leads table in entire repo | `contact_leads` (Supabase_v2/050) — V2-only, FK-dependent on `sites`/`profiles` which do NOT exist in production |
| Closest related tables | `estimates.lead_id`, `admin_notifications.lead_id`, `notification_logs.lead_id` — polymorphic reference columns only, **no lead table exists behind them** |

**This project has never created a production leads table.**

The leads feature was designed in migration `050_contact_leads.sql` against the V2 schema (`sites`/`profiles`), but that migration was never applied to production (it cannot be — the FK targets do not exist there). There is no legacy, alternative, or fallback lead table anywhere in the repository. Code correctly targets `contact_leads` — the table simply was never created in production.

**Therefore a new additive migration is the ONLY correct fix.** No code change is correct because no existing production table can receive leads.

### Required Fix (pending approval)

Create production-safe additive migration (no V2 FK references):

```sql
-- 091_contact_leads_production.sql (additive, idempotent)
CREATE TABLE IF NOT EXISTS contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number TEXT,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  project_type TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID,
  site_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
-- no FK constraints (production-compatible pattern used by 035/070/072)
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY contact_leads_select_authenticated ON contact_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY contact_leads_insert_public ON contact_leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY contact_leads_update_authenticated ON contact_leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```
Then run `npm run build`, apply via `psql "$DATABASE_URL" -f Supabase_v2/091_contact_leads_production.sql`, and re-test the quote form.

### Blocks
- Requires SQL execution against production Supabase (user must run manually or approve execution).
- Do NOT modify the frozen DB schema without explicit approval (per PROJECT_RULES).
