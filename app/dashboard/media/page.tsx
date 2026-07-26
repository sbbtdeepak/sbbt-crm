import { redirect } from "next/navigation";

export default function MediaPage() {
  redirect("/dashboard/cms?tab=company");
}