import StatusBadge from "./StatusBadge";

interface Props {
  packages: any[];
  onEdit?: (pkg: any) => void;
  onDelete?: (pkg: any) => void;
}

export default function PackagesTable({
  packages,
  onEdit,
  onDelete,
}: Props) {
  if (!packages?.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          No Packages Found
        </h2>

        <p className="mt-2 text-gray-500">
          Click "Add Package" to create your first package.
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
                Package
              </th>

              <th className="px-5 py-3 text-left">
                Price
              </th>

              <th className="px-5 py-3 text-left">
                Short Description
              </th>

              <th className="px-5 py-3 text-left">
                Status
              </th>

              <th className="px-5 py-3 text-right">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {packages.map((pkg) => (

              <tr
                key={pkg.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-5 py-4 font-semibold">
                  {pkg.name}
                </td>

                <td className="px-5 py-4">
                  ₹ {Number(pkg.price).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4 max-w-sm">

                  <div className="line-clamp-2">

                    {pkg.short_description}

                  </div>

                </td>

                <td className="px-5 py-4">

                  <StatusBadge
                    status={
                      pkg.is_active
                        ? "active"
                        : "inactive"
                    }
                  />

                </td>

                <td className="px-5 py-4">

                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => onEdit?.(pkg)}
                      className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete?.(pkg)}
                      className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}