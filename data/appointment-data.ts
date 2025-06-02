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

export const getUpcomingUserAppointment = async (userId) => {
  try {
    const upcomingAppointment = await db.appointment.findFirst({
      where: {
        userId: userId,
        startTime: {
          gt: new Date(), 
        },
      },
      orderBy: {
        startTime: 'asc',
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
        roomId: true,
      },
    });
    return upcomingAppointment; // returns null if none found
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch upcoming appointment");
  }
};



export const getUserAppointmentData = async (userId) => {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        userId: userId, 
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
        roomId: true,
      },
    });
    return appointments;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch appointment data");
  }
};

export const getDoctorAppointments = async (doctorId: string) => {
  try {
    // First, find the doctor record by user ID or email
    const doctor = await db.doctor.findFirst({
      where: {
        OR: [
          { id: doctorId },
          { email: doctorId }, // If doctorId is actually an email
        ],
      },
    })

    if (!doctor) {
      return { success: false, error: "No Appointments" } // Misleading error message
    }

    const appointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
      },
      include: {
        doctor: true,
      },
      orderBy: {
        startTime: "asc",
      },
    })

    return { success: true, data: appointments }
  } catch (error) {
    console.error("Failed to fetch doctor appointments:", error)
    return { success: false, error: "Failed to fetch appointments" }
  }
}