"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateLeadStatus(
  id: string,
  status: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contact_leads")
    .update({
      status,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");
}

export async function deleteLead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contact_leads")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");
}