"use client";

import { useActionState, useState, useCallback } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { saveBlog, deleteBlog, toggleBlogPublished } from "../actions";
import type { CMSBlogRow } from "../types";

interface Props {
  blog: CMSBlogRow | null;
  onBack: () => void;
}

export default function BlogForm({ blog, onBack }: Props) {
  const [state, formAction, isPending] = useActionState(saveBlog, {
    success: false,
    message: "",
  });

  const [deleteState, deleteAction, isDeleting] = useActionState(deleteBlog, {
    success: false,
    message: "",
  });

  const [toggleState, toggleAction, isToggling] = useActionState(toggleBlogPublished, {
    success: false,
    message: "",
  });

  const isEdit = Boolean(blog);

  // Image states
  const [featuredImageUrl, setFeaturedImageUrl] = useState(blog?.featured_image_url || "");

  // Handle delete
  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      const form = new FormData();
      form.set("id", blog?.id?.toString() || "");
      deleteAction(form);
    }
  }, [blog, deleteAction]);

  // Handle toggle published
  const handleTogglePublished = useCallback(() => {
    const form = new FormData();
    form.set("id", blog?.id?.toString() || "");
    form.set("is_published", !blog?.is_published ? "on" : "off");
    toggleAction(form);
  }, [blog, toggleAction]);

  // Show success/redirect
  if (state.success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">{state.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  if (deleteState.success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">{deleteState.message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-bold">
            {isEdit ? `Edit: ${blog?.title}` : "New Blog Post"}
          </h2>
        </div>
        {isEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTogglePublished}
              disabled={isToggling}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                blog?.is_published
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {isToggling ? "..." : blog?.is_published ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {state.message && !state.success && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
          {state.message}
        </div>
      )}
      {toggleState.message && (
        <div className={`mb-6 p-4 rounded-md ${
          toggleState.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        }`} role="alert">
          {toggleState.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={blog?.id} />}

        {/* Basic Information */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block mb-2 font-medium text-gray-700">Title *</label>
              <input
                id="title"
                name="title"
                defaultValue={blog?.title || ""}
                required
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter blog post title"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block mb-2 font-medium text-gray-700">Slug</label>
              <input
                id="slug"
                name="slug"
                defaultValue={blog?.slug || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="blog-post-slug"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from title if empty</p>
            </div>
            <div>
              <label htmlFor="author" className="block mb-2 font-medium text-gray-700">Author</label>
              <input
                id="author"
                name="author"
                defaultValue={blog?.author || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="display_order" className="block mb-2 font-medium text-gray-700">Display Order</label>
              <input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                defaultValue={blog?.display_order || 0}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block mb-2 font-medium text-gray-700">Tags</label>
              <input
                id="tags"
                name="tags"
                defaultValue={blog?.tags || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="construction, tips, design"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="excerpt" className="block mb-2 font-medium text-gray-700">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                defaultValue={blog?.excerpt || ""}
                rows={2}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Brief summary of the blog post..."
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="content" className="block mb-2 font-medium text-gray-700">Content</label>
              <textarea
                id="content"
                name="content"
                defaultValue={blog?.content || ""}
                rows={12}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="Write your blog post content here... HTML/markdown supported"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_published"
                  defaultChecked={blog?.is_published ?? false}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-700">Published (visible on website)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Featured Image</h3>
          <ImageUploader
            folder="blogs"
            value={featuredImageUrl}
            onChange={(url) => setFeaturedImageUrl(url)}
            label="Featured Image"
            disabled={isPending}
          />
          <input type="hidden" name="featured_image_url" value={featuredImageUrl} />
        </div>

        {/* SEO */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="meta_title" className="block mb-2 font-medium text-gray-700">Meta Title</label>
              <input
                id="meta_title"
                name="meta_title"
                defaultValue={blog?.meta_title || ""}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Blog Post Title | SBBT Construction"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="meta_description" className="block mb-2 font-medium text-gray-700">Meta Description</label>
              <textarea
                id="meta_description"
                name="meta_description"
                defaultValue={blog?.meta_description || ""}
                rows={2}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Learn about construction tips and insights..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : isEdit ? "Update Blog Post" : "Create Blog Post"}
          </button>
        </div>
      </form>
    </div>
  );
}