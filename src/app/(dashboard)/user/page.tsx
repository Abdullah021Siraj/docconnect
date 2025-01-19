import { UserChatbot } from "@/src/components/user/user-chatbot";
import UserDashboard from "@/src/components/user/user-dashboard";

const UserDashboardPage = () => {

  return (
    <>
  <div className="space-x-10 space-y-22"> {/* Adjust 'space-y' as needed */}
  <UserDashboard />
  <UserChatbot />
</div>
    </>
  );
};

export default UserDashboardPage;
