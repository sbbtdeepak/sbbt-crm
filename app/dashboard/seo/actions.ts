"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveSeo(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    meta_title:
      formData.get("meta_title")?.toString().trim() || "",
    meta_description:
      formData.get("meta_description")?.toString().trim() || "",
    meta_keywords:
      formData.get("meta_keywords")?.toString().trim() || "",
    og_image_url:
      formData.get("og_image")?.toString().trim() || "",
    canonical_url:
      formData.get("canonical_url")?.toString().trim() || "",
  };

  const { data: existing } = await supabase
    .from("cms_seo")
    .select("id")
    .limit(1)
    .maybeSingle();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("cms_seo")
      .update(payload)
      .eq("id", existing.id));
  } else {
    ({ error } = await supabase
      .from("cms_seo")
      .insert(payload));
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/dashboard/seo");
}