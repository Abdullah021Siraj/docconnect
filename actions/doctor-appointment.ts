"use server";

import { db } from "@/src/lib/db";

export const getDoctorAppointmentData = async (doctorId: string) => {
  try {
    const doctorWithAppointments = await db.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        appointments: {
            where: {
                doctorId: doctorId,
                startTime: {
                  gte: new Date() // Only future appointments
                }
              },
          select: {
            id: true,
            status: true,
            startTime: true,
            endTime: true,
            patientName: true,
            patientContact: true,
            roomId: true,
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    if (!doctorWithAppointments) {
      throw new Error("Doctor not found");
    }

    return {
      doctor: {
        name: doctorWithAppointments.name,
      },
      appointments: doctorWithAppointments.appointments || [], // Handle potential undefined
    };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch doctor and appointment data");
  }
};