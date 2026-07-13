# Authentication Analysis Report
## SBBT CRM Next.js Project

**Generated:** July 13, 2026  
**Scope:** Complete authentication system analysis

---

## 1. Authentication Related Files

### Core Auth Files
- `app/auth/callback/route.ts` - OAuth callback handler
- `app/login/page.tsx` - Google OAuth login page
- `app/admin/page.tsx` - Email/password admin login page
- `app/quote/page.tsx` - Quote page with Google OAuth
- `components/google-login-button.tsx` - Reusable Google login component

### Supabase Client Files
- `lib/supabase/client.ts` - Browser client using `@supabase/ssr`
- `lib/supabase/server.ts` - Server client using `@supabase/ssr`
- `lib/supabase/middleware.ts` - Server client for middleware
- `lib/supabase.js` - Empty file (unused)

### Middleware/Proxy Files
- `proxy.ts` - Root-level proxy file (ACTIVE)
- `lib/supabase/middleware.ts` - Middleware helper function (NOT USED)

---

## 2. Redirect Logic Analysis

### File: `app/auth/callback/route.ts`
```typescript
const returnTo = searchParams.get('returnTo') ?? '/'; // Default Homepage
return NextResponse.redirect(new URL(returnTo, origin));
```
- **Behavior:** Handles OAuth callback with `returnTo` parameter
- **Default:** Redirects to `/` if no `returnTo` specified
- **Issue:** Uses `returnTo` parameter but some login pages don't pass it

### File: `app/login/page.tsx`
```typescript
const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback'; // HARDCODED
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: redirectUrl }
});
```
- **Behavior:** Hardcoded Vercel URL (NOT dynamic)
- **Issue:** Will fail on localhost and other deployments
- **Missing:** No `returnTo` parameter

### File: `app/quote/page.tsx`
```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: redirectUrl }
});
```
- **Behavior:** Dynamic origin with `returnTo=/quote`
- **Status:** ✅ CORRECT implementation

### File: `components/google-login-button.tsx`
```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
```
- **Behavior:** Uses `next` parameter (not `returnTo`)
- **Issue:** Inconsistent with callback handler which expects `returnTo`

### File: `app/admin/page.tsx`
```typescript
window.location.href = '/dashboard';
```
- **Behavior:** Redirects to `/dashboard` after successful login
- **Status:** ✅ CORRECT

### File: `app/dashboard/page.tsx`
```typescript
window.location.href = '/admin'; // Redirects if not authenticated
```
- **Behavior:** Redirects to `/admin` if user not found
- **Status:** ✅ CORRECT (but should redirect to `/login` for consistency)

---

## 3. Middleware/Proxy Logic

### File: `proxy.ts` (ACTIVE - Root Level)
```typescript
export async function proxy(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { session } } = await supabase.auth.getSession()

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  return NextResponse.next()
}
```
- **Status:** ✅ ACTIVE
- **Protection:** Only protects `/dashboard` route
- **Redirect:** Redirects to `/` (homepage) if not authenticated
- **Issue:** Should redirect to `/admin` or `/login` instead of homepage

### File: `lib/supabase/middleware.ts` (NOT USED)
```typescript
export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(url)
  }
  return supabaseResponse
}
```
- **Status:** ❌ NOT USED
- **Issue:** Function exists but never called
- **Note:** Uses `createServerClient` which is better for SSR

### Conflict
- **CRITICAL:** Both `proxy.ts` and `lib/supabase/middleware.ts` exist but only `proxy.ts` is active
- **Next.js 16:** Uses proxy.ts instead of middleware.ts
- **Recommendation:** Remove unused `lib/supabase/middleware.ts` or integrate it

---

## 4. Supabase Auth Usage

### Client Creation Methods (INCONSISTENT)

#### Method 1: Direct `@supabase/supabase-js` (Used in most pages)
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```
**Used in:**
- `app/page.tsx`
- `app/login/page.tsx`
- `app/admin/page.tsx`
- `app/quote/page.tsx`
- `app/dashboard/page.tsx`
- `app/contact/page.tsx`

#### Method 2: `@supabase/ssr` Browser Client (Used in component)
```typescript
import { createClient } from "@/lib/supabase/client";
const supabase = createClient(); // Uses createBrowserClient
```
**Used in:**
- `components/google-login-button.tsx`

#### Method 3: `@supabase/ssr` Server Client (Not used in app)
```typescript
import { createClient } from "@/lib/supabase/server";
```
**Used in:**
- None in app routes (only defined in lib)

### Auth Methods Used

#### `signInWithOAuth` (Google Login)
- `app/login/page.tsx` - Line 41
- `app/quote/page.tsx` - Line 41
- `components/google-login-button.tsx` - Line 9

#### `signInWithPassword` (Email/Password)
- `app/admin/page.tsx` - Line 22

#### `getUser` (Check Auth Status)
- `app/login/page.tsx` - Line 23
- `app/dashboard/page.tsx` - Line 107
- `app/quote/page.tsx` - Line 21

#### `getSession` (Get Session)
- `proxy.ts` - Line 14

#### `onAuthStateChange` (Listen to Auth Changes)
- `app/quote/page.tsx` - Line 28

#### `signOut` (Logout)
- `app/quote/page.tsx` - Line 49

#### `exchangeCodeForSession` (OAuth Callback)
- `app/auth/callback/route.ts` - Line 15

---

## 5. Duplicate Login Implementations

### Login Page 1: `/login` (Google OAuth)
- **File:** `app/login/page.tsx`
- **Method:** Google OAuth only
- **Redirect:** Hardcoded to Vercel URL
- **Target:** `/dashboard` after login
- **Status:** ⚠️ HARDCODED URL ISSUE

### Login Page 2: `/admin` (Email/Password)
- **File:** `app/admin/page.tsx`
- **Method:** Email/Password only
- **Redirect:** `/dashboard` after login
- **Status:** ✅ WORKING

### Component: Google Login Button
- **File:** `components/google-login-button.tsx`
- **Method:** Google OAuth
- **Redirect:** Dynamic with `next=/dashboard`
- **Status:** ⚠️ Uses `next` instead of `returnTo`

### Issue Summary
- **CRITICAL:** Two separate login pages with different methods
- **INCONSISTENCY:** Different redirect parameter names (`returnTo` vs `next`)
- **HARDCODED:** `/login` uses hardcoded Vercel URL
- **RECOMMENDATION:** Consolidate to single login page or clarify purpose of each

---

## 6. Routes Checking Authentication

### `/dashboard` (Protected)
```typescript
useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (error || !user) {
      window.location.href = '/admin';
      return;
    }
    setUser(user);
  };
  checkUser();
}, []);
```
- **Check:** Client-side `getUser()` in useEffect
- **Redirect:** `/admin` if not authenticated
- **Status:** ✅ PROTECTED (client-side)

### `/login` (Auth Check)
```typescript
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    if (data?.user) {
      router.push('/dashboard');
    }
    setLoading(false);
  });
}, [router]);
```
- **Check:** Client-side `getUser()` in useEffect
- **Redirect:** `/dashboard` if already logged in
- **Status:** ✅ REDIRECTS AUTHENTICATED USERS

### `/quote` (Auth Check + State Listener)
```typescript
useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };
  getUser();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      setUser(session?.user || null);
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
    }
  });
  return () => subscription.unsubscribe();
}, []);
```
- **Check:** Client-side `getUser()` + `onAuthStateChange` listener
- **Status:** ✅ BEST PRACTICE (reactive auth state)

### `/` (Homepage - No Auth Check)
- **Status:** Public page, no auth check

### `/contact` (No Auth Check)
- **Status:** Public page, no auth check

### `/projects` (No Auth Check)
- **Status:** Public page, no auth check

---

## 7. Protected Pages

### Middleware Protection
- **`/dashboard`** - Protected by `proxy.ts`
- **Redirect:** `/` (homepage) if not authenticated

### Client-Side Protection
- **`/dashboard`** - Double protection (middleware + client-side check)
- **Redirect:** `/admin` if not authenticated

### Public Pages (No Protection)
- `/` (Homepage)
- `/login`
- `/admin`
- `/quote`
- `/contact`
- `/projects`
- `/projects/[id]`

---

## 8. Critical Issues Found

### 🔴 CRITICAL

1. **Hardcoded Vercel URL in `/login`**
   - File: `app/login/page.tsx:38`
   - Issue: `'https://sbbt-crm-new-seven.vercel.app/auth/callback'`
   - Impact: Will fail on localhost and other deployments
   - Fix: Use `window.location.origin + '/auth/callback'`

2. **Inconsistent Redirect Parameters**
   - Files: `app/quote/page.tsx` uses `returnTo`, `components/google-login-button.tsx` uses `next`
   - Impact: Callback handler only checks `returnTo`, so `next` parameter is ignored
   - Fix: Standardize on `returnTo` parameter

3. **Two Active Login Pages**
   - Files: `/login` (Google) and `/admin` (Email/Password)
   - Impact: Confusing UX, inconsistent authentication flows
   - Fix: Consolidate or clearly differentiate purposes

### 🟡 MEDIUM

4. **Middleware Redirects to Homepage**
   - File: `proxy.ts:18`
   - Issue: Redirects to `/` instead of `/admin` or `/login`
   - Impact: Poor UX for unauthenticated users trying to access dashboard
   - Fix: Redirect to `/admin` for consistency

5. **Unused Middleware File**
   - File: `lib/supabase/middleware.ts`
   - Issue: Exists but never used
   - Impact: Code clutter, potential confusion
   - Fix: Remove or integrate with `proxy.ts`

6. **Inconsistent Supabase Client Creation**
   - Issue: Mix of direct `@supabase/supabase-js` and `@supabase/ssr` methods
   - Impact: Inconsistent cookie handling, potential SSR issues
   - Fix: Standardize on `@supabase/ssr` for all client components

### 🟢 LOW

7. **Dashboard Redirects to `/admin` Instead of `/login`**
   - File: `app/dashboard/page.tsx:112`
   - Issue: Redirects to `/admin` (email login) instead of `/login` (Google)
   - Impact: Inconsistent user experience
   - Fix: Redirect to `/login` for Google-first auth flow

8. **Empty `lib/supabase.js` File**
   - File: `lib/supabase.js`
   - Issue: Empty file with no purpose
   - Impact: Code clutter
   - Fix: Remove file

---

## 9. Recommendations

### Immediate Fixes (Priority 1)
1. Fix hardcoded URL in `app/login/page.tsx`
2. Standardize redirect parameter to `returnTo` across all files
3. Update `proxy.ts` to redirect to `/admin` instead of `/`

### Short-term Improvements (Priority 2)
4. Consolidate login pages or clearly differentiate purposes
5. Standardize Supabase client creation to use `@supabase/ssr`
6. Remove unused `lib/supabase/middleware.ts` and `lib/supabase.js`

### Long-term Architecture (Priority 3)
7. Implement server-side auth checks for better security
8. Add proper error handling for auth failures
9. Implement consistent auth state management across app
10. Add loading states for all auth operations

---

## 10. Authentication Flow Summary

### Current Flow (Google Login via `/login`)
1. User visits `/login`
2. Page checks if already authenticated → redirects to `/dashboard` if yes
3. User clicks "Continue with Google"
4. Redirects to Google OAuth (HARDCODED URL - ISSUE)
5. Google redirects to `/auth/callback`
6. Callback exchanges code for session
7. Redirects to `/` (homepage) - NO `returnTo`. Parameter
8. User must manually navigate to `/dashboard`

### Current Flow (Email Login via `/admin`)
1. User visits `/admin`
2. Enters email/password
3. Submits form
4. If successful → redirects to `/dashboard`
5. If error → shows error message

### Current Flow (Quote Page)
1. User visits `/quote`
2. Page checks auth status
3. If not authenticated → shows Google login button
4. User clicks login → redirects with `returnTo=/quote`
5. Google OAuth flow
6. Callback redirects to `/quote`
7. `onAuthStateChange` listener updates user state
8. Quote form appears

### Current Flow (Dashboard Protection)
1. User tries to access `/dashboard`
2. Middleware checks session via `proxy.ts`
3. If no session → redirects to `/` (homepage)
4. If session exists → page loads
5. Client-side check in useEffect redirects to `/admin` if no user

---

## 11. File Inventory

### Authentication Files (7 files)
- `app/auth/callback/route.ts`
- `app/login/page.tsx`
- `app/admin/page.tsx`
- `app/quote/page.tsx`
- `components/google-login-button.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

### Middleware/Proxy Files (2 files)
- `proxy.ts` (ACTIVE)
- `lib/supabase/middleware.ts` (UNUSED)

### Other Files
- `lib/supabase.js` (EMPTY - should be removed)

---

## 12. Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Both variables are used across all authentication files.

---

**End of Report**
