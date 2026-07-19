# Supabase Client Migration Plan
## SBBT CRM Next.js Project

**Generated:** July 19, 2026  
**Scope:** Every file that creates or uses a Supabase client  
**Methodology:** Each file verified by reading source code on disk and/or git HEAD

---

## Client Types Reference

| Client Type | Import | Package | SSR Cookie Support | Use Case |
|-------------|--------|---------|-------------------|----------|
| **A** — Direct `createClient` | `import { createClient } from '@supabase/supabase-js'` | `@supabase/supabase-js` | ❌ No | Legacy, not recommended for Next.js SSR |
| **B** — SSR Browser Client | `import { createClient } from '@/lib/supabase/client'` | `@supabase/ssr` (via `createBrowserClient`) | ✅ Yes | Client components, `"use client"` pages |
| **C** — SSR Server Client | `import { createClient } from '@/lib/supabase/server'` | `@supabase/ssr` (via `createServerClient`) | ✅ Yes | Server components, Server Actions |
| **D** — Direct SSR Server Client | `import { createServerClient } from '@supabase/ssr'` | `@supabase/ssr` | ✅ Yes | Middleware/proxy, route handlers needing custom cookie config |

---

## Migration Table

| # | File | Current Client | Line | Recommended Client | Reason | Risk |
|---|------|---------------|------|-------------------|--------|------|
| 1 | `app/quote/page.tsx` | **A** — `@supabase/supabase-js` `createClient()` | 3, 8-11 | **B** — `@/lib/supabase/client` | This is a `"use client"` page. Direct `@supabase/supabase-js` does not handle SSR cookie management. Using `@/lib/supabase/client` ensures consistent cookie-based session handling with the rest of the app. | 🟡 MEDIUM — Session state may be inconsistent with other pages. Auth state changes (login/logout) may not propagate correctly. |
| 2 | `app/contact/page.tsx` | **A** — `@supabase/supabase-js` `createClient()` | 3, 9-10 | **B** — `@/lib/supabase/client` | Same as above. This is a `"use client"` page with a contact form that submits data to Supabase. | 🟢 LOW — Contact form submission does not depend on auth state. Risk is minimal but still inconsistent. |
| 3 | `app/login/page.tsx` (git HEAD) | **A** — `@supabase/supabase-js` `createClient()` | 3, 17-20 | **B** — `@/lib/supabase/client` | This is a `"use client"` page. The direct client is used for `getUser()` check and would benefit from SSR cookie consistency. | 🟡 MEDIUM — Auth check (`getUser()`) may behave differently from the SSR client. Could cause redirect loops or stale session detection. |
| 4 | `app/admin/page.tsx` | **B** — `@/lib/supabase/client` | 3, 7 | ✅ **Already correct** | Uses `createClient()` from `@/lib/supabase/client` which wraps `createBrowserClient` from `@supabase/ssr`. | ✅ None |
| 5 | `app/dashboard/page.tsx` | **B** — `@/lib/supabase/client` | 3, 48 | ✅ **Already correct** | Uses `createClient()` from `@/lib/supabase/client`. | ✅ None |
| 6 | `lib/auth/oauth.ts` | **B** — `@/lib/supabase/client` | 1, 4 | ✅ **Already correct** | Uses `createClient()` from `@/lib/supabase/client`. | ✅ None |
| 7 | `components/shared/GoogleLoginButton.tsx` | **B** — via `@/lib/auth/oauth` | 3 | ✅ **Already correct** | Indirectly uses `@/lib/supabase/client` through `signInWithGoogle()`. | ✅ None |
| 8 | `proxy.ts` | **D** — `createServerClient` from `@supabase/ssr` | 2, 36-46 | ✅ **Already correct** (just fixed) | Uses `createServerClient` with `getAll()` + `setAll()`. This is the correct pattern for middleware/proxy. | ✅ None (after Phase 2 fix) |
| 9 | `app/auth/callback/route.ts` | **D** — `createServerClient` from `@supabase/ssr` | 1, 12-32 | ✅ **Already correct** | Uses `createServerClient` with `get()`/`set()`/`remove()` (deprecated API but functional). This is a Route Handler, not a page. | 🟢 LOW — Uses deprecated `get`/`set`/`remove` API instead of `getAll`/`setAll`. Works but should be updated to match `proxy.ts` pattern. |
| 10 | `lib/supabase/server.ts` | **C** — `createServerClient` from `@supabase/ssr` | 1, 7-26 | ✅ **Already correct** | Uses `createServerClient` with `getAll()` + `setAll()`. This is the shared server client for Server Components. | ✅ None |
| 11 | `lib/supabase/client.ts` | **B** — `createBrowserClient` from `@supabase/ssr` | 1, 4 | ✅ **Already correct** | This IS the shared browser client definition. | ✅ None |
| 12 | `lib/supabase/middleware.ts` | **D** — `createServerClient` from `@supabase/ssr` | 1, 9-30 | ❌ **Unused — should be removed** | This file is never imported anywhere. Its functionality is now in `proxy.ts`. | 🟢 LOW — Dead code. No runtime impact. |
| 13 | `lib/supabase.js` | N/A — Empty file | — | ❌ **Should be deleted** | Empty file with no exports, no imports, no code. | 🟢 LOW — Dead file. No runtime impact. |

---

## Summary

| Status | Count | Files |
|--------|-------|-------|
| ✅ **Already correct** | 7 | `app/admin/page.tsx`, `app/dashboard/page.tsx`, `lib/auth/oauth.ts`, `components/shared/GoogleLoginButton.tsx`, `proxy.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts` |
| 🔄 **Needs migration (A → B)** | 3 | `app/quote/page.tsx`, `app/contact/page.tsx`, `app/login/page.tsx` |
| 🟢 **Low priority update** | 1 | `app/auth/callback/route.ts` (deprecated cookie API) |
| 🗑️ **Should be removed** | 2 | `lib/supabase/middleware.ts` (unused), `lib/supabase.js` (empty) |

---

## Migration Steps (If Approved)

### Step 1: Migrate 3 files from Pattern A → Pattern B

For each file, the change is identical:

```diff
-import { createClient } from '@supabase/supabase-js';
+import { createClient } from '@/lib/supabase/client';
```

And remove the direct `createClient(...)` call, replacing with:

```typescript
const supabase = createClient();
```

**Files:**
1. `app/quote/page.tsx` — lines 3, 8-11
2. `app/contact/page.tsx` — lines 3, 9-10
3. `app/login/page.tsx` — lines 3, 17-20

### Step 2: Update `app/auth/callback/route.ts` (Optional)

Update from deprecated `get`/`set`/`remove` to `getAll`/`setAll` pattern to match `proxy.ts`.

### Step 3: Remove dead files

1. `lib/supabase/middleware.ts` — after confirming `proxy.ts` handles all middleware needs
2. `lib/supabase.js` — empty file

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Session inconsistency after migration | Users may need to re-login | Low | The SSR client reads from the same cookies. Session should persist. |
| Build failure after import change | Build breaks | Low | `@/lib/supabase/client` is already used by 3 other files successfully. |
| `createClient()` API difference | Runtime error | None | Both return a `SupabaseClient` instance with identical API. The difference is only in cookie handling internals. |

---

**No code has been modified. Awaiting approval to proceed.**