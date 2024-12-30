import { LabDashboardCards } from "@/src/components/admin/lab-dashboard-cards";
import { LabTestTable } from "@/src/components/admin/lab-test-table";

const LabDashboard = () => {
  return (
    <div>
      <LabDashboardCards />
      <LabTestTable />
    </div>
  );
};

export default LabDashboard;
