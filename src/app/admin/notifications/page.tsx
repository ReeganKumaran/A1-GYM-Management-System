"use client";

import { useState, useEffect } from "react";
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetRole: "all",
    type: "general",
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create notification");
      }

      setFormData({ title: "", message: "", targetRole: "all", type: "general" });
      setShowForm(false);
      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notification");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400 mt-1">Send and manage notifications</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {showForm ? "Cancel" : "+ Create Notification"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError("")} className="float-right text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        )}

        {/* Create Notification Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create Notification</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Notification title"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Target Role</label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="all">All</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="trainer">Trainer</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="general">General</option>
                    <option value="fee_reminder">Fee Reminder</option>
                    <option value="holiday">Holiday</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Notification message"
                  rows={4}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                >
                  {submitting && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No notifications yet. Create your first notification above.
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={{
                  title: notification.title,
                  message: notification.message,
                  type: notification.type,
                  date: notification.date,
                  targetRole: notification.targetRole,
                }}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
