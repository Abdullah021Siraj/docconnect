import { FaGripLines } from "react-icons/fa";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Header } from "./header";
import { Icon } from "./icon";

interface InfoCardProps {
  children: React.ReactNode;
  headerLabel: string;
  image: string;
}

export const InfoCard = ({ headerLabel, children, image }: InfoCardProps) => {
  return (
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto p-4 sm:p-6">
      <Icon image={image} />
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <FaGripLines size={30} className="ml-6 text-orange-500" />
      <CardContent>{children}</CardContent>
    </Card>
  );
};
