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