"use server"

import { db } from "@/src/lib/db"
import { currentUser } from "@/src/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { appointmentBooking, appointmentBookingDoctor } from "./email"
import Stripe from "stripe"
import { logUserActivity } from "@/src/lib/notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
})

// Confirm appointment payment and allocate room
export const confirmAppointmentPayment = async (paymentId: string) => {
  try {
    const user = await currentUser()

    if (!user) {
      return { error: "Unauthorized!" }
    }

    // Find the appointment by paymentId
    const appointment = await db.appointment.findUnique({
      where: { paymentId },
      include: {
        user: true,
        doctor: true,
      },
    })

    if (!appointment) {
      return { error: "Appointment not found." }
    }

    if (appointment.userId !== user.id) {
      return { error: "Unauthorized to confirm this payment." }
    }

    // Generate room ID and update appointment status
    const roomId = uuidv4()

    const updatedAppointment = await db.appointment.update({
      where: { paymentId },
      data: {
        status: "CONFIRMED",
        roomId: roomId,
      },
      include: {
        user: true,
        doctor: true,
      },
    })

    // Send confirmation emails
    if (user.email) {
      await appointmentBooking(user.email, roomId, appointment.startTime)
    }

    if (appointment.doctor?.email) {
      await appointmentBookingDoctor(appointment.doctor.email, roomId, appointment.startTime)
    }

    await logUserActivity(user.id, "APPOINTMENT_BOOK", "Appointment booked successfully.");

    return {
      success: "Payment confirmed! Your appointment is now confirmed.",
      appointment: updatedAppointment,
      roomId,
    }
  } catch (error) {
    console.error("Error confirming appointment payment:", error)
    return { error: "Failed to confirm payment. Please try again." }
  }
}

// Confirm lab test payment
export const confirmLabTestPayment = async (paymentId: string) => {
  try {
    const user = await currentUser()

    if (!user) {
      return { error: "Unauthorized!" }
    }

    // Find the lab test by paymentId
    const labTest = await db.labTest.findUnique({
      where: { paymentId },
      include: {
        User: true,
      },
    })

    if (!labTest) {
      return { error: "Lab test not found." }
    }

    if (labTest.userId !== user.id) {
      return { error: "Unauthorized to confirm this payment." }
    }

    // Update lab test status to confirmed
    const updatedLabTest = await db.labTest.update({
      where: { paymentId },
      data: {
        status: "CONFIRMED",
      },
      include: {
        User: true,
      },
    })

    await logUserActivity(user.id, "LAB_APPOINTMENT_BOOK", "Lab Appointment booked successfully.");

    return {
      success: "Payment confirmed! Your lab test is now confirmed.",
      labTest: updatedLabTest,
    }
  } catch (error) {
    console.error("Error confirming lab test payment:", error)
    return { error: "Failed to confirm payment. Please try again." }
  }
}

export const createPaymentIntent = async (amount: number, paymentId: string, type: "appointment" | "labtest") => {
  try {
    const user = await currentUser()
    if (!user) {
      return { error: "Unauthorized!" }
    }

    // Convert amount to cents (Stripe uses cents)
    const amountInCents = Math.round(amount * 100)

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        paymentId,
        type,
        userId: user.id ?? null,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount,
      paymentId,
      type,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return { error: "Failed to create payment intent." }
  }
}

