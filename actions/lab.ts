"use server"

import { auth } from "@/src/auth";
import { db } from "@/src/lib/db";
import { LabTestSchema } from "@/src/schemas"; // Using LabTestSchema
import * as z from "zod";
import { format, parse, isValid } from 'date-fns';
import { Prisma } from '@prisma/client';
import { currentUser } from "@/src/lib/auth";
import { randomUUID } from "crypto";

export const bookLabTest = async (values: z.infer<typeof LabTestSchema>) => {
  try {
    const user = await currentUser()

    if (!user) {
      return { error: "Unauthorized!" }
    }

    const validatedFields = LabTestSchema.safeParse(values)

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten() }
    }

    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Unauthorized. Please sign in to book a lab test." }
    }

    const { contactInfo, address, testType, customTestRequest, specialInstructions, date, time } = validatedFields.data

    // Combine date and time for test appointment
    const dateStr = format(date, "yyyy-MM-dd")
    const testStartTime = parse(`${dateStr} ${time}`, "yyyy-MM-dd HH:mm", new Date())

    if (!isValid(testStartTime)) {
      return { error: "Invalid date or time combination." }
    }

    const testEndTime = new Date(testStartTime.getTime() + 60 * 60 * 1000)

    // Validate that test time is not in the past
    if (testStartTime < new Date()) {
      return { error: "Cannot schedule lab tests in the past." }
    }

    // Check for user scheduling conflicts
    const userConflict = await db.labTest.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
        OR: [
          {
            testStartTime: { lt: testEndTime },
            testEndTime: { gt: testStartTime },
          },
        ],
      },
    })

    if (userConflict) {
      return {
        error: "You already have a lab test scheduled during this time.",
        test: userConflict,
      }
    }

    // Generate payment ID
    const paymentId = randomUUID()

    // Create the new lab test booking with PENDING status
    const createdLabTest = await db.labTest.create({
      data: {
        contactInfo,
        address,
        testType,
        customTestRequest,
        specialInstructions,
        testStartTime: testStartTime,
        testEndTime,
        userId: session.user.id,
        status: "PENDING",
        paymentId,
      },
      include: {
        User: true,
      },
    })

    return {
      success: "Lab test created. Please proceed to payment.",
      test: createdLabTest,
      paymentId,
      redirectToPayment: true,
    }
  } catch (error) {
    console.error("Error booking lab test:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "This time slot is already booked." }
      }
      if (error.code === "P2003") {
        return { error: "Invalid user reference." }
      }
    }

    if (error instanceof Error) {
      if (error.message.includes("Invalid Date")) {
        return { error: "Please select a valid date and time." }
      }
      return { error: error.message }
    }

    return { error: "An unexpected error occurred. Please try again later." }
  }
}