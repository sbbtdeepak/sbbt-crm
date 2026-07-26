import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import NewsletterForm from "@/components/shared/NewsletterForm";
import Link from "next/link";
import { getBlogs, getBlogTags } from "@/lib/cms/public";

// ============================================================
// Blog Page — Public
// Reads entirely from cms_blogs. No hardcoded content.
// ============================================================

export const metadata: Metadata = {
  title: "Construction Blogs & Insights | SBBT",
  description:
    "Expert construction advice, design inspiration, home building guides, and renovation tips from Shree Badree Build Tech.",
  openGraph: {
    title: "Construction Blogs & Insights | SBBT",
    description:
      "Expert construction advice, design inspiration, home building guides, and renovation tips from Shree Badree Build Tech.",
    type: "website",
  },
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const searchTerm = params.search || "";
  const activeTag = params.tag || "";

  // Fetch all blogs and tags in parallel
  const [allBlogs, allTags] = await Promise.all([
    getBlogs(),
    getBlogTags(),
  ]);

  // Filter by search term
  const filteredBySearch = searchTerm
    ? allBlogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.tags.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allBlogs;

  // Filter by tag
  const blogs = activeTag
    ? filteredBySearch.filter(
        (blog) =>
          blog.tags &&
          blog.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .includes(activeTag.toLowerCase())
      )
    : filteredBySearch;

  // Featured blogs (first 2)
  const featuredBlogs = blogs.slice(0, 2);

  // Recent blogs
  const recentBlogs = blogs.slice(2);

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="md:pt-14 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              Construction <span className="text-indigo-600">Insights</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
              Expert advice, design inspiration, and construction guides for your dream project.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white py-6 border-b border-slate-200">
        <div className="mx-auto max-w-2xl px-6">
          <form method="GET" action="/blogs">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchTerm}
                placeholder="Search articles..."
                className="w-full rounded-full border border-slate-300 px-4 py-2.5 pl-10 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>
      </section>

      {/* Categories / Tags */}
      {allTags.length > 0 && (
        <section className="bg-slate-50 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {activeTag && (
                <Link
                  href="/blogs"
                  className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-sm border border-indigo-600 transition"
                >
                  Clear filter
                </Link>
              )}
              {allTags.map((tag) => {
                const count = allBlogs.filter(
                  (b) => b.tags && b.tags.split(",").map((t) => t.trim().toLowerCase()).includes(tag.toLowerCase())
                ).length;
                const isActive = activeTag.toLowerCase() === tag.toLowerCase();
                return (
                  <Link
                    key={tag}
                    href={isActive ? "/blogs" : `/blogs?tag=${encodeURIComponent(tag)}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm border transition ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {tag} ({count})
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {blogs.length === 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-slate-500 text-sm">No articles found matching your criteria.</p>
            <Link href="/blogs" className="mt-4 inline-block text-xs font-medium text-indigo-600 hover:underline">
              Clear filters and browse all articles →
            </Link>
          </div>
        </section>
      )}

      {/* Featured Articles */}
      {featuredBlogs.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Featured Articles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredBlogs.map((blog) => (
                <article key={blog.id} className="group rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white">
                  <div className="aspect-video bg-slate-200 relative overflow-hidden">
                    {blog.featured_image_url ? (
                      <img
                        src={blog.featured_image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      {blog.created_at && (
                        <span>{new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                      )}
                      {blog.author && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{blog.author}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {blog.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{blog.excerpt}</p>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:underline"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recentBlogs.length > 0 && (
        <section className="bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Articles</h2>
            <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm border border-slate-200">
              {recentBlogs.map((blog) => (
                <article key={blog.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <h3 className="text-sm font-semibold text-slate-900">{blog.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {blog.tags && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600 font-medium">
                          {blog.tags.split(",")[0].trim()}
                        </span>
                      )}
                      {blog.created_at && (
                        <span>{new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterForm />

      <CTA />
      <Footer />
    </>
  );
}