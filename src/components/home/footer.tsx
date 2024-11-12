import { FooterCard } from "./footer-card";

export const Footer = () => {
  return (
    <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
      <FooterCard
        heading="Contact Us"
        links={[
          { href: "/", label: "About Us" },
          { href: "/", label: "Carrier" },
          { href: "/", label: "We are hiring" },
          { href: "/", label: "Blog" },
        ]}
      />
      <FooterCard
        heading="Legal"
        links={[
          { href: "/", label: "About Us" },
          { href: "/", label: "Carrier" },
          { href: "/", label: "We are hiring" },
          { href: "/", label: "Blog" },
        ]}
      />
      <FooterCard
        heading="Features"
        links={[
          { href: "/", label: "About Us" },
          { href: "/", label: "Carrier" },
          { href: "/", label: "We are hiring" },
          { href: "/", label: "Blog" },
        ]}
      />
      <FooterCard
        heading="Resources"
        links={[
          { href: "/", label: "About Us" },
          { href: "/", label: "Carrier" },
          { href: "/", label: "We are hiring" },
          { href: "/", label: "Blog" },
        ]}
      />
      <FooterCard
        heading="Get In Touch"
        links={[
          { href: "/", label: "About Us" },
          { href: "/", label: "Carrier" },
          { href: "/", label: "We are hiring" },
          { href: "/", label: "Blog" },
        ]}
      />
    </div>
  );
};
