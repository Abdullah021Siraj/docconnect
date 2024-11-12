import { TestimonialCard } from "./testimonial-card";

export const ReviewSection = () => {
  return (
    <div className="flex flex-col min-h-screen w-full rounded-lg">
      <div className="flex-grow p-6">
        <div className="gap-6 w-full max-w-5xl mx-auto">
          <span className="text-sm font-semibold text-[#FF685B]">
            Practice Advice
          </span>
          <h1 className="text-4xl font-bold mt-2">Leading Medicine</h1>
          <p className="text-left mt-10 text-muted-foreground mb-10">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. <br />
            Laboriosam, ea. Natus molestiae blanditiis earum facilis dicta, sed
            id, <br /> cum delectus dolores necessitatibus voluptatibus corporis
            distinctio harum fugit, magni laborum velit.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          <TestimonialCard
            name="Sarah Ali"
            role="Medical Researcher"
            testimonial="This platform has transformed how I manage my health data! Uploading my reports is super easy, and the insights are incredibly helpful. The AI recommendations for doctors based on my analysis make booking an appointment hassle-free. I highly recommend it!"
            rating={5}
          />

          <TestimonialCard
            name="Rehman Ali"
            role="Working Professional"
            testimonial="As someone with a busy schedule, this site has been a game-changer. I can upload prescriptions and get personalized advice without having to go through pages of medical info. The appointment booking is seamless, saving me so much time!"
            rating={5}
          />

          <TestimonialCard
            name="Harris Khan"
            role="Student"
            testimonial="I never realized how easy managing health data could be! The upload and analysis features work perfectly, and the recommendations are spot-on. I was able to find a specialist in minutes, thanks to the recommendation system. Amazing tool!"
            rating={5}
          />
        </div>
      </div>
    </div>
  );
};
