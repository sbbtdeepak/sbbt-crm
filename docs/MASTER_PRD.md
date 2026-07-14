# SBBT CRM MVP

## Project Vision

Build a modern, scalable Construction CRM platform for Shree Badree Build Tech Pvt Ltd (SBBT).

Phase 1:
Develop a professional construction company website with an admin dashboard where all website content can be managed without editing code.

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

1. Public User
Google Login only when requesting a quotation.

2. Admin
Email and Password login with full dashboard access.

Future phases will expand this project into:
- Interior Design Website
- Construction CRM
- Construction ERP
- Multi-company SaaS Platform

## Public Website Modules

The public website will include the following pages and modules:

### Home
- Hero Banner (Admin Editable)
- Company Introduction
- Why Choose SBBT
- Featured Projects
- Pricing Overview
- Testimonials
- Brands We Work With
- Latest Blogs
- Latest News
- Google Rating
- Contact CTA
- Get Quote CTA

### Projects
- Project Listing
- Search & Filter
- Cover Image
- Short Description
- Status (Completed / Ongoing)

### Project Details
- Multiple Images
- Project Overview
- Plot Size
- Built-up Area
- Floors
- Package
- Construction Timeline
- Materials Used
- Related Projects

### Blog
- Blog Listing
- Blog Details
- Categories
- SEO Friendly URLs

### Pricing
- Multiple Packages
- Package Specifications
- Package Comparison
- Get Quote Button

### Testimonials
- Customer Reviews
- Google Rating
- Customer Images

### Brands We Work With
- Brand Logos
- Brand Names

### News
- Company Updates
- Construction News

### Refer & Earn
- Reward Information
- Terms & Conditions

### Contact
- Contact Form
- Company Details
- Google Map

### Quote Generator
- Google Login Required
- Auto-fill Contact Details
- Submit Quote Request

## Authentication

There will be two completely separate authentication flows.

### Public User

Visitors can browse the complete website without logging in.

Only the "Get Quote" feature requires authentication.

Authentication Method:
- Google OAuth using Supabase

After successful login:
- User profile is created automatically if it does not exist.
- Contact form fields are auto-filled.
- User can submit quotation request.
- Quotation request is stored in Supabase.
- Quotation request is visible in Admin Dashboard.
- Future support for Google Sheet synchronization.

Public users must never access the Admin Dashboard.

---

### Admin

Admin login is completely separate from Google OAuth.

Login Method:
- Email
- Password

After successful login:
- Redirect to Dashboard.

Admin can manage:

- Hero Banner
- Projects
- Project Images
- Blogs
- Pricing Packages
- Testimonials
- Brands
- News
- Refer & Earn
- Contact Leads
- Quote Requests
- Website Settings

Dashboard routes must always remain protected.

Only authenticated Admin users can access Dashboard.

## Dashboard

The Dashboard is the Content Management System (CMS) for the public website.

The Dashboard must contain the following modules.

### Dashboard Home
- Statistics Cards
- Recent Leads
- Recent Quote Requests
- Recent Projects

### Hero Management
- Hero Image
- Heading
- Sub Heading
- CTA Button

### Projects Management
- Add Project
- Edit Project
- Delete Project
- Upload Multiple Images
- Mark as Featured
- Completed / Ongoing Status

### Blog Management
- Add Blog
- Edit Blog
- Delete Blog
- SEO Fields
- Featured Image

### Pricing Management
- Add Package
- Edit Package
- Delete Package
- Package Specifications
- Package Rate

### Testimonials Management
- Customer Name
- Rating
- Review
- Customer Image

### Brands Management
- Brand Name
- Brand Logo

### News Management
- Add News
- Edit News
- Delete News

### Refer & Earn Management
- Reward Amount
- Description
- Banner Image

### Contact Leads
- View Contact Forms
- Search
- Filter
- Status

### Quote Requests
- View Quote Requests
- Search
- Filter
- Export (Future)

### Website Settings
- Company Information
- Social Links
- Google Rating
- Contact Details

## Projects

## Project Details

## Blog

## Pricing Packages

## Testimonials

## Brands We Work With

## News

## Refer & Earn

## Contact Leads

## Quote Generator

## Future Interior Website

## Future SaaS CRM
