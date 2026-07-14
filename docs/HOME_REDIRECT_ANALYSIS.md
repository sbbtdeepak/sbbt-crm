# Home Redirect Analysis
## app/page.tsx Analysis

**Generated:** July 13, 2026  
**File Analyzed:** `app/page.tsx` (45 lines)

---

## Analysis Results

### 1. Why authenticated users are redirected to Home?

**Answer:** `app/page.tsx` is NOT the cause of the redirect.

The homepage (`app/page.tsx`) is a static component that does NOT perform any redirects. It simply displays the homepage content (hero section and footer).

---

### 2. Is page.tsx checking getUser() or getSession()?

**Answer:** NO

**Analysis:**
- The file does NOT import Supabase
- The file does NOT call `getUser()`
- The file does NOT call `getSession()`
- The file does NOT have any authentication logic

**Code Evidence:**
```typescript
"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-indigo-50 to-blue-50">
        {/* ... content ... */}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center text-sm">
        {/* ... footer content ... */}
      </footer>
    </div>
  );
}
```

---

### 3. Does page.tsx automatically redirect logged-in users?

**Answer:** NO

**Analysis:**
- The component has NO `useEffect` hooks
- The component has NO authentication checks
- The component has NO redirect logic
- The component is purely presentational

---

### 4. Is there any redirect("/") or router.push("/")?

**Answer:** NO

**Search Results:**
- NO `redirect('/')` found
- NO `router.push('/')` found
- NO `window.location.href = '/'` found
- NO redirect logic of any kind

---

### 5. Is page.tsx intentionally sending authenticated users to Home instead of Dashboard?

**Answer:** NO

**Analysis:**
- The homepage is the default landing page for ALL users (authenticated or not)
- The homepage does NOT check authentication status
- The homepage does NOT have conditional logic based on auth state
- The homepage is designed to be the public landing page

**Design Intent:**
- Homepage is for public visitors
- Homepage has "Get Quote Now" button for visitors
- Homepage has "Admin Login" link in footer for admins
- Authenticated users can still visit homepage if they want

---

### 6. If this file is the cause, explain the exact code block responsible.

**Answer:** This file is NOT the cause.

**Conclusion:**
`app/page.tsx` is NOT responsible for redirecting authenticated users to Home. It is a static homepage component that displays content to all users regardless of authentication status.

---

## Actual Cause of Redirect to Home

Based on previous analysis, the actual cause of authenticated users being redirected to Home is:

### Primary Cause: OAuth Callback Default

**File:** `app/auth/callback/route.ts`  
**Line:** 7

```typescript
const returnTo = searchParams.get('returnTo') ?? '/'; // Default Homepage
```

**Explanation:**
- When OAuth callback receives NO `returnTo` parameter, it defaults to `/` (homepage)
- This happens when login pages don't include `returnTo` in their OAuth redirect URL
- Previously, `app/login/page.tsx` had hardcoded URL without `returnTo` parameter
- This has been fixed, but the callback still defaults to `/` as a fallback

### Secondary Cause: Missing returnTo in Login Flows

**Historical Issue (Now Fixed):**
- `app/login/page.tsx` previously used hardcoded URL without `returnTo`
- `components/google-login-button.tsx` previously used `next=` instead of `returnTo`
- Both have been fixed to use `returnTo=/dashboard`

**Current Status:**
- `app/login/page.tsx` now uses `returnTo=/dashboard` via `queryParams`
- `components/google-login-button.tsx` now uses `returnTo=/dashboard`
- `app/quote/page.tsx` uses `returnTo=/quote`

---

## Summary

| Question | Answer |
|---------|--------|
| Is `app/page.tsx` the cause? | NO |
| Does it check `getUser()` or `getSession()`? | NO |
| Does it automatically redirect logged-in users? | NO |
| Does it have `redirect('/')` or `router.push('/')`? | NO |
| Is it intentionally sending users to Home? | NO (it's the homepage) |
| Exact code block responsible? | None (not the cause) |

---

## Recommendation

The redirect to Home issue is NOT caused by `app/page.tsx`. The issue was in the OAuth callback default behavior and login page implementations, which have now been fixed.

**Current State:**
- ✅ `app/login/page.tsx` - Uses `returnTo=/dashboard`
- ✅ `components/google-login-button.tsx` - Uses `returnTo=/dashboard`
- ✅ `app/quote/page.tsx` - Uses `returnTo=/quote`
- ✅ `app/auth/callback/route.ts` - Reads `returnTo` parameter correctly

**Expected Behavior Now:**
- `/login` → Google OAuth → `/dashboard`
- `/quote` → Google OAuth → `/quote`
- Google Login Button → Google OAuth → `/dashboard`

---

**End of Analysis**
