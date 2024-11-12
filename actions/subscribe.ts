"use server";

import { db } from "@/src/lib/db";
import { logUserActivity } from "@/src/lib/notification";
import { subEmailSchema } from "@/src/schemas";
import * as z from "zod";


export const Subscribe = async (values: z.infer<typeof subEmailSchema>) => {
  const validatedFields = subEmailSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid Email" };
  }

  const { email } = validatedFields.data;

  const existingSubscription = await db.emailSubscription.findUnique({
    where: { email },
  });

  if (existingSubscription) {
    return { error: "Email already subscribed to the newsletter" };
  }

  await db.emailSubscription.create({
    data: {
      email,
      isSubscribed: true,
    },
  });

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await logUserActivity(existingUser.id, "EMAIL_SUB" ,'Subscribe to the newsletter');
  }

  return { success: "Subscribed to the newsletter successfully!" };
};
