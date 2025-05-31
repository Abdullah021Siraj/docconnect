"use server"

import { db } from "@/src/lib/db"

export const logAdminActivity = async (adminId: string, action: string, details: string) => {
  try {
    await db.adminActivity.create({
      data: {
        adminId,
        action,
        details,
      },
    })
  } catch (error) {
    console.error("Failed to log admin activity:", error)
  }
}
