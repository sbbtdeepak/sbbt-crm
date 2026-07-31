import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import NewsletterForm from "@/components/shared/NewsletterForm";
import BlogCard from "@/components/blog/BlogCard";
import { CategoryChips, HotTopicsSlider, MostReadList } from "@/components/blog/BlogWidgets";
import { getBlogs, getBlogCategories, getBlogTags } from "@/lib/cms/public";
import { buildListingMetadata, getCompanySeoFallback } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import Link from "next/link";

const breadcrumbs = breadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Blogs", path: "/blogs" },
]);

// ============================================================
// Blog Page — Public (Premium Redesign)
// Reads entirely from cms_blogs. No hardcoded content.
// Sections: Hero, Search, Categories, Hot Topics, Featured,
// Latest Grid, Most Read Sidebar, Pagination.
// ============================================================

const BLOGS_PER_PAGE = 9;

export async function generateMetadata() {
  const fallback = await getCompanySeoFallback();

  return buildListingMetadata({
    title: "Construction Blogs & Insights | SBBT",
    description:
      "Expert construction advice, design inspiration, home building guides, and renovation tips from Shree Badree Build Tech.",
    keywords: fallback.keywords,
    path: "/blogs",
    fallback,
  });
}

const jsonLd = breadcrumbs;

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const searchTerm = params.search || "";
  const activeCategory = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Fetch everything in parallel
  const [allBlogs, categories, allTags] = await Promise.all([
    getBlogs(),
    getBlogCategories(),
    getBlogTags(),
  ]);

  // ---------- Filtering ----------
  let filtered = allBlogs;

  if (activeCategory) {
    filtered = filtered.filter(
      (blog) => blog.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (blog) =>
        blog.title.toLowerCase().includes(term) ||
        blog.excerpt.toLowerCase().includes(term) ||
        blog.tags.toLowerCase().includes(term) ||
        blog.category.toLowerCase().includes(term)
    );
  }

  // ---------- Derived sections ----------
  const hotBlogs = allBlogs.filter((blog) => blog.is_hot).slice(0, 8);
  const featuredBlogs = filtered
    .filter((blog) => blog.featured)
    .slice(0, 3);

  // Hero slot: first featured OR first filtered
  const heroBlog = featuredBlogs[0] || filtered[0] || null;
  const heroSecondary = featuredBlogs[1] || null;
  const heroTertiary = featuredBlogs[2] || null;

  const restAfterHero = (heroBlog ? filtered.filter((b) => b.id !== heroBlog.id) : filtered)
    .filter((b) => !heroSecondary || b.id !== heroSecondary.id)
    .filter((b) => !heroTertiary || b.id !== heroTertiary.id);

  // Latest grid with pagination
  const latestBlogs = restAfterHero;
  const totalPages = Math.max(1, Math.ceil(latestBlogs.length / BLOGS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageBlogs = latestBlogs.slice(
    (currentPage - 1) * BLOGS_PER_PAGE,
    currentPage * BLOGS_PER_PAGE
  );

  // Most read: top by views (excluding hero + secondary when possible)
  const mostRead = [...latestBlogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Category counts
  const counts: Record<string, number> = {};
  for (const blog of allBlogs) {
    if (blog.category) {
      counts[blog.category] = (counts[blog.category] || 0) + 1;
    }
  }

  // Pagination URL builder
  const pageHref = (p: number) => {
    const paramsObj = new URLSearchParams();
    if (searchTerm) paramsObj.set("search", searchTerm);
    if (activeCategory) paramsObj.set("category", activeCategory);
    if (p > 1) paramsObj.set("page", String(p));
    const qs = paramsObj.toString();
    return qs ? `/blogs?${qs}` : "/blogs";
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      {/* ============ Hero ============ */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 md:pt-14">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20 text-center">
          <span className="inline-block rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            Insights & Guides
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Construction <span className="text-indigo-400">Insights</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
            Expert advice, design inspiration, and construction guides for your dream project.
          </p>

          {/* Search */}
          <form method="GET" action="/blogs" className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchTerm}
                placeholder="Search articles..."
                className="w-full rounded-full border border-slate-600 bg-slate-800/60 px-5 py-3 pl-11 text-sm text-white placeholder-slate-400 shadow-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
              {searchTerm && (
                <Link
                  href="/blogs"
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ============ Categories ============ */}
      <section className="border-b border-slate-200 bg-slate-50 py-5">
        <div className="mx-auto max-w-7xl px-6">
          <CategoryChips categories={categories} active={activeCategory} counts={counts} />
        </div>
      </section>

      {/* ============ Hot Topics ============ */}
      {hotBlogs.length > 0 && !searchTerm && !activeCategory && (
        <section className="border-b border-orange-100 bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-white py-6">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-orange-600">
                🔥 Hot Topics
              </h2>
              <span className="text-[11px] text-slate-400">Scroll →</span>
            </div>
            <HotTopicsSlider blogs={hotBlogs} />
          </div>
        </section>
      )}

      {/* ============ Empty State ============ */}
      {filtered.length === 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-slate-500 text-sm">
              No articles found matching your criteria.
            </p>
            <Link
              href="/blogs"
              className="mt-4 inline-block text-xs font-medium text-indigo-600 hover:underline"
            >
              Clear filters and browse all articles →
            </Link>
          </div>
        </section>
      )}

      {/* ============ Two-Column: Main + Sidebar ============ */}
      {filtered.length > 0 && (
        <section className="bg-white py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-3">
              {/* Main column */}
              <div className="lg:col-span-2">
                {!searchTerm && !activeCategory ? (
                  /* ---- Home view: Hero featured block ---- */
                  <div className="space-y-8">
                    {heroBlog && (
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <BlogCard blog={heroBlog} variant="featured" priority />
                        </div>
                        {heroSecondary && (
                          <BlogCard blog={heroSecondary} variant="default" />
                        )}
                        {heroTertiary && (
                          <BlogCard blog={heroTertiary} variant="default" />
                        )}
                      </div>
                    )}

                    <div>
                      <h2 className="mb-4 text-xl font-bold text-slate-900">
                        Latest Articles
                      </h2>
                      {pageBlogs.length > 0 ? (
                        <div className="grid gap-5 sm:grid-cols-2">
                          {pageBlogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No more articles.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ---- Filtered view: Results grid ---- */
                  <div>
                    <h2 className="mb-4 text-xl font-bold text-slate-900">
                      {searchTerm || activeCategory ? "Search Results" : "Latest Articles"}
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {pageBlogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ---- Pagination ---- */}
                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-2">
                    <Link
                      href={pageHref(currentPage - 1)}
                      aria-disabled={currentPage <= 1}
                      className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                        currentPage <= 1
                          ? "pointer-events-none border-slate-200 text-slate-300"
                          : "border-slate-300 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      ← Prev
                    </Link>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={pageHref(p)}
                        className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                          p === currentPage
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                    <Link
                      href={pageHref(currentPage + 1)}
                      aria-disabled={currentPage >= totalPages}
                      className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                        currentPage >= totalPages
                          ? "pointer-events-none border-slate-200 text-slate-300"
                          : "border-slate-300 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      Next →
                    </Link>
                  </nav>
                )}
              </div>

              {/* ---- Sidebar: Most Read + Tags ---- */}
              <aside className="space-y-8">
                {mostRead.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                      Most Read
                    </h2>
                    <MostReadList blogs={mostRead} />
                  </div>
                )}

                {allTags.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                      Topics
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 12).map((tag) => (
                        <Link
                          key={tag}
                          href="/blogs"
                          className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter mini-card */}
                <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 p-5 text-white">
                  <h2 className="text-sm font-bold">Stay Updated</h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Get the latest construction insights in your inbox.
                  </p>
                </div>
              </aside>
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