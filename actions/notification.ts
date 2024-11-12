'use server';

import { currentUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";


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