"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveSeo(formData: FormData) {
  const supabase = await createClient();

  const page =
    formData.get("page")?.toString().trim() || "home";

  const payload = {
    page,

    meta_title:
      formData.get("meta_title")?.toString().trim() || "",

    meta_description:
      formData.get("meta_description")?.toString().trim() || "",

    meta_keywords:
      formData.get("meta_keywords")?.toString().trim() || "",

    og_image:
      formData.get("og_image")?.toString().trim() || "",

    canonical_url:
      formData.get("canonical_url")?.toString().trim() || "",
  };

  const { data: existing } = await supabase
    .from("seo_settings")
    .select("id")
    .eq("page", page)
    .maybeSingle();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("seo_settings")
      .update(payload)
      .eq("id", existing.id));
  } else {
    ({ error } = await supabase
      .from("seo_settings")
      .insert(payload));
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/dashboard/seo");
}