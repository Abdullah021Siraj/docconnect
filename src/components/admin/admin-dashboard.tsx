import { currentUser } from "@/src/lib/auth";
import { DashboardCard } from "./dashboard-card";
import { DashboardTable } from "./dashboard-table";
import { getAllStatusNumber } from "@/actions/all-appointment";

export const AdminDashboard = async () => {
  const user = await currentUser();
  const statusCounts = await getAllStatusNumber();
  return (
    <>
      <div className="flex flex-row p-4 justify-center items-center gap-4">
        <DashboardCard
          message="Total number of  scheduled appointments"
          count={statusCounts.CONFIRMED || 0}
        />
        <DashboardCard
          message="Total number of pending appointments"
          count={statusCounts.PENDING || 0}
        />
        <DashboardCard
          message="Total number of cancelled  appointments"
          count={statusCounts.CANCELLED || 0}
        />
      </div>
    </>
  );
};
