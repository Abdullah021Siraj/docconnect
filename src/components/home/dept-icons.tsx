import Image, { StaticImageData } from "next/image";

interface IconProps {
  image: string | StaticImageData;
}

export const DeptIcon = ({ image }: IconProps) => {
  return (
    <Image
      src={image}
      alt="icon"
      width={300}
      height={0}
      loading="lazy"
      className="rounded-xl object-cover h-64 w-full"
    />
  );
};
