# Authentication Analysis Report — VERSION 2
## SBBT CRM Next.js Project

**Generated:** July 19, 2026  
**Version:** 2 (Verified against actual source code)  
**Methodology:** Every finding verified by reading the actual file on disk and/or git HEAD. Findings without direct evidence are marked **UNVERIFIED** and removed.

---

## VERIFICATION METHODOLOGY

Each finding in this report was verified by:
1. Reading the actual file on disk (`read_file`)
2. Comparing against git HEAD (`git show HEAD:<path>`) when disk file was corrupted
3. Tracing import chains to verify actual behavior
4. Checking for file existence before making claims

**Findings from V1 that were removed due to lack of evidence:**
- ❌ "Hardcoded Vercel URL in `/login`" — The file on disk is corrupted, but git HEAD shows it uses `signInWithGoogle("/dashboard")` from `lib/auth/oauth.ts` which dynamically constructs the URL using `window.location.origin`. No hardcoded URL exists.
- ❌ "Inconsistent Redirect Parameters (`returnTo` vs `next`)" — `components/google-login-button.tsx` does not exist. The actual component `components/shared/GoogleLoginButton.tsx` uses `signInWithGoogle("/dashboard")` which uses `returnTo`. All code consistently uses `returnTo`.
- ❌ "Middleware Redirects to Homepage" — `proxy.ts` line 51 redirects to `/admin`, not `/`. Already fixed.

---

## FINDING 1: CORRUPTED `app/login/page.tsx` File

### Evidence
- **File:** `app/login/page.tsx`
- **Lines:** 1–35
- **Content on disk:** Contains safety classification text ("We need to classify the user input and assistant response... User Safety: safe") — NOT actual code
- **Git HEAD content:** Valid Next.js login page with Google OAuth

### Why It Is a Problem
The file on disk has been overwritten with non-code content. The application will fail to compile or render the login page. Any `next build` or runtime access to `/login` will crash.

### What Happens If We DO NOT Fix It
- `/login` page will not render
- Build will fail with syntax errors
- Users cannot log in via Google OAuth
- The corrupted file will cause deployment failures

### Recommended Fix
Restore the file from git HEAD:
```bash
git checkout HEAD -- app/login/page.tsx
```

### Risk Level
🔴 **CRITICAL** — Application-breaking. Login flow completely broken.

---

## FINDING 2: `proxy.ts` Uses `getSession()` Instead of `getUser()`

### Evidence
- **File:** `proxy.ts`
- **Line:** 48
- **Code:** `const { data: { session } } = await supabase.auth.getSession();`
- **Contrast:** `lib/supabase/middleware.ts` line 33 uses `await supabase.auth.getUser()` which is the recommended approach

### Why It Is a Problem
`getSession()` only reads the local cookie without verifying with the Supabase server. A tampered or expired session cookie would still pass the check. `getUser()` makes a server request to validate the token, providing proper security.

### What Happens If We DO NOT Fix It
- Expired sessions may still grant access to `/dashboard`
- Stolen session cookies could be used without server validation
- Users who have been deleted from Supabase Auth would still have access until cookie expiry

### Recommended Fix
Replace `getSession()` with `getUser()` in `proxy.ts`:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.redirect(new URL("/admin", request.url));
}
```

### Risk Level
🔴 **CRITICAL** — Security vulnerability. Server-side session validation is bypassed.

---

## FINDING 3: `proxy.ts` Does Not Handle Session Refresh

### Evidence
- **File:** `proxy.ts`
- **Lines:** 40–46
- **Code:**
  ```typescript
  cookies: {
    getAll() {
      return request.cookies.getAll();
    },
  },
  ```
- **Missing:** `setAll()` method
- **Contrast:** `lib/supabase/middleware.ts` lines 17–27 has proper `setAll()` implementation

### Why It Is a Problem
The `createServerClient` from `@supabase/ssr` requires both `getAll()` and `setAll()` to properly handle session refresh. Without `setAll()`, refreshed session tokens cannot be written back to cookies, causing session loss on token expiry.

### What Happens If We DO NOT Fix It
- Users will be unexpectedly logged out after token expiry (typically 1 hour)
- Session refresh will silently fail
- Users will be redirected to `/admin` even with valid sessions after token refresh

### Recommended Fix
Add `setAll()` to the cookies configuration in `proxy.ts`:
```typescript
cookies: {
  getAll() {
    return request.cookies.getAll();
  },
  setAll(cookiesToSet) {
    cookiesToSet.forEach(({ name, value, options }) =>
      request.cookies.set(name, value)
    );
  },
},
```

### Risk Level
🔴 **CRITICAL** — Session refresh broken. Users will be logged out after 1 hour.

---

## FINDING 4: Unused `lib/supabase/middleware.ts` File

### Evidence
- **File:** `lib/supabase/middleware.ts`
- **Lines:** 1–43
- **Status:** File exists with a complete `updateSession()` function
- **Usage:** Zero imports across the entire codebase
- **Active middleware:** `proxy.ts` (root level) is the actual middleware

### Why It Is a Problem
- Dead code adds maintenance burden
- Contains a more correct implementation (`getUser()` + `setAll()`) that is not being used
- Future developers may be confused about which middleware is active

### What Happens If We DO NOT Fix It
- Code clutter continues
- Risk of someone activating both middlewares causing conflicts
- The better implementation remains unused

### Recommended Fix
Option A: Delete the file if `proxy.ts` will be fixed with `getUser()` and `setAll()`.
Option B: Integrate the `updateSession()` function into `proxy.ts` and delete the file.

### Risk Level
🟡 **MEDIUM** — Not breaking, but technical debt.

---

## FINDING 5: Inconsistent Supabase Client Creation

### Evidence
- **Files using direct `@supabase/supabase-js`:**
  - `app/quote/page.tsx` — Line 3: `import { createClient } from '@supabase/supabase-js';`
  - `app/contact/page.tsx` — Line 3: `import { createClient } from '@supabase/supabase-js';`
  - `app/login/page.tsx` (git HEAD) — Line 3: `import { createClient } from '@supabase/supabase-js';`

- **Files using `@/lib/supabase/client` (which uses `@supabase/ssr`):**
  - `app/admin/page.tsx` — Line 3: `import { createClient } from '@/lib/supabase/client';`
  - `app/dashboard/page.tsx` — Line 3: `import { createClient } from '@/lib/supabase/client';`
  - `components/shared/GoogleLoginButton.tsx` — Via `@/lib/auth/oauth` → `@/lib/supabase/client`

- **Files using `createServerClient` from `@supabase/ssr` directly:**
  - `app/auth/callback/route.ts` — Line 1
  - `proxy.ts` — Line 2

### Why It Is a Problem
Direct `@supabase/supabase-js` client does not handle cookie-based session management properly in a Next.js SSR context. The `@supabase/ssr` package is designed specifically for this. Mixing both creates inconsistent auth behavior.

### What Happens If We DO NOT Fix It
- Pages using direct client may not properly handle session cookies
- Inconsistent auth state between pages
- Potential SSR hydration mismatches

### Recommended Fix
Replace all direct `@supabase/supabase-js` imports with `@/lib/supabase/client`:
- `app/quote/page.tsx`: Change import to `import { createClient } from "@/lib/supabase/client";`
- `app/contact/page.tsx`: Change import to `import { createClient } from "@/lib/supabase/client";`
- `app/login/page.tsx`: Change import to `import { createClient } from "@/lib/supabase/client";`

### Risk Level
🟡 **MEDIUM** — Not immediately breaking, but causes inconsistent behavior.

---

## FINDING 6: Dashboard Redirects to `/admin` Instead of `/login`

### Evidence
- **File:** `app/dashboard/page.tsx`
- **Line:** 112
- **Code:** `window.location.href = '/admin';`
- **Also line:** 122 (catch block)
- **Also line:** 391 (`handleLogout` redirects to `/admin`)

### Why It Is a Problem
`/admin` is the email/password login page for admin users. `/login` is the Google OAuth page for general users. Redirecting unauthenticated users to `/admin` forces them to use email/password login instead of Google OAuth, which is the primary auth method.

### What Happens If We DO NOT Fix It
- Users trying to access dashboard are sent to email login instead of Google login
- Inconsistent UX — most of the app uses Google OAuth
- Confusion for non-admin users

### Recommended Fix
Change redirect target from `/admin` to `/login`:
```typescript
window.location.href = '/login';
```

### Risk Level
🟢 **LOW** — Functional but inconsistent UX.

---

## FINDING 7: Empty `lib/supabase.js` File

### Evidence
- **File:** `lib/supabase.js`
- **Content:** Empty (read_file returned nothing)
- **Purpose:** None

### Why It Is a Problem
Dead file with no purpose. May cause confusion about which supabase client to use.

### What Happens If We DO NOT Fix It
- Minor code clutter
- Potential confusion for developers

### Recommended Fix
Delete the file.

### Risk Level
🟢 **LOW** — Cosmetic.

---

## FINDING 8: Two Active Login Pages (Architectural Decision)

### Evidence
- **`/login`** (Google OAuth) — `app/login/page.tsx`
- **`/admin`** (Email/Password) — `app/admin/page.tsx`

### Why This Exists
This appears to be by design:
- `/login` is for general users authenticating via Google OAuth
- `/admin` is for admin/staff using email/password credentials

### Assessment
This is an architectural choice, not a bug. However, it should be documented to avoid confusion.

### Recommended Fix
No code change needed. Document the purpose of each login page in the project README or a docs file.

### Risk Level
🟢 **LOW** — By design, but should be documented.

---

## FINDING 9: `app/auth/callback/route.ts` — Inconsistent Indentation

### Evidence
- **File:** `app/auth/callback/route.ts`
- **Lines:** 24–29
- **Code:**
  ```typescript
     remove(name: string, options: any) {
   cookieStore.set({
     name,
     value: "",
     ...options,
   });
  },
  ```
- **Issue:** The `remove` method body uses 2-space indentation while the rest of the file uses 4-space indentation

### Why It Is a Problem
Inconsistent indentation violates code style standards and may cause linter warnings.

### What Happens If We DO NOT Fix It
- Linter warnings
- Code style inconsistency

### Recommended Fix
Fix indentation to use consistent 4 spaces:
```typescript
    remove(name: string, options: any) {
      cookieStore.set({
        name,
        value: "",
        ...options,
      });
    },
```

### Risk Level
🟢 **LOW** — Cosmetic/linting only.

---

## SUMMARY TABLE

| # | Finding | File | Risk | Evidence Status |
|---|---------|------|------|-----------------|
| 1 | Corrupted `app/login/page.tsx` | `app/login/page.tsx` | 🔴 CRITICAL | ✅ CONFIRMED — File contains safety classification text instead of code |
| 2 | `proxy.ts` uses `getSession()` not `getUser()` | `proxy.ts:48` | 🔴 CRITICAL | ✅ CONFIRMED — Server validation bypassed |
| 3 | `proxy.ts` missing `setAll()` for session refresh | `proxy.ts:40-46` | 🔴 CRITICAL | ✅ CONFIRMED — Session refresh broken |
| 4 | Unused `lib/supabase/middleware.ts` | `lib/supabase/middleware.ts` | 🟡 MEDIUM | ✅ CONFIRMED — Zero imports |
| 5 | Inconsistent Supabase client creation | Multiple files | 🟡 MEDIUM | ✅ CONFIRMED — Mix of direct `supabase-js` and `@supabase/ssr` |
| 6 | Dashboard redirects to `/admin` not `/login` | `app/dashboard/page.tsx:112` | 🟢 LOW | ✅ CONFIRMED — UX inconsistency |
| 7 | Empty `lib/supabase.js` file | `lib/supabase.js` | 🟢 LOW | ✅ CONFIRMED — Empty file |
| 8 | Two login pages (by design) | `/login`, `/admin` | 🟢 LOW | ✅ CONFIRMED — Architectural choice |
| 9 | Inconsistent indentation in callback | `app/auth/callback/route.ts:24-29` | 🟢 LOW | ✅ CONFIRMED — Linting issue |

---

## REMOVED FROM V1 (UNVERIFIED / OUTDATED)

The following findings from V1 were removed because evidence shows they are no longer valid:

| V1 Finding | Reason for Removal |
|------------|-------------------|
| Hardcoded Vercel URL in `/login` | File uses `signInWithGoogle()` from `lib/auth/oauth.ts` which dynamically constructs URL with `window.location.origin`. No hardcoded URL exists. |
| Inconsistent redirect parameters (`returnTo` vs `next`) | `components/google-login-button.tsx` does not exist. All code consistently uses `returnTo` via `lib/auth/oauth.ts`. |
| Middleware redirects to homepage | `proxy.ts:51` redirects to `/admin`, not `/`. Already fixed. |

---

## PRIORITY ACTIONS

### Immediate (Fix Now — Breaking)
1. **Restore `app/login/page.tsx`** from git HEAD — corrupted file breaks login
2. **Fix `proxy.ts`** — replace `getSession()` with `getUser()` and add `setAll()` for session refresh

### Short-term (Fix Soon — Technical Debt)
3. **Standardize Supabase client** — replace direct `@supabase/supabase-js` imports with `@/lib/supabase/client`
4. **Remove unused `lib/supabase/middleware.ts`** after confirming `proxy.ts` is fixed
5. **Delete empty `lib/supabase.js`**

### Low Priority (Fix When Convenient)
6. **Update dashboard redirect** from `/admin` to `/login`
7. **Fix indentation** in `app/auth/callback/route.ts`
8. **Document dual login pages** purpose

---

## FILES VERIFIED

| File | Status | Notes |
|------|--------|-------|
| `app/auth/callback/route.ts` | ✅ Verified | Working, minor indentation issue |
| `app/login/page.tsx` | ❌ CORRUPTED | Contains safety classification text, not code |
| `app/login/page.tsx` (git HEAD) | ✅ Verified | Valid code using `signInWithGoogle("/dashboard")` |
| `app/admin/page.tsx` | ✅ Verified | Working email/password login |
| `app/quote/page.tsx` | ✅ Verified | Working, uses direct supabase-js |
| `app/dashboard/page.tsx` | ✅ Verified | Working, redirects to `/admin` |
| `app/contact/page.tsx` | ✅ Verified | Uses direct supabase-js |
| `app/page.tsx` (git HEAD) | ✅ Verified | Public homepage, no auth |
| `proxy.ts` | ✅ Verified | Active middleware, needs `getUser()` + `setAll()` |
| `lib/supabase/middleware.ts` | ✅ Verified | Unused, but has better implementation |
| `lib/supabase/client.ts` | ✅ Verified | Uses `createBrowserClient` from `@supabase/ssr` |
| `lib/supabase/server.ts` | ✅ Verified | Uses `createServerClient` from `@supabase/ssr` |
| `lib/supabase.js` | ✅ Verified | Empty file |
| `lib/auth/oauth.ts` | ✅ Verified | Correctly uses `returnTo` with dynamic origin |
| `components/shared/GoogleLoginButton.tsx` | ✅ Verified | Uses `signInWithGoogle("/dashboard")` |
| `next.config.ts` | ✅ Verified | Minimal config, no custom rewrites |
| `package.json` | ✅ Verified | `@supabase/ssr` ^0.12.0, `@supabase/supabase-js` ^2.110.0 |

---

**End of Report — Version 2**