# Sprint 13B - CMS Integration Checklist

## Issues Found & Fixed

### [x] 1. Footer - Social links from CMS
Status: ✅ Already done. Uses getSocialLinks() from CMS actions.

### [ ] 2. Hardcoded pexels placeholder images
- `components/home/Projects.tsx` - Remove pexels fallback, use null
- `components/home/Blogs.tsx` - Remove pexels fallback, use null
- `components/home/Hero.tsx` - Remove pexels fallback, use null

### [ ] 3. Hardcoded contact info in Contact page
- `app/contact/page.tsx` - Remove "SBBT Constructions, Mumbai", "+91 98765 43210", "info@sbbtconstruction.com" fallbacks

### [ ] 4. Hardcoded business hours fallback
- `app/contact/page.tsx` - Remove hardcoded Mon-Sat business hours

### [ ] 5. Hero - Remove hardcoded fallback content
- `components/home/Hero.tsx` - Remove pexels and hardcoded title/subtitle fallbacks

### [ ] 6. Missing blog detail page
- Create `app/blogs/[slug]/page.tsx` reading from cms_blogs

### [ ] 7. SEO integration - Add dynamic SEO to public pages
- `app/blogs/page.tsx` - Read cms_seo for metadata
- `app/contact/page.tsx` - Read cms_seo for metadata  
- `app/projects/page.tsx` - Read cms_seo for metadata
- `app/packages/page.tsx` - Read cms_seo for metadata

### [ ] 8. Newsletter form verification
Status: ✅ Already posts to /api/leads which saves to database. No fake success.

### [ ] 9. createClient() audit
Status: ✅ All files use @/lib/supabase/client or @/lib/supabase/server

### [ ] 10. Build verification
- [ ] Run TypeScript check
- [ ] Run build