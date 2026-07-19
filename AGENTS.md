<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data.

Before writing or modifying any code:

- Read the relevant documentation from `node_modules/next/dist/docs/`.
- Follow the latest Next.js 16 conventions.
- Respect deprecation warnings.
- Never assume older Next.js APIs are valid.

<!-- END:nextjs-agent-rules -->

# SBBT CRM Project Rules

## General

- This is a production project.
- Prioritize stability over speed.
- Never rewrite working code.
- Never perform repository-wide refactors unless explicitly requested.
- Make the smallest possible change.
- Always preserve existing functionality.

---

## Development Workflow

Before writing code:

1. Analyze
2. Verify assumptions
3. Show affected files
4. Explain root cause
5. Show implementation plan
6. Wait for approval

Never skip the approval step.

---

## Feature Development

- Build one feature at a time.
- Complete one phase before starting the next.
- Never combine multiple milestones into one implementation.
- Keep changes scoped only to the current feature.

---

## Authentication

Authentication is frozen.

Do NOT modify:

- app/auth/*
- proxy.ts
- app/login/*
- lib/supabase/*

Unless explicitly instructed.

---

## Supabase

- Use existing project architecture.
- Do not create duplicate clients.
- Reuse existing helpers.
- Follow Supabase SSR best practices.

---

## Shared Components

Shared components must always be:

- Generic
- Reusable
- Type-safe
- Independent of CMS-specific types

Never duplicate components.

Always reuse existing components whenever possible.

---

## TypeScript

- Strict TypeScript only.
- Never introduce `any`.
- Prefer reusable interfaces.
- Export all public types.

---

## UI Rules

Every UI must be:

- Mobile First
- Responsive
- Accessible
- SEO Friendly
- Production Ready

---

## Database

- Never delete existing tables.
- Never perform destructive migrations.
- Every migration must be reversible.
- Prefer additive schema changes.
- Future-proof schema for multi-site support.

---

## Build Rules

After every implementation:

1. npm run build
2. TypeScript check
3. npm run lint
4. Git diff review

Stop after verification.

Wait for approval.

---

## Code Quality

Never create:

- duplicate helpers
- duplicate components
- duplicate actions
- duplicate types

Always check before creating new files.

---

## Architecture

Prefer:

Feature → Shared Component → Utility

Avoid:

Feature → Duplicate Component

---

## Git

Never commit automatically.

Wait for user approval before:

- git add
- git commit
- git push

---

## Documentation

Whenever a new architecture or major feature is added:

Update documentation before continuing.

---

## Important

If there is uncertainty:

STOP.

Explain the issue.

Ask for approval.

Never guess.