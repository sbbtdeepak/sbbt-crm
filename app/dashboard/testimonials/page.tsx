import { redirect } from "next/navigation";

export default function TestimonialsPage() {
  redirect("/dashboard/cms?tab=testimonials");
}