# SBBT CRM - Project Development Rules

## 1. Folder Structure

```
sbbt-crm/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin authentication page
│   ├── auth/callback/            # OAuth callback handlers
│   ├── contact/                  # Contact page
│   ├── dashboard/                # Main dashboard (protected route)
│   ├── layout.tsx                # Root layout with fonts
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── projects/                 # Project-specific components
│   │   ├── project-form-modal.tsx
│   │   ├── projects-table.tsx
│   │   └── status-badge.tsx
│   ├── google-login-button.tsx  # Authentication component
│   └── logout-button.tsx         # Authentication component
├── lib/                          # Utility functions and helpers
│   ├── projects/
│   │   └── images.ts             # Image handling utilities
│   └── supabase/                 # Supabase client configurations
│       ├── client.ts             # Browser client
│       ├── server.ts             # Server client
│       └── middleware.ts         # Auth middleware
├── public/                       # Static assets
├── supabase/                     # Database schema files
│   ├── projects.sql
│   └── project_images.sql
├── types/                        # TypeScript type definitions
│   └── project.ts
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript configuration
└── tailwind.config.ts           # Tailwind CSS configuration
```

**Rules:**
- Place all page components in `app/` directory following App Router conventions
- Group related components in subdirectories within `components/`
- Keep utility functions in `lib/` organized by feature
- Store TypeScript types in `types/` directory
- SQL schema files go in `supabase/` directory

## 2. Naming Conventions

**Files:**
- Use kebab-case for all files: `project-form-modal.tsx`, `status-badge.tsx`
- Component files should match the exported component name (converted to kebab-case)

**Components:**
- Use PascalCase for component names: `ProjectsTable`, `ProjectFormModal`
- Prefix component files with their feature: `projects/`, `auth/`

**Types/Interfaces:**
- Use PascalCase for types: `Project`, `ProjectStatus`, `ProjectInput`
- Use descriptive names that reflect the data structure

**Functions:**
- Use camelCase for functions: `createClient`, `getProjectThumbnail`, `updateField`
- Use descriptive verbs for actions: `fetchProjects`, `handleDelete`, `parseFeatures`

**Constants:**
- Use UPPER_SNAKE_CASE for constants: `PROJECT_STATUSES`, `PROJECT_PACKAGES`
- Export constants from type definition files when related to types

**Variables:**
- Use camelCase for variables: `user`, `loading`, `activeTab`
- Use descriptive names that indicate purpose

**CSS Classes:**
- Use Tailwind utility classes directly
- For custom styles, use kebab-case in CSS files

## 3. Authentication Rules

**Authentication Flow:**
- Use Supabase Auth for all authentication
- Implement Google OAuth via `google-login-button.tsx`
- Use `logout-button.tsx` for sign-out functionality

**Client Creation:**
- **Browser Components:** Import from `lib/supabase/client.ts` using `createBrowserClient` from `@supabase/ssr`
- **Server Components:** Import from `lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr`
- **Middleware:** Use `lib/supabase/middleware.ts` for session management

**Protected Routes:**
- All routes under `/dashboard` require authentication
- Middleware in `lib/supabase/middleware.ts` redirects unauthenticated users to `/admin`
- Never use `window.location.href` for redirects in client components; use `useRouter` from `next/navigation`

**User Session:**
- Check user session on protected pages using `supabase.auth.getUser()`
- Handle loading states while checking authentication
- Redirect to login page if user is not authenticated

**Best Practices:**
- Never expose service role keys in client-side code
- Use RLS (Row Level Security) policies in Supabase for data access control
- Implement proper error handling for auth failures

## 4. Dashboard Module Rules

**Architecture:**
- Dashboard is a client-side component (`"use client"` directive)
- Use server-side Supabase client for data fetching in Server Components when possible
- For complex dashboards, client-side fetching is acceptable but should be documented

**State Management:**
- Use React hooks (`useState`, `useEffect`) for local state
- Keep state organized by feature (projects, packages, testimonials)
- Use loading states to improve UX during data fetching

**Data Fetching:**
- Fetch data on component mount using `useEffect`
- Use Promise.all for parallel independent data fetches
- Implement proper error handling with try-catch blocks
- Order data appropriately (e.g., `created_at descending`)

**Forms:**
- Use controlled components for form inputs
- Validate required fields before submission
- Handle file uploads separately from form data
- Reset forms after successful submission

**Modals:**
- Use fixed positioning with z-index for modals
- Implement backdrop blur for better UX
- Handle close actions properly (reset state, clean up)
- Make modals responsive with max-width constraints

**Tab Navigation:**
- Use string literal types for tab states: `"projects" | "packages" | "testimonials"`
- Implement active tab state with proper conditional rendering
- Keep tab content in separate sections for maintainability

## 5. Supabase Rules

**Client Configuration:**
- Always use environment variables for Supabase credentials
- Use `@supabase/ssr` package for Next.js integration
- Never hardcode credentials in code

**Database Queries:**
- Use the Supabase client for all database operations
- Use `.select()` with proper joins for related data
- Use `.order()` for consistent data sorting
- Use `.eq()` for filtering by specific values

**Error Handling:**
- Always check for errors in Supabase responses
- Log errors to console for debugging
- Display user-friendly error messages in the UI
- Use try-catch blocks for async operations

**File Storage:**
- Store images in Supabase Storage
- Use proper bucket naming conventions
- Implement image upload with progress indication
- Handle image deletion when removing records

**Type Safety:**
- Define TypeScript interfaces for all database tables
- Use these types throughout the application
- Keep types in sync with database schema
- Update types when schema changes

**SQL Schema:**
- Store SQL migration files in `supabase/` directory
- Name files descriptively: `projects.sql`, `project_images.sql`
- Include comments for complex queries
- Version control all schema changes

## 6. Environment Variable Rules

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Naming Convention:**
- Use `NEXT_PUBLIC_` prefix for variables needed in browser code
- Use descriptive names: `NEXT_PUBLIC_SUPABASE_URL`, not `NEXT_PUBLIC_SB_URL`

**Management:**
- Never commit `.env` file (it's in `.gitignore`)
- Use `.env.example` as a template for required variables
- Document all environment variables in this file
- Keep secrets out of client-side code

**Access:**
- Access variables using `process.env.VARIABLE_NAME`
- Use non-null assertion `!` only when certain the variable exists
- Provide fallback values for optional variables

**Development vs Production:**
- Use separate Supabase projects for dev and production
- Never use production credentials in development
- Rotate keys if accidentally exposed

## 7. Git Workflow

**Branching Strategy:**
- Use `main` as the production branch
- Create feature branches from `main`: `feature/add-project-images`
- Use descriptive branch names with kebab-case

**Branch Types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks

**Workflow:**
1. Create a new branch from `main`
2. Make changes and commit frequently
3. Push branch to remote
4. Create pull request for review
5. Merge to `main` after approval
6. Delete feature branch after merge

**Pull Requests:**
- Provide clear description of changes
- Reference related issues if applicable
- Ensure all tests pass
- Request at least one review before merging

**Conflicts:**
- Resolve conflicts locally before pushing
- Communicate with team for complex conflicts
- Test thoroughly after conflict resolution

## 8. Commit Naming

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

**Examples:**
- `feat(projects): add image upload functionality`
- `fix(auth): resolve redirect loop on dashboard`
- `refactor(dashboard): extract modal components`
- `docs(readme): update deployment instructions`

**Rules:**
- Use imperative mood: "add" not "added" or "adds"
- Keep subject line under 50 characters
- Capitalize subject line
- Do not end subject line with period
- Wrap body at 72 characters
- Explain what and why, not how
- Reference issue numbers in footer

**Bad Examples:**
- `fixed bug` (too vague)
- `Update stuff` (non-imperative, vague)
- `feat: added a new thing for the users to use` (too long, non-imperative)

## 9. Deployment Workflow

**Platform:**
- Use Vercel for deployment (recommended for Next.js)
- Alternative: Netlify, Railway, or self-hosted

**Pre-Deployment Checklist:**
- [ ] All tests pass
- [ ] Environment variables configured in deployment platform
- [ ] Database migrations applied to production
- [ ] Build succeeds locally
- [ ] No console errors in production build
- [ ] Responsive design verified
- [ ] Authentication flow tested

**Environment Variables in Vercel:**
- Add variables in Vercel project settings
- Use production Supabase credentials
- Never use development credentials in production

**Build Process:**
- Vercel automatically builds on push to `main`
- Build command: `npm run build`
- Output directory: `.next`

**Database Migrations:**
- Apply SQL changes manually to production Supabase
- Test migrations on staging environment first
- Backup database before major schema changes
- Document all schema changes

**Monitoring:**
- Set up error tracking (e.g., Sentry)
- Monitor build logs in Vercel
- Check Supabase logs for database issues
- Set up uptime monitoring

**Rollback:**
- Use Vercel's rollback feature if needed
- Keep previous database schema versions
- Have rollback plan for major changes

## 10. Coding Standards

**TypeScript:**
- Enable strict mode in `tsconfig.json`
- Use explicit type annotations for function parameters
- Avoid `any` type; use `unknown` if necessary
- Use interfaces for object shapes, types for unions/aliases
- Prefer `const` over `let` when possible

**React:**
- Use functional components with hooks
- Use `"use client"` directive for client components
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript interfaces

**Next.js:**
- Use App Router (not Pages Router)
- Use Server Components by default
- Use Client Components only when necessary (interactivity)
- Use `next/image` for optimized images
- Use `next/link` for internal navigation

**CSS/Styling:**
- Use Tailwind CSS for all styling
- Prefer utility classes over custom CSS
- Use dark mode variants: `dark:bg-zinc-900`
- Use responsive prefixes: `sm:grid-cols-2`
- Keep component styles consistent

**Code Organization:**
- Keep file size under 300 lines when possible
- Extract large components into smaller subcomponents
- Group related functions together
- Add comments for complex logic
- Remove commented-out code before committing

**Error Handling:**
- Always handle potential errors
- Use try-catch for async operations
- Display user-friendly error messages
- Log errors for debugging
- Implement loading states

**Performance:**
- Use React.memo for expensive components
- Implement proper key props in lists
- Lazy load heavy components when needed
- Optimize images with proper formats
- Minimize re-renders with proper dependency arrays

**Accessibility:**
- Use semantic HTML elements
- Add proper alt text for images
- Ensure keyboard navigation works
- Use ARIA labels when necessary
- Test with screen readers

**Code Review Checklist:**
- [ ] Code follows TypeScript best practices
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] No console.log statements in production code
- [ ] Code is formatted consistently
- [ ] Variable names are descriptive
- [ ] Functions are small and focused
- [ ] No duplicate code
- [ ] Comments explain "why" not "what"
