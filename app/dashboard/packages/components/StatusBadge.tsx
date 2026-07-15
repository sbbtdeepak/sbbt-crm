interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
    draft: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status?.toLowerCase()] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}