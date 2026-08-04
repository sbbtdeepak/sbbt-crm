# PRD-01: SBBT CRM — Website & CMS

**Document ID:** PRD-01  
**Title:** SBBT CRM — Public Website & Content Management System  
**Version:** 1.0  
**Date:** August 2026  
**Author:** AI Software Architect  
**Status:** Draft  

---

## 1. Executive Summary

This document defines the Product Requirements for PRD-01: the SBBT CRM Public Website and Content Management System (CMS). The platform serves Shree Badree Build Tech Pvt Ltd (SBBT), a construction company specializing in residential construction, turnkey construction, interior design, renovation, and commercial construction.

The Public Website provides a professional online presence for SBBT, showcasing projects, packages, testimonials, brands, and company information. It includes a quote generator that captures lead inquiries from visitors. The CMS (Dashboard) enables non-technical administrators to manage all website content without code changes.

This PRD covers the current Minimum Viable Product (MVP) scope only. All future phases — including the Estimate Engine, CRM workflow, ERP, Inventory, Billing, Project Execution, Vendor Management, Customer Portal, Mobile App, and SaaS Platform — are explicitly excluded and will be addressed in future PRDs.

**Key Facts:**
- **Technology Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase
- **Deployment Target:** Vercel
- **Authentication:** Two separate flows — Google OAuth for public users, Email/Password for admins
- **Hosting:** Supabase (database, storage, auth)

---

## 2. Vision

Build a modern, scalable Construction CRM platform for Shree Badree Build Tech Pvt Ltd (SBBT).

**Phase 1:** Develop a professional construction company website with an admin dashboard where all website content can be managed without editing code.

The website will include:
- Home
- Projects
- Project Details
- Blogs
- Pricing Packages
- Testimonials
- Brands We Work With
- News
- Refer & Earn
- Contact
- Quote Generator

The admin dashboard will allow complete management of all website content.

Authentication will have two separate flows:

1. **Public User** — Google Login only when requesting a quotation.
2. **Admin** — Email and Password login with full dashboard access.

Future phases will expand this project into:
- Interior Design Website
- Construction CRM
- Construction ERP
- Multi-company SaaS Platform

---

## 3. Business Goals

| ID | Goal | Metric |
|----|------|--------|
| BG-001 | Establish a professional online presence for SBBT | Website launched with all core pages |
| BG-002 | Generate qualified leads through the public website | Track quote requests submitted |
| BG-003 | Enable non-technical staff to manage website content | Admin dashboard fully operational |
| BG-004 | Reduce dependency on developers for content updates | Zero code deploys needed for content changes |
| BG-005 | Showcase completed projects to build credibility | Project gallery with images and details |
| BG-006 | Capture and organize customer inquiries | Leads stored and accessible in dashboard |
| BG-007 | Improve search visibility | SEO-friendly URLs and metadata |

---

## 4. MVP Scope

### Current MVP — In Scope

The following features are part of the current MVP:

| Feature | Description | Priority |
|---------|-------------|----------|
| Public Website | Static and dynamic pages for company presence | P0 |
| Admin Dashboard (CMS) | Full content management interface | P0 |
| Authentication | Google OAuth for public users; Email/Password for admins | P0 |
| Hero Banner Management | Admin-editable hero image, heading, subheading, CTA | P0 |
| Project Management | Create, edit, delete projects with multiple images | P0 |
| Blog Management | Create, edit, delete blog posts with SEO fields | P0 |
| Pricing Package Management | Create, edit, delete packages with specifications | P0 |
| Testimonial Management | Manage customer reviews, ratings, images | P0 |
| Brand Management | Manage brand logos and names | P0 |
| News Management | Create, edit, delete company news | P0 |
| Refer & Earn Management | Manage reward amounts and banners | P0 |
| Contact Form | Public contact form with lead capture | P0 |
| Quote Generator | Google-login-required quote request form | P0 |
| Website Settings | Manage company info, social links, contact details | P0 |
| Contact Leads | View and manage contact form submissions | P0 |
| Quote Requests | View and manage quote request submissions | P0 |

### Future Scope — Out of Current MVP

The following are explicitly **not** part of this PRD and will be addressed in future documents:

- Estimate Engine (PRD-02)
- CRM Workflow (PRD-03)
- ERP / Inventory (PRD-04)
- Customer Portal (PRD-05)
- Vendor Portal (PRD-06)
- Mobile App (PRD-07)
- SaaS Platform / Multi-tenant (PRD-08)

[ASSUMPTION] The CMS and public website will be designed with future integration points in mind, but no integration work is included in this PRD.

---

## 5. Website Modules

### 5.1 Home Page

**Purpose:** The primary landing page for SBBT, designed to showcase the company's value proposition and drive engagement.

**Business Value:** First impression for visitors; highest traffic page; key conversion point for quote requests.

**Primary Users:** All website visitors (public users, potential customers, partners).

**Dependencies:** CMS for Hero Banner, CMS for Featured Projects, CMS for Pricing Overview, CMS for Testimonials, CMS for Brands, CMS for Latest Blogs, CMS for Google Rating, CMS for Contact CTA, CMS for Get Quote CTA.

**Future Expansion:** Personalization based on visitor segment, dynamic content modules, A/B testing framework.

| Component | Description |
|-----------|-------------|
| Hero Banner (Admin Editable) | Full-width hero image with heading, sub-heading, and CTA button |
| Company Introduction | Brief company overview and value proposition |
| Why Choose SBBT | Key differentiators and selling points |
| Featured Projects | Carousel or grid of highlighted completed projects |
| Pricing Overview | Summary of available construction packages |
| Testimonials | Rotating customer reviews with ratings |
| Brands We Work With | Logo carousel of trusted supplier brands |
| Latest Blogs | Recent blog posts with preview |
| Google Rating | Aggregated Google review rating display |
| Contact CTA | Call-to-action encouraging contact |
| Get Quote CTA | Call-to-action launching the quote generator |

### 5.2 Projects

**Purpose:** Display a searchable, filterable listing of completed and ongoing construction projects.

**Business Value:** Showcases portfolio, builds credibility, demonstrates expertise across project types.

**Primary Users:** All website visitors.

**Dependencies:** CMS for Project data (images, descriptions, status, metadata).

**Future Expansion:** Project categories, advanced filtering, project comparison.

| Feature | Description |
|---------|-------------|
| Project Listing | Grid or list view of all projects |
| Search & Filter | Search by keyword; filter by status (completed/ongoing) |
| Cover Image | Each project displays a representative cover image |
| Short Description | Brief summary of the project |
| Status | Visual indicator: Completed or Ongoing |

### 5.3 Project Details

**Purpose:** Provide detailed information about individual projects including images, specifications, and materials used.

**Business Value:** Deep engagement; demonstrates quality and attention to detail; supports client decision-making.

**Primary Users:** All website visitors interested in specific projects.

**Dependencies:** CMS for Project data (multiple images, specifications, materials, related projects).

**Future Expansion:** Interactive floor plans, before/after sliders, 3D views.

| Feature | Description |
|---------|-------------|
| Multiple Images | Image gallery for each project |
| Project Overview | Detailed description |
| Plot Size | Land area specification |
| Built-up Area | Total constructed area |
| Floors | Number of floors |
| Package | Construction package used |
| Construction Timeline | Duration of the project |
| Materials Used | List of key materials |
| Related Projects | Cross-links to similar projects |

### 5.4 Blog

**Purpose:** Publish company updates, construction news, and educational content.

**Business Value:** Improves SEO, establishes thought leadership, engages returning visitors.

**Primary Users:** All website visitors, potential customers seeking information.

**Dependencies:** CMS for Blog data (title, content, categories, featured image, SEO fields).

**Future Expansion:** Categories, tags, author management, newsletter integration.

| Feature | Description |
|---------|-------------|
| Blog Listing | Paginated list of all blog posts |
| Blog Details | Full article page with featured image |
| Categories | Organize posts by topic |
| SEO Friendly URLs | Slug-based permalinks with metadata |

### 5.5 Pricing Packages

**Purpose:** Present SBBT's construction packages with specifications and pricing information.

**Business Value:** Enables self-service comparison; supports lead generation through "Get Quote" buttons.

**Primary Users:** All website visitors, especially those evaluating construction options.

**Dependencies:** CMS for Package data (specifications, rates, descriptions).

**Future Expansion:** Package comparison matrix, dynamic pricing calculator, custom quote requests.

| Feature | Description |
|---------|-------------|
| Multiple Packages | Display of all available packages |
| Package Specifications | Detailed specs for each package |
| Package Comparison | Side-by-side comparison view |
| Get Quote Button | CTAs to launch quote generator |

### 5.6 Testimonials

**Purpose:** Display customer reviews and ratings to build trust and social proof.

**Business Value:** Increases conversion rates; builds credibility; showcases customer satisfaction.

**Primary Users:** All website visitors.

**Dependencies:** CMS for Testimonial data (customer name, rating, review, image).

**Future Expansion:** Video testimonials, Google review integration, filtered display.

| Feature | Description |
|---------|-------------|
| Customer Reviews | Text-based reviews |
| Google Rating | Displayed rating score |
| Customer Images | Reviewer profile images |

### 5.7 Brands We Work With

**Purpose:** Showcase trusted supplier and partner brands.

**Business Value:** Builds credibility; demonstrates supply chain quality; partner relationship visibility.

**Primary Users:** All website visitors, potential partners.

**Dependencies:** CMS for Brand data (name, logo).

**Future Expansion:** Brand detail pages, partner spotlight articles.

| Feature | Description |
|---------|-------------|
| Brand Logos | Image gallery of brand logos |
| Brand Names | Display of brand names |

### 5.8 News

**Purpose:** Publish company updates, announcements, and construction industry news.

**Business Value:** Keeps visitors informed; improves SEO; demonstrates company activity.

**Primary Users:** All website visitors, stakeholders.

**Dependencies:** CMS for News data (title, content, images).

**Future Expansion:** News categories, newsletter signup, RSS feed.

| Feature | Description |
|---------|-------------|
| Company Updates | Internal company announcements |
| Construction News | Industry-related news |

### 5.9 Refer & Earn

**Purpose:** Present the referral reward program to encourage customer advocacy.

**Business Value:** Drives word-of-mouth marketing; acquires new customers through existing ones.

**Primary Users:** All website visitors, especially existing customers.

**Dependencies:** CMS for Refer & Earn data (reward amount, description, banner image).

**Future Expansion:** Referral tracking, reward redemption, program analytics.

| Feature | Description |
|---------|-------------|
| Reward Amount | Display of referral reward value |
| Description | Program terms and conditions |
| Banner Image | Promotional visual |

### 5.10 Contact

**Purpose:** Provide a contact form and company contact information for visitor inquiries.

**Business Value:** Captures leads; provides essential contact information; supports customer service.

**Primary Users:** All website visitors.

**Dependencies:** CMS for Company Details, CMS for Social Links, CMS for Google Map.

**Future Expansion:** Live chat, WhatsApp integration, location finder.

| Feature | Description |
|---------|-------------|
| Contact Form | Name, email, phone, message fields |
| Company Details | Address, phone, email displayed |
| Google Map | Embedded map showing company location |

### 5.11 Quote Generator

**Purpose:** Capture detailed quote requests from visitors, requiring Google authentication.

**Business Value:** Qualified lead capture; enables estimation process; reduces spam.

**Primary Users:** Public users (requires Google login).

**Dependencies:** Google OAuth authentication, CMS for Company/Social settings.

**Future Expansion:** Integration with Estimate Engine (PRD-02), automated quote generation, status tracking.

| Feature | Description |
|---------|-------------|
| Google Login Required | Visitors must authenticate via Google |
| Auto-fill Contact Details | Pre-populate form with Google profile data |
| Submit Quote Request | Form submission stores lead in dashboard |
| Admin Dashboard Visibility | Quote requests visible to admins |

[ASSUMPTION] The quote generator form fields are limited to contact information in the current MVP. Detailed project specifications and estimation will be handled by the Estimate Engine (PRD-02).

[OPEN DECISION] Should the quote generator include project type selection (residential, commercial, interior, renovation) in the MVP, or defer to PRD-02?

---

## 6. CMS Modules

### 6.1 Dashboard Home

**Purpose:** Central hub providing an overview of key metrics and recent activity.

**Business Value:** Enables admins to quickly assess platform health and recent activity.

**Primary Users:** Admin users.

**Dependencies:** Authentication (admin login required), data from all CMS modules.

**Future Expansion:** Customizable widgets, data visualizations, export capabilities.

| Feature | Description |
|---------|-------------|
| Statistics Cards | Summary counts (projects, blogs, leads, quotes) |
| Recent Leads | Latest contact form submissions |
| Recent Quote Requests | Latest quote generator submissions |
| Recent Projects | Latest project entries |

### 6.2 Hero Management

**Purpose:** Manage the homepage hero banner content without code changes.

**Business Value:** Enables rapid updates to promotions, campaigns, and messaging.

**Primary Users:** Admin users.

**Dependencies:** CMS for homepage data storage.

**Future Expansion:** A/B testing, scheduled publishing, video backgrounds.

| Feature | Description |
|---------|-------------|
| Hero Image | Upload and select hero banner image |
| Heading | Primary headline text |
| Sub Heading | Secondary headline text |
| CTA Button | Call-to-action button text and link |

### 6.3 Projects Management

**Purpose:** Create, edit, and delete project entries displayed on the public website.

**Business Value:** Keeps the portfolio current; no developer intervention needed for updates.

**Primary Users:** Admin users.

**Dependencies:** CMS for project data storage, image uploader component.

**Future Expansion:** Project status tracking, timeline management, document attachments.

| Feature | Description |
|---------|-------------|
| Add Project | Create new project entry |
| Edit Project | Modify existing project details |
| Delete Project | Remove project from listing |
| Upload Multiple Images | Gallery images for project |
| Mark as Featured | Highlight project on homepage |
| Completed / Ongoing Status | Set project status |

### 6.4 Blog Management

**Purpose:** Create, edit, and delete blog posts with full SEO support.

**Business Value:** Enables content marketing strategy; supports SEO efforts.

**Primary Users:** Admin users (content editors).

**Dependencies:** CMS for blog data storage, image uploader, SEO fields.

**Future Expansion:** Draft/publish workflow, author attribution, content scheduling.

| Feature | Description |
|---------|-------------|
| Add Blog | Create new blog post |
| Edit Blog | Modify existing post content |
| Delete Blog | Remove blog post |
| SEO Fields | Meta title, meta description, slug |
| Featured Image | Cover image for blog post |

### 6.5 Pricing Management

**Purpose:** Manage construction packages with specifications and rates.

**Business Value:** Enables pricing updates without developer involvement; supports sales team.

**Primary Users:** Admin users, sales team.

**Dependencies:** CMS for package data storage.

**Future Expansion:** Dynamic pricing rules, package versioning, comparison matrix.

| Feature | Description |
|---------|-------------|
| Add Package | Create new construction package |
| Edit Package | Modify package specifications and rates |
| Delete Package | Remove package from listing |
| Package Specifications | Detailed feature descriptions |
| Package Rate | Pricing information |

### 6.6 Testimonials Management

**Purpose:** Manage customer testimonials displayed on the homepage and testimonials page.

**Business Value:** Maintains social proof; enables quick updates to reviews.

**Primary Users:** Admin users.

**Dependencies:** CMS for testimonial data storage.

**Future Expansion:** Review moderation, automated import from Google, video support.

| Feature | Description |
|---------|-------------|
| Customer Name | Reviewer's name |
| Rating | Star rating (1-5) |
| Review | Full review text |
| Customer Image | Reviewer's profile image |

### 6.7 Brands Management

**Purpose:** Manage the list of trusted supplier and partner brands.

**Business Value:** Keeps partner information current; demonstrates supply chain quality.

**Primary Users:** Admin users.

**Dependencies:** CMS for brand data storage.

**Future Expansion:** Brand detail pages, partner portals, logo approval workflow.

| Feature | Description |
|---------|-------------|
| Brand Name | Display name |
| Brand Logo | Logo image file |

### 6.8 News Management

**Purpose:** Create, edit, and delete company news and announcements.

**Business Value:** Keeps stakeholders informed; supports communications strategy.

**Primary Users:** Admin users, marketing team.

**Dependencies:** CMS for news data storage.

**Future Expansion:** News categories, scheduling, email newsletter integration.

| Feature | Description |
|---------|-------------|
| Add News | Create new news item |
| Edit News | Modify existing news content |
| Delete News | Remove news item |

### 6.9 Refer & Earn Management

**Purpose:** Manage the referral program details displayed on the public website.

**Business Value:** Enables marketing team to update referral incentives.

**Primary Users:** Admin users, marketing team.

**Dependencies:** CMS for refer & earn data storage.

**Future Expansion:** Referral tracking, reward redemption, analytics dashboard.

| Feature | Description |
|---------|-------------|
| Reward Amount | Monetary value of referral reward |
| Description | Program details and terms |
| Banner Image | Promotional visual |

### 6.10 Contact Leads

**Purpose:** View and manage inquiries submitted through the public contact form.

**Business Value:** Enables customer service response; captures qualified leads.

**Primary Users:** Admin users, sales team.

**Dependencies:** CMS for lead data storage, notification system.

**Future Expansion:** Lead status tracking, assignment to team members, follow-up reminders.

| Feature | Description |
|---------|-------------|
| View Contact Forms | List of all submissions |
| Search | Filter leads by keyword |
| Filter | Filter by date, status, or other criteria |
| Status | Track lead status (new, in progress, resolved) |

[OPEN DECISION] What lead statuses should be available in the MVP? (e.g., New, Contacted, Qualified, Converted, Archived)

### 6.11 Quote Requests

**Purpose:** View and manage quote requests submitted through the public quote generator.

**Business Value:** Enables sales team to follow up on qualified leads; supports estimation process.

**Primary Users:** Admin users, sales team, estimators.

**Dependencies:** Authentication (Google OAuth), CMS for quote data storage.

**Future Expansion:** Integration with Estimate Engine (PRD-02), quote status tracking, automated responses.

| Feature | Description |
|---------|-------------|
| View Quote Requests | List of all submissions |
| Search | Filter by keyword |
| Filter | Filter by date, project type, or other criteria |
| Export | Export to CSV/PDF (Future) |

[OPEN DECISION] Should export functionality be included in the MVP for quote requests?

### 6.12 Website Settings

**Purpose:** Manage global company information, social links, and contact details.

**Business Value:** Single source of truth for company information displayed across the website.

**Primary Users:** Admin users.

**Dependencies:** CMS for settings data storage.

**Future Expansion:** Multi-site support, region-specific settings, theme customization.

| Feature | Description |
|---------|-------------|
| Company Information | Company name, address, phone, email |
| Social Links | Links to social media profiles |
| Google Rating | Display rating score |
| Contact Details | Contact information for display |

---

## 7. Authentication

### 7.1 Public User Authentication

**Purpose:** Authenticate public website visitors who wish to submit quote requests.

**Business Value:** Reduces spam; captures accurate user information; enables follow-up.

**Primary Users:** Public website visitors.

**Dependencies:** Supabase Auth, Google OAuth provider.

**Future Expansion:** Email/password login option, phone login, social login expansion.

| Feature | Description |
|---------|-------------|
| Google OAuth | Primary authentication method |
| Automatic Profile Creation | User profile created on first login |
| Auto-fill Contact Details | Form fields pre-populated from Google profile |

[ASSUMPTION] Only Google OAuth is supported for public users in the MVP. Other identity providers (Facebook, Apple, etc.) will be added in future phases.

### 7.2 Admin Authentication

**Purpose:** Authenticate administrators who manage the CMS dashboard.

**Business Value:** Secures administrative access; separates admin and public user flows.

**Primary Users:** Admin users.

**Dependencies:** Supabase Auth, email/password provider.

**Future Expansion:** Role-based access control, SSO, 2FA enforcement.

| Feature | Description |
|---------|-------------|
| Email Login | Email and password authentication |
| Password Protection | Secure credential storage |
| Dashboard Access | Authenticated admins redirected to dashboard |

### 7.3 Authentication Architecture

[ASSUMPTION] The two authentication flows are completely separate. Public users authenticate via Google OAuth. Admins authenticate via Email/Password. There is no user-type confusion or crossover between the two systems.

[ASSUMPTION] A proxy-based middleware protects all `/dashboard/*` routes, ensuring only authenticated admin users can access CMS features.

[OPEN DECISION] Should admin authentication eventually be unified with public user authentication under a single user model with role-based permissions? This is deferred to PRD-03 (CRM) or PRD-08 (SaaS).

---

## 8. User Roles

### 8.1 Administrator (Admin)

**Purpose:** Full access to all CMS features and website settings.

| Permission | Access |
|------------|--------|
| View Dashboard | ✅ |
| Manage All CMS Modules | ✅ |
| Manage Website Settings | ✅ |
| View Contact Leads | ✅ |
| View Quote Requests | ✅ |
| Edit Application Settings | ✅ |
| Manage Users | ❌ (future) |

**Future Expansion:** Role-based permission scoping, user management interface.

### 8.2 Public User

**Purpose:** Browse the website and submit quote requests.

| Permission | Access |
|------------|--------|
| Browse Website | ✅ |
| Submit Contact Form | ✅ |
| Submit Quote Request | ✅ (requires Google login) |
| Access Dashboard | ❌ |

[OPEN DECISION] Should admin users have granular roles (e.g., Editor, Viewer) in the MVP, or is a single Admin role sufficient?

---

## 9. Functional Requirements

| ID | Requirement | Priority | Module |
|----|-------------|----------|--------|
| FR-001 | Public website must display all core pages (Home, Projects, Blog, Pricing, Testimonials, Brands, News, Refer & Earn, Contact, Quote Generator) | P0 | All |
| FR-002 | Home page must include a hero banner with editable heading, subheading, and CTA button | P0 | Hero |
| FR-003 | Projects listing must support search and filtering by status | P0 | Projects |
| FR-004 | Each project must display a cover image, short description, and status (Completed/Ongoing) | P0 | Projects |
| FR-005 | Project detail pages must show multiple images, overview, plot size, built-up area, floors, package, timeline, materials used, and related projects | P0 | Project Details |
| FR-006 | Blog listing must display posts in reverse chronological order with pagination | P0 | Blog |
| FR-007 | Blog detail pages must have SEO-friendly URLs with metadata | P0 | Blog |
| FR-008 | Pricing packages must display specifications, rates, and a "Get Quote" button | P0 | Packages |
| FR-009 | Testimonials must display customer name, rating, review, and image | P0 | Testimonials |
| FR-010 | Brands section must display brand logos and names | P0 | Brands |
| FR-011 | News section must display company updates and construction news | P0 | News |
| FR-012 | Refer & Earn section must display reward amount, description, and banner image | P0 | Refer & Earn |
| FR-013 | Contact page must include a contact form, company details, and Google Map | P0 | Contact |
| FR-014 | Quote Generator must require Google OAuth authentication | P0 | Quote |
| FR-015 | Quote form must auto-fill contact details from Google profile | P0 | Quote |
| FR-016 | Submitted quote requests must be visible in the admin dashboard | P0 | Quote Requests |
| FR-017 | Admin dashboard home must display statistics cards, recent leads, recent quote requests, and recent projects | P0 | Dashboard Home |
| FR-018 | Admin must be able to create, edit, and delete hero banner content | P0 | Hero Management |
| FR-019 | Admin must be able to create, edit, and delete projects with multiple image uploads | P0 | Projects |
| FR-020 | Admin must be able to mark projects as featured | P0 | Projects |
| FR-021 | Admin must be able to create, edit, and delete projects with status (Completed/Ongoing) | P0 | Projects |
| FR-022 | Admin must be able to create, edit, and delete blog posts with SEO fields and featured images | P0 | Blog |
| FR-023 | Admin must be able to create, edit, and delete pricing packages with specifications and rates | P0 | Pricing |
| FR-024 | Admin must be able to create, edit, and delete testimonials (name, rating, review, image) | P0 | Testimonials |
| FR-025 | Admin must be able to create, edit, and delete brand entries (name, logo) | P0 | Brands |
| FR-026 | Admin must be able to create, edit, and delete news entries | P0 | News |
| FR-027 | Admin must be able to manage refer & earn content (reward amount, description, banner) | P0 | Refer & Earn |
| FR-028 | Admin must be able to view, search, and filter contact form submissions | P0 | Contact Leads |
| FR-029 | Admin must be able to view, search, and filter quote request submissions | P0 | Quote Requests |
| FR-030 | Admin must be able to manage global website settings (company info, social links, contact details) | P0 | Settings |
| FR-031 | All `/dashboard/*` routes must be protected by authentication middleware | P0 | Auth |
| FR-032 | Public users must not be able to access `/dashboard/*` routes | P0 | Auth |

---

## 10. Non-Functional Requirements

| ID | Requirement | Category | Priority |
|----|-------------|----------|--------|
| NFR-001 | Website must be mobile-responsive (mobile-first design) | Performance/UX | P0 |
| NFR-002 | Website must be accessible (WCAG 2.1 AA compliance) | Accessibility | P0 |
| NFR-003 | Website must load in under 3 seconds on desktop, 5 seconds on mobile (first contentful paint) | Performance | P0 |
| NFR-004 | All public pages must be statically generated (SSG) where possible, with ISR for dynamic content | Performance | P0 |
| NFR-005 | Dashboard pages must require authentication via middleware | Security | P0 |
| NFR-006 | All admin actions must be protected by server-side validation | Security | P0 |
| NFR-007 | Passwords must be stored using secure hashing (bcrypt/scrypt via Supabase) | Security | P0 |
| NFR-008 | HTTPS must be enforced for all pages | Security | P0 |
| NFR-009 | Public pages must be SEO-friendly with proper meta tags, structured data, and sitemap.xml | SEO | P0 |
| NFR-010 | Blog posts must have SEO-friendly slugs and metadata | SEO | P0 |
| NFR-011 | The application must handle errors gracefully with user-friendly error pages | Reliability | P0 |
| NFR-012 | All forms must validate input on both client and server sides | Reliability | P0 |
| NFR-013 | The application must support English as the primary language | i18n | P1 |
| NFR-014 | Future support for additional languages (Hindi, regional Indian languages) | i18n | P2 |
| NFR-015 | Image uploads must be optimized and served via CDN | Performance | P1 |
| NFR-016 | The platform must be deployable on Vercel | Deployment | P0 |
| NFR-017 | Database must use Supabase with proper schema design | Infrastructure | P0 |
| NFR-018 | The codebase must use TypeScript with strict mode | Code Quality | P0 |
| NFR-019 | No `any` types allowed (strict typing) | Code Quality | P0 |
| NFR-020 | Shared components must remain generic and not CMS-specific | Architecture | P0 |

[ASSUMPTION] English is the only required language for the MVP. Multi-language support is a future enhancement.

---

## 11. Success Metrics

| Metric | Target | Measurement Frequency |
|--------|--------|----------------------|
| Website Visitors | 1,000 unique visitors/month | Monthly |
| Lead Conversion % | 2% of visitors submitting contact forms | Monthly |
| Quote Requests | 50 quote requests/month | Monthly |
| Admin Productivity | 50% reduction in developer-involved content updates | Quarterly |
| SEO Growth | Top 3 Google ranking for "construction company [city]" | Quarterly |
| Page Load Time | Average < 3 seconds FCP (desktop), < 5 seconds (mobile) | Continuous |
| CMS Adoption | 100% of content updates performed by non-technical staff | Monthly |

---

## 12. Acceptance Criteria

### 12.1 Public Website

| ID | Criteria |
|----|----------|
| AC-WEB-001 | [Given] a visitor navigates to the homepage, [When] the page loads, [Then] it displays a hero banner, company introduction, why choose section, featured projects, pricing overview, testimonials, brands, latest blogs, Google rating, and CTA buttons. |
| AC-WEB-002 | [Given] a visitor browses the projects page, [When] they use search or filters, [Then] projects are filtered in real-time. |
| AC-WEB-003 | [Given] a visitor clicks a project, [When] the detail page loads, [Then] it shows all required project information including images, specs, and related projects. |
| AC-WEB-004 | [Given] a visitor browses the blog listing, [When] they click a blog, [Then] they see the full post with an SEO-friendly URL. |
| AC-WEB-005 | [Given] a visitor views pricing packages, [When] they click "Get Quote", [Then] they are redirected to Google login. |
| AC-WEB-006 | [Given] a visitor submits the contact form, [When] submission is successful, [Then] the lead appears in the admin dashboard. |

### 12.2 CMS / Admin Dashboard

| ID | Criteria |
|----|----------|
| AC-CMS-001 | [Given] an admin logs in, [When] they access the dashboard, [Then] they see statistics, recent leads, recent quotes, and recent projects. |
| AC-CMS-002 | [Given] an admin navigates to Hero Management, [When] they edit fields and save, [Then] changes appear on the homepage within 1 minute. |
| AC-CMS-003 | [Given] an admin creates a new project with images, [When] they mark it as featured, [Then] it appears on the homepage hero section. |
| AC-CMS-004 | [Given] an admin edits a blog post with SEO fields, [When] they save, [Then] the post has a meta title, meta description, and clean slug. |
| AC-CMS-005 | [Given] an admin creates a package, [When] they add specifications and rate, [Then] the package displays on the pricing page. |
| AC-CMS-006 | [Given] a visitor submits a contact form, [When] the admin opens Contact Leads, [Then] the submission is searchable and filterable. |

### 12.3 Authentication

| ID | Criteria |
|----|----------|
| AC-AUTH-001 | [Given] a visitor clicks "Get Quote", [When] they are not logged in, [Then] they are redirected to Google OAuth. |
| AC-AUTH-002 | [Given] an admin navigates to `/dashboard`, [When] they are not authenticated, [Then] they are redirected to the admin login page. |
| AC-AUTH-003 | [Given] an admin logs in successfully, [When] they access `/dashboard`, [Then] the dashboard loads without redirect. |
| AC-AUTH-004 | [Given] a public user completes Google OAuth, [When] they fill the quote form, [Then] their contact details are pre-filled from their Google profile. |

---

## 13. Future Roadmap

### Phase 2: Interior Design Website
- Dedicated interior design project types
- Interior-specific package offerings
- Room visualization gallery
- Design consultation booking

### Phase 3: Construction CRM
- Lead Management
- Quote Requests
- Customer Management
- Project Tracking
- Task Assignment
- Follow-up
- Notifications
- Reports
- Analytics

### Phase 4: Quotation Engine
- Dynamic Packages
- Package Comparison
- Cost Calculator
- PDF Generation
- Email Quote
- WhatsApp Quote
- CRM Integration

### Phase 5: Customer Dashboard
- Dynamic Homepage
- Dynamic Packages
- Dynamic Projects
- Dynamic Testimonials
- Dynamic Blogs
- Dynamic SEO
- Contact Page
- About Page
- FAQ

### Phase 6: AI Website Builder
- Business Information
- Google Business Import
- AI Content
- AI SEO
- AI Images
- AI Layout
- AI Packages
- AI Blog Generation

### Phase 7: Multi-Tenant SaaS
- Site Management
- Tenant Management
- Subscription Plans
- Billing
- Usage Limits
- Custom Domains
- Theme Management

### Phase 8: AI Automation
- AI Chatbot
- AI Quote Assistant
- AI Lead Qualification
- AI Follow-up
- AI SEO Writer
- AI Blog Writer
- AI Analytics

---

## 14. Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| RSK-001 | Google OAuth changes its API, breaking authentication | High | Monitor Google API announcements; implement fallback login option |
| RSK-002 | Supabase pricing increases with scale | Medium | Design with cost monitoring; evaluate alternatives |
| RSK-003 | Admin accidentally deletes content with no undo | High | Implement soft-delete and version history (future) |
| RSK-004 | SEO performance does not improve after launch | Medium | Implement SEO monitoring; iterate on content and metadata |
| RSK-005 | Website performance degrades with media-heavy projects | Medium | Implement image optimization and lazy loading |
| RSK-006 | Public users encounter errors on quote form submission | Medium | Implement comprehensive error handling and user feedback |
| RSK-007 | Admin password compromise leads to unauthorized content changes | High | Implement session timeout and 2FA (future) |
| RSK-008 | Duplicate content across pages affects SEO | Medium | Implement canonical URLs and proper meta tags |
| RSK-009 | Browser compatibility issues affect older browsers | Low | Define minimum browser support; test on target browsers |

---

## 15. Out of Scope

The following are explicitly **not** part of PRD-01 and will be addressed in future Product Requirement Documents:

- Estimate Engine (PRD-02)
- CRM Workflow — Lead Management, Customer Management, Project Tracking (PRD-03)
- ERP — Inventory, Billing, Costing (PRD-04)
- Customer Portal (PRD-05)
- Vendor Portal (PRD-06)
- Mobile App (PRD-07)
- SaaS Platform / Multi-tenant architecture (PRD-08)

Additionally, the following features are deferred to future versions:

| Feature | Future PRD |
|---------|-----------|
| Lead status tracking and assignment | PRD-03 |
| Contact lead / quote request export | PRD-03 |
| Quote request detailed specifications | PRD-02 |
| Admin user roles (Editor, Viewer) | PRD-03 or PRD-08 |
| 2FA for admin accounts | Future |
| Multi-language support | Future |
| Soft-delete and version history in CMS | Future |
| A/B testing for homepage | Future |
| Scheduled content publishing | Future |

---

## 16. Open Questions

| ID | Question | Stakeholder | Priority |
|----|----------|-------------|----------|
| OQ-001 | Should the quote generator include project type selection (residential, commercial, interior, renovation) in the MVP? | Product, Sales | High |
| OQ-002 | What lead statuses should be available for Contact Leads? (e.g., New, Contacted, Qualified, Converted, Archived) | Sales | High |
| OQ-003 | Should export functionality (CSV/PDF) be included in the MVP for Contact Leads and Quote Requests? | Sales, Admin | Medium |
| OQ-004 | Should admin users have granular roles (Editor, Viewer) in the MVP, or is a single Admin role sufficient? | Admin, Product | Medium |
| OQ-005 | Should admin authentication eventually be unified with public user authentication under a single user model with role-based permissions? | Product, Engineering | High |
| OQ-006 | What is the target number of projects, blogs, and testimonials to display in listings before pagination is required? | Product | Low |
| OQ-007 | Should the hero banner support video backgrounds in the MVP? | Marketing | Low |
| OQ-008 | What image size requirements and optimization settings should be enforced for uploads? | Engineering | Medium |
| OQ-009 | Should the contact form include file upload capability? | Sales | Low |
| OQ-010 | What analytics platform should be integrated? (Google Analytics, Plausible, etc.) | Marketing | Medium |

---

## 17. Glossary

| Term | Definition |
|------|-----------|
| **Lead** | A potential customer who has submitted contact information via the contact form or quote generator |
| **Customer** | A lead who has been qualified and converted into a paying client |
| **Project** | A completed or ongoing construction project undertaken by SBBT, displayed on the website portfolio |
| **Package** | A predefined set of construction services and specifications with an associated rate |
| **Estimate** | A detailed cost breakdown for a customer's project (future PRD-02) |
| **CMS** | Content Management System — the admin dashboard for managing website content |
| **CRM** | Customer Relationship Management — system for managing leads, customers, and interactions (future PRD-03) |
| **ERP** | Enterprise Resource Planning — integrated system for managing business processes (future PRD-04) |
| **SSG** | Static Site Generation — pre-rendering pages at build time |
| **ISR** | Incremental Static Regeneration — updating static pages after build |
| **SEO** | Search Engine Optimization — optimizing content for search engines |
| **CTO** | Call To Action |
| **FCP** | First Contentful Paint — performance metric |
| **WCAG** | Web Content Accessibility Guidelines |

---

## 18. Document Version History

| Version | Date | Author | Status |
|---------|------|--------|--------|
| 1.0 | August 2026 | AI Software Architect | Draft |

---

## 19. Future PRD Roadmap

| PRD | Title | Scope | Status |
|-----|-------|-------|--------|
| PRD-01 | Website + CMS | Public website, admin dashboard, content management, authentication | Current |
| PRD-02 | Estimate Engine | Independent, reusable estimation engine (quotation generation, pricing) | Future |
| PRD-03 | CRM | Lead management, customer management, project tracking, follow-up | Future |
| PRD-04 | ERP | Inventory, billing, costing, vendor management | Future |
| PRD-05 | Customer Portal | Self-service portal for customers | Future |
| PRD-06 | Vendor Portal | Supplier and partner portal | Future |
| PRD-07 | Mobile App | Native mobile application | Future |
| PRD-08 | SaaS Platform | Multi-tenant, multi-company SaaS architecture | Future |

---

*End of Document*
