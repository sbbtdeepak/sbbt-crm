import HeroForm from "./components/HeroForm";
import { createClient } from "@/lib/supabase/server";

export default async function CMSPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("hero_banner")
    .select("*")
    .limit(1)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Homepage CMS
        </h1>

        <p className="text-gray-500 mt-1">
          Manage homepage hero section.
        </p>
      </div>

      <HeroForm hero={data} />
    </div>
  );
}