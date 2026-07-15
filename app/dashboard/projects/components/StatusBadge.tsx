interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const colors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    ongoing: "bg-blue-100 text-blue-700",
    planning: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status?.toLowerCase()] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}