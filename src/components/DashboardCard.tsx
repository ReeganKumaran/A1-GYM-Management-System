interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
  },
};

export default function DashboardCard({
  title,
  value,
  icon,
  color,
}: DashboardCardProps) {
  const colors = colorMap[color] || colorMap.orange;

  return (
    <div
      className={`rounded-xl border ${colors.border} ${colors.bg} p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-lg ${colors.bg} ${colors.text}`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
