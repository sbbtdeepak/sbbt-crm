import { createClient } from "@/lib/supabase/server";
import BlogsContent from "./components/BlogsContent";

export default async function BlogsPage() {

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <BlogsContent
      blogs={data ?? []}
      error={error?.message}
    />
  );
}