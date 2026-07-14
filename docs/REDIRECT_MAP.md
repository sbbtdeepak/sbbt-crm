# Redirect Map
## Complete Redirect Analysis

**Generated:** July 13, 2026  
**Scope:** Entire project redirect analysis

---

## Summary

| Redirect Type | Count | Files |
|---------------|-------|-------|
| `router.push` | 3 | 3 files |
| `router.replace` | 0 | 0 files |
| `redirect()` | 0 | 0 files |
| `NextResponse.redirect` | 5 | 3 files |
| `window.location.href` | 3 | 2 files |
| `window.location.origin` | 3 | 3 files |
| `window.location.reload` | 1 | 1 file |
| `window.location.assign` | 0 | 0 files |

**Total Redirects:** 15 occurrences across 8 files

---

## 1. router.push

### File: `components/logout-button.tsx`
**Line:** 12
```typescript
router.push("/");
```
**Purpose:** Redirect to homepage after logout
**Context:** Called after `supabase.auth.signOut()`

---

### File: `app/login/page.tsx`
**Line:** 25
```typescript
router.push('/dashboard');
```
**Purpose:** Redirect to dashboard if user is already authenticated on page load
**Context:** Called in `useEffect` after `getUser()` check

---

### File: `app/dashboard/page.tsx`
**Line:** 390
```typescript
router.push("/admin");
```
**Purpose:** Redirect to admin page after logout
**Context:** Called in `handleLogout` after `supabase.auth.signOut()`

---

## 2. router.replace

**No occurrences found.**

---

## 3. redirect()

**No occurrences found.**

---

## 4. NextResponse.redirect

### File: `proxy.ts`
**Line:** 18
```typescript
return NextResponse.redirect(new URL('/', request.url))
```
**Purpose:** Redirect unauthenticated users from `/dashboard` to homepage
**Context:** Middleware check for protected routes

---

### File: `lib/supabase/middleware.ts`
**Line:** 39
```typescript
return NextResponse.redirect(url);
```
**Purpose:** Redirect unauthenticated users from `/dashboard` to homepage
**Context:** Middleware check for protected routes (UNUSED FILE)

---

### File: `app/auth/callback/route.ts`
**Line:** 19
```typescript
return NextResponse.redirect(new URL('/?error=login_failed', origin));
```
**Purpose:** Redirect to homepage with error parameter on OAuth exchange failure
**Context:** Called when `exchangeCodeForSession` returns error

---

### File: `app/auth/callback/route.ts`
**Line:** 23
```typescript
return NextResponse.redirect(new URL(returnTo, origin));
```
**Purpose:** Redirect to `returnTo` URL after successful OAuth exchange
**Context:** Called when OAuth code exchange succeeds

---

### File: `app/auth/callback/route.ts`
**Line:** 26
```typescript
return NextResponse.redirect(new URL('/', origin));
```
**Purpose:** Default redirect to homepage if no code parameter in callback URL
**Context:** Fallback when OAuth callback receives no authorization code

---

## 5. window.location

### File: `app/quote/page.tsx`
**Line:** 40
```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
```
**Purpose:** Build OAuth redirect URL with dynamic origin
**Context:** Used in `handleGoogleLogin` for Google OAuth

---

### File: `app/quote/page.tsx`
**Line:** 50
```typescript
window.location.reload();
```
**Purpose:** Reload page after logout
**Context:** Called in `handleLogout` after `supabase.auth.signOut()`

---

### File: `components/google-login-button.tsx`
**Line:** 12
```typescript
redirectTo: `${window.location.origin}/auth/callback?returnTo=/dashboard`
```
**Purpose:** Build OAuth redirect URL with dynamic origin
**Context:** Used in `handleGoogleLogin` for Google OAuth

---

### File: `app/login/page.tsx`
**Line:** 37
```typescript
const redirectUrl = `${window.location.origin}/auth/callback`;
```
**Purpose:** Build OAuth redirect URL with dynamic origin
**Context:** Used in `handleGoogleLogin` for Google OAuth

---

## 6. window.location.href

### File: `app/admin/page.tsx`
**Line:** 32
```typescript
window.location.href = '/dashboard';
```
**Purpose:** Redirect to dashboard after successful email/password login
**Context:** Called in `handleLogin` after `signInWithPassword` succeeds

---

### File: `app/dashboard/page.tsx`
**Line:** 112
```typescript
window.location.href = '/admin'; // ✅ router.push की जगह window.location.href
```
**Purpose:** Redirect to admin page if user not authenticated
**Context:** Called in `useEffect` when `getUser()` returns no user

---

### File: `app/dashboard/page.tsx`
**Line:** 121
```typescript
window.location.href = '/admin';
```
**Purpose:** Redirect to admin page on error
**Context:** Called in `useEffect` catch block

---

## 7. window.location.assign

**No occurrences found.**

---

## Redirect Flow Diagrams

### OAuth Login Flow (Google)

```
User clicks Google Login
       ↓
window.location.origin + '/auth/callback?returnTo=/dashboard'
       ↓
Google OAuth
       ↓
app/auth/callback/route.ts
       ↓
exchangeCodeForSession()
       ↓
NextResponse.redirect(new URL(returnTo, origin))
       ↓
User lands on /dashboard
```

### Email/Password Login Flow

```
User submits form
       ↓
signInWithPassword()
       ↓
window.location.href = '/dashboard'
       ↓
User lands on /dashboard
```

### Logout Flow

```
User clicks logout
       ↓
signOut()
       ↓
router.push("/") OR router.push("/admin")
       ↓
User lands on home or admin
```

### Protected Route Flow

```
User tries to access /dashboard
       ↓
proxy.ts middleware
       ↓
getSession()
       ↓
If no session → NextResponse.redirect(new URL('/', request.url))
       ↓
User lands on homepage
```

---

## Redirect Destination Summary

| Destination | Count | Methods |
|-------------|-------|---------|
| `/` (homepage) | 3 | NextResponse.redirect (2), router.push (1) |
| `/dashboard` | 4 | router.push (2), window.location.href (1), NextResponse.redirect (1 via returnTo) |
| `/admin` | 4 | router.push (1), window.location.href (3) |
| `/quote` | 1 | NextResponse.redirect (1 via returnTo) |
| `/?error=login_failed` | 1 | NextResponse.redirect (1) |

---

## Redirect Method Usage by File

| File | router.push | NextResponse.redirect | window.location.href | window.location.origin | window.location.reload |
|------|-------------|----------------------|---------------------|----------------------|----------------------|
| `components/logout-button.tsx` | 1 | 0 | 0 | 0 | 0 |
| `app/login/page.tsx` | 1 | 0 | 0 | 1 | 0 |
| `app/dashboard/page.tsx` | 1 | 0 | 2 | 0 | 0 |
| `proxy.ts` | 0 | 1 | 0 | 0 | 0 |
| `lib/supabase/middleware.ts` | 0 | 1 | 0 | 0 | 0 |
| `app/auth/callback/route.ts` | 0 | 3 | 0 | 0 | 0 |
| `app/admin/page.tsx` | 0 | 0 | 1 | 0 | 0 |
| `app/quote/page.tsx` | 0 | 0 | 0 | 1 | 1 |
| `components/google-login-button.tsx` | 0 | 0 | 0 | 1 | 0 |

---

## Issues Identified

### Issue 1: Inconsistent Redirect Methods
**Files:** `app/dashboard/page.tsx`, `app/admin/page.tsx`
**Problem:** Using `window.location.href` instead of `router.push`
**Impact:** Hard navigation, loses Next.js router state
**Recommendation:** Use `router.push()` for client-side redirects

### Issue 2: Middleware Redirect to Homepage
**File:** `proxy.ts:18`
**Problem:** Redirects unauthenticated users to `/` instead of `/admin`
**Impact:** Poor UX, users don't know how to login
**Recommendation:** Redirect to `/admin` for login

### Issue 3: Unused Middleware File
**File:** `lib/supabase/middleware.ts`
**Problem:** File exists but is never used
**Impact Code clutter, confusion
**Recommendation:** Delete file

---

## Best Practices

### Client-Side Redirects
- ✅ Use `router.push()` for navigation
- ✅ Use `router.replace()` to replace history
- ❌ Avoid `window.location.href` (loses Next.js state)

### Server-Side Redirects
- ✅ Use `NextResponse.redirect()` in API routes and middleware
- ✅ Use `redirect()` from `next/navigation` in server components

### OAuth Redirects
- ✅ Use `window.location.origin` for dynamic URLs
- ✅ Include `returnTo` parameter for post-login redirect
- ❌ Avoid hardcoded URLs

---

**End of Report**
