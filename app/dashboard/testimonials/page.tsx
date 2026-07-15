import { createClient } from "@/lib/supabase/server";
import TestimonialsContent from "./components/TestimonialsContent";

export default async function TestimonialsPage() {

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <TestimonialsContent
      testimonials={data ?? []}
      error={error?.message}
    />
  );
}