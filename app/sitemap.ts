import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// Dynamic Sitemap Generation
// SBBT CRM Next.js Project
//
// Generates sitemap.xml with static routes and dynamic
// content from CMS (projects, blogs, packages).
// ============================================================

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.sbbt.in";
  const supabase = await createClient();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quote`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/refer-and-earn`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/join-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic routes from CMS
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  // Projects
  const { data: projects } = await supabase
    .from("cms_projects")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (projects) {
    projects.forEach((project: { slug: string; updated_at: string }) => {
      dynamicRoutes.push({
        url: `${baseUrl}/projects/${project.slug}`,
        lastModified: new Date(project.updated_at || new Date()),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    });
  }

  // Blogs
  const { data: blogs } = await supabase
    .from("cms_blogs")
    .select("slug, updated_at")
    .eq("is_published", true);

  if (blogs) {
    blogs.forEach((blog: { slug: string; updated_at: string }) => {
      dynamicRoutes.push({
        url: `${baseUrl}/blogs/${blog.slug}`,
        lastModified: new Date(blog.updated_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  }

  // Packages
  const { data: packages } = await supabase
    .from("cms_packages")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (packages) {
    packages.forEach((pkg: { slug: string; updated_at: string }) => {
      dynamicRoutes.push({
        url: `${baseUrl}/packages/${pkg.slug}`,
        lastModified: new Date(pkg.updated_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  }

  return [...staticRoutes, ...dynamicRoutes];
}
