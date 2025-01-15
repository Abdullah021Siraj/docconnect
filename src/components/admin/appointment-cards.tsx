import { currentRole, currentUser } from "@/src/lib/auth";
import { DashboardCard } from "../dashboard-card";
import { getAllStatusNumber } from "@/actions/all-appointment";
import Link from "next/link";

export const AppointmentDashboardCards = async () => {
  const statusCounts = await getAllStatusNumber();

  return (
    <div className="flex flex-row p-4 justify-center items-center gap-4">
      <div className="bg-black p-4 rounded-lg text-white">
        <Link href="/dashboard/lab">Lab Table</Link>
      </div>
      <DashboardCard
        message="Total number of confirmed appointments"
        count={statusCounts.CONFIRMED || 0}
      />
      <DashboardCard
        message="Total number of pending appointments"
        count={statusCounts.PENDING || 0}
      />
      <DashboardCard
        message="Total number of cancelled appointments"
        count={statusCounts.CANCELLED || 0}
      />
    </div>
  );
};