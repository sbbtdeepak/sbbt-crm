import Link from "next/link";
import type { PublicBlog } from "@/lib/cms/public";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface BlogCardProps {
  blog: PublicBlog;
  variant?: "default" | "featured" | "compact";
  priority?: boolean;
}

// ============================================================
// BlogCard — Reusable blog card component (3 variants)
// - featured : large hero card for the top of the listing
// - default  : standard grid card
// - compact  : horizontal list item (Most Read sidebar)
// ============================================================
export default function BlogCard({
  blog,
  variant = "default",
  priority = false,
}: BlogCardProps) {
  const date = formatDate(blog.published_date || blog.created_at);
  const href = `/blogs/${blog.slug}`;
  const category = blog.category || "";

  // ---------- Featured (hero) variant ----------
  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-2xl shadow-lg bg-slate-900 min-h-[380px] lg:min-h-[440px]">
        {blog.featured_image_url ? (
          <img
            src={blog.featured_image_url}
            alt={blog.featured_image_alt || blog.title}
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {category && (
              <span className="rounded-full bg-indigo-600 px-2.5 py-1 font-semibold text-white">
                {category}
              </span>
            )}
            {blog.is_hot && (
              <span className="rounded-full bg-orange-500 px-2.5 py-1 font-semibold text-white">
                🔥 Hot
              </span>
            )}
            {date && <span className="text-slate-300">{date}</span>}
            {blog.reading_time > 0 && (
              <span className="text-slate-300">· {blog.reading_time} min read</span>
            )}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white lg:text-3xl">
            <Link href={href} className="transition group-hover:text-indigo-300">
              {blog.title}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-300">
            {blog.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="font-medium text-white">{blog.author}</span>
            {blog.views > 0 && <span>· {formatCount(blog.views)} views</span>}
          </div>
        </div>
      </article>
    );
  }

  // ---------- Compact (list) variant ----------
  if (variant === "compact") {
    return (
      <article className="group flex items-start gap-3">
        <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
          {blog.featured_image_url ? (
            <img
              src={blog.featured_image_url}
              alt={blog.featured_image_alt || blog.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0">
          {date && <p className="text-[11px] text-slate-500">{date}</p>}
          <Link
            href={href}
            className="line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-indigo-600"
          >
            {blog.title}
          </Link>
          {blog.views > 0 && (
            <p className="text-[11px] text-slate-500">{formatCount(blog.views)} views</p>
          )}
        </div>
      </article>
    );
  }

  // ---------- Default (grid) variant ----------
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={href} className="block">
        <div className="relative aspect-video overflow-hidden bg-slate-200">
          {blog.featured_image_url ? (
            <img
              src={blog.featured_image_url}
              alt={blog.featured_image_alt || blog.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No image
            </div>
          )}
          {blog.is_hot && (
            <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
              🔥 Hot
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          {category && (
            <Link
              href={`/blogs?category=${encodeURIComponent(category)}`}
              className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              {category}
            </Link>
          )}
          {date && <span>{date}</span>}
          {blog.reading_time > 0 && <span>· {blog.reading_time} min read</span>}
        </div>
        <h3 className="mt-2 text-base font-bold text-slate-900 transition group-hover:text-indigo-600">
          <Link href={href}>{blog.title}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">{blog.excerpt}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">{blog.author}</span>
          <Link
            href={href}
            className="text-xs font-semibold text-indigo-600 transition group-hover:underline"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
}