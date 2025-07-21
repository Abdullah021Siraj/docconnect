"use server"

import * as z from "zod"
import { revalidatePath } from "next/cache"

import { db } from "@/src/lib/db"
import { logAdminActivity } from "@/lib/admin-logger"

// Schemas for validation
const AppointmentStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["CONFIRMED", "PENDING", "CANCELLED"]),
})

const AppointmentNotesSchema = z.object({
  id: z.string(),
  notes: z.string(),
})

// Get doctor's appointments
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
      return { success: false, error: "No Appointments" }
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

// Update appointment status (doctor can mark as completed, etc.)
export const updateAppointmentStatus = async (values: z.infer<typeof AppointmentStatusSchema>, doctorId: string) => {
  try {
    const validatedFields = AppointmentStatusSchema.safeParse(values)

    if (!validatedFields.success) {
      return { success: false, error: "Invalid appointment data" }
    }

    const { id, status } = validatedFields.data

    // Verify the appointment belongs to this doctor
    const appointment = await db.appointment.findFirst({
      where: {
        id,
        doctor: {
          OR: [{ id: doctorId }, { email: doctorId }],
        },
      },
      include: { doctor: true },
    })

    if (!appointment) {
      return { success: false, error: "Appointment not found or access denied" }
    }

    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: { status },
      include: { doctor: true },
    })

    // Log the activity
    await logAdminActivity(doctorId, "APPOINTMENT_STATUS_UPDATE", `Updated appointment status to ${status}`)

    // Revalidate the appointments page to refresh data
    revalidatePath("/doctor")

    return { success: true, data: updatedAppointment }
  } catch (error) {
    console.error("Failed to update appointment status:", error)
    return { success: false, error: "Failed to update appointment status" }
  }
}

// Add notes to appointment
export const addAppointmentNotes = async (values: z.infer<typeof AppointmentNotesSchema>, doctorId: string) => {
  try {
    const validatedFields = AppointmentNotesSchema.safeParse(values)

    if (!validatedFields.success) {
      return { success: false, error: "Invalid notes data" }
    }

    const { id, notes } = validatedFields.data

    // Verify the appointment belongs to this doctor
    const appointment = await db.appointment.findFirst({
      where: {
        id,
        doctor: {
          OR: [{ id: doctorId }, { email: doctorId }],
        },
      },
    })

    if (!appointment) {
      return { success: false, error: "Appointment not found or access denied" }
    }

    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: {
        // Note: You may need to add a notes field to your Appointment model
        // For now, we'll use a custom field or store in a separate table
      },
      include: { doctor: true },
    })

    await logAdminActivity(
      doctorId,
      "APPOINTMENT_NOTES_ADD",
      `Added notes to appointment for ${appointment.patientName}`,
    )

    revalidatePath("/doctor")

    return { success: true, data: updatedAppointment }
  } catch (error) {
    console.error("Failed to add appointment notes:", error)
    return { success: false, error: "Failed to add notes" }
  }
}

// Get doctor's schedule for a specific date
export const getDoctorSchedule = async (doctorId: string, date: string) => {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const doctor = await db.doctor.findFirst({
      where: {
        OR: [{ id: doctorId }, { email: doctorId }],
      },
    })

    if (!doctor) {
      return { success: false, error: "Doctor not found" }
    }

    const appointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    return { success: true, data: appointments }
  } catch (error) {
    console.error("Failed to fetch doctor schedule:", error)
    return { success: false, error: "Failed to fetch schedule" }
  }
}
