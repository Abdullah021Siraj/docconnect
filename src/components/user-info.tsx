import { ExtendedUser } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface UserInfoProps {
  user?: ExtendedUser;
  label: string;
}

export const UserInfo = ({ user, label }: UserInfoProps) => {
  return (
    <div className="max-w-[90%] lg:max-w-[800px] mx-auto">
      <Card className="p-4 md:p-6 border border-gray-200 shadow-sm">
        <CardHeader>
          <p className="text-lg md:text-2xl font-semibold text-center text-black">{label}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm bg-gray-50">
            <p className="text-sm font-medium text-black">ID</p>
            <p className="truncate text-xs max-w-full md:max-w-[250px] font-mono p-1 rounded-md break-all text-black">
              {user?.id}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm bg-gray-50">
            <p className="text-sm font-medium text-black">Name</p>
            <p className="truncate text-xs max-w-full md:max-w-[250px] font-mono p-1 rounded-md break-words text-black">
              {user?.name}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm bg-gray-50">
            <p className="text-sm font-medium text-black">Email</p>
            <p className="truncate text-xs max-w-full md:max-w-[250px] font-mono p-1 rounded-md break-words text-black">
              {user?.email}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm bg-gray-50">
            <p className="text-sm font-medium text-black">Role</p>
            <p className="truncate text-xs max-w-full md:max-w-[250px] font-mono p-1 rounded-md text-black">
              {user?.role}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm bg-gray-50">
            <p className="text-sm font-medium text-black">Two Factor Authentication</p>
            <Badge
              variant={user?.isTwoFactorEnabled ? "default" : "destructive"}
              className="text-sm text-black"
            >
              {user?.isTwoFactorEnabled ? "ON" : "OFF"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
