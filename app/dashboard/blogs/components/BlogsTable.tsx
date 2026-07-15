  import { Blog } from "../types";

interface Props {
  blogs: Blog[];
}

export default function BlogsTable({ blogs }: Props) {
  if (!blogs.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          No Blogs Found
        </h2>

        <p className="mt-2 text-gray-500">
          Click "Add Blog" to create your first blog.
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
                Title
              </th>

              <th className="px-5 py-3 text-left">
                Author
              </th>

              <th className="px-5 py-3 text-left">
                Published
              </th>

              <th className="px-5 py-3 text-left">
                Created
              </th>

            </tr>

          </thead>

          <tbody>

            {blogs.map((blog) => (

              <tr
                key={blog.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-5 py-4">

                  <div className="font-semibold">
                    {blog.title}
                  </div>

                  <div className="text-sm text-gray-500 line-clamp-1">
                    {blog.excerpt}
                  </div>

                </td>

                <td className="px-5 py-4">
                  {blog.author}
                </td>

                <td className="px-5 py-4">

                  {blog.published ? (
                    <span className="rounded bg-green-100 px-3 py-1 text-green-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded bg-yellow-100 px-3 py-1 text-yellow-700">
                      Draft
                    </span>
                  )}

                </td>

                <td className="px-5 py-4">
                  {new Date(blog.created_at).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}  