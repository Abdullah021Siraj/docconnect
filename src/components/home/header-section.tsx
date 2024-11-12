import Image from "next/image";
import { Button } from "../ui/button";

export const HeaderSection = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start rounded-lg">
      <div className="max-w-md lg:max-w-full text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
          A Great Place to <br /> Receive Care
        </h1>
        <p className="mt-4 sm:mt-8">
          Medical Recover is most focused on helping you <br /> discover your
          most beautiful smile
        </p>
        <div className="flex flex-col sm:flex-row items-center lg:items-start mt-4 sm:mt-8 gap-2">
          <Button variant="ghost" className="bg-[#FF685B] text-white">
            Get Quote Now
          </Button>
          <Button variant="outline" className="text-[#FF685B] border-[#FF685B]">
            Learn More
          </Button>
        </div>
      </div>
      <div className="hidden lg:block ">
        <Image
          src="/main-doc.png"
          alt="headshot"
          width={300}
          height={0}
          className=""
          quality={100}
        />
      </div>
    </div>
  );
};
