import { Button } from "../ui/button";
import { ProductCard } from "./product-card";

export const DeptSection = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#E5F9F7] rounded-lg">
      <div className="flex-grow p-6">
        <div className="gap-6 w-full max-w-5xl mx-auto">
          <span className="text-sm font-semibold text-[#FF685B]">
            Practice Advice
          </span>
          <h1 className="text-4xl font-bold mt-2 text-black">
            Our Departments
          </h1>
          <p className="text-left mt-10 text-muted-foreground mb-10">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. <br />
            Laboriosam, ea. Natus molestiae blanditiis earum facilis dicta, sed
            id, <br /> cum delectus dolores necessitatibus voluptatibus corporis
            distinctio harum fugit, magni laborum velit.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          <ProductCard
            header="Painless procedures"
            title="Quick Examination"
            description="We focus on ergonomics and meeting you where you work. It's only a keystroke away."
            salesNumber={15}
            oldPrice={2099}
            newPrice={1599}
            image="/report.png"
          >
            <Button variant="outline" className="border-[#fbbf24] rounded-xl">
              Learn More
            </Button>
          </ProductCard>
          <ProductCard
            header="Painless procedures"
            title="Quick Examination"
            description="We focus on ergonomics and meeting you where you work. It's only a keystroke away."
            salesNumber={15}
            oldPrice={2599}
            newPrice={1999}
            image="/doc.png"
          >
            <Button variant="outline" className="border-[#fbbf24] rounded-xl">
              Learn More
            </Button>
          </ProductCard>
          <ProductCard
            header="Painless procedures"
            title="Quick Examination"
            description="We focus on ergonomics and meeting you where you work. It's only a keystroke away."
            salesNumber={15}
            oldPrice={2099}
            newPrice={1599}
            image="/tubes.png"
          >
            <Button variant="outline" className="border-[#fbbf24] rounded-xl">
              Learn More
            </Button>
          </ProductCard>
        </div>
      </div>
    </div>
  );
};
