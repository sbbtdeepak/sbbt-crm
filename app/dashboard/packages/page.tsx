import { createClient } from "@/lib/supabase/server";
import PackagesContent from "./components/PackagesContent";

export default async function PackagesPage() {
  const supabase = await createClient();

  const { data: packages, error } = await supabase
    .from("packages")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <PackagesContent
      packages={packages ?? []}
      error={error?.message}
    />
  );
}