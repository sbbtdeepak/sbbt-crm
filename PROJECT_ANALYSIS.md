# SBBT CRM Project Analysis

## Folder Structure
- **app/**: Core application components
  - auth/: Authentication-related files
  - dashboard/: Dashboard components
  - login/: Login page
  - projects/: Project management features
  - quote/: Quoting functionality
- **components/**: Reusable UI components
  - home/, layout/, shared/, ui/: Common UI elements
- **docs/**: Documentation files
  - AUTH_FLOW.md, DATABASE_SCHEMA.md, DASHBOARD_REDIRECT_ANALYSIS.md
- **lib/**: Utility and service files
  - supabase.js: Supabase client configuration
- **public/**: Static assets (SVG icons)
- **types/**: TypeScript type definitions

## Authentication Flow
1. Entry points: `docs/AUTH_ENTRY_POINTS.md` lists login, signup, and callback routes
2. Flow diagram: `docs/AUTH_FLOW.md` describes OAuth integration with Supabase
3. Security: Uses Supabase's built-in auth with email/password and social login
4. Redirects: `docs/REDIRECT_MAP.md` handles post-authentication navigation

## Dashboard Architecture
- Built using Next.js layout system with `app/layout.tsx`
- Components: `components/dashboard/` contains main dashboard UI
- Data flow: Fetches project data from Supabase via `lib/supabase.js`
- Redirect logic: Handles navigation between dashboard sections

## CMS Architecture
- Content management handled through:
  - `app/projects/`: Project creation/editing interface
  - `app/quote/`: Quoting system with template management
- Uses Supabase storage for media assets (`supabase/project_images.sql`)

## Database Structure
- Supabase PostgreSQL database with tables:
  - `projects`: Project records with status tracking
  - `project_images`: Image attachments for projects
- Schema defined in `supabase/projects.sql` and `supabase/project_images.sql`

## Identified Issues
### Bugs
- Potential redirect loops in `docs/DASHBOARD_REDIRECT_ANALYSIS.md`
- Missing error handling in Supabase API calls

### Duplicate Components
- Multiple similar UI components in `components/ui/` and `components/shared/`

### Security Issues
- Hardcoded Supabase URL in `lib/supabase.js`
- No rate limiting on authentication endpoints

### Performance Issues
- Large initial load of dashboard data
- No caching implemented for frequently accessed data

## Suggested Improvements
1. Implement Supabase row-level security for project data
2. Add caching layer for dashboard components
3. Refactor duplicate UI components
4. Add rate limiting to authentication endpoints
5. Implement proper error handling for Supabase operations
6. Optimize initial dashboard data loading