"use server"

import { useCurrentUser } from "@/hooks/use-current-user";
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
        roomId: true,
      },
    });
    return appointments;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment data");
  }
};

export const getUserAppointmentData = async () => {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        patientName: true,
        patientContact: true,
        status: true,
        startTime: true,
        endTime: true,
        userId: true,
        user: true,
        doctor: true,
        roomId: true
      },
    });
    return appointments;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment data");
  }
};

export const getDoctorAppointmentData = async (doctorId: string) => {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        doctorId: doctorId, // Filter by the specified doctor
      },
      select: {
        id: true,
        patientName: true,
        patientContact: true,
        status: true,
        startTime: true,
        endTime: true,
        userId: true,
        user: true,
        doctor: {
          select: {
            id: true,
            name: true,
            speciality: true,
          },
        },
      },
      orderBy: {
        startTime: "asc", // Optional: Sort by start time
      },
    });
    console.log(appointments);
    return appointments;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment data");
  }
};