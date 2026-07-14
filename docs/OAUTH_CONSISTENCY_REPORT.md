# OAuth Consistency Report
## Google OAuth Implementation Analysis

**Generated:** July 13, 2026  
**Files Analyzed:**
1. `components/google-login-button.tsx`
2. `app/quote/page.tsx`
3. `app/login/page.tsx` (for comparison)

---

## Verification Results

### 1. Does every Google OAuth call use `returnTo=`?

**FAIL** - Not consistent

| File | Parameter Used | Status |
|------|----------------|--------|
| `components/google-login-button.tsx` | `next=/dashboard` | ❌ FAIL |
| `app/quote/page.tsx` | `returnTo=/quote` | ✅ PASS |
| `app/login/page.tsx` | `returnTo=/dashboard` (via queryParams) | ✅ PASS |

**Issue:** `components/google-login-button.tsx` uses `next=` instead of `returnTo=`

---

### 2. Is there any remaining usage of `next=`?

**FAIL** - Yes, found in one file

**Location:** `components/google-login-button.tsx:12`

```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
```

**Impact:** Callback handler (`app/auth/callback/route.ts`) only checks for `returnTo` parameter, so `next=` is ignored. Users will be redirected to homepage instead of dashboard.

---

### 3. Are there any hardcoded URLs?

**PASS** - No hardcoded URLs found

| File | URL Method | Status |
|------|------------|--------|
| `components/google-login-button.tsx` | `window.location.origin` | ✅ PASS |
| `app/quote/page.tsx` | `window.location.origin` | ✅ PASS |
| `app/login/page.tsx` | `window.location.origin` | ✅ PASS |

**Details:**
- `components/google-login-button.tsx:12` - Uses `window.location.origin`
- `app/quote/page.tsx:40` - Uses `window.location.origin`
- `app/login/page.tsx:37` - Uses `window.location.origin`

---

### 4. Do both files use `window.location.origin` correctly?

**PASS** - Both files use it correctly

| File | Usage | Status |
|------|-------|--------|
| `components/google-login-button.tsx` | `${window.location.origin}/auth/callback` | ✅ PASS |
| `app/quote/page.tsx` | `window.location.origin + '/auth/callback?returnTo=/quote'` | ✅ PASS |

**Note:** Both use dynamic origin, which works on localhost and production.

---

### 5. Is there any inconsistency between login/page.tsx and these files?

**FAIL** - Yes, parameter naming inconsistency

### Comparison Table

| Aspect | `app/login/page.tsx` | `app/quote/page.tsx` | `components/google-login-button.tsx` |
|--------|---------------------|---------------------|-----------------------------------|
| **Parameter Name** | `returnTo` (via queryParams) | `returnTo` | `next` ❌ |
| **URL Method** | `window.location.origin` | `window.location.origin` | `window.location.origin` |
| **Redirect Target** | `/dashboard` | `/quote` | `/dashboard` |
| **Implementation** | `queryParams` object | Query string in URL | Query string in URL |
| **Consistency** | ✅ Consistent with callback | ✅ Consistent with callback | ❌ Inconsistent |

### Detailed Comparison

#### `app/login/page.tsx` (Lines 37-46)
```typescript
const redirectUrl = `${window.location.origin}/auth/callback`;
console.log('🔍 Redirecting to:', redirectUrl);

await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
    queryParams: {
      returnTo: '/dashboard',
    },
  },
});
```
- **Method:** Uses `queryParams` object
- **Parameter:** `returnTo`
- **Status:** ✅ Correct

#### `app/quote/page.tsx` (Lines 40-46)
```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
  },
});
```
- **Method:** Query string in URL
- **Parameter:** `returnTo`
- **Status:** ✅ Correct

#### `components/google-login-button.tsx` (Lines 12-13)
```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
```
- **Method:** Query string in URL
- **Parameter:** `next` ❌
- **Status:** ❌ Wrong parameter name

---

## Issues Summary

### Critical Issue

**Issue:** `components/google-login-button.tsx` uses `next=` instead of `returnTo=`

**Location:** Line 12

**Current Code:**
```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
```

**Impact:**
- Callback handler ignores `next` parameter
- Users redirected to homepage instead of dashboard
- Inconsistent with other OAuth implementations

**Fix Required:**
```typescript
redirectTo: `${window.location.origin}/auth/callback?returnTo=/dashboard`,
```

---

## Implementation Differences

### Method 1: Query String in URL
**Used by:** `app/quote/page.tsx`, `components/google-login-button.tsx`

```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
  },
});
```

### Method 2: queryParams Object
**Used by:** `app/login/page.tsx`

```typescript
const redirectUrl = `${window.location.origin}/auth/callback`;
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
    queryParams: {
      returnTo: '/dashboard',
    },
  },
});
```

**Note:** Both methods are valid, but parameter naming must be consistent.

---

## Recommendations

### Priority 1: Fix Parameter Name

**File:** `components/google-login-button.tsx`  
**Line:** 12

**Change:**
```typescript
// From:
redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`

// To:
redirectTo: `${window.location.origin}/auth/callback?returnTo=/dashboard`
```

### Priority 2: Standardize Implementation Method (Optional)

**Option A:** Use query string for all (simpler)
```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/dashboard';
```

**Option B:** Use queryParams for all (cleaner)
```typescript
const redirectUrl = window.location.origin + '/auth/callback';
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
    queryParams: {
      returnTo: '/dashboard',
    },
  },
});
```

---

## Final Verification Summary

| Check | Result |
|-------|--------|
| Every Google OAuth uses `returnTo=` | ❌ FAIL |
| No remaining `next=` usage | ❌ FAIL |
| No hardcoded URLs | ✅ PASS |
| Correct `window.location.origin` usage | ✅ PASS |
| Consistency with login/page.tsx | ❌ FAIL |

---

**End of Report**
