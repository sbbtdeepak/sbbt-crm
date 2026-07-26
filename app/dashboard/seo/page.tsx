import { redirect } from "next/navigation";

export default function SEOPage() {
  redirect("/dashboard/cms?tab=seo");
}