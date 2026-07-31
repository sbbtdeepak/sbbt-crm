const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

function getEnv(key) {
  const raw = fs.readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith(key + "=")) {
      return line.slice(key.length + 1).trim();
    }
  }
  return null;
}

const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const supabase = createClient(url, anonKey);

// Exact same query now used in Components/home/Testimonials.tsx
supabase
  .from("cms_testimonials")
  .select("id, client_name, testimonial, rating, project_name, location, image_url")
  .eq("is_featured", true)
  .order("display_order", { ascending: true })
  .then(({ data, error }) => {
    console.log("ERROR:", JSON.stringify(error));
    console.log("ROWS:", data ? data.length : 0);
    if (data && data.length > 0) {
      console.log("FIRST_ROW:", JSON.stringify(data[0]));
    }
  })
  .catch((err) => {
    console.log("EXCEPTION:", JSON.stringify(err));
  });