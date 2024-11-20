"use server";

import { db } from "@/src/lib/db";

export interface Doctor {
  id: string;
  name: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  speciality: string;
}

export const getAllDoctors = async (): Promise<Doctor[]> => {
  try {
    const doctors = await db.doctor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        speciality: true
      }
    });
    
    return doctors;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
};