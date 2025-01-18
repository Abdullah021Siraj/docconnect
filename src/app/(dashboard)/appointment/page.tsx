import { AppointmentDashboardCards } from "@/src/components/admin/appointment-cards";
import { AppointmentTable } from "@/src/components/admin/appointment-table";

const AppointmentDashboard = () => {
  return (
    <div>
      {/* <AppointmentDashboardCards />  */}
      <AppointmentTable />
      <div className="mb-10"></div>
    </div>
  );
};

export default AppointmentDashboard;
