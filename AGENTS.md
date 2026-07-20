# SBBT CRM - CONTINUE DEVELOPMENT

Project:
SBBT CRM
Stack:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Server Actions

====================================================
CURRENT PROJECT STATUS
====================================================

Auth
✅ Stable

CMS Database
✅ Complete

CMS Forms
✅ Complete

CMS Server Actions
✅ Complete

Public RLS Policies
✅ Complete

ImageUploader
✅ Code Fix Applied
⚠ Runtime Verification Pending

Company CMS Integration
✅ Implemented
⚠ Runtime Verification Pending

Homepage CMS
⚠ Runtime Verification Pending

Build
✅ PASS

TypeScript
✅ PASS

====================================================
CURRENT MILESTONE
====================================================

Goal:

Complete CMS Runtime Stabilization.

DO NOT start new features.

====================================================
TOP PRIORITY
====================================================

1.
Image Upload

Verify:

✓ Upload

✓ Preview

✓ Save

✓ Refresh

✓ Database persistence

2.
Company CMS

Verify:

✓ Header

✓ Footer

✓ Contact Page

✓ Brand Name

✓ Logo

✓ Phone

✓ Email

✓ Address

✓ WhatsApp

3.
Homepage CMS

Verify:

✓ Hero Heading

✓ Subtitle

✓ CTA

✓ Hero Image

✓ Stats

====================================================
DEVELOPMENT RULES
====================================================

Runtime Stability
>

Data Integrity
>

Security
>

Architecture
>

Performance
>

Feature Development
>

Appearance

Never violate this priority.

====================================================
MODIFICATION RULES
====================================================

Before changing code:

1.
Investigate.

2.
Identify root cause.

3.
Find exact file.

4.
Touch minimum files.

5.
Avoid duplicate logic.

6.
Wait for approval before large refactors.

====================================================
STRICTLY FORBIDDEN
====================================================

❌ Duplicate Components

❌ Duplicate Types

❌ Duplicate Utilities

❌ Duplicate Hooks

❌ Duplicate Server Actions

❌ Duplicate Queries

❌ Direct DOM Manipulation
(document.querySelector, appendChild, innerHTML, etc.)

❌ Unnecessary Refactoring

❌ Authentication Changes

❌ Architecture Changes without approval

====================================================
AUTH IS FROZEN
====================================================

Never modify:

proxy.ts

app/auth/*

lib/auth/*

lib/supabase/*

unless explicitly requested.

====================================================
CMS RULES
====================================================

Reuse existing:

Server Actions

Types

ImageUploader

Storage Utilities

No duplicate CMS logic.

====================================================
COMPLETION RULE
====================================================

A task is NOT complete until ALL pass:

✅ Build

✅ TypeScript

✅ Runtime

✅ CRUD

✅ No Console Errors

✅ No React Warnings

✅ No Hydration Warnings

✅ No Network Errors

✅ Refresh Verified

✅ Regression Check

If runtime cannot be verified:

Report:

NOT VERIFIED

Never assume success.

====================================================
REPORT FORMAT
====================================================

Files Changed

Root Cause

Implementation

Build

TypeScript

Runtime

CRUD

Regression

Git Diff

Known Issues

Next Recommendation

====================================================
CURRENT TASK
====================================================

Do NOT create new features.

Continue from the current runtime stabilization.

First verify and fix:

1.
Image Upload

2.
Company CMS Runtime

3.
Homepage CMS Runtime

If any runtime issue exists:

Stop.

Fix only that issue.

After every fix:

Build

TypeScript

Runtime Verification

Wait for approval.

Do not proceed to the next task until the current runtime issue is fully resolved.