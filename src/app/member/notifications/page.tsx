"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import NotificationCard from "@/components/NotificationCard";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "general" | "fee_reminder" | "holiday" | "announcement";
  date: string;
  targetRole: string;
}

type TypeFilter = "all" | "general" | "fee_reminder" | "holiday" | "announcement";

const filterLabels: Record<TypeFilter, string> = {
  all: "All",
  general: "General",
  fee_reminder: "Fee Reminder",
  holiday: "Holiday",
  announcement: "Announcement",
};

export default function MemberNotifications() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);

        // Fetch notifications for "member" and "all" roles
        const [memberRes, allRes] = await Promise.all([
          fetch("/api/notifications?targetRole=member"),
          fetch("/api/notifications?targetRole=all"),
        ]);

        if (!memberRes.ok || !allRes.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const memberData = await memberRes.json();
        const allData = await allRes.json();

        const memberNotifs = Array.isArray(memberData) ? memberData : [];
        const allNotifs = Array.isArray(allData) ? allData : [];

        // Combine and deduplicate by _id
        const combined = [...memberNotifs, ...allNotifs];
        const seen = new Set<string>();
        const unique = combined.filter((n) => {
          if (!n._id || seen.has(n._id)) return false;
          seen.add(n._id);
          return true;
        });

        // Sort by date descending
        unique.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setNotifications(unique);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status]);

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md text-center">
            <p className="text-red-400 font-semibold text-lg mb-2">Error</p>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-gray-400">
            Stay updated with announcements and reminders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as TypeFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {filterLabels[tab]}
              {tab !== "all" && (
                <span className="ml-2 text-xs opacity-70">
                  ({notifications.filter((n) => n.type === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-gray-400 text-lg">No notifications</p>
            <p className="text-gray-500 text-sm mt-1">
              {filter !== "all"
                ? `No ${filterLabels[filter].toLowerCase()} notifications`
                : "You have no notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <NotificationCard
                key={notification._id || index}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
