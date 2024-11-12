"use server";


import { db } from "@/src/lib/db";
import { getUserByEmail } from "../data/user";

export const Prescription = async (email: string, imageUrl: string) => {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    const prescription = await db.prescription.create({
      data: {
        imageUrl,
        userId: existingUser.id,
        isTemporary: false,
      },
    });
    return prescription;
  } else {
    const prescription = await db.prescription.create({
      data: {
        imageUrl,
        isTemporary: true,
      },
    });
    return prescription;
  }
};
