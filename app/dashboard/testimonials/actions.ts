"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTestimonial(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_name:
      formData.get("client_name")?.toString().trim() || "",
    designation:
      formData.get("designation")?.toString().trim() || "",
    project_name:
      formData.get("project_name")?.toString().trim() || "",
    location:
      formData.get("location")?.toString().trim() || "",
    testimonial:
      formData.get("content")?.toString().trim() || "",
    rating: Number(formData.get("rating") || 5),
    image_url:
      formData.get("image_url")?.toString().trim() || "",
    is_featured:
      formData.get("is_featured") === "on",
    display_order:
      Number(formData.get("display_order") || 0),
  };

  const { error } = await supabase
    .from("cms_testimonials")
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
    designation:
      formData.get("designation")?.toString().trim() || "",
    project_name:
      formData.get("project_name")?.toString().trim() || "",
    location:
      formData.get("location")?.toString().trim() || "",
    testimonial:
      formData.get("content")?.toString().trim() || "",
    rating: Number(formData.get("rating") || 5),
    image_url:
      formData.get("image_url")?.toString().trim() || "",
    is_featured:
      formData.get("is_featured") === "on",
    display_order:
      Number(formData.get("display_order") || 0),
  };

  const { error } = await supabase
    .from("cms_testimonials")
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
    .from("cms_testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/testimonials");
}