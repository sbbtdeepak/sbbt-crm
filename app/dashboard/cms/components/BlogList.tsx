"use client";

import { useState, useEffect } from "react";
import { getBlogs, deleteBlog, toggleBlogPublished } from "../actions";
import type { CMSBlogRow } from "../types";

interface Props {
  onEdit: (blog: CMSBlogRow) => void;
  onCreate: () => void;
}

export default function BlogList({ onEdit, onCreate }: Props) {
  const [blogs, setBlogs] = useState<CMSBlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBlogs() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBlogs();
        if (!cancelled) {
          setBlogs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load blogs");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchBlogs();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    const formData = new FormData();
    formData.set("id", String(id));
    const result = await deleteBlog({ success: false, message: "" }, formData);
    if (result.success) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    const formData = new FormData();
    formData.set("id", String(id));
    formData.set("is_published", current ? "off" : "on");
    await toggleBlogPublished({ success: false, message: "" }, formData);
    setBlogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_published: !current } : b))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Blog Posts</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          + New Blog Post
        </button>
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No blog posts yet</p>
          <p className="mt-1">Create your first blog post to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold truncate">{blog.title}</h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      blog.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {blog.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                {blog.excerpt && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{blog.excerpt}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>By {blog.author || "Unknown"}</span>
                  <span>Slug: /blogs/{blog.slug}</span>
                  <span>Order: {blog.display_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(blog.id, blog.is_published);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    blog.is_published
                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {blog.is_published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(blog);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(blog.id);
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}