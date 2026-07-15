"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parseBrands(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
}

export async function createPackage(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: formData.get("name")?.toString().trim() || "",
    price: Number(formData.get("price") || 0),

    short_description:
      formData.get("short_description")?.toString().trim() || "",

    description:
      formData.get("description")?.toString().trim() || "",

    brands: parseBrands(
      formData.get("brands")?.toString() || ""
    ),

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

  const payload = {
    name: formData.get("name")?.toString().trim() || "",
    price: Number(formData.get("price") || 0),

    short_description:
      formData.get("short_description")?.toString().trim() || "",

    description:
      formData.get("description")?.toString().trim() || "",

    brands: parseBrands(
      formData.get("brands")?.toString() || ""
    ),

    is_active:
      formData.get("status")?.toString() === "active",
  };

  const { error } = await supabase
    .from("packages")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/packages");
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