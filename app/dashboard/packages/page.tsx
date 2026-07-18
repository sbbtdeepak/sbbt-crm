import { createClient } from "@/lib/supabase/server";
import PackagesContent from "./components/PackagesContent";

interface PackageFeature {
  id: string;
  section: string;
  feature: string;
  solid_structure: string | null;
  essential: string | null;
  premium: string | null;
  custom: string | null;
}

export default async function PackagesPage() {
  const supabase = await createClient();

  const [{ data: packages, error: pkgError }, { data: features, error: featError }] = await Promise.all([
    supabase
      .from("packages")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),
    supabase
      .from("package_features")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <PackagesContent
      packages={packages ?? []}
      features={features ?? []}
      error={pkgError?.message || featError?.message}
    />
  );
}