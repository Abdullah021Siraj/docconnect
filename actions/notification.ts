'use server';

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export const NotificationFetcher = async () => {
  const user = await currentUser();

  if (!user) {
    return []; 
  }

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return notifications;
};

export const markNotificationAsRead = async (notificationId: string) => {
  await db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};