"use client";

import { useState, useCallback } from "react";
import BlogList from "./BlogList";
import BlogForm from "./BlogForm";
import type { CMSBlogRow } from "../types";

type View = "list" | "create" | "edit";

export default function BlogsSection() {
  const [view, setView] = useState<View>("list");
  const [editingBlog, setEditingBlog] = useState<CMSBlogRow | null>(null);

  const handleCreate = useCallback(() => {
    setEditingBlog(null);
    setView("create");
  }, []);

  const handleEdit = useCallback((blog: CMSBlogRow) => {
    setEditingBlog(blog);
    setView("edit");
  }, []);

  const handleBack = useCallback(() => {
    setEditingBlog(null);
    setView("list");
  }, []);

  if (view === "create") {
    return <BlogForm blog={null} onBack={handleBack} />;
  }

  if (view === "edit" && editingBlog) {
    return <BlogForm blog={editingBlog} onBack={handleBack} />;
  }

  return <BlogList onEdit={handleEdit} onCreate={handleCreate} />;
}