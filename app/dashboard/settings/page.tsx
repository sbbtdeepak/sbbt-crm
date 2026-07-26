import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/dashboard/cms?tab=settings");
}