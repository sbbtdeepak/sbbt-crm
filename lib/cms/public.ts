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
import { DEFAULT_SITE_ID } from "@/app/dashboard/cms/types";

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
  featured_image_alt: string;
  author: string;
  tags: string;
  category: string;
  reading_time: number;
  views: number;
  is_hot: boolean;
  featured: boolean;
  published_date: string | null;
  og_image_url: string;
  faq: Array<{ question: string; answer: string }>;
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

export interface PublicPackageItem {
  item: string;
  brand: string;
  specification: string;
  remarks: string;
}

export interface PublicPackageSection {
  title: string;
  items: PublicPackageItem[];
}

export interface PublicPackage {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  display_order: number;
  is_active: boolean;
  sections: PublicPackageSection[];
}

// ============================================================
// Packages
// ============================================================

/**
 * Fetch all active packages with nested sections and items.
 * Used by homepage and package comparison page.
 */
export async function getPackagesForPublic(): Promise<PublicPackage[]> {
  const supabase = await createServerClient();

  const { data: packages, error } = await supabase
    .from("cms_packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error || !packages || packages.length === 0) {
    return [];
  }

  const pkgIds = packages.map((p: Record<string, unknown>) => p.id as number);

  const { data: sections } = await supabase
    .from("cms_package_sections")
    .select("*")
    .in("package_id", pkgIds)
    .order("display_order", { ascending: true });

  const sectionIds = (sections || []).map((s: Record<string, unknown>) => s.id as number);

  const { data: items } = await supabase
    .from("cms_package_items")
    .select("*")
    .in("section_id", sectionIds.length > 0 ? sectionIds : [0])
    .order("display_order", { ascending: true });

  const sectionsByPackage: Record<number, PublicPackageSection[]> = {};
  const itemsBySection: Record<number, PublicPackageItem[]> = {};

  for (const section of sections || []) {
    const pkgId = section.package_id as number;
    if (!sectionsByPackage[pkgId]) sectionsByPackage[pkgId] = [];
    sectionsByPackage[pkgId].push({
      title: section.title as string,
      items: [],
    });
  }

  for (const item of items || []) {
    const secId = item.section_id as number;
    if (!itemsBySection[secId]) itemsBySection[secId] = [];
    itemsBySection[secId].push({
      item: item.item as string,
      brand: item.brand as string,
      specification: item.specification as string,
      remarks: item.remarks as string,
    });
  }

  // Re-attach items to sections
  for (const pkgId of Object.keys(sectionsByPackage)) {
    const numPkgId = parseInt(pkgId, 10);
    let sectionIdx = 0;
    for (const section of sections || []) {
      if (section.package_id === numPkgId) {
        const secId = section.id as number;
        sectionsByPackage[numPkgId][sectionIdx].items = itemsBySection[secId] || [];
        sectionIdx++;
      }
    }
  }

  return packages.map((pkg: Record<string, unknown>) => ({
    id: pkg.id as number,
    name: pkg.name as string,
    slug: pkg.slug as string,
    price: pkg.price as number,
    description: pkg.description as string,
    display_order: pkg.display_order as number,
    is_active: pkg.is_active as boolean,
    sections: sectionsByPackage[pkg.id as number] || [],
  }));
}

/**
 * Fetch single package by slug (for public display).
 */
export async function getPackageBySlug(slug: string): Promise<PublicPackage | null> {
  const supabase = await createServerClient();

  const { data: pkg, error } = await supabase
    .from("cms_packages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !pkg) {
    return null;
  }

  const pkgId = pkg.id as number;

  const { data: sections } = await supabase
    .from("cms_package_sections")
    .select("*")
    .eq("package_id", pkgId)
    .order("display_order", { ascending: true });

  const sectionIds = (sections || []).map((s: Record<string, unknown>) => s.id as number);

  const { data: items } = await supabase
    .from("cms_package_items")
    .select("*")
    .in("section_id", sectionIds.length > 0 ? sectionIds : [0])
    .order("display_order", { ascending: true });

  const itemsBySection: Record<number, PublicPackageItem[]> = {};
  for (const item of items || []) {
    const secId = item.section_id as number;
    if (!itemsBySection[secId]) itemsBySection[secId] = [];
    itemsBySection[secId].push({
      item: item.item as string,
      brand: item.brand as string,
      specification: item.specification as string,
      remarks: item.remarks as string,
    });
  }

  return {
    id: pkg.id as number,
    name: pkg.name as string,
    slug: pkg.slug as string,
    price: pkg.price as number,
    description: pkg.description as string,
    display_order: pkg.display_order as number,
    is_active: pkg.is_active as boolean,
    sections: (sections || []).map((sec: Record<string, unknown>) => ({
      title: sec.title as string,
      items: itemsBySection[sec.id as number] || [],
    })),
  };
}

// ============================================================
// Blogs
// ============================================================

/**
 * Options for fetching published blogs.
 */
export interface BlogQueryOptions {
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  isHot?: boolean;
  sortBy?: "display_order" | "views" | "created_at" | "published_date";
  offset?: number;
}

/**
 * Fetch published blogs from cms_blogs.
 * Filters by is_published = true and supports premium query options.
 */
export async function getBlogs(options?: BlogQueryOptions): Promise<PublicBlog[]> {
  const supabase = await createServerClient();

  let query = supabase
    .from("cms_blogs")
    .select("*")
    .eq("is_published", true);

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.featured !== undefined) {
    query = query.eq("featured", options.featured);
  }

  if (options?.isHot !== undefined) {
    query = query.eq("is_hot", options.isHot);
  }

  query = query.order(options?.sortBy || "display_order", { ascending: options?.sortBy === "views" ? false : true });

  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `title.ilike.${term},excerpt.ilike.${term},tags.ilike.${term},content.ilike.${term},category.ilike.${term},meta_title.ilike.${term},meta_description.ilike.${term}`
    );
  }

  if (options?.offset) {
    query = query.range(options.offset, (options.offset || 0) + (options.limit || 6) - 1);
  } else if (options?.limit) {
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
 * Fetch single blog by its slug.
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
 * Extract unique categories from all published blogs.
 */
export async function getBlogCategories(): Promise<string[]> {
  const blogs = await getBlogs();
  const categorySet = new Set<string>();

  for (const blog of blogs) {
    if (blog.category) {
      categorySet.add(blog.category.trim());
    }
  }

  return Array.from(categorySet).sort();
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

/**
 * Fetch related blogs sharing the same category, excluding the given slug.
 */
export async function getRelatedBlogs(slug: string, category: string, limit = 6): Promise<PublicBlog[]> {
  if (!category) return [];

  const blogs = await getBlogs({ category, limit, sortBy: "created_at" });
  return blogs.filter((blog) => blog.slug !== slug);
}

/**
 * Fetch adjacent (previous/next) blog entries for pagination.
 */
export async function getAdjacentBlogs(slug: string): Promise<{ prev: PublicBlog | null; next: PublicBlog | null }> {
  const supabase = await createServerClient();
  const all = await getBlogs();

  const index = all.findIndex((blog) => blog.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}

/**
 * Increment the views counter for a blog via SECURITY DEFINER RPC.
 * Safe for anonymous public visitors.
 */
export async function incrementBlogViews(slug: string): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.rpc("increment_blog_views", { p_slug: slug });
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
 * Fetch published blogs from cms_blogs on client side.
 */
export async function getBlogsClient(options?: BlogQueryOptions): Promise<PublicBlog[]> {
  const supabase = createBrowserClient();

  let query = supabase
    .from("cms_blogs")
    .select("*")
    .eq("is_published", true);

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.featured !== undefined) {
    query = query.eq("featured", options.featured);
  }

  if (options?.isHot !== undefined) {
    query = query.eq("is_hot", options.isHot);
  }

  query = query.order(options?.sortBy || "display_order", { ascending: options?.sortBy === "views" ? false : true });

  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `title.ilike.${term},excerpt.ilike.${term},tags.ilike.${term},content.ilike.${term},category.ilike.${term},meta_title.ilike.${term},meta_description.ilike.${term}`
    );
  }

  if (options?.offset) {
    query = query.range(options.offset, (options.offset || 0) + (options.limit || 6) - 1);
  } else if (options?.limit) {
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
 * Fetch featured testimonials from cms_testimonials on client side.
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

/**
 * Fetch all active packages on client side.
 */
export async function getPackagesClient(): Promise<PublicPackage[]> {
  const supabase = createBrowserClient();

  const { data: packages, error } = await supabase
    .from("cms_packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error || !packages || packages.length === 0) {
    return [];
  }

  const pkgIds = packages.map((p: Record<string, unknown>) => p.id as number);

  const { data: sections } = await supabase
    .from("cms_package_sections")
    .select("*")
    .in("package_id", pkgIds)
    .order("display_order", { ascending: true });

  const sectionIds = (sections || []).map((s: Record<string, unknown>) => s.id as number);

  const { data: items } = await supabase
    .from("cms_package_items")
    .select("*")
    .in("section_id", sectionIds.length > 0 ? sectionIds : [0])
    .order("display_order", { ascending: true });

  const sectionsByPackage: Record<number, PublicPackageSection[]> = {};
  const itemsBySection: Record<number, PublicPackageItem[]> = {};

  for (const section of sections || []) {
    const pkgId = section.package_id as number;
    if (!sectionsByPackage[pkgId]) sectionsByPackage[pkgId] = [];
    sectionsByPackage[pkgId].push({
      title: section.title as string,
      items: [],
    });
  }

  for (const item of items || []) {
    const secId = item.section_id as number;
    if (!itemsBySection[secId]) itemsBySection[secId] = [];
    itemsBySection[secId].push({
      item: item.item as string,
      brand: item.brand as string,
      specification: item.specification as string,
      remarks: item.remarks as string,
    });
  }

  // Re-attach items to sections
  for (const pkgId of Object.keys(sectionsByPackage)) {
    const numPkgId = parseInt(pkgId, 10);
    let sectionIdx = 0;
    for (const section of sections || []) {
      if (section.package_id === numPkgId) {
        const secId = section.id as number;
        sectionsByPackage[numPkgId][sectionIdx].items = itemsBySection[secId] || [];
        sectionIdx++;
      }
    }
  }

  return packages.map((pkg: Record<string, unknown>) => ({
    id: pkg.id as number,
    name: pkg.name as string,
    slug: pkg.slug as string,
    price: pkg.price as number,
    description: pkg.description as string,
    display_order: pkg.display_order as number,
    is_active: pkg.is_active as boolean,
    sections: sectionsByPackage[pkg.id as number] || [],
  }));
}