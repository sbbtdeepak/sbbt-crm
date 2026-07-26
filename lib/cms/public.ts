// ============================================================
// CMS — Public Helpers
// SBBT CRM v2
//
// Reusable fetch logic for public-facing CMS data.
// These helpers are used by server components (RSC) and
// client components to read published content from cms_blogs
// and cms_testimonials tables.
// ============================================================

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// ============================================================
// Types (mirrors dashboard types for public consumption)
// ============================================================

export interface PublicBlog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PublicTestimonial {
  id: number;
  client_name: string;
  designation: string;
  project_name: string;
  location: string;
  testimonial: string;
  image_url: string;
  rating: number;
  is_featured: boolean;
  display_order: number;
}

// ============================================================
// Blogs
// ============================================================

/**
 * Fetch published blogs from cms_blogs.
 * Filters by is_published = true and orders by display_order.
 * @param options.limit  Max number of blogs to return (default: all)
 * @param options.search Optional search filter (matches title, excerpt, tags)
 */
export async function getBlogs(options?: {
  limit?: number;
  search?: string;
}): Promise<PublicBlog[]> {
  const supabase = await createServerClient();

  let query = supabase
    .from("cms_blogs")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `title.ilike.${term},excerpt.ilike.${term},tags.ilike.${term},content.ilike.${term}`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }

  return (data || []) as PublicBlog[];
}

/**
 * Fetch a single blog by its slug.
 */
export async function getBlogBySlug(slug: string): Promise<PublicBlog | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("cms_blogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }

  return data as PublicBlog | null;
}

/**
 * Extract unique tags from all published blogs.
 * Tags are stored as comma-separated strings.
 */
export async function getBlogTags(): Promise<string[]> {
  const blogs = await getBlogs();
  const tagSet = new Set<string>();

  for (const blog of blogs) {
    if (blog.tags) {
      blog.tags.split(",").forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed) tagSet.add(trimmed);
      });
    }
  }

  return Array.from(tagSet).sort();
}

// ============================================================
// Testimonials
// ============================================================

/**
 * Fetch featured testimonials from cms_testimonials.
 * Filters by is_featured = true and orders by display_order.
 */
export async function getTestimonials(options?: {
  limit?: number;
}): Promise<PublicTestimonial[]> {
  const supabase = await createServerClient();

  let query = supabase
    .from("cms_testimonials")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }

  return (data || []) as PublicTestimonial[];
}

// ============================================================
// Client-side helpers (for client components)
// ============================================================

/**
 * Fetch published blogs from cms_blogs on the client side.
 */
export async function getBlogsClient(options?: {
  limit?: number;
  search?: string;
}): Promise<PublicBlog[]> {
  const supabase = createBrowserClient();

  let query = supabase
    .from("cms_blogs")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `title.ilike.${term},excerpt.ilike.${term},tags.ilike.${term},content.ilike.${term}`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }

  return (data || []) as PublicBlog[];
}

/**
 * Fetch featured testimonials from cms_testimonials on the client side.
 */
export async function getTestimonialsClient(options?: {
  limit?: number;
}): Promise<PublicTestimonial[]> {
  const supabase = createBrowserClient();

  let query = supabase
    .from("cms_testimonials")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }

  return (data || []) as PublicTestimonial[];
}