import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export const MeetOurExpertSection = () => {
  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 w-full max-w-5xl mx-auto m-40">
      <div>
        <h1 className="text-4xl font-bold">Meet Our Expert</h1>
        <p className="mt-10 text-muted-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Laboriosam,
          ea. Natus molestiae blanditiis earum facilis dicta, sed id, cum
          delectus dolores necessitatibus voluptatibus corporis distinctio harum
          fugit, magni laborum velit.
        </p>
        <Button variant="ghost" className="ml-[-14px] mt-4 text-[#FF685B]">
          <Link href="/">Learn More</Link>
          <FaArrowRight />
        </Button>
      </div>
      <Image
        src="/test.png"
        alt="test"
        width={400}
        height={0}
        quality={100}
        className="flex justify-center items-center mx-auto"
      />
    </div>
  );
};
