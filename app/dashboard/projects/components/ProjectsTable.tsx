import StatusBadge from "./StatusBadge";

interface Props {
  projects: any[];
}

export default function ProjectsTable({
  projects,
}: Props) {
  if (!projects.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          No Projects Found
        </h2>

        <p className="text-gray-500 mt-2">
          Click "Add Project" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-5 py-3 text-left">Project</th>
            <th className="px-5 py-3 text-left">Client</th>
            <th className="px-5 py-3 text-left">Package</th>
            <th className="px-5 py-3 text-left">Location</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-5 py-4 font-medium">
                {project.name}
              </td>

              <td className="px-5 py-4">
                {project.client_name}
              </td>

              <td className="px-5 py-4">
                {project.package}
              </td>

              <td className="px-5 py-4">
                {project.location}
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={project.status}
                />
              </td>

              <td className="px-5 py-4 text-right">
                <button className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}