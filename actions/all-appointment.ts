"use server"

import { db } from "@/src/lib/db"

export const getAllAppointmentsWithUser = async () => {
    try {
        const allAppointments = await db.appointment.findMany(
            {
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    },
                    doctor: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        );
        return allAppointments;
    } catch (error) {
        throw new Error('Failed to fetch All Appointments');
    }
}

export const getAllStatusNumber = async () => {
    try {
        const allStatus = await db.appointment.groupBy({
            by: ['status'],
            _count: {
                status: true
            },
            where: {
                status: {
                    in: ['PENDING', 'CANCELLED', 'CONFIRMED']
                }
            }
        });

        const statusCount = allStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;  return acc;
        }, {} as Record<string, number>);

        return statusCount;
        } catch (error) {
        throw new Error('Failed to fetch All Status');
    }
}
