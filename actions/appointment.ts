"use server";

import { auth } from "@/src/auth";
import { db } from "@/src/lib/db";
import { AppointmentSchema } from "@/src/schemas";
import * as z from "zod";
import { format, parse, isValid } from 'date-fns';
import { Prisma } from '@prisma/client';
import { currentUser } from "@/src/lib/auth";
import { randomUUID } from "crypto";
import { appointmentBooking, appointmentBookingDoctor } from "./email";
import { v4 as uuidv4 } from 'uuid';

export const appointment = async (values: z.infer<typeof AppointmentSchema>) => {
  try {
    const user = await currentUser()

    if (!user) {
      return { error: "Unauthorized!" }
    }

    const validatedFields = AppointmentSchema.safeParse(values)

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten() }
    }

    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Unauthorized. Please sign in to book an appointment." }
    }

    const { name, contact, reason, date, time, doctor } = validatedFields.data

    // Combine date and time
    const dateStr = format(date, "yyyy-MM-dd")
    const startTime = parse(`${dateStr} ${time}`, "yyyy-MM-dd HH:mm", new Date())

    if (!isValid(startTime)) {
      return { error: "Invalid date or time combination" }
    }

    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000)

    // Validate that appointment is not in the past
    if (startTime < new Date()) {
      return { error: "Cannot book appointments in the past" }
    }

    // Check for user conflicts
    const userConflict = await db.appointment.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    })

    const doctorConflict = await db.appointment.findFirst({
      where: {
        doctorId: doctor,
        status: "PENDING",
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    })

    if (doctorConflict) {
      return {
        error: "This doctor is already scheduled for this time slot",
        appointment: doctorConflict,
      }
    }

    if (userConflict) {
      return {
        error: "You already have an appointment during this time.",
        appointment: userConflict,
      }
    }

    // Generate payment ID and create appointment with PENDING status
    const paymentId = randomUUID()

    const createdAppointment = await db.appointment.create({
      data: {
        patientName: name,
        patientContact: contact,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        startTime,
        endTime,
        paymentId,
        user: {
          connect: { id: session.user.id },
        },
        doctor: {
          connect: { id: doctor },
        },
        // roomId will be generated after payment confirmation
      },
      include: {
        user: true,
        doctor: true,
      },
    })

    return {
      success: "Appointment created. Please proceed to payment.",
      appointment: createdAppointment,
      paymentId,
      redirectToPayment: true,
    }
  } catch (error) {
    console.error("Error creating appointment:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "This time slot is already booked" }
      }
      if (error.code === "P2003") {
        return { error: "Invalid user reference" }
      }
    }

    if (error instanceof Error) {
      if (error.message.includes("Invalid Date")) {
        return { error: "Please select a valid date and time" }
      }
      return { error: error.message }
    }

    return { error: "An unexpected error occurred. Please try again later." }
  }
}
