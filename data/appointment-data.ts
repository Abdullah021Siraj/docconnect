"use server"

import { db } from "@/src/lib/db";

export const getAppointmentData = async () => {
  try {
    const appointments = await db.appointment.findMany({
      select: {
        patientName: true,
        patientContact: true,
        status: true,
        startTime: true,
        endTime: true,
        userId: true,
        user: true,
        doctor: true,
      },
    });
    return appointments;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment data");
  }
};