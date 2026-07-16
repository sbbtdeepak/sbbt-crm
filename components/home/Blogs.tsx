import { createClient } from "@/lib/supabase/server";

export default async function Blogs() {

  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .limit(3);

  if (!data?.length) return null;

  return (
    <section
      id="blogs"
      className="bg-gray-50 py-20"
    >

      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-12 text-center">

          <h2 className="text-4xl font-bold">
            Latest Blogs
          </h2>

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          {data.map((blog: any) => (

            <div
              key={blog.id}
              className="overflow-hidden rounded-2xl bg-white shadow"
            >

              <img
                src={
                  blog.featured_image ||
                  "https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=900"
                }
                className="h-56 w-full object-cover"
                alt={blog.title}
              />

              <div className="p-6">

                <h3 className="text-xl font-bold">
                  {blog.title}
                </h3>

                <p className="mt-4 text-gray-600">
                  {blog.excerpt}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}