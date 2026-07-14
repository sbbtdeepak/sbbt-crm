# Authentication Entry Points Analysis
## SBBT CRM Next.js Project

**Generated:** July 13, 2026  
**Scope:** Complete authentication entry points analysis

---

## Authentication Entry Points Summary

| Entry Point | Route | Auth Method | Redirect After Login | Session Creation | Session Check |
|-------------|-------|-------------|---------------------|------------------|---------------|
| `/login` | `app/login/page.tsx` | Google OAuth | `/dashboard` | No (Callback) | Yes (getUser) |
| `/admin` | `app/admin/page.tsx` | Email/Password | `/dashboard` | Yes (Direct) | No |
| `/quote` | `app/quote/page.tsx` | Google OAuth | `/quote` | No (Callback) | Yes (getUser + onAuthStateChange) |
| `/dashboard` | `app/dashboard/page.tsx` | N/A (Protected) | N/A | No | Yes (getUser) |

---

## 1. app/login/page.tsx Flow

### File: `app/login/page.tsx` (73 lines)

### Authentication Method: Google OAuth

### Complete Flow

#### Step 1: Page Load
```typescript
useEffect(() => {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  setIsReady(true);

  supabase.auth.getUser().then(({ data }: { data: any }) => {
    if (data?.user) {
      router.push('/dashboard');
    }
    setLoading(false);
  });
}, [router]);
```

**What Happens:**
1. Creates Supabase client (singleton pattern)
2. Checks if user is already authenticated
3. If authenticated, redirects to `/dashboard`
4. Sets loading state to false

#### Step 2: User Clicks Google Login
```typescript
const handleGoogleLogin = async () => {
  if (!isReady || !supabase) {
    alert('Please wait...');
    return;
  }

  // ✅ सीधा Live URL (हार्ड-कोडेड)
  const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback';
  console.log('🔍 Redirecting to:', redirectUrl);

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
};
```

**What Happens:**
1. Validates Supabase client is ready
2. Uses HARDCODED Vercel URL (CRITICAL ISSUE)
3. Calls `signInWithOAuth` with Google provider
4. Redirects to Google OAuth consent page
5. **NO `returnTo` parameter** - Callback will redirect to homepage

#### Step 3: OAuth Callback
- Google redirects to `/auth/callback`
- Callback handler exchanges code for session
- Session created in `app/auth/callback/route.ts`
- Redirects to `/` (homepage) - NO `returnTo` parameter

#### Step 4: Post-Login
- User ends up on homepage instead of dashboard
- User must manually navigate to `/dashboard`

### Redirect After Login
**Destination:** `/dashboard` (via client-side check on page load)  
**Actual Behavior:** `/` (homepage) - due to missing `returnTo` parameter

### Session Creation
**Method:** Indirect via OAuth callback  
**Location:** `app/auth/callback/route.ts`  
**Method Used:** `exchangeCodeForSession(code)`

### Session Check
**Method:** `getUser()`  
**Location:** Line 23  
**Purpose:** Check if already authenticated on page load

### Issues
1. 🔴 **HARDCODED URL** - Breaks localhost development
2. 🔴 **No `returnTo` parameter** - Users redirected to homepage instead of dashboard
3. 🟡 Singleton pattern for Supabase client

---

## 2. app/admin/page.tsx Flow

### File: `app/admin/page.tsx` (82 lines)

### Note: No `app/admin/login/page.tsx` exists
- Only `app/admin/page.tsx` exists
- This is the admin login page

### Authentication Method: Email/Password

### Complete Flow

#### Step 1: Page Load
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**What Happens:**
1. Creates Supabase client (module-level)
2. No session check on page load
3. Shows login form immediately

#### Step 2: User Submits Form
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    setLoading(false);
  } else {
    // ✅ Login के बाद Dashboard पर भेजें
    window.location.href = '/dashboard';
  }
};
```

**What Happens:**
1. Validates form submission
2. Calls `signInWithPassword` with email and password
3. If error, displays error message
4. If success, redirects to `/dashboard`

#### Step 3: Session Creation
- Session created directly by `signInWithPassword`
- No OAuth callback needed
- Session stored in Supabase cookies automatically

### Redirect After Login
**Destination:** `/dashboard`  
**Method:** `window.location.href = '/dashboard'`  
**Status:** ✅ WORKING CORRECTLY

### Session Creation
**Method:** Direct  
**Location:** `app/admin/page.tsx` (Line 22)  
**Method Used:** `signInWithPassword({ email, password })`

### Session Check
**Method:** None  
**Status:** No session check on page load  
**Purpose:** Assumes user is not authenticated

### Issues
1. 🟢 No critical issues
2. 🟡 No session check on page load (could redirect if already authenticated)

---

## 3. Which Page is Google OAuth?

### Google OAuth Entry Points

#### Primary: `/login` (`app/login/page.tsx`)
- **Route:** `/login`
- **Purpose:** Admin login via Google
- **UI:** "Continue with Google" button
- **Redirect URL:** HARDCODED to Vercel
- **ReturnTo Parameter:** None
- **Status:** 🔴 BROKEN on localhost

#### Secondary: `/quote` (`app/quote/page.tsx`)
- **Route:** `/quote`
- **Purpose:** Quote request login via Google
- **UI:** Google login button (shown when not authenticated)
- **Redirect URL:** Dynamic (`window.location.origin`)
- **ReturnTo Parameter:** `returnTo=/quote`
- **Status:** ✅ WORKING CORRECTLY

#### Component: Google Login Button (`components/google-login-button.tsx`)
- **Type:** Reusable component
- **Purpose:** Can be used anywhere
- **Redirect URL:** Dynamic (`window.location.origin`)
- **ReturnTo Parameter:** `next=/dashboard` (WRONG PARAMETER NAME)
- **Status:** ⚠️ INCONSISTENT parameter name

### Summary

| Page | Google OAuth? | Status |
|------|--------------|--------|
| `/login` | ✅ Yes | 🔴 Broken (hardcoded URL) |
| `/quote` | ✅ Yes | ✅ Working (dynamic URL) |
| `/admin` | ❌ No | N/A (Email/Password) |
| `GoogleLoginButton` component | ✅ Yes | ⚠️ Wrong parameter name |

---

## 4. Which Page is Email/Password?

### Email/Password Entry Points

#### Primary: `/admin` (`app/admin/page.tsx`)
- **Route:** `/admin`
- **Purpose:** Admin login via email/password
- **UI:** Email and password input fields
- **Method:** `signInWithPassword`
- **Status:** ✅ WORKING CORRECTLY

### Summary

| Page | Email/Password? | Status |
|------|------------------|--------|
| `/login` | ❌ No | N/A (Google OAuth only) |
| `/quote` | ❌ No | N/A (Google OAuth only) |
| `/admin` | ✅ Yes | ✅ Working |

---

## 5. Where Each Page Redirects After Login

### `/login` (Google OAuth)
**Intended Redirect:** `/dashboard`  
**Actual Redirect:** `/` (homepage)  
**Reason:** Missing `returnTo` parameter in OAuth redirect URL  
**Code:** 
```typescript
const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback'; // No returnTo
```

### `/admin` (Email/Password)
**Redirect:** `/dashboard`  
**Status:** ✅ WORKING CORRECTLY  
**Code:**
```typescript
window.location.href = '/dashboard';
```

### `/quote` (Google OAuth)
**Redirect:** `/quote`  
**Status:** ✅ WORKING CORRECTLY  
**Reason:** Includes `returnTo=/quote` parameter  
**Code:**
```typescript
const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
```

### Summary Table

| Entry Point | Auth Method | Intended Redirect | Actual Redirect | Status |
|-------------|-------------|------------------|-----------------|--------|
| `/login` | Google OAuth | `/dashboard` | `/` | 🔴 Wrong |
| `/admin` | Email/Password | `/dashboard` | `/dashboard` | ✅ Correct |
| `/quote` | Google OAuth | `/quote` | `/quote` | ✅ Correct |

---

## 6. Which Page Creates Session

### Session Creation Methods

#### Method 1: OAuth Callback (Indirect)
**Location:** `app/auth/callback/route.ts`  
**Entry Points Using This:**
- `/login` (Google OAuth)
- `/quote` (Google OAuth)
- `GoogleLoginButton` component

**Process:**
1. User initiates OAuth on login page
2. Redirected to Google
3. Google redirects to `/auth/callback`
4. Callback exchanges code for session
5. Session created and stored in cookies

**Code:**
```typescript
const { error } = await supabase.auth.exchangeCodeForSession(code);
```

#### Method 2: Direct Login (Direct)
**Location:** `app/admin/page.tsx`  
**Entry Points Using This:**
- `/admin` (Email/Password)

**Process:**
1. User submits email/password form
2. Direct call to Supabase auth
3. Session created immediately
4. Session stored in cookies

**Code:**
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Summary

| Entry Point | Session Creation Method | Location |
|-------------|------------------------|----------|
| `/login` | OAuth Callback | `app/auth/callback/route.ts` |
| `/admin` | Direct | `app/admin/page.tsx` |
| `/quote` | OAuth Callback | `app/auth/callback/route.ts` |

---

## 7. Which Page Checks Session

### Session Check Methods

#### Method 1: `getUser()` (One-time Check)

**Locations:**
1. `app/login/page.tsx` (Line 23)
2. `app/quote/page.tsx` (Line 21)
3. `app/dashboard/page.tsx` (Line 107)

**Purpose:** Check if user is currently authenticated

**Code Example:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

**Behavior:**
- One-time check when component mounts
- Does not react to auth state changes
- Requires manual refresh to detect changes

#### Method 2: `onAuthStateChange()` (Reactive Listener)

**Location:**
- `app/quote/page.tsx` (Line 28)

**Purpose:** Listen to auth state changes in real-time

**Code Example:**
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    setUser(session?.user || null);
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
  }
});
```

**Behavior:**
- Reacts to auth state changes
- Updates user state automatically
- Handles token refresh
- Must unsubscribe on unmount

#### Method 3: Middleware (Server-Side)

**Location:**
- `proxy.ts` (Line 14)

**Purpose:** Server-side session check for protected routes

**Code Example:**
```typescript
const { data: { session } } = await supabase.auth.getSession();

if (request.nextUrl.pathname.startsWith('/dashboard')) {
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

**Behavior:**
- Server-side check before page loads
- Protects `/dashboard` route
- Redirects unauthenticated users

### Session Check by Page

| Page | Session Check Method | Purpose |
|------|----------------------|---------|
| `/login` | `getUser()` | Check if already authenticated, redirect to dashboard |
| `/admin` | None | No session check (assumes not authenticated) |
| `/quote` | `getUser()` + `onAuthStateChange()` | Check auth and react to changes |
| `/dashboard` | `getUser()` | Check if authenticated, redirect if not |
| `proxy.ts` (middleware) | `getSession()` | Server-side protection for `/dashboard` |

### Summary

**Pages with Session Check:**
- ✅ `/login` - Checks on page load
- ✅ `/quote` - Checks on page load + reactive listener
- ✅ `/dashboard` - Checks on page load
- ✅ `proxy.ts` - Server-side check for `/dashboard`

**Pages without Session Check:**
- ❌ `/admin` - No session check

---

## 8. Complete Authentication Flow Diagrams

### Flow 1: Google OAuth via `/login`

```
User visits /login
       ↓
Page checks if already authenticated (getUser)
       ↓
If authenticated → Redirect to /dashboard
       ↓
If not → Show "Continue with Google" button
       ↓
User clicks button
       ↓
Redirect to Google OAuth (HARDCODED URL - ISSUE)
       ↓
User approves on Google
       ↓
Google redirects to /auth/callback
       ↓
Callback exchanges code for session
       ↓
Session created in cookies
       ↓
Redirect to / (NO returnTo - ISSUE)
       ↓
User ends up on homepage instead of dashboard
```

### Flow 2: Email/Password via `/admin`

```
User visits /admin
       ↓
Show email/password form (no session check)
       ↓
User enters credentials
       ↓
User submits form
       ↓
Call signInWithPassword
       ↓
Session created directly
       ↓
Redirect to /dashboard
       ↓
User lands on dashboard
```

### Flow 3: Google OAuth via `/quote`

```
User visits /quote
       ↓
Page checks auth status (getUser)
       ↓
If authenticated → Show quote form
       ↓
If not → Show Google login button
       ↓
User clicks login
       ↓
Redirect to Google OAuth (dynamic URL)
       ↓
User approves on Google
       ↓
Google redirects to /auth/callback?returnTo=/quote
       ↓
Callback exchanges code for session
       ↓
Session created in cookies
       ↓
Redirect to /quote (returnTo parameter)
       ↓
onAuthStateChange listener updates user state
       ↓
Quote form appears
```

---

## 9. Issues Summary

### Critical Issues

#### Issue 1: Hardcoded URL in `/login`
**File:** `app/login/page.tsx:38`  
**Problem:** `'https://sbbt-crm-new-seven.vercel.app/auth/callback'`  
**Impact:** Breaks localhost development  
**Fix:** Use `window.location.origin + '/auth/callback?returnTo=/dashboard'`

#### Issue 2: Missing returnTo in `/login`
**File:** `app/login/page.tsx:38`  
**Problem:** No `returnTo` parameter in redirect URL  
**Impact:** Users redirected to homepage instead of dashboard  
**Fix:** Add `?returnTo=/dashboard` to redirect URL

#### Issue 3: Wrong Parameter Name in Component
**File:** `components/google-login-button.tsx:12`  
**Problem:** Uses `next` instead of `returnTo`  
**Impact:** Callback ignores parameter, redirects to homepage  
**Fix:** Change `next` to `returnTo`

### Medium Issues

#### Issue 4: No Session Check on `/admin`
**File:** `app/admin/page.tsx`  
**Problem:** No session check on page load  
**Impact:** Already authenticated users see login form  
**Fix:** Add `getUser()` check on page load

#### Issue 5: Inconsistent Auth Methods
**Problem:** Two separate login pages with different methods  
**Impact:** Confusing UX  
**Fix:** Consolidate or clearly differentiate purposes

---

## 10. Recommendations

### Priority 1: Critical Fixes

1. **Fix hardcoded URL in `/login`**
   ```typescript
   // Change line 38 from:
   const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback';
   // To:
   const redirectUrl = window.location.origin + '/auth/callback?returnTo=/dashboard';
   ```

2. **Fix parameter name in Google Login Button**
   ```typescript
   // Change line 12 from:
   redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
   // To:
   redirectTo: `${window.location.origin}/auth/callback?returnTo=/dashboard`
   ```

### Priority 2: Improvements

3. **Add session check to `/admin`**
   ```typescript
   useEffect(() => {
     supabase.auth.getUser().then(({ data }) => {
       if (data?.user) {
         window.location.href = '/dashboard';
       }
     });
   }, []);
   ```

4. **Add onAuthStateChange to `/login`**
   ```typescript
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'SIGNED_IN') {
         router.push('/dashboard');
       }
     });
     return () => subscription.unsubscribe();
   }, [router]);
   ```

### Priority 3: Architecture

5. **Consider consolidating login pages**
   - Single login page with both Google and Email/Password options
   - Clearer UX
   - Easier maintenance

---

**End of Analysis**
