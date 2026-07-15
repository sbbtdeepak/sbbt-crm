"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const features =
    formData
      .get("features")
      ?.toString()
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean) || [];

  const { error } = await supabase.from("projects").insert({
    name: formData.get("name"),
    client_name: formData.get("client_name"),
    cid: formData.get("cid"),
    package: formData.get("package"),
    project_value: Number(formData.get("project_value")),
    plot_area: formData.get("plot_area"),
    road_facing: formData.get("road_facing"),
    floors: Number(formData.get("floors")),
    status: formData.get("status"),
    rating: Number(formData.get("rating")),
    location: formData.get("location"),
    timeline: formData.get("timeline"),
    features,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/projects");
}