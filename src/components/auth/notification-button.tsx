"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BellIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  markNotificationAsRead,
  NotificationFetcher,
} from "../../../actions/notification";

interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: Date;
  expiresAt: Date;
  isRead: boolean;
}
export const NotificationButton = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const notifications: Notification[] = await NotificationFetcher();
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString(undefined, options);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Notifications" className="relative">
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-100 p-2 shadow-md rounded-md"
        align="end"
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex justify-between py-2 px-3 cursor-pointer hover:bg-gray-100 rounded-md"
              onClick={() => handleNotificationClick(notification.id)}
            >
              <span>{notification.message}</span>
              <span className="text-sm text-gray-500">
                {formatDate(notification.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="py-2 px-3 text-gray-500">
            No new notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
