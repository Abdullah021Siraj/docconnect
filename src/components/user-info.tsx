import { ExtendedUser } from "@/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface UserInfoProps {
  user?: ExtendedUser;
  label: string;
}

export const UserInfo = ({ user, label }: UserInfoProps) => {
  return (
    <Card className="w-full max-w-[600px] border-none mx-auto p-4 md:p-6">
      <CardHeader>
        <p className="text-lg md:text-2xl font-semibold text-center">{label}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">ID</p>
          <p className="truncate text-xs max-w-full md:max-w-[180px] font-mono p-1 rounded-md">
            {user?.id}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Name</p>
          <p className="truncate text-xs max-w-full md:max-w-[180px] font-mono p-1 rounded-md">
            {user?.name}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Email</p>
          <p className="truncate text-xs max-w-full md:max-w-[180px] font-mono p-1 rounded-md">
            {user?.email}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Role</p>
          <p className="truncate text-xs max-w-full md:max-w-[180px] font-mono p-1 rounded-md">
            {user?.role}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center md:justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Two Factor Authentication</p>
          <Badge variant={user?.isTwoFactorEnabled ? "success" : "destructive"}>
            {user?.isTwoFactorEnabled ? "ON" : "OFF"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
