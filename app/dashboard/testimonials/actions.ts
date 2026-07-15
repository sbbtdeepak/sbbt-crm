"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTestimonial(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_name:
      formData.get("client_name")?.toString().trim() || "",

    project_name:
      formData.get("project_name")?.toString().trim() || "",

    content:
      formData.get("content")?.toString().trim() || "",

    rating: Number(formData.get("rating") || 5),

    is_featured:
      formData.get("is_featured") === "on",
  };

  const { error } = await supabase
    .from("testimonials")
    .insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/testimonials");
}

export async function updateTestimonial(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const payload = {
    client_name:
      formData.get("client_name")?.toString().trim() || "",

    project_name:
      formData.get("project_name")?.toString().trim() || "",

    content:
      formData.get("content")?.toString().trim() || "",

    rating: Number(formData.get("rating") || 5),

    is_featured:
      formData.get("is_featured") === "on",
  };

  const { error } = await supabase
    .from("testimonials")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/testimonials");
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/testimonials");
}