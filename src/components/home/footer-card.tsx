import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import Link from "next/link";

interface FooterCardProps {
  heading: string;
  links: { href: string; label: string }[];
}

export const FooterCard = ({ heading, links }: FooterCardProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild className="flex flex-col">
        <Button variant="outline" className="bg-[#FF685B] text-white">
          {heading}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium gap-y-4 flex flex-col">
              {links.map((link, index) => (
                <span key={index}>
                  <Link href={link.href}>{link.label}</Link>
                </span>
              ))}
            </h4>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
