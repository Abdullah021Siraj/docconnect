import { TeamCard } from "./team-card";

export const Team = () => {
  return (
    <div className="flex flex-col min-h-screen w-full rounded-lg">
      <div className="flex-grow p-6">
        <div className="gap-6 w-full max-w-5xl mx-auto">
          <span className="text-sm font-semibold text-[#FF685B]">Team</span>
          <h1 className="text-4xl font-bold mt-2">Our Team</h1>
          <p className="text-left mt-10 text-muted-foreground mb-10">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. <br />
            Laboriosam, ea. Natus molestiae blanditiis earum facilis dicta, sed
            id, <br /> cum delectus dolores necessitatibus voluptatibus corporis
            distinctio harum fugit, magni laborum velit.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          <TeamCard
            name="Abdullah"
            role="Ortho"
            fbLink="https://www.facebook.com"
            instaLink="/"
            twitterLink="/"
            image="/doc3.jpg"
          />
          <TeamCard
            name="Abdullah"
            role="Dr Sarah"
            fbLink="https://www.facebook.com"
            instaLink="/"
            twitterLink="/"
            image="/doc2.jpg"
          />
          <TeamCard
            name="Abdullah"
            role="Dr Charles"
            fbLink="https://www.facebook.com"
            instaLink="/"
            twitterLink="/"
            image="/doc3.jpg"
          />
        </div>
      </div>
    </div>
  );
};
