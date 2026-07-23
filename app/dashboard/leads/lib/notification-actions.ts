"use server";

// ============================================================
// Admin Notification Actions
// SBBT CRM Next.js Project
//
// Server actions for fetching, marking as read, and managing
// admin in-app notifications.
// ============================================================

import { createClient } from "@/lib/supabase/server";

export interface AdminNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  lead_id: number | null;
  lead_number: string | null;
  created_at: string;
}

export interface AdminNotificationResult {
  notifications: AdminNotification[];
  unread_count: number;
}

/**
 * Fetches admin notifications for the current user.
 * Returns both broadcast notifications (target_user_id IS NULL)
 * and notifications specifically targeted at the current user.
 *
 * @param limit Maximum number of notifications to return (default: 20)
 * @returns Notifications and unread count
 */
export async function getAdminNotifications(
  limit: number = 20
): Promise<AdminNotificationResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .or("target_user_id.is.null")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching admin notifications:", error.message);
      return { notifications: [], unread_count: 0 };
    }

    const notifications = (data || []) as AdminNotification[];
    const unread_count = notifications.filter((n) => !n.is_read).length;

    return { notifications, unread_count };
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return { notifications: [], unread_count: 0 };
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(
  id: number
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("admin_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error.message);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

/**
 * Marks all unread notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    const supabase = await createClient();

    const { data: unread, error: fetchError } = await supabase
      .from("admin_notifications")
      .select("id")
      .eq("is_read", false)
      .or("target_user_id.is.null");

    if (fetchError) {
      console.error("Error fetching unread notifications:", fetchError.message);
      return { success: false, count: 0 };
    }

    const unreadIds = (unread || []).map((n) => n.id);

    if (unreadIds.length === 0) {
      return { success: true, count: 0 };
    }

    const { error } = await supabase
      .from("admin_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .in("id", unreadIds);

    if (error) {
      console.error("Error marking all notifications as read:", error.message);
      return { success: false, count: 0 };
    }

    return { success: true, count: unreadIds.length };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Gets the current unread notification count (lightweight).
 * Used for the notification badge in the header.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("admin_notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .or("target_user_id.is.null");

    if (error) {
      console.error("Error fetching unread count:", error.message);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}