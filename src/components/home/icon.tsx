import Image, { StaticImageData } from "next/image";

interface IconProps {
  image: string | StaticImageData;
}

export const Icon = ({ image }: IconProps) => {
  return (
    <Image
      src={image}
      alt="icon"
      width={100}
      height={0}
      className="rounded-xl pl-6"
    />
  );
};
