import ModernHealthDashboard from "@/src/components/user/medical-dashboard";
import { UserAppointmentsList } from "@/src/components/user/user-appointments";
import { UserChatbot } from "@/src/components/user/user-chatbot";
import UserDashboard from "@/src/components/user/user-dashboard";

const UserDashboardPage = () => {
  return (
    <>
      <div className="w-full overflow-hidden">
        <ModernHealthDashboard />
      </div>
    </>
  );
};

export default UserDashboardPage;
