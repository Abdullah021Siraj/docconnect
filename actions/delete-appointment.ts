"use server";

import { db } from "@/src/lib/db";

export const deleteAppointment = async (appointmentId: string) => {
  await db.appointment.delete({
    where: {
      id: appointmentId,
    },
  });
};
