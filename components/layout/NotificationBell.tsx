"use client";

// ============================================================
// Notification Bell Component
// SBBT CRM Next.js Project
//
// Displays a notification bell icon with unread count badge
// and a dropdown list of recent notifications.
//
// Integrates into the DashboardHeader component.
// ============================================================

import { useState, useEffect, useRef } from "react";
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AdminNotification,
} from "@/app/dashboard/leads/lib/notification-actions";

// ============================================================
// Type Icons
// ============================================================

const TYPE_ICONS: Record<string, string> = {
  info: "i",
  success: "✓",
  warning: "⚠",
  error: "✕",
};

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  error: "bg-red-100 text-red-600",
};

// ============================================================
// Notification Bell
// ============================================================

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from server
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminNotifications(10);
      setNotifications(result.notifications);
      setUnreadCount(result.unread_count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const result = await getAdminNotifications(10);
        if (mounted) {
          setNotifications(result.notifications);
          setUnreadCount(result.unread_count);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    // Poll every 30 seconds
    const interval = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.is_read
            ? n
            : { ...n, is_read: true, read_at: new Date().toISOString() }
        )
      );
      setUnreadCount(0);
    }
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 origin-top-right">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="mx-auto h-8 w-8 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-500">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`transition hover:bg-slate-50 ${
                        !notification.is_read ? "bg-indigo-50/50" : ""
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (!notification.is_read) {
                            handleMarkAsRead(notification.id);
                          }
                          if (notification.link) {
                            window.location.href = notification.link;
                          }
                        }}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left"
                      >
                        {/* Type Icon */}
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            TYPE_COLORS[notification.type] ||
                            TYPE_COLORS.info
                          }`}
                        >
                          {TYPE_ICONS[notification.type] || TYPE_ICONS.info}
                        </span>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm ${
                              !notification.is_read
                                ? "font-semibold text-slate-900"
                                : "font-medium text-slate-700"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!notification.is_read && (
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-4 py-2">
              <a
                href="/dashboard/leads"
                className="block text-center text-xs font-medium text-slate-500 hover:text-slate-700 transition"
              >
                View all notifications
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}