import { AdminDashboard } from "@/src/components/admin/admin-dashboard";
import { DashboardCard } from "@/src/components/admin/dashboard-card";
import { DashboardTable } from "@/src/components/admin/dashboard-table";

const Dashboard = async () => {
  return (
    <>
      <AdminDashboard />
      <DashboardTable />
    </>
  );
};

export default Dashboard;
