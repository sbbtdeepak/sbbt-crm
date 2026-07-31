import PageHero from "@/components/shared/PageHero";
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

  // ---------- Pagination ----------
  const totalPages = Math.ceil(filtered.length / BLOGS_PER_PAGE);
  const paginatedBlogs = filtered.slice(
    (page - 1) * BLOGS_PER_PAGE,
    page * BLOGS_PER_PAGE
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <PageHero title="Construction Insights" subtitle="Expert advice, design inspiration, and construction guides for your dream project." />

      {/* Search */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 relative z-10">
        <form method="GET" action="/blogs" className="mx-auto max-w-xl">
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Search articles..."
              className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 pl-11 text-sm text-slate-900 placeholder-slate-400 shadow-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7"
              />
            </svg>
          </div>
        </form>
      </div>

      {/* ============ Category Chips ============ */}
      <section className="mx-auto max-w-7xl px-6 mt-6">
        <CategoryChips
          categories={categories.map((c: { name: string; slug: string }) => ({
            name: c.name,
            slug: c.slug,
          }))}
          activeCategory={activeCategory}
        />
      </section>

      {/* ============ Hot Topics ============ */}
      {hotBlogs.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 mt-8">
          <HotTopicsSlider blogs={hotBlogs} />
        </section>
      )}

      {/* ============ Featured Blog Section ============ */}
      {heroBlog && (
        <section className="mx-auto max-w-7xl px-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Featured</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Primary (larger) */}
            <Link
              href={`/blogs/${heroBlog.slug}`}
              className="group relative col-span-2 overflow-hidden rounded-2xl bg-slate-900"
            >
              {heroBlog.image_url ? (
                <img
                  src={heroBlog.image_url}
                  alt={heroBlog.title}
                  className="h-full w-full object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-80"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-800 to-slate-900">
                  <span className="text-4xl text-white/30">SBBT</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block rounded-full bg-indigo-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {heroBlog.category}
                </span>
                <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                  {heroBlog.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300 line-clamp-2">
                  {heroBlog.excerpt}
                </p>
              </div>
            </Link>

            {/* Secondary */}
            <div className="flex flex-col gap-4">
              {heroSecondary && (
                <Link
                  href={`/blogs/${heroSecondary.slug}`}
                  className="group relative flex-1 overflow-hidden rounded-2xl bg-slate-800"
                >
                  {heroSecondary.image_url ? (
                    <img
                      src={heroSecondary.image_url}
                      alt={heroSecondary.title}
                      className="h-full w-full object-cover opacity-60 transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-700 to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block rounded-full bg-indigo-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                      {heroSecondary.category}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-white">
                      {heroSecondary.title}
                    </h3>
                  </div>
                </Link>
              )}
              {heroTertiary && (
                <Link
                  href={`/blogs/${heroTertiary.slug}`}
                  className="group relative flex-1 overflow-hidden rounded-2xl bg-slate-800"
                >
                  {heroTertiary.image_url ? (
                    <img
                      src={heroTertiary.image_url}
                      alt={heroTertiary.title}
                      className="h-full w-full object-cover opacity-60 transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-700 to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block rounded-full bg-indigo-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                      {heroTertiary.category}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-white">
                      {heroTertiary.title}
                    </h3>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ Latest Articles + Most Read ============ */}
      <section className="mx-auto max-w-7xl px-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Latest Articles</h2>
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {paginatedBlogs.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <p className="text-slate-500">No articles match your search.</p>
                <Link
                  href="/blogs"
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {paginatedBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    const params = new URLSearchParams();
                    if (searchTerm) params.set("search", searchTerm);
                    if (activeCategory) params.set("category", activeCategory);
                    params.set("page", String(p));
                    return (
                      <Link
                        key={p}
                        href={`/blogs?${params.toString()}`}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                          p === page
                            ? "bg-indigo-600 text-white shadow"
                            : "bg-white text-slate-600 hover:bg-indigo-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Most Read */}
          <aside className="space-y-6">
            <MostReadList blogs={allBlogs} />
            <NewsletterForm />
          </aside>
        </div>
      </section>

      <CTA />
      <Footer />
    </>
  );
}