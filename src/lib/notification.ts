import { db } from "./db";

export async function logUserActivity(
  userId: string,
  type: string,
  message: string
) {
  const expiresAt = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);

  const notification = await db.notification.create({
    data: {
      userId,
      type,
      message,
      createdAt: new Date(),
      expiresAt,
    },
  });

  return notification;
}

// Run this function periodically (e.g., every hour) using a cron job
export async function cleanupExpiredNotifications() {
  try {
    return await db.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
    throw error;
  }
}
