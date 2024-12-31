import { AppointmentDashboardCards } from "@/src/components/admin/admin-dashboard-cards";
import { DashboardTable } from "@/src/components/admin/dashboard-table";

const Dashboard = () => {
  return (
    <>
      <AppointmentDashboardCards />
      <DashboardTable />
      <div className="mb-10"></div>
    </>
  );
};

export default Dashboard;
