"use server"

import { db } from "@/src/lib/db";

export const getLabTestData = async () => {
  try {
    const labTest = await db.labTest.findMany({
      select: {
        id: true,
        testStartTime: true,
        status: true,
        testType: true,
        contactInfo: true,
        User: true,
        testEndTime: true,
      },
    });
    return labTest;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment data");
  }
};


export const getUpcomingLabTest = async (userId) => {
  try {
    const upcomingLabTest = await db.labTest.findFirst({
      where: {
        userId: userId,
        testStartTime: {
          gt: new Date(), 
        },
      },
      orderBy: {
        testStartTime: "asc",
      },
      select: {
        id: true,
        testStartTime: true,
        status: true,
        testType: true,
        contactInfo: true,
        testEndTime: true,
        User: true,
      },
    });
    return upcomingLabTest;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch upcoming lab test");
  }
};
