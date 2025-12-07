"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationContext } from "./NotificationContext";
import NotificationsModal from "./NotificationsModal";

export default function AdminNotificationBell() {
  const { notifications, unreadCount, refreshNotifications } = useNotificationContext();
  const [open, setOpen] = useState(false);

  // Only show bell if user is admin (assume admin context)
  // Optionally, you can add a prop or context check for role

  return (
    <>
      <button
        className="relative p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Voir les notifications"
        onClick={() => {
          setOpen(true);
          refreshNotifications();
        }}
      >
        <Bell className="h-6 w-6 text-blue-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      <NotificationsModal
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
      />
    </>
  );
}
