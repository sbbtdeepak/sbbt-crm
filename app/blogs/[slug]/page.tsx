import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import NewsletterForm from "@/components/shared/NewsletterForm";
import Link from "next/link";
import { getBlogBySlug } from "@/lib/cms/public";

// ============================================================
// Blog Detail Page — Public
// Reads entirely from cms_blogs. No hardcoded content.
// ============================================================

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

import { buildItemMetadata, getCompanySeoFallback } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  const fallback = await getCompanySeoFallback();

  if (!blog) {
    return { title: "Blog Not Found | SBBT" };
  }

  const title = blog.meta_title?.trim() || `${blog.title} | ${fallback.siteName}`;
  const description = blog.meta_description?.trim() || blog.excerpt?.trim() || fallback.description;

  return buildItemMetadata({
    title,
    description,
    keywords: blog.tags?.trim() || fallback.keywords,
    path: `/blogs/${blog.slug || slug}`,
    fallback,
    ogImage: blog.featured_image_url?.trim() || fallback.logoUrl,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // Parse tags for display
  const tags = blog.tags
    ? blog.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <>
      <Header />

      {/* Blog Detail */}
      <article className="md:pt-24 bg-slate-50 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Back link */}
          <Link
            href="/blogs"
            className="inline-flex items-center text-xs text-indigo-600 hover:underline mb-6"
          >
            &#x2190; Back to Blogs
          </Link>

          {/* Header */}
          <header className="mb-8">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blogs?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-600 hover:bg-indigo-100 transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-tight">
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {blog.author && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {blog.author}
                </span>
              )}
              {blog.created_at && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {new Date(blog.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {blog.featured_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-md">
              <img
                src={blog.featured_image_url}
                alt={blog.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {blog.excerpt && (
            <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
              <p className="text-sm text-indigo-900 leading-relaxed italic">
                {blog.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm sm:prose-base max-w-none prose-slate prose-headings:text-slate-950 prose-a:text-indigo-600">
            {blog.content.split("\n").map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return <br key={idx} />;

              // Check if it's a heading (starts with ## or #)
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-lg font-bold text-slate-950 mt-6 mb-3">
                    {trimmed.replace(/^##\s+/, "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={idx} className="text-xl font-bold text-slate-950 mt-6 mb-3">
                    {trimmed.replace(/^#\s+/, "")}
                  </h1>
                );
              }

              return (
                <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed mb-3">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Tags at bottom */}
          {tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Tags:</span>
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blogs?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <NewsletterForm />
      <CTA />
      <Footer />
    </>
  );
}