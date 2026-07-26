import { redirect } from "next/navigation";

export default function BlogsPage() {
  redirect("/dashboard/cms?tab=blogs");
}