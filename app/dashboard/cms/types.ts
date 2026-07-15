"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveHeroBanner(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    title: formData.get("title")?.toString() || "",
    subtitle: formData.get("subtitle")?.toString() || "",
    button_text: formData.get("button_text")?.toString() || "",
    button_link: formData.get("button_link")?.toString() || "",
    image_url: formData.get("image_url")?.toString() || "",
  };

  const id = formData.get("id")?.toString();

  let error;

  if (id) {
    ({ error } = await supabase
      .from("hero_banner")
      .update(payload)
      .eq("id", id));
  } else {
    ({ error } = await supabase
      .from("hero_banner")
      .insert(payload));
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/dashboard/cms");
}