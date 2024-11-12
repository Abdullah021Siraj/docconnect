import { Poppins } from "next/font/google";
import { Navbar } from "./(protected)/components/navbar";
import { HomePage } from "./HomePage/page";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <Navbar />
      <HomePage />
    </main>
  );
}
