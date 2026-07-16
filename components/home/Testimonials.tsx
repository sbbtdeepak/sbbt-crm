import { createClient } from "@/lib/supabase/server";

export default async function Testimonials() {

  const supabase = await createClient();

  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_featured", true);

  if (!data?.length) return null;

  return (
    <section
      id="testimonials"
      className="bg-white py-20"
    >

      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-12 text-center">

          <h2 className="text-4xl font-bold">
            Happy Customers
          </h2>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {data.map((item: any) => (

            <div
              key={item.id}
              className="rounded-2xl border bg-gray-50 p-6"
            >

              <div className="mb-4 text-yellow-500">
                ⭐⭐⭐⭐⭐
              </div>

              <p className="italic text-gray-600">
                "{item.content}"
              </p>

              <div className="mt-6">

                <h3 className="font-bold">
                  {item.client_name}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.project_name}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}