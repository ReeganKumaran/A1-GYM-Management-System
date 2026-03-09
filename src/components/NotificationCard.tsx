interface Notification {
  title: string;
  message: string;
  type: "general" | "fee_reminder" | "holiday" | "announcement";
  date: string;
  targetRole: string;
}

interface NotificationCardProps {
  notification: Notification;
}

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  general: { bg: "bg-blue-500/15", text: "text-blue-400", label: "General" },
  fee_reminder: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    label: "Fee Reminder",
  },
  holiday: { bg: "bg-green-500/15", text: "text-green-400", label: "Holiday" },
  announcement: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    label: "Announcement",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export default function NotificationCard({
  notification,
}: NotificationCardProps) {
  const style = typeStyles[notification.type] || typeStyles.general;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
          >
            {style.label}
          </span>
          <span className="text-xs text-gray-500">
            {timeAgo(notification.date)}
          </span>
        </div>
        <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">
          {notification.targetRole}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">
        {notification.title}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed">
        {notification.message}
      </p>

      <div className="mt-3 pt-3 border-t border-gray-800">
        <span className="text-xs text-gray-500">
          {formatDate(notification.date)}
        </span>
      </div>
    </div>
  );
}
