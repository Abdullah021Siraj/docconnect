import ModernHealthDashboard from "@/src/components/user/medical-dashboard";
// src/pages/user/dashboard.tsx
import { UserAppointmentsList } from "@/src/components/user/user-appointments";
import { UserChatbot } from "@/src/components/user/user-chatbot";
import UserDashboard from "@/src/components/user/user-dashboard";
import  VirtualAssistant  from "@/src/components/VirtualAssist/virt";

const UserDashboardPage = () => {
  return (
    <>
      <div className="w-full overflow-hidden">
        <ModernHealthDashboard />
      </div>
      <VirtualAssistant />
    </>
  );
};

export default UserDashboardPage;