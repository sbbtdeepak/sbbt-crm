import { createClient } from "@/lib/supabase/server";
import LeadContent from "./components/LeadContent";

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_leads")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <LeadContent
      leads={data ?? []}
      error={error?.message}
    />
  );
}