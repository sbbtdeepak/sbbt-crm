import Link from "next/link";
import type { PublicBlog } from "@/lib/cms/public";

// ============================================================
// Blog Widgets — CategoryChips, HotTopicsSlider, MostReadList
// Reusable pieces for the blog listing + detail pages.
// ============================================================

// ---------- CategoryChips ----------
export function CategoryChips({
  categories,
  active,
  counts,
}: {
  categories: string[];
  active?: string;
  counts?: Record<string, number>;
}) {
  if (!categories.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blogs"
        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm border transition ${
          !active
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
        }`}
      >
        All
      </Link>
      {categories.map((category) => {
        const isActive = active?.toLowerCase() === category.toLowerCase();
        return (
          <Link
            key={category}
            href={isActive ? "/blogs" : `/blogs?category=${encodeURIComponent(category)}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm border transition ${
              isActive
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            {category}
            {counts && counts[category] ? ` (${counts[category]})` : ""}
          </Link>
        );
      })}
    </div>
  );
}

// ---------- HotTopicsSlider ----------
export function HotTopicsSlider({ blogs }: { blogs: PublicBlog[] }) {
  if (!blogs.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {blogs.map((blog) => (
        <Link
          key={blog.id}
          href={`/blogs/${blog.slug}`}
          className="group flex min-w-[240px] max-w-[240px] shrink-0 snap-start flex-col rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm transition hover:shadow-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
            🔥 Hot Topic
          </span>
          <span className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-orange-600">
            {blog.title}
          </span>
          <span className="mt-2 text-[11px] text-slate-500">
            {blog.reading_time > 0 ? `${blog.reading_time} min read` : ""}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ---------- MostReadList ----------
export function MostReadList({ blogs }: { blogs: PublicBlog[] }) {
  if (!blogs.length) return null;

  return (
    <ol className="space-y-4">
      {blogs.map((blog, index) => (
        <li key={blog.id}>
          <Link
            href={`/blogs/${blog.slug}`}
            className="group flex items-start gap-3"
          >
            <span className="mt-0.5 text-lg font-bold text-slate-300 transition group-hover:text-indigo-500">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="line-clamp-2 text-sm font-semibold text-slate-800 transition group-hover:text-indigo-600">
              {blog.title}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}