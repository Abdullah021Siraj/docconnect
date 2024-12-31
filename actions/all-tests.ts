"use server"

import { db } from "@/src/lib/db";

export const getAllStatusNumberOfLab = async () => {
    try {
        const allStatus = await db.labTest.groupBy({
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