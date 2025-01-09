import Link from "next/link";
import { DashboardCard } from "../dashboard-card";
import { getAllStatusNumberOfLab } from "@/actions/all-tests";

export const LabDashboardCards = async () => {
  const statusCounts = await getAllStatusNumberOfLab();
  return (
    <>
      <div className="flex flex-row p-4 justify-center items-center gap-4">
        <div className="bg-black p-4 rounded-lg text-white">
          <Link href="/dashboard" target="_blank">
            Appointment Table
          </Link>
        </div>
        <DashboardCard
          message="Total number of  scheduled Lab tests"
          count={statusCounts.CONFIRMED || 0}
        />
        <DashboardCard
          message="Total number of pending Lab tests"
          count={statusCounts.PENDING || 0}
        />
        <DashboardCard
          message="Total number of cancelled Lab tests"
          count={statusCounts.CANCELLED || 0}
        />
      </div>
    </>
  );
};
