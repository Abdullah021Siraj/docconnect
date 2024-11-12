import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Card, CardContent, CardFooter } from "../ui/card";
import Link from "next/link";
import Image from "next/image";

interface TeamCardProps {
  name: string;
  role: string;
  fbLink: string;
  instaLink: string;
  twitterLink: string;
  image: string;
}

export const TeamCard = ({
  name,
  role,
  fbLink,
  instaLink,
  twitterLink,
  image,
}: TeamCardProps) => {
  return (
    <Card className="w-full max-w-md border-none">
      <Image
        src={image}
        width={300}
        height={0}
        alt={name}
        className="w-full rounded-t-md object-cover"
        quality={100}
      />
      <CardContent className="pt-6">
        <div className="flex space-x-4 justify-center items-center">
          <div className="space-y-1 flex justify-center items-center flex-col">
            <h3 className="font-semibold leading-none">{name}</h3>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        <CardFooter className="flex flex-row gap-x-4 justify-center items-center mt-4">
          <Link href={fbLink}>
            <FaFacebook size={40} />
          </Link>
          <Link href={instaLink}>
            <FaInstagram size={40} />
          </Link>
          <Link href={twitterLink}>
            <FaTwitter size={40} />
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
