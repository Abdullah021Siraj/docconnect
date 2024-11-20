import { Card, CardDescription, CardHeader } from "../ui/card";

interface DashboardCardProps {
  message: string;
  count: number;
}

export const DashboardCard = async ({ message, count }: DashboardCardProps) => {
  return (
    <Card className="w-[400px] mx-5 p-10 mb-10">
      {/* <CardHeader className="font-bold text-xl">{number}</CardHeader> */}
      <CardHeader className="font-bold text-xl">{count}</CardHeader>
      <CardDescription className="font-semibold">{message}</CardDescription>
    </Card>
  );
};
