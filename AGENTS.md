# SBBT CRM - Development Agent Guide

## Project Overview

**Project Name:** SBBT CRM + CMS + AI Website Builder  
**Company:** Shree Badree Build Tech Pvt. Ltd.  
**Website:** https://www.sbbt.in

A production-ready Construction CRM + CMS platform evolving into an AI-powered Website Builder. Modular, scalable, and reusable architecture.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Storage
- Server Actions
- Vercel

## Development Priorities

Priority order (highest to lowest):

1. **Runtime Stability**
2. **Data Integrity**
3. **Security**
4. **Architecture**
5. **Performance**
6. **Feature Completion**
7. **UI / Appearance**

Never sacrifice higher priorities for lower ones.

## Modification Rules

Before modifying any file:

1. Identify the exact file.
2. Explain why it must be modified.
3. Check for existing implementation.
4. Avoid duplicate logic.
5. Modify the smallest possible surface area.

Never rewrite working components without approval.

## Runtime First Rule

If a runtime error exists:

- STOP feature development.
- Fix runtime first.
- Do not continue building new features.

## Feature Development Rules

Each feature must:

- Be production ready
- Be mobile responsive
- Be SEO friendly
- Be accessible
- Be reusable
- Be modular
- Be type safe

## Code Quality Rules

Never:

- Duplicate components
- Duplicate utilities
- Duplicate hooks
- Duplicate types
- Duplicate server actions

Always reuse existing code.

## Authentication Protection Rules

Authentication is stable. Do not modify authentication unless explicitly requested.

Protected files:

- `proxy.ts`
- `app/auth/*`
- `lib/auth/*`
- `lib/supabase/*`

## CMS Rules

When working with CMS modules:

- Reuse existing Server Actions
- Reuse existing Types
- Reuse ImageUploader component
- Reuse Storage utilities

Do not create duplicate CMS logic.

## Investigation Before Coding Rule

Before changing code:

1. Investigate first.
2. Return:
   - Root Cause
   - Files affected
   - Implementation plan

Wait for approval.

## Completion Rule

A task is NOT complete until:

- Build passes
- TypeScript passes
- Runtime verified
- CRUD verified (if applicable)
- No console errors
- No React warnings
- No hydration warnings
- No network/API errors
- No regressions

If runtime cannot be verified, report: **NOT VERIFIED**

Never assume success without verification.

## Reporting Format

Every completed task must include:

- Files Changed
- Build
- TypeScript
- Runtime
- CRUD
- Regression Check
- Git Diff
- Known Issues

## Git Commit Rule

Do not recommend commit until:

- Runtime is verified.

## Scope Control Rule

Touch only files required for the task.

Never refactor unrelated files.

Never introduce architectural changes without approval.