import type { ProjectStatus } from "@/types/project";

const statusStyles: Record<ProjectStatus, string> = {
  planning:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  ongoing: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
