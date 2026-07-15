"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createBlog(formData: FormData) {
  const supabase = await createClient();

  const title =
    formData.get("title")?.toString().trim() || "";

  const payload = {
    title,

    slug:
      formData.get("slug")?.toString().trim() ||
      slugify(title),

    excerpt:
      formData.get("excerpt")?.toString().trim() || "",

    content:
      formData.get("content")?.toString().trim() || "",

    featured_image:
      formData.get("featured_image")?.toString().trim() || "",

    author:
      formData.get("author")?.toString().trim() || "SBBT",

    published:
      formData.get("published") === "on",

    published_at:
      formData.get("published") === "on"
        ? new Date().toISOString()
        : null,
  };

  const { error } = await supabase
    .from("blogs")
    .insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/blogs");
}

export async function updateBlog(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const title =
    formData.get("title")?.toString().trim() || "";

  const payload = {
    title,

    slug:
      formData.get("slug")?.toString().trim() ||
      slugify(title),

    excerpt:
      formData.get("excerpt")?.toString().trim() || "",

    content:
      formData.get("content")?.toString().trim() || "",

    featured_image:
      formData.get("featured_image")?.toString().trim() || "",

    author:
      formData.get("author")?.toString().trim() || "SBBT",

    published:
      formData.get("published") === "on",

    published_at:
      formData.get("published") === "on"
        ? new Date().toISOString()
        : null,
  };

  const { error } = await supabase
    .from("blogs")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/blogs");
}

export async function deleteBlog(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/blogs");
}