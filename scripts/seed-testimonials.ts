import { createClient } from "@supabase/supabase-js";
import { TESTIMONIALS_SEED } from "../lib/testimonials-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTestimonials() {
  console.log("Seeding testimonials...");
  
  for (const testimonial of TESTIMONIALS_SEED) {
    const { error } = await supabase
      .from("testimonials")
      .insert({
        client_name: testimonial.client_name,
        project_name: testimonial.location, // Using location as project_name
        content: testimonial.content,
        rating: testimonial.rating,
        is_featured: testimonial.is_featured,
      });

    if (error) {
      console.error(`Error inserting testimonial for ${testimonial.client_name}:`, error.message);
    } else {
      console.log(`Created testimonial for ${testimonial.client_name}`);
    }
  }

  console.log("Seeding complete!");
}

seedTestimonials().catch(console.error);