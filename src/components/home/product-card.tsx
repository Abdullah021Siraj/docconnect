import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FaGripLines } from "react-icons/fa";
import { DeptIcon } from "./dept-icons";

interface productCardProps {
  children: React.ReactNode;
  header: string;
  description: string;
  title: string;
  salesNumber: number;
  oldPrice: number;
  newPrice: number;
  image: string;
}

export const ProductCard = ({
  description,
  header,
  children,
  title,
  salesNumber,
  oldPrice,
  newPrice,
  image,
}: productCardProps) => {
  return (
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto p-4 sm:p-6 text-black">
      <DeptIcon image={image} />
      <CardHeader className="ml-6 text-left text-sm font-semibold text-[#FF685B]">
        {header}
        <FaGripLines />
      </CardHeader>
      <div className="ml-12">
        <CardTitle className="mb-2 text-lg font-semibold text-left">
          {title}
        </CardTitle>
        <CardDescription className="mb-1 text-gray-500 text-left">
          {description}
        </CardDescription>
        <CardDescription className="text-sm text-gray-400 text-left">
          Sales: {salesNumber}
        </CardDescription>
        <div className="flex flex-row">
          <CardDescription className="text-sm text-gray-400 text-left text-muted-foreground line-through">
            PKR {oldPrice}
          </CardDescription>
          <CardDescription className="ml-2 text-md text-green-400 text-left font-bold">
            PKR {newPrice}
          </CardDescription>
        </div>
      </div>
      <CardContent className="ml-6 mt-4 text-left">{children}</CardContent>
    </Card>
  );
};
