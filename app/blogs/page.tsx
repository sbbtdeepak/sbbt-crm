"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";

const blogCategories = [
  { name: "Construction Tips", href: "#", count: 12 },
  { name: "Design Ideas", href: "#", count: 8 },
  { name: "Material Guides", href: "#", count: 15 },
  { name: "Project Stories", href: "#", count: 20 },
];

const featuredArticles = [
  {
    title: "10 Essential Construction Tips for First-Time Home Builders",
    excerpt: "Building your first home? These expert tips will help you avoid common mistakes and ensure your dream project turns out exactly as planned.",
    date: "June 15, 2025",
    readTime: "5 min read",
    image: "/api/placeholder/600/400",
  },
  {
    title: "Modern Home Design Trends for 2025",
    excerpt: "Discover the latest architectural trends that are shaping modern residential construction across India.",
    date: "June 10, 2025",
    readTime: "4 min read",
    image: "/api/placeholder/600/400",
  },
];

const recentArticles = [
  {
    title: "How to Choose the Right Construction Package",
    date: "July 1, 2025",
    category: "Construction Tips",
  },
  {
    title: "Understanding Material Quality Grades",
    date: "June 28, 2025",
    category: "Material Guides",
  },
  {
    title: "Planning Your Home Layout: A Complete Guide",
    date: "June 25, 2025",
    category: "Design Ideas",
  },
  {
    title: "Cost-Saving Strategies Without Compromising Quality",
    date: "June 20, 2025",
    category: "Construction Tips",
  },
  {
    title: "Smart Home Integration in Modern Construction",
    date: "June 18, 2025",
    category: "Project Stories",
  },
  {
    title: "Legal Checklist Before Starting Construction",
    date: "June 12, 2025",
    category: "Construction Tips",
  },
];

export default function BlogsPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="pt-28 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-950 sm:text-5xl">
              Construction <span className="text-indigo-600">Insights</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Expert advice, design inspiration, and construction guides for your dream project.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white py-8 border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full rounded-full border border-slate-300 px-6 py-4 pl-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
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
        </div>
      </section>

      {/* Categories */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {blogCategories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="rounded-full bg-white px-6 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                {category.name} ({category.count})
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-10">Featured Articles</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredArticles.map((article, idx) => (
              <article key={idx} className="group rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                <div className="aspect-video bg-slate-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    Image Placeholder
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-slate-600 line-clamp-2">{article.excerpt}</p>
                  <a href="#" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
                    Read More →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-10">Recent Articles</h2>
          <div className="divide-y divide-slate-200 rounded-2xl bg-white shadow-sm border border-slate-200">
            {recentArticles.map((article, idx) => (
              <article key={idx} className="p-6 hover:bg-slate-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{article.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-600 font-medium">
                      {article.category}
                    </span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-indigo-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Stay Updated</h2>
          <p className="mt-3 text-indigo-200">
            Subscribe to our newsletter for the latest construction insights and updates.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-full px-6 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white hover:bg-emerald-400 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <CTA />

      <Footer />
    </>
  );
}