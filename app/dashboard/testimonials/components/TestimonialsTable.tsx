import { Testimonial } from "../types";

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialsTable({
  testimonials,
}: Props) {
  if (!testimonials.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          No Testimonials Found
        </h2>

        <p className="mt-2 text-gray-500">
          Click "Add Testimonial" to create your first testimonial.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-5 py-3 text-left">
                Client
              </th>

              <th className="px-5 py-3 text-left">
                Project
              </th>

              <th className="px-5 py-3 text-left">
                Review
              </th>

              <th className="px-5 py-3 text-left">
                Rating
              </th>

              <th className="px-5 py-3 text-left">
                Featured
              </th>

            </tr>

          </thead>

          <tbody>

            {testimonials.map((item) => (

              <tr
                key={item.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-5 py-4 font-semibold">
                  {item.client_name}
                </td>

                <td className="px-5 py-4">
                  {item.project_name}
                </td>

                <td className="px-5 py-4 max-w-md">
                  <div className="line-clamp-2">
                    {item.content}
                  </div>
                </td>

                <td className="px-5 py-4">
                  {"⭐".repeat(item.rating)}
                </td>

                <td className="px-5 py-4">
                  {item.is_featured ? (
                    <span className="rounded bg-green-100 px-3 py-1 text-green-700">
                      Yes
                    </span>
                  ) : (
                    <span className="rounded bg-gray-100 px-3 py-1">
                      No
                    </span>
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}