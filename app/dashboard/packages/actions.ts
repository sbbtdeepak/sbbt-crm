"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function createPackage(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name")?.toString().trim() || "";
  const payload = {
    slug: slugify(name),
    name: name,
    price: Number(formData.get("price") || 0),
    short_description:
      formData.get("short_description")?.toString().trim() || "",
    description:
      formData.get("description")?.toString().trim() || "",
    brands: formData.get("brands")?.toString().trim() || "",
    image_url: formData.get("image_url")?.toString().trim() || "",
    is_active:
      formData.get("status")?.toString() === "active",
  };

  const { error } = await supabase
    .from("packages")
    .insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/packages");
}

export async function updatePackage(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const name = formData.get("name")?.toString().trim() || "";
  const packagePayload = {
    slug: slugify(name),
    name: name,
    price: Number(formData.get("price") || 0),
    short_description:
      formData.get("short_description")?.toString().trim() || "",
    description:
      formData.get("description")?.toString().trim() || "",
    brands: formData.get("brands")?.toString().trim() || "",
    image_url: formData.get("image_url")?.toString().trim() || "",
    is_active:
      formData.get("status")?.toString() === "active",
  };

  // Update package
  const { error: pkgError } = await supabase
    .from("packages")
    .update(packagePayload)
    .eq("id", id);

  if (pkgError) {
    throw new Error(pkgError.message);
  }

  // Update features - iterate through formData entries
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^feature_([a-f0-9-]+)_(solid_structure|essential|premium|custom)$/);
    if (match) {
      const featureId = match[1];
      const field = match[2];
      
      await supabase
        .from("package_features")
        .update({ [field]: value.toString() })
        .eq("id", featureId);
    }
  }

  revalidatePath("/dashboard/packages");
  revalidatePath("/packages");
}

export async function deletePackage(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/packages");
}