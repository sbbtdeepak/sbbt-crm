# Environment Check Report
## SBBT CRM Next.js Project

**Generated:** July 13, 2026  
**Scope:** Complete environment variable and URL analysis

---

## 1. Environment Variables Currently Used

### Required Environment Variables (2)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Purpose:** Supabase project URL for API calls
- **Usage:** 12 files across the project
- **Required:** ✅ YES (Critical)
- **Default Value:** None (must be set)

**Files using this variable:**
1. `proxy.ts` - Line 6, 10
2. `lib/supabase/server.ts` - Line 8
3. `lib/supabase/middleware.ts` - Line 10
4. `lib/supabase/client.ts` - Line 5
5. `app/login/page.tsx` - Line 17
6. `app/admin/page.tsx` - Line 7
7. `app/quote/page.tsx` - Line 7
8. `app/dashboard/page.tsx` - Line 8
9. `app/contact/page.tsx` - Line 27
10. `app/projects/page.tsx` - Line 8
11. `app/projects/[id]/page.tsx` - Line 9
12. `app/auth/callback/route.ts` - Line 11

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Purpose:** Supabase anonymous/public key for client-side access
- **Usage:** 12 files across the project
- **Required:** ✅ YES (Critical)
- **Default Value:** None (must be set)

**Files using this variable:**
1. `proxy.ts` - Line 7, 11
2. `lib/supabase/server.ts` - Line 9
3. `lib/supabase/middleware.ts` - Line 11
4. `lib/supabase/client.ts` - Line 6
5. `app/login/page.tsx` - Line 18
6. `app/admin/page.tsx` - Line 8
7. `app/quote/page.tsx` - Line 8
8. `app/dashboard/page.tsx` - Line 9
9. `app/contact/page.tsx` - Line 28
10. `app/projects/page.tsx` - Line 9
11. `app/projects/[id]/page.tsx` - Line 10
12. `app/auth/callback/route.ts` - Line 12

---

## 2. Missing Environment Variables

### Recommended but Not Used

#### `NEXT_PUBLIC_SITE_URL`
- **Purpose:** Base URL for the application (useful for OAuth redirects)
- **Current Usage:** ❌ NOT USED anywhere in codebase
- **Recommendation:** Should be added to replace hardcoded URLs
- **Expected Format:** `https://your-domain.vercel.app` or `http://localhost:3000`

#### `NEXT_PUBLIC_APP_URL`
- **Purpose:** Alternative name for site URL
- **Current Usage:** ❌ NOT USED anywhere in codebase
- **Recommendation:** Optional, could be used as alternative to SITE_URL

### Optional Environment Variables (Not Currently Used)

#### `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`
- **Purpose:** Google OAuth client ID (if using custom OAuth)
- **Current Usage:** ❌ NOT USED (using Supabase OAuth instead)
- **Recommendation:** Not needed with current Supabase OAuth setup

---

## 3. NEXT_PUBLIC_SITE_URL Usage

### Current Status: ❌ NOT USED

**Analysis:**
- The variable `NEXT_PUBLIC_SITE_URL` is not defined or used anywhere in the codebase
- No references found in any files
- Not present in `.env.example`

**Impact:**
- OAuth redirects rely on `window.location.origin` (dynamic)
- One hardcoded URL exists in `app/login/page.tsx`
- No centralized URL configuration

**Recommendation:**
Add `NEXT_PUBLIC_SITE_URL` to `.env.example` and use it for OAuth redirects:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Hardcoded URLs

### 🔴 CRITICAL: Hardcoded Vercel URL

**File:** `app/login/page.tsx`  
**Line:** 38  
**URL:** `https://sbbt-crm-new-seven.vercel.app/auth/callback`

```typescript
const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback'; // HARDCODED
```

**Issues:**
1. ❌ Will fail on localhost development
2. ❌ Will fail if deployed to different Vercel project
3. ❌ Will fail if domain changes
4. ❌ Not maintainable across environments

**Impact:**
- Google OAuth login will not work on localhost
- Deployment to other domains will break authentication
- Cannot test locally without modifying code

**Fix Required:**
Replace with:
```typescript
const redirectUrl = window.location.origin + '/auth/callback';
```

### Other URLs (Acceptable)

**README.md** - Documentation links (acceptable):
- `https://nextjs.org`
- `https://vercel.com/font`
- `https://github.com/vercel/next.js`
- `https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme`

**Public SVG files** - Namespace declarations (acceptable):
- `http://www.w3.org/2000/svg` in SVG files

**package-lock.json** - NPM registry URLs (acceptable):
- `https://registry.npmjs.org` - Standard NPM registry

---

## 5. Supabase URL Usage

### Environment Variable Usage

**Pattern:** All files use `process.env.NEXT_PUBLIC_SUPABASE_URL!`

**Consistency:** ✅ CONSISTENT across all files

**Files using Supabase URL (12 total):**

#### Direct Supabase Client Creation (9 files)
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```
- `app/login/page.tsx`
- `app/admin/page.tsx`
- `app/quote/page.tsx`
- `app/dashboard/page.tsx`
- `app/contact/page.tsx`
- `app/projects/page.tsx`
- `app/projects/[id]/page.tsx`
- `app/auth/callback/route.ts`
- `proxy.ts`

#### SSR Client Creation (3 files)
```typescript
import { createServerClient } from "@supabase/ssr";
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: {...} }
);
```
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

#### Browser Client Creation (1 file)
```typescript
import { createBrowserClient } from "@supabase/ssr";
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```
- `lib/supabase/client.ts`

### Analysis

**Strengths:**
- ✅ Consistent variable naming
- ✅ Non-null assertion operator (`!`) used throughout
- ✅ Environment variables are prefixed with `NEXT_PUBLIC_` for client-side access

**Weaknesses:**
- ⚠️ Mix of different Supabase client creation methods
- ⚠️ No fallback values if environment variables are missing
- ⚠️ No validation that environment variables are set

**Recommendations:**
1. Add environment variable validation at startup
2. Consider using a single client creation method consistently
3. Add fallback values for development

---

## 6. OAuth Redirect URLs

### Current OAuth Redirect Implementations

#### 1. `/login` Page (HARDCODED - ISSUE)
**File:** `app/login/page.tsx`  
**Line:** 38-44

```typescript
const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback';
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
  },
});
```

- **Method:** Hardcoded URL
- **Return Parameter:** None
- **Status:** 🔴 BROKEN on localhost
- **Fix Required:** Use `window.location.origin`

#### 2. `/quote` Page (DYNAMIC - CORRECT)
**File:** `app/quote/page.tsx`  
**Line:** 40-44

```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
  },
});
```

- **Method:** Dynamic `window.location.origin`
- **Return Parameter:** `returnTo=/quote`
- **Status:** ✅ CORRECT
- **Callback:** Handles returnTo parameter

#### 3. Google Login Button Component (DYNAMIC - INCONSISTENT)
**File:** `components/google-login-button.tsx`  
**Line:** 12

```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
```

- **Method:** Dynamic `window.location.origin`
- **Return Parameter:** `next=/dashboard` (WRONG PARAMETER NAME)
- **Status:** ⚠️ INCONSISTENT
- **Issue:** Uses `next` instead of `returnTo`
- **Callback:** Does NOT handle `next` parameter (only handles `returnTo`)

### Callback Handler

**File:** `app/auth/callback/route.ts`  
**Line:** 7, 23

```typescript
const returnTo = searchParams.get('returnTo') ?? '/'; // Default Homepage
// ...
return NextResponse.redirect(new URL(returnTo, origin));
```

- **Parameter Checked:** `returnTo` only
- **Default Redirect:** `/` (homepage)
- **Ignores:** `next` parameter (used in google-login-button.tsx)

### OAuth Redirect Flow Summary

**Working Flow (`/quote`):**
1. User on `/quote` clicks Google login
2. Redirects to: `{origin}/auth/callback?returnTo=/quote`
3. Google OAuth flow completes
4. Callback receives `returnTo=/quote`
5. Redirects to `/quote`
6. ✅ User stays on quote page

**Broken Flow (`/login`):**
1. User on `/login` clicks Google login
2. Redirects to: `https://sbbt-crm-new-seven.vercel.app/auth/callback` (HARDCODED)
3. Google OAuth flow completes
4. Callback receives NO `returnTo` parameter
5. Redirects to `/` (homepage - default)
6. ❌ User ends up on homepage instead of dashboard

**Inconsistent Flow (Google Login Button):**
1. User clicks Google login button
2. Redirects to: `{origin}/auth/callback?next=/dashboard`
3. Google OAuth flow completes
4. Callback receives `next=/dashboard` but ignores it
5. Redirects to `/` (homepage - default)
6. ❌ User ends up on homepage instead of dashboard

### Issues Found

1. **Hardcoded URL in `/login`** - Critical issue
2. **Inconsistent parameter names** - `returnTo` vs `next`
3. **Missing returnTo in `/login`** - No redirect after login
4. **Callback ignores `next` parameter** - Component uses wrong parameter name

---

## 7. Vercel Environment Variables Required

### Required for Vercel Deployment

#### Production Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Recommended Additional Variables
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Vercel Environment Setup Steps

1. **Go to Vercel Project Settings**
   - Navigate to your project on Vercel
   - Go to Settings → Environment Variables

2. **Add Required Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

3. **Add Recommended Variables**
   - `NEXT_PUBLIC_SITE_URL` - Your Vercel domain

4. **Environment-Specific Values**
   - **Production:** `https://your-domain.vercel.app`
   - **Preview:** `https://your-preview-url.vercel.app`
   - **Development:** `http://localhost:3000`

### Supabase Configuration Required

#### Supabase Dashboard Settings

1. **Go to Supabase Dashboard → Authentication → URL Configuration**

2. **Site URL**
   - Set to: `https://your-domain.vercel.app`
   - For local development: `http://localhost:3000`

3. **Redirect URLs**
   Add these URLs to allowed redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
   - `https://your-preview-url.vercel.app/auth/callback`

4. **Additional Redirect URLs (if needed)**
   - `https://your-domain.vercel.app/**` (Wildcard for testing)

### Current `.env.example` Content

**File:** `.env.example`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Status:** ✅ Contains required variables  
**Missing:** `NEXT_PUBLIC_SITE_URL` (recommended)

---

## 8. Dynamic URL Usage

### `window.location.origin` Usage

**Files using `window.location.origin`:**

#### 1. `app/quote/page.tsx` (Line 40)
```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
```
- **Status:** ✅ CORRECT
- **Behavior:** Dynamically gets current origin
- **Works on:** Localhost and production

#### 2. `components/google-login-button.tsx` (Line 12)
```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
```
- **Status:** ⚠️ CORRECT METHOD, WRONG PARAMETER
- **Behavior:** Dynamically gets current origin
- **Issue:** Uses `next` instead of `returnTo`

### Analysis

**Advantages of `window.location.origin`:**
- ✅ Works on localhost automatically
- ✅ Works on any domain without configuration
- ✅ No need for environment variables
- ✅ No hardcoded URLs

**Disadvantages:**
- ⚠️ Cannot be used in server components
- ⚠️ Requires JavaScript execution
- ⚠️ May not work in all edge cases (e.g., iframes)

**Recommendation:**
Continue using `window.location.origin` for client-side redirects, but add `NEXT_PUBLIC_SITE_URL` as fallback for server-side use.

---

## 9. Environment Variable Validation

### Current Validation Status

**Validation:** ❌ NO VALIDATION

**Analysis:**
- No startup checks for environment variables
- No validation in middleware
- No validation in API routes
- No error messages if variables are missing

**Impact:**
- Application will crash if environment variables are missing
- Hard to debug missing variable issues
- Poor developer experience

**Recommended Validation:**

Add validation in `lib/supabase/client.ts`:
```typescript
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
```

---

## 10. Security Considerations

### Environment Variable Exposure

**Client-Side Variables (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_SUPABASE_URL` - ✅ Safe to expose (public URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ Safe to expose (designed for public use)
- `NEXT_PUBLIC_SITE_URL` - ✅ Safe to expose (public URL)

**Server-Side Variables (not prefixed):**
- None currently used
- Consider adding for sensitive values if needed

### Supabase Security

**Anon Key Security:**
- ✅ Anon key is designed for client-side use
- ✅ Row Level Security (RLS) should be enabled in Supabase
- ⚠️ Ensure RLS policies are properly configured

**Recommendations:**
1. Enable Row Level Security in Supabase
2. Review RLS policies for all tables
3. Use service role key only in server-side code (never expose to client)
4. Regularly rotate anon keys if compromised

---

## 11. Summary of Issues

### 🔴 Critical Issues

1. **Hardcoded Vercel URL in `/login` page**
   - File: `app/login/page.tsx:38`
   - Impact: Breaks localhost development and other deployments
   - Fix: Replace with `window.location.origin + '/auth/callback'`

2. **Inconsistent OAuth redirect parameters**
   - Files: `app/quote/page.tsx` uses `returnTo`, `components/google-login-button.tsx` uses `next`
   - Impact: Google login button doesn't work correctly
   - Fix: Standardize on `returnTo` parameter

### 🟡 Medium Issues

3. **Missing `NEXT_PUBLIC_SITE_URL` environment variable**
   - Impact: No centralized URL configuration
   - Fix: Add to `.env.example` and use where appropriate

4. **No environment variable validation**
   - Impact: Hard to debug missing variables
   - Fix: Add validation at startup

5. **Missing returnTo parameter in `/login`**
   - Impact: Users redirected to homepage after login instead of dashboard
   - Fix: Add `?returnTo=/dashboard` to OAuth redirect URL

### 🟢 Low Issues

6. **Mix of Supabase client creation methods**
   - Impact: Inconsistent cookie handling
   - Fix: Standardize on one method

---

## 12. Recommended Fixes

### Immediate Actions (Priority 1)

1. **Fix hardcoded URL in `app/login/page.tsx`**
   ```typescript
   // Change line 38 from:
   const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback';
   // To:
   const redirectUrl = window.location.origin + '/auth/callback?returnTo=/dashboard';
   ```

2. **Fix parameter name in `components/google-login-button.tsx`**
   ```typescript
   // Change line 12 from:
   redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
   // To:
   redirectTo: `${window.location.origin}/auth/callback?returnTo=/dashboard`
   ```

3. **Update `.env.example`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### Short-term Actions (Priority 2)

4. **Add environment variable validation**
   - Add validation in `lib/supabase/client.ts`
   - Add validation in `lib/supabase/server.ts`
   - Add startup check in root layout

5. **Document Vercel environment setup**
   - Add deployment guide to README.md
   - Document Supabase redirect URL configuration

### Long-term Actions (Priority 3)

6. **Standardize Supabase client creation**
   - Choose one method (SSR vs direct)
   - Update all files to use consistent method

7. **Add comprehensive error handling**
   - Handle missing environment variables gracefully
   - Show user-friendly error messages

---

## 13. Environment Variable Reference

### Complete `.env.example` (Recommended)

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Application URL (Recommended)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Add custom configurations below
# NEXT_PUBLIC_APP_NAME=SBBT CRM
# NEXT_PUBLIC_SUPPORT_EMAIL=support@sbbt.com
```

### Environment-Specific Values

**Development (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Production (Vercel):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**Preview (Vercel):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
NEXT_PUBLIC_SITE_URL=https://your-preview-url.vercel.app
```

---

## 14. Deployment Checklist

### Before Deploying to Vercel

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in Vercel environment variables
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel environment variables (recommended)
- [ ] Configure Supabase redirect URLs in Supabase dashboard
- [ ] Set Supabase Site URL in Supabase dashboard
- [ ] Enable Row Level Security in Supabase
- [ ] Test OAuth flow on preview deployment
- [ ] Fix hardcoded URL in `app/login/page.tsx`
- [ ] Fix parameter name in `components/google-login-button.tsx`

### Supabase Configuration Checklist

- [ ] Add production domain to Supabase Site URL
- [ ] Add `/auth/callback` redirect URL to Supabase
- [ ] Add localhost redirect URL for development
- [ ] Enable Google OAuth provider in Supabase
- [ ] Configure Google OAuth credentials in Supabase
- [ ] Review and enable Row Level Security policies
- [ ] Test authentication flow end-to-end

---

**End of Report**
